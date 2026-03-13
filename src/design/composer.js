// ═══════════════════════════════════════════
// CONDUCTOR v3.1 — Composition Engine
// ═══════════════════════════════════════════
// Generates rich, multi-layered Figma designs.
// Each section produces 30-60+ elements.

import { snap, semanticColors, componentDefaults, typeScale, SPACING, RADIUS, SHADOWS } from './intelligence.js'

// ─── Sequence runner ───
async function runSequence(bridge, commands) {
  var results = []
  for (var i = 0; i < commands.length; i++) {
    var cmd = commands[i]
    var data = {}
    var src = cmd.data
    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        var v = src[k]
        if (typeof v === 'string' && v.charAt(0) === '$') {
          var refIdx = parseInt(v.replace('$','').replace('.id',''))
          if (results[refIdx] && results[refIdx].id) v = results[refIdx].id
        }
        data[k] = v
      }
    }
    try {
      var result = await bridge.send(cmd.type, data)
      results.push(result)
    } catch (e) {
      results.push({ id: null, error: e.message })
    }
  }
  return results
}

// ─── Shorthand builders ───
function F(name, opts) { opts.name = name; opts.direction = opts.direction || 'VERTICAL'; return { type:'create_frame', data:opts } }
function H(name, opts) { opts.direction = 'HORIZONTAL'; return F(name, opts) }
function T(text, opts) { opts.text = text; if (!opts.fontName) opts.fontName = { family:'Inter', style: opts._w || 'Regular' }; delete opts._w; return { type:'create_text', data:opts } }
function R(name, opts) { opts.name = name; return { type:'create_rectangle', data:opts } }
function $(idx) { return '$' + idx + '.id' }

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function composeNav(content, colors, brand, W) {
  var c = [], brandName = (content && content.brand) || 'acme'
  var navItems = (content && content.navItems) || ['Features','Pricing','Docs','Blog']

  // 0: Nav bar
  c.push(H('Navigation', { width:W, height:64, paddingLeft:40, paddingRight:40, paddingTop:0, paddingBottom:0, gap:0, fill:colors.bg, counterAxisAlignItems:'CENTER' }))
  // 1: Logo mark
  c.push(H('Logo Mark', { parentId:$(0), width:28, height:28, fill:brand, cornerRadius:7, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  // 2: Logo letter
  c.push(T(brandName.charAt(0).toUpperCase(), { parentId:$(1), fontSize:14, _w:'Bold', color:'#ffffff' }))
  // 3: Brand name
  c.push(T(brandName, { parentId:$(0), fontSize:15, _w:'Semi Bold', color:colors.text1 }))
  // 4: Spacer
  c.push(F('_spacer', { parentId:$(0), width:1, height:1, fill:colors.bg, primaryAxisSizingMode:'FILL' }))
  // 5: Nav links
  c.push(H('Nav Links', { parentId:$(0), gap:28, counterAxisAlignItems:'CENTER' }))
  for (var i = 0; i < navItems.length; i++) {
    c.push(T(navItems[i], { parentId:$(5), fontSize:14, _w:'Medium', color:colors.text3 }))
  }
  // CTA button
  var btnIdx = c.length
  c.push(H('Nav CTA', { parentId:$(0), height:36, paddingLeft:16, paddingRight:16, paddingTop:0, paddingBottom:0, fill:brand, cornerRadius:8, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T('Get started', { parentId:$(btnIdx), fontSize:13, _w:'Semi Bold', color:'#ffffff' }))
  // Divider
  c.push(R('Nav Divider', { parentId:$(0), width:W, height:1, fill:colors.border }))
  return c
}

// ═══════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════
function composeHero(content, colors, brand, W) {
  var c = []
  var title = (content && content.title) || 'Ship faster with\nless overhead'
  var subtitle = (content && content.subtitle) || 'The modern platform for teams that move fast.\nEverything you need to build, deploy, and scale.'
  var ctaText = (content && content.cta) || 'Start for free'

  // 0: Hero section
  c.push(F('Hero Section', { width:W, paddingTop:112, paddingBottom:96, paddingLeft:48, paddingRight:48, gap:28, fill:colors.bg, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))

  // 1: Overline badge
  c.push(H('Badge', { parentId:$(0), paddingLeft:6, paddingRight:14, paddingTop:5, paddingBottom:5, gap:8, fill:colors.surface2, cornerRadius:20, counterAxisAlignItems:'CENTER' }))
  // 2: Badge dot container
  c.push(H('Badge Dot', { parentId:$(1), width:20, height:20, fill:colors.brand, cornerRadius:10, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  // 3: Dot inner (sparkle)
  c.push(T('✦', { parentId:$(2), fontSize:9, color:'#ffffff' }))
  // 4: Badge text
  c.push(T('Introducing v3 — now with 201 tools', { parentId:$(1), fontSize:12, _w:'Medium', color:colors.text2 }))

  // 5: Main heading
  c.push(T(title, { parentId:$(0), fontSize:68, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER', lineHeight:1.05 }))

  // 6: Subtitle
  c.push(T(subtitle, { parentId:$(0), fontSize:19, color:colors.text2, textAlignHorizontal:'CENTER', maxWidth:560 }))

  // 7: Button row
  c.push(H('Buttons', { parentId:$(0), gap:12, paddingTop:8 }))
  // 8: Primary CTA
  c.push(H('Primary CTA', { parentId:$(7), height:52, paddingLeft:28, paddingRight:28, paddingTop:0, paddingBottom:0, fill:brand, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  // 9: Primary label
  c.push(T(ctaText, { parentId:$(8), fontSize:16, _w:'Semi Bold', color:'#ffffff' }))
  // 10: Secondary CTA
  c.push(H('Secondary CTA', { parentId:$(7), height:52, paddingLeft:28, paddingRight:28, paddingTop:0, paddingBottom:0, fill:colors.surface, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  // 11: Secondary label
  c.push(T('See how it works →', { parentId:$(10), fontSize:16, _w:'Medium', color:colors.text2 }))

  // 12: Social proof row
  c.push(H('Social Proof', { parentId:$(0), gap:12, counterAxisAlignItems:'CENTER', paddingTop:12 }))
  // 13: Avatar stack frame
  c.push(H('Avatars', { parentId:$(12), gap:-8 }))
  // 14-18: Five avatar circles
  var avatarColors = [brand, '#10b981', '#f59e0b', '#ef4444', '#6366f1']
  var avatarLetters = ['A','S','M','J','K']
  for (var ai = 0; ai < 5; ai++) {
    var avIdx = c.length
    c.push(H('Avatar', { parentId:$(13), width:28, height:28, fill:avatarColors[ai], cornerRadius:14, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
    c.push(T(avatarLetters[ai], { parentId:$(avIdx), fontSize:11, _w:'Semi Bold', color:'#ffffff' }))
  }
  // Stars
  c.push(T('★★★★★', { parentId:$(12), fontSize:13, color:'#fbbf24' }))
  // Proof text
  c.push(T('Loved by 10,000+ teams', { parentId:$(12), fontSize:13, _w:'Medium', color:colors.text3 }))

  return c
}

// ═══════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════
function composeStats(content, colors, brand, W) {
  var c = [], contentW = 1120
  var stats = (content && content.stats) || [
    { value:'10,000+', label:'Teams worldwide' },
    { value:'99.9%', label:'Uptime SLA' },
    { value:'< 50ms', label:'Global latency' },
    { value:'4.9/5', label:'Customer rating' },
  ]

  // 0: Stats bar
  c.push(H('Stats Bar', { width:W, paddingTop:48, paddingBottom:48, paddingLeft:48, paddingRight:48, fill:colors.bg2, primaryAxisAlignItems:'CENTER' }))
  // 1: Inner container
  c.push(H('Stats Inner', { parentId:$(0), width:contentW }))

  for (var si = 0; si < stats.length; si++) {
    var sw = Math.floor(contentW / stats.length)
    var sti = c.length
    // Stat frame
    c.push(F('Stat: ' + stats[si].label, { parentId:$(1), width:sw, paddingTop:16, paddingBottom:16, gap:4, counterAxisAlignItems:'CENTER' }))
    // Value
    c.push(T(stats[si].value, { parentId:$(sti), fontSize:36, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))
    // Label
    c.push(T(stats[si].label, { parentId:$(sti), fontSize:13, _w:'Medium', color:colors.text3, textAlignHorizontal:'CENTER' }))
    // Vertical divider (except last)
    if (si < stats.length - 1) {
      c.push(R('Divider', { parentId:$(1), width:1, height:48, fill:colors.border }))
    }
  }
  return c
}

// ═══════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════
function composeFeatures(content, colors, brand, W) {
  var c = [], contentW = 1120
  var heading = (content && content.title) || 'Everything you need'
  var sub = (content && content.subtitle) || 'Powerful features to help your team ship faster\nand with more confidence.'
  var features = (content && content.features) || [
    { icon:'⚡', title:'Instant Deploy', desc:'Push to deploy in seconds. Zero config.\nAutomatic HTTPS, global CDN, and instant rollbacks.' },
    { icon:'📈', title:'Auto Scale', desc:'Scales to millions of requests automatically.\nPay only for what you use. No capacity planning.' },
    { icon:'🔒', title:'Enterprise Security', desc:'SOC 2 Type II compliant. End-to-end encryption.\nSSO, RBAC, and audit logs built in.' },
  ]

  // 0: Section
  c.push(F('Features Section', { width:W, paddingTop:96, paddingBottom:96, paddingLeft:48, paddingRight:48, gap:56, fill:colors.bg, counterAxisAlignItems:'CENTER' }))

  // 1: Header group
  c.push(F('Features Header', { parentId:$(0), gap:12, counterAxisAlignItems:'CENTER' }))
  // 2: Overline
  c.push(T('FEATURES', { parentId:$(1), fontSize:11, _w:'Semi Bold', color:brand, letterSpacing:2.5, textAlignHorizontal:'CENTER' }))
  // 3: Heading
  c.push(T(heading, { parentId:$(1), fontSize:44, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))
  // 4: Subtitle
  c.push(T(sub, { parentId:$(1), fontSize:18, color:colors.text2, textAlignHorizontal:'CENTER' }))

  // 5: Card row
  c.push(H('Feature Cards', { parentId:$(0), width:contentW, gap:20 }))

  for (var fi = 0; fi < features.length; fi++) {
    var f = features[fi]
    var cw = Math.floor((contentW - (features.length - 1) * 20) / features.length)
    var ci = c.length

    // Card
    c.push(F(f.title, { parentId:$(5), width:cw, paddingTop:32, paddingBottom:32, paddingLeft:28, paddingRight:28, gap:16, fill:colors.surface, cornerRadius:16 }))

    // Icon circle
    var iconI = c.length
    c.push(H('Icon BG', { parentId:$(ci), width:48, height:48, fill:colors.surface3, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
    c.push(T(f.icon, { parentId:$(iconI), fontSize:22 }))

    // Title
    c.push(T(f.title, { parentId:$(ci), fontSize:20, _w:'Semi Bold', color:colors.text1 }))

    // Description
    c.push(T(f.desc, { parentId:$(ci), fontSize:14, color:colors.text2, lineHeight:1.6 }))

    // Divider inside card
    c.push(R('Card Divider', { parentId:$(ci), width:cw - 56, height:1, fill:colors.border }))

    // Learn more link
    c.push(T('Learn more →', { parentId:$(ci), fontSize:13, _w:'Medium', color:brand }))
  }
  return c
}

// ═══════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════
function composeTestimonials(content, colors, brand, W) {
  var c = [], contentW = 1120
  var testimonials = (content && content.testimonials) || [
    { quote:'This product transformed how our team works. The speed and reliability are unmatched.', author:'Sarah Chen', role:'CTO, TechCorp', initial:'S' },
    { quote:'Best tool we adopted this year. Our deployment time dropped by 80%.', author:'Marcus Rivera', role:'VP Engineering, ScaleUp', initial:'M' },
    { quote:'Finally something that actually understands what good design looks like.', author:'Aria Kim', role:'Design Lead, Craft', initial:'A' },
  ]

  // 0: Section
  c.push(F('Testimonials', { width:W, paddingTop:96, paddingBottom:96, paddingLeft:48, paddingRight:48, gap:56, fill:colors.bg2, counterAxisAlignItems:'CENTER' }))
  // 1: Header
  c.push(F('Testimonials Header', { parentId:$(0), gap:12, counterAxisAlignItems:'CENTER' }))
  c.push(T('TESTIMONIALS', { parentId:$(1), fontSize:11, _w:'Semi Bold', color:brand, letterSpacing:2.5 }))
  c.push(T('Trusted by the best teams', { parentId:$(1), fontSize:44, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))

  // Card row
  var rowIdx = c.length
  c.push(H('Testimonial Cards', { parentId:$(0), width:contentW, gap:16 }))

  for (var ti = 0; ti < testimonials.length; ti++) {
    var t = testimonials[ti]
    var tw = Math.floor((contentW - (testimonials.length - 1) * 16) / testimonials.length)
    var tidx = c.length

    // Card
    c.push(F('Testimonial', { parentId:$(rowIdx), width:tw, paddingTop:28, paddingBottom:28, paddingLeft:24, paddingRight:24, gap:16, fill:colors.surface, cornerRadius:16 }))

    // Stars
    c.push(T('★★★★★', { parentId:$(tidx), fontSize:14, color:'#fbbf24' }))

    // Quote
    c.push(T('"' + t.quote + '"', { parentId:$(tidx), fontSize:15, color:colors.text1, lineHeight:1.6 }))

    // Divider
    c.push(R('Divider', { parentId:$(tidx), width:tw - 48, height:1, fill:colors.border }))

    // Author row
    var authIdx = c.length
    c.push(H('Author', { parentId:$(tidx), gap:10, counterAxisAlignItems:'CENTER' }))

    // Avatar
    var avIdx = c.length
    c.push(H('Avatar', { parentId:$(authIdx), width:36, height:36, fill:brand, cornerRadius:18, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
    c.push(T(t.initial, { parentId:$(avIdx), fontSize:14, _w:'Semi Bold', color:'#ffffff' }))

    // Author info
    var infoIdx = c.length
    c.push(F('Author Info', { parentId:$(authIdx), gap:2 }))
    c.push(T(t.author, { parentId:$(infoIdx), fontSize:14, _w:'Semi Bold', color:colors.text1 }))
    c.push(T(t.role, { parentId:$(infoIdx), fontSize:12, color:colors.text3 }))
  }
  return c
}

// ═══════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════
function composePricing(content, colors, brand, W) {
  var c = [], contentW = 1080
  var tiers = (content && content.tiers) || [
    { name:'Starter', price:'$0', period:'/mo', desc:'For side projects and experiments.', features:['1 project','1,000 API calls/day','Community support','Basic analytics'], cta:'Start free', hl:false },
    { name:'Pro', price:'$29', period:'/mo', desc:'For growing teams that need more.', features:['Unlimited projects','100,000 API calls/day','Priority support','Advanced analytics','Team collaboration','Custom domains','Webhooks'], cta:'Start free trial', hl:true },
    { name:'Enterprise', price:'Custom', period:'', desc:'For organizations with advanced needs.', features:['Everything in Pro','Unlimited API calls','Dedicated support','SSO & SAML','99.99% SLA','Custom integrations','On-premise option','Audit logs'], cta:'Contact sales', hl:false },
  ]

  // 0: Section
  c.push(F('Pricing Section', { width:W, paddingTop:96, paddingBottom:96, paddingLeft:48, paddingRight:48, gap:56, fill:colors.bg, counterAxisAlignItems:'CENTER' }))
  // Header
  c.push(F('Pricing Header', { parentId:$(0), gap:12, counterAxisAlignItems:'CENTER' }))
  c.push(T('PRICING', { parentId:$(1), fontSize:11, _w:'Semi Bold', color:brand, letterSpacing:2.5 }))
  c.push(T('Simple, transparent pricing', { parentId:$(1), fontSize:44, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))
  c.push(T('No hidden fees. Start free, scale as you grow.', { parentId:$(1), fontSize:18, color:colors.text2, textAlignHorizontal:'CENTER' }))

  // Tier row
  var rowIdx = c.length
  c.push(H('Tiers', { parentId:$(0), width:contentW, gap:16, counterAxisAlignItems:'STRETCH' }))

  for (var ti = 0; ti < tiers.length; ti++) {
    var t = tiers[ti]
    var tw = Math.floor((contentW - (tiers.length - 1) * 16) / tiers.length)
    var isHl = t.hl
    var tidx = c.length

    // Card
    c.push(F(t.name, { parentId:$(rowIdx), width:tw, paddingTop:32, paddingBottom:32, paddingLeft:28, paddingRight:28, gap:16, fill:isHl ? colors.surface2 : colors.surface, cornerRadius:16 }))

    // Popular badge
    if (isHl) {
      var bidx = c.length
      c.push(H('Popular', { parentId:$(tidx), paddingLeft:10, paddingRight:10, paddingTop:4, paddingBottom:4, fill:brand, cornerRadius:6, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T('MOST POPULAR', { parentId:$(bidx), fontSize:9, _w:'Bold', color:'#ffffff' }))
    }

    // Name
    c.push(T(t.name, { parentId:$(tidx), fontSize:22, _w:'Semi Bold', color:colors.text1 }))

    // Price row
    var pidx = c.length
    c.push(H('Price', { parentId:$(tidx), gap:4, counterAxisAlignItems:'BASELINE' }))
    c.push(T(t.price, { parentId:$(pidx), fontSize:44, _w:'Bold', color:colors.text1 }))
    if (t.period) {
      c.push(T(t.period, { parentId:$(pidx), fontSize:16, color:colors.text3 }))
    }

    // Description
    c.push(T(t.desc, { parentId:$(tidx), fontSize:14, color:colors.text2 }))

    // Divider
    c.push(R('Divider', { parentId:$(tidx), width:tw - 56, height:1, fill:colors.border }))

    // Features list
    var flidx = c.length
    c.push(F('Features', { parentId:$(tidx), gap:10 }))
    for (var fi = 0; fi < t.features.length; fi++) {
      var flrow = c.length
      c.push(H('Feature', { parentId:$(flidx), gap:8, counterAxisAlignItems:'CENTER' }))
      // Checkmark circle
      var chkIdx = c.length
      c.push(H('Check', { parentId:$(flrow), width:18, height:18, fill:isHl ? brand : colors.surface3, cornerRadius:9, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T('✓', { parentId:$(chkIdx), fontSize:10, _w:'Bold', color:isHl ? '#ffffff' : colors.text2 }))
      c.push(T(t.features[fi], { parentId:$(flrow), fontSize:13, color:colors.text2 }))
    }

    // Spacer to push button to bottom
    c.push(F('_grow', { parentId:$(tidx), width:1, height:1, primaryAxisSizingMode:'FILL' }))

    // CTA button
    var btIdx = c.length
    c.push(H(t.cta, { parentId:$(tidx), height:48, paddingLeft:24, paddingRight:24, paddingTop:0, paddingBottom:0, fill:isHl ? brand : 'transparent', cornerRadius:10, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER', primaryAxisSizingMode:'FILL' }))
    c.push(T(t.cta, { parentId:$(btIdx), fontSize:15, _w:'Semi Bold', color:isHl ? '#ffffff' : brand }))
  }
  return c
}

// ═══════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════
function composeCTA(content, colors, brand, W) {
  var c = [], contentW = 1120
  var title = (content && content.ctaTitle) || 'Ready to get started?'
  var sub = (content && content.ctaSub) || 'Join thousands of teams already shipping faster.\nNo credit card required.'
  var btnText = (content && content.cta) || 'Start for free'

  // 0: Section bg
  c.push(F('CTA Section', { width:W, paddingTop:96, paddingBottom:96, paddingLeft:48, paddingRight:48, fill:colors.bg2, counterAxisAlignItems:'CENTER' }))
  // 1: CTA Card
  c.push(F('CTA Card', { parentId:$(0), width:contentW, paddingTop:72, paddingBottom:72, paddingLeft:48, paddingRight:48, gap:24, fill:colors.surface, cornerRadius:24, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  // 2: Heading
  c.push(T(title, { parentId:$(1), fontSize:44, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))
  // 3: Subtitle
  c.push(T(sub, { parentId:$(1), fontSize:18, color:colors.text2, textAlignHorizontal:'CENTER' }))
  // 4: Button row
  c.push(H('CTA Buttons', { parentId:$(1), gap:12, paddingTop:8 }))
  // 5: Primary
  c.push(H('CTA Primary', { parentId:$(4), height:56, paddingLeft:32, paddingRight:32, paddingTop:0, paddingBottom:0, fill:brand, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T(btnText, { parentId:$(5), fontSize:17, _w:'Semi Bold', color:'#ffffff' }))
  // 7: Secondary
  c.push(H('CTA Secondary', { parentId:$(4), height:56, paddingLeft:32, paddingRight:32, paddingTop:0, paddingBottom:0, fill:colors.surface2, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T('Talk to sales →', { parentId:$(7), fontSize:17, _w:'Medium', color:colors.text2 }))

  return c
}

// ═══════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════
function composeFooter(content, colors, brand, W) {
  var c = [], brandName = (content && content.brand) || 'acme'
  var cols = [
    { title:'Product', links:['Features','Pricing','Docs','Changelog'] },
    { title:'Company', links:['About','Blog','Careers','Press'] },
    { title:'Legal', links:['Terms','Privacy','License'] },
  ]

  // 0: Footer top divider
  c.push(R('Footer Divider', { width:W, height:1, fill:colors.border }))
  // 1: Footer frame
  c.push(F('Footer', { width:W, paddingTop:56, paddingBottom:40, paddingLeft:48, paddingRight:48, gap:40, fill:colors.bg }))

  // 2: Footer columns row
  c.push(H('Footer Columns', { parentId:$(1), gap:0 }))

  // 3: Brand column (wider)
  c.push(F('Brand Column', { parentId:$(2), width:360, gap:12 }))
  // 4: Brand row
  c.push(H('Brand', { parentId:$(3), gap:8, counterAxisAlignItems:'CENTER' }))
  // Logo mark
  var lmIdx = c.length
  c.push(H('Logo', { parentId:$(4), width:22, height:22, fill:brand, cornerRadius:5, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T(brandName.charAt(0).toUpperCase(), { parentId:$(lmIdx), fontSize:11, _w:'Bold', color:'#ffffff' }))
  c.push(T(brandName, { parentId:$(4), fontSize:14, _w:'Semi Bold', color:colors.text1 }))
  // Description
  c.push(T('Design-intelligent tools for modern teams.\nBuilt with care, shipped with confidence.', { parentId:$(3), fontSize:13, color:colors.text3, lineHeight:1.6 }))

  // Link columns
  for (var ci2 = 0; ci2 < cols.length; ci2++) {
    var col = cols[ci2]
    var colIdx = c.length
    c.push(F(col.title, { parentId:$(2), width:160, gap:10 }))
    c.push(T(col.title, { parentId:$(colIdx), fontSize:12, _w:'Semi Bold', color:colors.text1 }))
    // Spacer
    c.push(F('_gap', { parentId:$(colIdx), width:1, height:4 }))
    for (var li = 0; li < col.links.length; li++) {
      c.push(T(col.links[li], { parentId:$(colIdx), fontSize:13, color:colors.text3 }))
    }
  }

  // Bottom bar
  c.push(R('Bottom Divider', { parentId:$(1), width:W - 96, height:1, fill:colors.border }))
  var botIdx = c.length
  c.push(H('Bottom', { parentId:$(1), counterAxisAlignItems:'CENTER' }))
  c.push(T('© 2025 ' + brandName + '. All rights reserved.', { parentId:$(botIdx), fontSize:12, color:colors.text3 }))

  return c
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
function composeDashboard(content, colors, brand, W) {
  var c = [], sideW = 260
  var metrics = (content && content.metrics) || [
    { label:'Total Revenue', value:'$48,290', change:'+12.5%', up:true },
    { label:'Active Users', value:'2,420', change:'+8.3%', up:true },
    { label:'Conversion', value:'3.24%', change:'-0.8%', up:false },
    { label:'Avg. Session', value:'4m 32s', change:'+15.2%', up:true },
  ]
  var navItems = ['Overview','Analytics','Customers','Products','Settings']

  // 0: Dashboard root
  c.push(H('Dashboard', { width:W, height:900, fill:colors.bg, gap:0 }))

  // 1: Sidebar
  c.push(F('Sidebar', { parentId:$(0), width:sideW, height:900, paddingTop:20, paddingBottom:20, paddingLeft:16, paddingRight:16, gap:4, fill:colors.surface }))

  // 2: Sidebar logo row
  c.push(H('Sidebar Brand', { parentId:$(1), gap:8, counterAxisAlignItems:'CENTER', paddingLeft:8, paddingBottom:16 }))
  var slmIdx = c.length
  c.push(H('Logo', { parentId:$(2), width:24, height:24, fill:brand, cornerRadius:6, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T('C', { parentId:$(slmIdx), fontSize:12, _w:'Bold', color:'#ffffff' }))
  c.push(T('Conductor', { parentId:$(2), fontSize:14, _w:'Semi Bold', color:colors.text1 }))

  // Nav items
  for (var ni = 0; ni < navItems.length; ni++) {
    var isActive = ni === 0
    var niIdx = c.length
    c.push(H(navItems[ni], { parentId:$(1), height:36, paddingLeft:10, paddingRight:10, paddingTop:0, paddingBottom:0, gap:8, cornerRadius:8, fill:isActive ? colors.surface3 : 'transparent', counterAxisAlignItems:'CENTER', primaryAxisSizingMode:'FILL' }))
    // Dot for active
    if (isActive) {
      c.push(H('Active Dot', { parentId:$(niIdx), width:6, height:6, fill:brand, cornerRadius:3 }))
    }
    c.push(T(navItems[ni], { parentId:$(niIdx), fontSize:13, _w:isActive ? 'Medium' : 'Regular', color:isActive ? colors.text1 : colors.text3 }))
  }

  // Sidebar divider
  c.push(R('Sidebar Divider', { parentId:$(0), width:1, height:900, fill:colors.border }))

  // Main area
  var mainIdx = c.length
  c.push(F('Main', { parentId:$(0), height:900, paddingTop:28, paddingBottom:28, paddingLeft:32, paddingRight:32, gap:24, fill:colors.bg, primaryAxisSizingMode:'FILL' }))

  // Header row
  var hdrIdx = c.length
  c.push(H('Header', { parentId:$(mainIdx), counterAxisAlignItems:'CENTER' }))
  c.push(T('Overview', { parentId:$(hdrIdx), fontSize:24, _w:'Bold', color:colors.text1 }))
  c.push(F('_spacer', { parentId:$(hdrIdx), width:1, height:1, primaryAxisSizingMode:'FILL' }))
  var dlBtnIdx = c.length
  c.push(H('Download', { parentId:$(hdrIdx), height:36, paddingLeft:14, paddingRight:14, paddingTop:0, paddingBottom:0, fill:colors.surface, cornerRadius:8, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
  c.push(T('Export ↓', { parentId:$(dlBtnIdx), fontSize:12, _w:'Medium', color:colors.text2 }))

  // Metrics row
  var mRowIdx = c.length
  c.push(H('Metrics', { parentId:$(mainIdx), gap:16 }))

  for (var mi = 0; mi < metrics.length; mi++) {
    var m = metrics[mi]
    var mIdx = c.length
    c.push(F(m.label, { parentId:$(mRowIdx), paddingTop:20, paddingBottom:20, paddingLeft:20, paddingRight:20, gap:8, fill:colors.surface, cornerRadius:12, primaryAxisSizingMode:'FILL' }))
    c.push(T(m.label, { parentId:$(mIdx), fontSize:12, _w:'Medium', color:colors.text3 }))
    c.push(T(m.value, { parentId:$(mIdx), fontSize:28, _w:'Bold', color:colors.text1 }))
    // Change badge
    var chgIdx = c.length
    c.push(H('Change', { parentId:$(mIdx), paddingLeft:6, paddingRight:6, paddingTop:2, paddingBottom:2, fill:m.up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', cornerRadius:4 }))
    c.push(T(m.change, { parentId:$(chgIdx), fontSize:11, _w:'Semi Bold', color:m.up ? '#4ade80' : '#f87171' }))
  }

  // Chart area
  var chartIdx = c.length
  c.push(F('Chart Area', { parentId:$(mainIdx), paddingTop:24, paddingBottom:24, paddingLeft:24, paddingRight:24, gap:16, fill:colors.surface, cornerRadius:12, primaryAxisSizingMode:'FILL' }))
  var chartHdrIdx = c.length
  c.push(H('Chart Header', { parentId:$(chartIdx), counterAxisAlignItems:'CENTER' }))
  c.push(T('Revenue Over Time', { parentId:$(chartHdrIdx), fontSize:16, _w:'Semi Bold', color:colors.text1 }))
  c.push(F('_spacer', { parentId:$(chartHdrIdx), width:1, height:1, primaryAxisSizingMode:'FILL' }))
  // Period pills
  var pillsIdx = c.length
  c.push(H('Period', { parentId:$(chartHdrIdx), gap:4 }))
  var periods = ['7D','30D','90D','1Y']
  for (var pi = 0; pi < periods.length; pi++) {
    var pillIdx = c.length
    c.push(H(periods[pi], { parentId:$(pillsIdx), height:28, paddingLeft:10, paddingRight:10, paddingTop:0, paddingBottom:0, fill:pi === 1 ? colors.surface3 : 'transparent', cornerRadius:6, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
    c.push(T(periods[pi], { parentId:$(pillIdx), fontSize:11, _w:pi === 1 ? 'Medium' : 'Regular', color:pi === 1 ? colors.text1 : colors.text3 }))
  }
  // Chart placeholder
  c.push(R('Chart', { parentId:$(chartIdx), width:800, height:220, fill:colors.surface2, cornerRadius:8 }))

  return c
}

// ═══════════════════════════════════════════
// SMART COMPONENTS
// ═══════════════════════════════════════════
function composeSmartComponent(type, variant, label, brandColor, mode) {
  var colors = semanticColors(brandColor || '#6366f1', mode || 'dark')
  var brand = brandColor || colors.brand
  var defs = componentDefaults(type, variant)
  if (!defs) return null
  var c = []

  switch (type) {
    case 'button': {
      c.push(H((label || 'Button') + ' — ' + (variant || 'default'), { height:defs.h, paddingLeft:defs.px, paddingRight:defs.px, paddingTop:0, paddingBottom:0, fill:brand, cornerRadius:defs.radius, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER', gap:8 }))
      c.push(T(label || 'Get started', { parentId:$(0), fontSize:defs.fontSize, _w:defs.fontWeight, color:'#ffffff' }))
      break
    }
    case 'input': {
      c.push(F('Input — ' + (variant || 'default'), { gap:6 }))
      c.push(T(label || 'Email address', { parentId:$(0), fontSize:13, _w:'Medium', color:colors.text2 }))
      c.push(H('Input Field', { parentId:$(0), height:defs.h, paddingLeft:defs.px, paddingRight:defs.px, paddingTop:0, paddingBottom:0, fill:colors.surface, cornerRadius:defs.radius, counterAxisAlignItems:'CENTER' }))
      c.push(T('you@example.com', { parentId:$(2), fontSize:defs.fontSize, color:colors.text3 }))
      break
    }
    case 'card': {
      c.push(F(label || 'Card', { paddingTop:defs.py, paddingBottom:defs.py, paddingLeft:defs.px, paddingRight:defs.px, gap:defs.gap, fill:colors.surface, cornerRadius:defs.radius }))
      var icIdx = c.length
      c.push(H('Icon', { parentId:$(0), width:48, height:48, fill:colors.surface3, cornerRadius:12, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T('⚡', { parentId:$(icIdx), fontSize:22 }))
      c.push(T(label || 'Feature title', { parentId:$(0), fontSize:18, _w:'Semi Bold', color:colors.text1 }))
      c.push(T('A short description of this feature and why it matters to your users.', { parentId:$(0), fontSize:14, color:colors.text2, lineHeight:1.6 }))
      c.push(R('Divider', { parentId:$(0), width:200, height:1, fill:colors.border }))
      c.push(T('Learn more →', { parentId:$(0), fontSize:13, _w:'Medium', color:brand }))
      break
    }
    case 'modal': {
      c.push(F('Modal Overlay', { width:1440, height:900, fill:'#00000080', primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(F('Modal', { parentId:$(0), width:defs.maxW, paddingTop:defs.py, paddingBottom:defs.py, paddingLeft:defs.px, paddingRight:defs.px, gap:defs.gap, fill:colors.surface, cornerRadius:defs.radius }))
      c.push(T(label || 'Confirm action', { parentId:$(1), fontSize:18, _w:'Semi Bold', color:colors.text1 }))
      c.push(T('Are you sure you want to proceed? This action cannot be undone.', { parentId:$(1), fontSize:15, color:colors.text2 }))
      c.push(R('Divider', { parentId:$(1), width:defs.maxW - defs.px * 2, height:1, fill:colors.border }))
      c.push(H('Actions', { parentId:$(1), gap:8, primaryAxisAlignItems:'MAX' }))
      c.push(H('Cancel', { parentId:$(5), height:40, paddingLeft:16, paddingRight:16, paddingTop:0, paddingBottom:0, fill:colors.surface2, cornerRadius:8, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T('Cancel', { parentId:$(6), fontSize:14, _w:'Medium', color:colors.text2 }))
      c.push(H('Confirm', { parentId:$(5), height:40, paddingLeft:16, paddingRight:16, paddingTop:0, paddingBottom:0, fill:brand, cornerRadius:8, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T('Confirm', { parentId:$(8), fontSize:14, _w:'Semi Bold', color:'#ffffff' }))
      break
    }
    case 'avatar': {
      c.push(H('Avatar', { width:defs.size, height:defs.size, fill:brand, cornerRadius:defs.radius, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T((label || 'A').charAt(0).toUpperCase(), { parentId:$(0), fontSize:defs.fontSize, _w:defs.fontWeight, color:'#ffffff' }))
      break
    }
    case 'badge': {
      c.push(H('Badge', { height:defs.h, paddingLeft:defs.px, paddingRight:defs.px, paddingTop:0, paddingBottom:0, fill:colors.surface2, cornerRadius:defs.radius, primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'CENTER' }))
      c.push(T(label || 'New', { parentId:$(0), fontSize:defs.fontSize, _w:defs.fontWeight, color:brand }))
      break
    }
    default: {
      c.push(F(type, { paddingTop:16, paddingBottom:16, paddingLeft:16, paddingRight:16, gap:8, fill:colors.surface, cornerRadius:8 }))
      c.push(T(label || type, { parentId:$(0), fontSize:14, color:colors.text1 }))
    }
  }
  return c
}

// ═══════════════════════════════════════════
// SECTION ROUTER
// ═══════════════════════════════════════════
function composeSection(type, content, brandColor, mode, width) {
  var W = width || 1440
  var colors = semanticColors(brandColor || '#6366f1', mode || 'dark')
  var brand = brandColor || '#6366f1'

  switch (type) {
    case 'nav': return composeNav(content, colors, brand, W)
    case 'hero': return composeHero(content, colors, brand, W)
    case 'stats': return composeStats(content, colors, brand, W)
    case 'features': return composeFeatures(content, colors, brand, W)
    case 'testimonials': return composeTestimonials(content, colors, brand, W)
    case 'pricing': return composePricing(content, colors, brand, W)
    case 'cta': return composeCTA(content, colors, brand, W)
    case 'footer': return composeFooter(content, colors, brand, W)
    case 'dashboard': return composeDashboard(content, colors, brand, W)
    default:
      var c = []
      c.push(F(type + ' Section', { width:W, paddingTop:96, paddingBottom:96, paddingLeft:48, paddingRight:48, gap:32, fill:colors.bg, counterAxisAlignItems:'CENTER' }))
      c.push(T((content && content.title) || type, { parentId:$(0), fontSize:40, _w:'Bold', color:colors.text1, textAlignHorizontal:'CENTER' }))
      return c
  }
}

// ═══════════════════════════════════════════
// PAGE COMPOSER
// ═══════════════════════════════════════════
function composePage(type, content, brandColor, mode, width) {
  var sections = []
  switch (type) {
    case 'landing': sections = ['nav','hero','stats','features','testimonials','cta','footer']; break
    case 'pricing': sections = ['nav','pricing','cta','footer']; break
    case 'dashboard': sections = ['dashboard']; break
    default: sections = ['nav','hero','features','cta','footer']
  }
  return { sections:sections, content:content, brand:brandColor || '#6366f1', mode:mode || 'dark', width:width || 1440 }
}

export { runSequence, composeSmartComponent, composeSection, composePage }
