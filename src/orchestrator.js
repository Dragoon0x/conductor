// ═══════════════════════════════════════════
// CONDUCTOR — Orchestrator
// ═══════════════════════════════════════════
// Takes a blueprint (sequence of commands) and executes them
// through the relay one at a time. Each command can reference
// results from previous commands via $ref tokens.
//
// Example: create a frame, then create text inside it.
// The text command references the frame's ID via $ref.
//
// { type: 'create_frame', name: 'Hero', ... }          → returns { id: '5:2' }
// { type: 'create_text', parentId: '$0.id', text: ... } → parentId resolved to '5:2'

/**
 * Execute a sequence of Figma commands through the relay.
 * Supports $ref tokens: '$N.field' references result N's field.
 *
 * @param {Object} relay - The WebSocket relay instance
 * @param {Array} commands - Array of { type, data } command objects
 * @param {Function} onProgress - Optional callback(stepIndex, totalSteps, result)
 * @returns {Promise<{ results: Array, errors: Array, success: boolean }>}
 */
export async function executeSequence(relay, commands, onProgress) {
  var results = [];
  var errors = [];

  for (var i = 0; i < commands.length; i++) {
    var cmd = commands[i];
    var resolvedData = resolveRefs(cmd.data || {}, results);

    try {
      var result = await relay.sendToPlugin(cmd.type, resolvedData, 10000);

      if (result && result.error) {
        errors.push({ step: i, command: cmd.type, error: result.error });
        results.push(result);
        // Don't stop on error — skip and continue
        process.stderr.write('CONDUCTOR orchestrator: step ' + i + ' (' + cmd.type + ') error: ' + result.error + '\n');
      } else {
        results.push(result || {});
        if (onProgress) onProgress(i, commands.length, result);
        process.stderr.write('CONDUCTOR orchestrator: step ' + (i + 1) + '/' + commands.length + ' ' + cmd.type + ' -> ' + (result && (result.id || result.name) || 'ok') + '\n');
      }
    } catch (err) {
      errors.push({ step: i, command: cmd.type, error: String(err) });
      results.push({ error: String(err) });
      process.stderr.write('CONDUCTOR orchestrator: step ' + i + ' (' + cmd.type + ') threw: ' + String(err) + '\n');
    }

    // Small delay between commands to let Figma process
    await sleep(50);
  }

  return {
    results: results,
    errors: errors,
    success: errors.length === 0,
    totalSteps: commands.length,
    completedSteps: commands.length - errors.length,
  };
}

/**
 * Resolve $ref tokens in command data.
 * '$0.id' → results[0].id
 * '$parent' → results[results.length-1].id (last result's id)
 * '$2.name' → results[2].name
 */
function resolveRefs(data, results) {
  if (typeof data === 'string') {
    // Check for $ref pattern
    return data.replace(/\$(\d+)\.(\w+)/g, function(match, idx, field) {
      var r = results[parseInt(idx)];
      return (r && r[field] !== undefined) ? r[field] : match;
    }).replace(/\$parent/g, function() {
      var last = results[results.length - 1];
      return (last && last.id) ? last.id : '';
    });
  }

  if (Array.isArray(data)) {
    return data.map(function(item) { return resolveRefs(item, results); });
  }

  if (data && typeof data === 'object') {
    var resolved = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        resolved[key] = resolveRefs(data[key], results);
      }
    }
    return resolved;
  }

  return data;
}

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
}
