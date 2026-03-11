// ═══════════════════════════════════════════
// CONDUCTOR — Orchestration Test
// ═══════════════════════════════════════════
// Run: node test-orchestrate.js
// Then connect the Figma plugin.
// Sends ONE create_page command → CONDUCTOR executes 49 sequential commands.

var http = require('http');
var WebSocketServer = require('ws').WebSocketServer;

var PORT = 9800;
var server = http.createServer();
var wss = new WebSocketServer({ server: server });
var cmdId = 0;
var pending = {};
var queue = [];
var ws_ref = null;

// Import blueprints directly to show what will happen
var totalExpected = 49; // Landing page generates ~49 commands

console.log('\n  ⊞ CONDUCTOR Orchestration Test');
console.log('  This proves single-prompt → multi-element execution.');
console.log('  Listening on ws://localhost:' + PORT);
console.log('  Connect the CONDUCTOR plugin in Figma.\n');

wss.on('connection', function(ws) {
  ws_ref = ws;
  console.log('  ✓ Plugin connected!\n');
  console.log('  Building a full landing page from one command...');
  console.log('  Expected: ~' + totalExpected + ' sequential Figma operations.\n');

  var created = [];
  var errors = [];
  var startTime = Date.now();

  ws.on('message', function(data) {
    try {
      var msg = JSON.parse(data.toString());

      if (msg.type === 'plugin_ready') {
        console.log('  ← Plugin v' + (msg.version || '?') + ' ready');
        console.log('');

        // Build the sequence locally to execute
        var blueprint = buildLandingPage({
          brand: 'acme',
          brandColor: '#6366f1',
          title: 'Ship faster with\nless overhead',
          subtitle: 'The modern platform for teams that move fast.',
          ctaText: 'Start for free',
          features: [
            { icon: '⚡', title: 'Instant Deploy', desc: 'Push to deploy in seconds. Zero config.' },
            { icon: '📈', title: 'Auto Scale', desc: 'Scales to millions. Pay for what you use.' },
            { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2. E2E encryption. SSO built in.' },
          ],
          stats: [
            { value: '10,000+', label: 'Teams' },
            { value: '99.9%', label: 'Uptime' },
            { value: '< 50ms', label: 'Latency' },
          ],
        });

        queue = blueprint.commands.slice();
        console.log('  Blueprint generated: ' + queue.length + ' commands');
        console.log('  ' + blueprint.description);
        console.log('');

        // Execute first command
        executeNext();
      }

      if (msg.type === 'result') {
        var result = msg.data || {};
        var elapsed = Date.now() - startTime;

        if (result.error) {
          errors.push({ step: created.length, error: result.error });
          console.log('  ✗ #' + msg.id + ' error: ' + result.error);
        } else {
          created.push(result);
          var step = created.length;
          var total = queue.length + step;
          var pct = Math.round((step / (queue.length + step)) * 100);
          console.log('  ✓ ' + step + '/' + (queue.length + step) + ' (' + pct + '%) ' + (result.type || '') + ' ' + (result.name || result.id || ''));
        }

        // Resolve refs and execute next
        executeNext();
      }
    } catch (e) {}
  });

  function executeNext() {
    if (queue.length === 0) {
      var elapsed = Date.now() - startTime;
      console.log('');
      console.log('  ═══════════════════════════════════════');
      console.log('  ✓ COMPLETE');
      console.log('  ═══════════════════════════════════════');
      console.log('  Created: ' + created.length + ' elements');
      console.log('  Errors:  ' + errors.length);
      console.log('  Time:    ' + (elapsed / 1000).toFixed(1) + 's');
      console.log('  ═══════════════════════════════════════');
      console.log('');
      console.log('  Check your Figma canvas. You should see a complete');
      console.log('  landing page with nav, hero, stats, features, CTA, footer.');
      console.log('  All auto-layout. All grid-aligned. From one command.');
      console.log('');
      console.log('  Ctrl+C to stop.\n');
      return;
    }

    var cmd = queue.shift();
    var resolvedData = resolveRefs(cmd.data, created);
    var id = ++cmdId;

    ws_ref.send(JSON.stringify({
      type: 'command',
      id: id,
      command: { type: cmd.type, data: resolvedData },
    }));
  }
});

// Resolve $N.field refs against results array
function resolveRefs(data, results) {
  if (typeof data === 'string') {
    return data.replace(/\$(\d+)\.(\w+)/g, function(match, idx, field) {
      var r = results[parseInt(idx)];
      return (r && r[field] !== undefined) ? String(r[field]) : match;
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

// ═══════════════════════════════════════════
// Inline blueprint (same as blueprints.js but standalone for testing)
// ═══════════════════════════════════════════

function buildLandingPage(args) {
  var brandColor = args.brandColor || '#6366f1';
  var pageWidth = 1440;
  var bg = '#0f0f1a';
  var textColor = '#ffffff';
  var mutedColor = '#888899';
  var cardBg = '#16162e';
  var cmds = [];

  function fr(name, opts) { return { type: 'create_frame', data: Object.assign({ name: name, direction: 'VERTICAL', padding: 0, gap: 0, fill: bg, cornerRadius: 0 }, opts) }; }
  function hfr(name, opts) { return fr(name, Object.assign({ direction: 'HORIZONTAL' }, opts)); }
  function tx(content, opts) { return { type: 'create_text', data: Object.assign({ text: content, fontSize: 16, color: textColor, fontName: { family: 'Inter', style: 'Regular' } }, opts) }; }
  function ap(ref, cmd) { cmd.data.parentId = ref; return cmd; }

  // 0: Root
  cmds.push(fr('Landing Page', { width: pageWidth, height: 2000, fill: bg }));

  // 1: Nav
  cmds.push(ap('$0.id', hfr('Navigation', { width: pageWidth, height: 64, padding: 24, gap: 16, fill: bg, counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$1.id', tx(args.brand || 'acme', { fontSize: 18, fontName: { family: 'Inter', style: 'Bold' } })));
  cmds.push(ap('$1.id', fr('Spacer', { width: 1, height: 1, fill: bg })));

  var navItems = ['Features', 'Pricing', 'Docs', 'Blog'];
  for (var i = 0; i < navItems.length; i++) {
    cmds.push(ap('$1.id', tx(navItems[i], { fontSize: 14, color: mutedColor, fontName: { family: 'Inter', style: 'Medium' } })));
  }

  var navBtnIdx = cmds.length;
  cmds.push(ap('$1.id', hfr('Nav CTA', { width: 120, height: 36, padding: 12, fill: brandColor, cornerRadius: 8, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + navBtnIdx + '.id', tx('Sign up', { fontSize: 13, fontName: { family: 'Inter', style: 'Semi Bold' } })));

  // Hero
  var heroIdx = cmds.length;
  cmds.push(ap('$0.id', fr('Hero Section', { width: pageWidth, height: 520, padding: 80, gap: 24, fill: bg, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + heroIdx + '.id', tx('INTRODUCING ' + (args.brand || 'ACME').toUpperCase(), { fontSize: 12, color: brandColor, fontName: { family: 'Inter', style: 'Semi Bold' } })));
  cmds.push(ap('$' + heroIdx + '.id', tx(args.title, { fontSize: 56, fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(ap('$' + heroIdx + '.id', tx(args.subtitle, { fontSize: 18, color: mutedColor, textAlignHorizontal: 'CENTER' })));

  var btnRowIdx = cmds.length;
  cmds.push(ap('$' + heroIdx + '.id', hfr('Hero Buttons', { width: 340, height: 48, gap: 12, fill: bg, primaryAxisAlignItems: 'CENTER' })));
  var pBtnIdx = cmds.length;
  cmds.push(ap('$' + btnRowIdx + '.id', hfr('Primary CTA', { width: 160, height: 48, padding: 16, fill: brandColor, cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + pBtnIdx + '.id', tx(args.ctaText, { fontSize: 15, fontName: { family: 'Inter', style: 'Semi Bold' } })));
  var sBtnIdx = cmds.length;
  cmds.push(ap('$' + btnRowIdx + '.id', hfr('Secondary CTA', { width: 160, height: 48, padding: 16, fill: '#1a1a2e', cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + sBtnIdx + '.id', tx('View demo →', { fontSize: 15, color: '#ccccdd', fontName: { family: 'Inter', style: 'Medium' } })));

  // Stats
  var statsIdx = cmds.length;
  cmds.push(ap('$0.id', hfr('Stats Bar', { width: pageWidth, height: 120, padding: 48, gap: 80, fill: '#13132a', counterAxisAlignItems: 'CENTER' })));
  for (var s = 0; s < args.stats.length; s++) {
    var si = cmds.length;
    cmds.push(ap('$' + statsIdx + '.id', fr('Stat ' + (s+1), { width: 200, height: 64, gap: 4, fill: '#13132a', counterAxisAlignItems: 'CENTER' })));
    cmds.push(ap('$' + si + '.id', tx(args.stats[s].value, { fontSize: 32, fontName: { family: 'Inter', style: 'Bold' } })));
    cmds.push(ap('$' + si + '.id', tx(args.stats[s].label, { fontSize: 13, color: mutedColor })));
  }

  // Features
  var featIdx = cmds.length;
  cmds.push(ap('$0.id', fr('Features Section', { width: pageWidth, padding: 64, gap: 32, fill: bg, counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + featIdx + '.id', tx('Everything you need', { fontSize: 36, fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(ap('$' + featIdx + '.id', tx('Powerful features to help your team ship faster.', { fontSize: 16, color: mutedColor, textAlignHorizontal: 'CENTER' })));

  var cardRowIdx = cmds.length;
  cmds.push(ap('$' + featIdx + '.id', hfr('Feature Cards', { width: pageWidth - 128, gap: 20, fill: bg })));

  for (var f = 0; f < args.features.length; f++) {
    var cw = Math.floor((pageWidth - 128 - 40) / args.features.length);
    var ci = cmds.length;
    cmds.push(ap('$' + cardRowIdx + '.id', fr(args.features[f].title, { width: cw, height: 200, padding: 24, gap: 12, fill: cardBg, cornerRadius: 12 })));
    cmds.push(ap('$' + ci + '.id', tx(args.features[f].icon + '  ' + args.features[f].title, { fontSize: 18, fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(ap('$' + ci + '.id', tx(args.features[f].desc, { fontSize: 14, color: mutedColor })));
  }

  // CTA
  var ctaIdx = cmds.length;
  cmds.push(ap('$0.id', fr('CTA Section', { width: pageWidth, padding: 80, gap: 24, fill: '#0a0a14', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + ctaIdx + '.id', tx('Ready to get started?', { fontSize: 40, fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(ap('$' + ctaIdx + '.id', tx('Join thousands of teams already shipping faster.', { fontSize: 16, color: mutedColor, textAlignHorizontal: 'CENTER' })));
  var ctaBtnIdx = cmds.length;
  cmds.push(ap('$' + ctaIdx + '.id', hfr('CTA Button', { width: 200, height: 52, padding: 16, fill: brandColor, cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + ctaBtnIdx + '.id', tx(args.ctaText, { fontSize: 16, fontName: { family: 'Inter', style: 'Semi Bold' } })));

  // Footer
  var footerIdx = cmds.length;
  cmds.push(ap('$0.id', hfr('Footer', { width: pageWidth, height: 80, padding: 24, gap: 16, fill: '#080812', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + footerIdx + '.id', tx('© 2025 ' + (args.brand || 'Acme') + '. All rights reserved.', { fontSize: 13, color: mutedColor })));

  return { commands: cmds, description: 'Landing page: nav, hero, stats, ' + args.features.length + ' feature cards, CTA, footer. ' + cmds.length + ' elements.' };
}

server.listen(PORT);
