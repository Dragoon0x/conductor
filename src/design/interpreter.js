// ═══════════════════════════════════════════
// CONDUCTOR v3.2 — Design Interpreter
// ═══════════════════════════════════════════
// Takes any natural language prompt and extracts
// design intent: mood, palette, depth, density,
// typography character, layout strategy.
//
// This is the brain. The composer is the hands.

import { semanticColors, typeScale, snap, SHADOWS } from './intelligence.js'

// ─── Mood Detection ───
// Scans prompt text for style/mood signals
var MOOD_SIGNALS = {
  // Mood → keywords that trigger it
  minimal:    ['minimal','clean','simple','stripped','bare','zen','quiet','calm','whitespace','restrained'],
  bold:       ['bold','strong','loud','impactful','powerful','striking','dramatic','intense','punchy'],
  playful:    ['playful','fun','friendly','casual','warm','cheerful','vibrant','colorful','quirky','whimsical'],
  luxury:     ['luxury','brand','premium','elegant','refined','sophisticated','exclusive','high-end','classy','prestige'],
  corporate:  ['corporate','professional','enterprise','business','formal','serious','trustworthy','reliable'],
  dark:       ['dark','moody','noir','night','shadow','deep','mysterious','brooding'],
  techy:      ['tech','developer','code','hacker','terminal','engineer','devtool','api','saas'],
  organic:    ['organic','natural','earthy','soft','gentle','rounded','flowing','human'],
  brutalist:  ['brutalist','raw','rough','unpolished','industrial','grunge','concrete'],
  editorial:  ['editorial','magazine','publication','article','blog','journal','story','content'],
}

// ─── Industry Detection ───
var INDUSTRY_SIGNALS = {
  fintech:    ['fintech','banking','finance','payment','money','wallet','trading','invest','crypto'],
  health:     ['health','medical','wellness','fitness','care','therapy','meditation','mindful','yoga'],
  ecommerce:  ['ecommerce','shop','store','product','retail','marketplace','buy','sell','cart'],
  education:  ['education','learn','course','student','school','teach','academy','tutorial'],
  saas:       ['saas','dashboard','analytics','tool','platform','software','app','manage','workflow'],
  creative:   ['creative','design','art','portfolio','agency','studio','photographer','gallery'],
  food:       ['food','restaurant','recipe','cook','menu','delivery','cafe','bar','dining'],
  travel:     ['travel','booking','hotel','flight','destination','trip','adventure','explore'],
  social:     ['social','community','network','chat','message','connect','share','follow'],
  ai:         ['ai','artificial','intelligence','machine','learning','model','neural','gpt','llm'],
}

// ─── Component Detection ───
var COMPONENT_SIGNALS = {
  hero:         ['hero','landing','header','above fold','headline','main banner','splash'],
  features:     ['features','capabilities','what we do','benefits','why us','highlights'],
  pricing:      ['pricing','plans','tiers','cost','subscription','free trial','enterprise'],
  testimonials: ['testimonials','reviews','quotes','customers say','social proof','trust'],
  dashboard:    ['dashboard','admin','panel','metrics','kpi','analytics','overview','stats'],
  form:         ['form','signup','login','register','contact','input','submit','subscribe'],
  gallery:      ['gallery','portfolio','showcase','grid','images','photos','work'],
  faq:          ['faq','questions','answers','help','support'],
  cta:          ['cta','call to action','get started','sign up','try','start'],
  footer:       ['footer','bottom','links','copyright'],
  nav:          ['nav','navigation','menu','header bar','topbar'],
  stats:        ['stats','numbers','metrics','counters','data points'],
}

function detectSignals(text, signalMap) {
  var lower = text.toLowerCase()
  var scores = {}
  for (var key in signalMap) {
    if (signalMap.hasOwnProperty(key)) {
      var keywords = signalMap[key]
      var score = 0
      for (var i = 0; i < keywords.length; i++) {
        if (lower.indexOf(keywords[i]) !== -1) score++
      }
      if (score > 0) scores[key] = score
    }
  }
  // Sort by score descending
  var sorted = Object.keys(scores).sort(function(a, b) { return scores[b] - scores[a] })
  return sorted
}

// ─── Design Parameters from Mood ───
var MOOD_PARAMS = {
  minimal: {
    cornerRadius: 8, shadowDepth: 'sm', density: 'spacious', typeRatio: 'major2',
    headingWeight: 'Semi Bold', bodyWeight: 'Regular', bgContrast: 'low',
    iconStyle: 'outline', dividers: true, badgeStyle: 'subtle',
    sectionPadding: 120, cardPadding: 32, gap: 24, headingSize: 56,
  },
  bold: {
    cornerRadius: 16, shadowDepth: 'lg', density: 'normal', typeRatio: 'major3',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'high',
    iconStyle: 'filled', dividers: false, badgeStyle: 'filled',
    sectionPadding: 96, cardPadding: 28, gap: 20, headingSize: 72,
  },
  playful: {
    cornerRadius: 20, shadowDepth: 'md', density: 'normal', typeRatio: 'minor3',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'medium',
    iconStyle: 'filled', dividers: false, badgeStyle: 'pill',
    sectionPadding: 96, cardPadding: 28, gap: 20, headingSize: 64,
  },
  luxury: {
    cornerRadius: 4, shadowDepth: 'sm', density: 'spacious', typeRatio: 'perfect4',
    headingWeight: 'Medium', bodyWeight: 'Light', bgContrast: 'low',
    iconStyle: 'outline', dividers: true, badgeStyle: 'outline',
    sectionPadding: 140, cardPadding: 40, gap: 32, headingSize: 60,
  },
  corporate: {
    cornerRadius: 8, shadowDepth: 'md', density: 'normal', typeRatio: 'major2',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'medium',
    iconStyle: 'filled', dividers: true, badgeStyle: 'subtle',
    sectionPadding: 96, cardPadding: 28, gap: 20, headingSize: 48,
  },
  dark: {
    cornerRadius: 12, shadowDepth: 'lg', density: 'normal', typeRatio: 'major2',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'high',
    iconStyle: 'filled', dividers: false, badgeStyle: 'filled',
    sectionPadding: 96, cardPadding: 28, gap: 20, headingSize: 64,
  },
  techy: {
    cornerRadius: 8, shadowDepth: 'sm', density: 'dense', typeRatio: 'major2',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'medium',
    iconStyle: 'outline', dividers: true, badgeStyle: 'code',
    sectionPadding: 80, cardPadding: 24, gap: 16, headingSize: 52,
  },
  organic: {
    cornerRadius: 24, shadowDepth: 'md', density: 'spacious', typeRatio: 'minor3',
    headingWeight: 'Medium', bodyWeight: 'Regular', bgContrast: 'low',
    iconStyle: 'filled', dividers: false, badgeStyle: 'pill',
    sectionPadding: 112, cardPadding: 32, gap: 24, headingSize: 56,
  },
  brutalist: {
    cornerRadius: 0, shadowDepth: 'none', density: 'dense', typeRatio: 'perfect5',
    headingWeight: 'Bold', bodyWeight: 'Regular', bgContrast: 'extreme',
    iconStyle: 'none', dividers: true, badgeStyle: 'border',
    sectionPadding: 64, cardPadding: 20, gap: 12, headingSize: 80,
  },
  editorial: {
    cornerRadius: 4, shadowDepth: 'sm', density: 'spacious', typeRatio: 'major3',
    headingWeight: 'Medium', bodyWeight: 'Regular', bgContrast: 'low',
    iconStyle: 'none', dividers: true, badgeStyle: 'subtle',
    sectionPadding: 120, cardPadding: 32, gap: 28, headingSize: 56,
  },
}

// ─── Color Palettes by Industry ───
var INDUSTRY_COLORS = {
  fintech:   { brand:'#0ea5e9', accent:'#06b6d4', mode:'dark' },
  health:    { brand:'#10b981', accent:'#34d399', mode:'light' },
  ecommerce: { brand:'#f59e0b', accent:'#fbbf24', mode:'light' },
  education: { brand:'#6366f1', accent:'#818cf8', mode:'light' },
  saas:      { brand:'#6366f1', accent:'#a78bfa', mode:'dark' },
  creative:  { brand:'#ec4899', accent:'#f472b6', mode:'dark' },
  food:      { brand:'#ef4444', accent:'#f87171', mode:'light' },
  travel:    { brand:'#0ea5e9', accent:'#38bdf8', mode:'light' },
  social:    { brand:'#8b5cf6', accent:'#a78bfa', mode:'dark' },
  ai:        { brand:'#6366f1', accent:'#818cf8', mode:'dark' },
}

// ─── Main Interpreter ───
export function interpretDesign(prompt) {
  // 1. Detect mood
  var moods = detectSignals(prompt, MOOD_SIGNALS)
  var primaryMood = moods[0] || 'techy'

  // 2. Detect industry
  var industries = detectSignals(prompt, INDUSTRY_SIGNALS)
  var primaryIndustry = industries[0] || 'saas'

  // 3. Detect needed components
  var components = detectSignals(prompt, COMPONENT_SIGNALS)
  // Always include nav and footer if building a page
  var isPage = prompt.toLowerCase().indexOf('page') !== -1 || prompt.toLowerCase().indexOf('landing') !== -1 || prompt.toLowerCase().indexOf('website') !== -1 || prompt.toLowerCase().indexOf('site') !== -1
  if (isPage) {
    if (components.indexOf('nav') === -1) components.unshift('nav')
    if (components.indexOf('footer') === -1) components.push('footer')
    // Default sections if none detected
    if (components.length <= 2) {
      components = ['nav', 'hero', 'features', 'cta', 'footer']
    }
  }
  if (components.length === 0) components = ['hero']

  // 4. Get design parameters from mood
  var params = MOOD_PARAMS[primaryMood] || MOOD_PARAMS.techy

  // 5. Get color from industry (or extract from prompt)
  var colorMatch = prompt.match(/#[0-9a-fA-F]{6}/)
  var industryColor = INDUSTRY_COLORS[primaryIndustry] || INDUSTRY_COLORS.saas
  var brandColor = colorMatch ? colorMatch[0] : industryColor.brand

  // 6. Determine mode
  var forceDark = prompt.toLowerCase().indexOf('dark') !== -1
  var forceLight = prompt.toLowerCase().indexOf('light') !== -1
  var mode = forceDark ? 'dark' : (forceLight ? 'light' : industryColor.mode)

  // 7. Extract content hints from prompt
  var contentHints = extractContentHints(prompt)

  return {
    mood: primaryMood,
    industry: primaryIndustry,
    sections: components,
    params: params,
    brandColor: brandColor,
    mode: mode,
    content: contentHints,
    width: 1440,
    meta: {
      detectedMoods: moods.slice(0, 3),
      detectedIndustries: industries.slice(0, 3),
      detectedComponents: components,
    }
  }
}

// ─── Content Hint Extractor ───
function extractContentHints(prompt) {
  var content = {}
  var lower = prompt.toLowerCase()

  // Try to find a brand name
  var brandMatch = prompt.match(/(?:for|called|named)\s+["']?([A-Z][a-zA-Z]+)["']?/)
  if (brandMatch) content.brand = brandMatch[1]

  // Try to find a title/heading
  var titleMatch = prompt.match(/(?:heading|title|headline)\s+["']([^"']+)["']/)
  if (titleMatch) content.title = titleMatch[1]

  // Try to find a CTA
  var ctaMatch = prompt.match(/(?:button|cta)\s+(?:saying?\s+)?["']([^"']+)["']/)
  if (ctaMatch) content.cta = ctaMatch[1]

  // Feature count
  var featureCountMatch = lower.match(/(\d+)\s+features?/)
  if (featureCountMatch) content.featureCount = parseInt(featureCountMatch[1])

  // Pricing tiers
  var tierCountMatch = lower.match(/(\d+)\s+(?:pricing\s+)?tiers?/)
  if (tierCountMatch) content.tierCount = parseInt(tierCountMatch[1])

  return content
}

// ─── Apply Design Params to Section ───
// This modifies the section composition based on interpreted mood
export function applyDesignParams(sectionCmds, params) {
  for (var i = 0; i < sectionCmds.length; i++) {
    var cmd = sectionCmds[i]
    if (cmd.type === 'create_frame' && cmd.data) {
      // Apply corner radius from mood
      if (cmd.data.cornerRadius !== undefined && cmd.data.cornerRadius > 0) {
        cmd.data.cornerRadius = params.cornerRadius
      }
      // Apply density
      if (params.density === 'spacious') {
        if (cmd.data.paddingTop && cmd.data.paddingTop >= 48) cmd.data.paddingTop = snap(cmd.data.paddingTop * 1.3)
        if (cmd.data.paddingBottom && cmd.data.paddingBottom >= 48) cmd.data.paddingBottom = snap(cmd.data.paddingBottom * 1.3)
        if (cmd.data.gap && cmd.data.gap >= 16) cmd.data.gap = snap(cmd.data.gap * 1.2)
      } else if (params.density === 'dense') {
        if (cmd.data.paddingTop && cmd.data.paddingTop >= 48) cmd.data.paddingTop = snap(cmd.data.paddingTop * 0.75)
        if (cmd.data.paddingBottom && cmd.data.paddingBottom >= 48) cmd.data.paddingBottom = snap(cmd.data.paddingBottom * 0.75)
        if (cmd.data.gap && cmd.data.gap >= 16) cmd.data.gap = snap(cmd.data.gap * 0.8)
      }
    }
    // Apply heading weight from mood
    if (cmd.type === 'create_text' && cmd.data && cmd.data.fontName) {
      if (cmd.data.fontSize >= 40 && cmd.data.fontName.style === 'Bold') {
        cmd.data.fontName.style = params.headingWeight
      }
      // Apply heading size for hero headings
      if (cmd.data.fontSize >= 56) {
        cmd.data.fontSize = params.headingSize
      }
    }
  }
  return sectionCmds
}

// ─── Get Interpretation Summary ───
// Returns a human-readable description of what the interpreter decided
export function getInterpretationSummary(interpretation) {
  var i = interpretation
  return {
    summary: 'Detected ' + i.mood + ' mood for ' + i.industry + ' industry. ' +
      'Building ' + i.sections.length + ' sections: ' + i.sections.join(', ') + '. ' +
      'Brand color: ' + i.brandColor + '. Mode: ' + i.mode + '.',
    mood: i.mood,
    industry: i.industry,
    sections: i.sections,
    brandColor: i.brandColor,
    mode: i.mode,
    params: {
      cornerRadius: i.params.cornerRadius + 'px',
      shadowDepth: i.params.shadowDepth,
      density: i.params.density,
      typeRatio: i.params.typeRatio,
      headingSize: i.params.headingSize + 'px',
    }
  }
}
