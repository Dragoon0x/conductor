// ═══════════════════════════════════════════
// CONDUCTOR — Blueprints v2
// ═══════════════════════════════════════════
// Polished, production-grade command sequences.
// Every value is intentional. Every pixel is grid-aligned.

import { snapToGrid, generateTypeScale, generateSemanticColors, generatePalette } from './design/intelligence.js';

// ─── Helpers ───

function frame(name, opts) {
  return { type: 'create_frame', data: Object.assign({ name: name, direction: 'VERTICAL', padding: 0, gap: 0, fill: '#0c0c18', cornerRadius: 0 }, opts) };
}

function hframe(name, opts) {
  return frame(name, Object.assign({ direction: 'HORIZONTAL' }, opts));
}

function text(content, opts) {
  return { type: 'create_text', data: Object.assign({ text: content, fontSize: 16, color: '#ffffff', fontName: { family: 'Inter', style: 'Regular' } }, opts) };
}

function rect(name, opts) {
  return { type: 'create_rect', data: Object.assign({ name: name, width: 100, height: 100 }, opts) };
}

function ap(ref, cmd) { cmd.data.parentId = ref; return cmd; }

// ═══════════════════════════════════════════
// LANDING PAGE — Premium quality
// ═══════════════════════════════════════════

export function buildLandingPage(args) {
  var brand = args.brandColor || '#6366f1';
  var W = args.width || 1440;
  var contentW = 1120;
  var dark = args.darkMode !== false;

  // Palette
  var bg =       dark ? '#09090f' : '#ffffff';
  var bg2 =      dark ? '#0f0f1c' : '#f9f9fb';
  var bg3 =      dark ? '#14142a' : '#f3f3f7';
  var cardBg =   dark ? '#12122a' : '#ffffff';
  var cardBorder = dark ? '#1e1e3a' : '#e8e8ee';
  var text1 =    dark ? '#f0f0f8' : '#111118';
  var text2 =    dark ? '#a0a0b8' : '#55556a';
  var text3 =    dark ? '#686880' : '#88889a';
  var divider =  dark ? '#1a1a32' : '#e4e4ec';

  var title = args.title || 'Ship faster with\nless overhead';
  var subtitle = args.subtitle || 'The modern platform for teams that move fast.\nEverything you need to build, deploy, and scale.';
  var ctaText = args.ctaText || 'Start for free';
  var navItems = args.navItems || ['Features', 'Pricing', 'Docs', 'Blog'];
  var features = args.features || [
    { icon: '⚡', title: 'Instant Deploy', desc: 'Push to deploy in seconds. Zero config. Automatic HTTPS, global CDN, and instant rollbacks.' },
    { icon: '📈', title: 'Auto Scale', desc: 'Scales to millions of requests automatically. Pay only for what you use. No capacity planning.' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 Type II compliant. End-to-end encryption. SSO, RBAC, and audit logs built in.' },
  ];
  var stats = args.stats || [
    { value: '10,000+', label: 'Teams worldwide' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 50ms', label: 'Global latency' },
    { value: '4.9/5', label: 'Customer rating' },
  ];

  var cmds = [];

  // ── 0: Page Root ──
  cmds.push(frame('Landing Page', { width: W, fill: bg, gap: 0, primaryAxisSizingMode: 'HUG' }));

  // ── 1: Navigation ──
  var navIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Navigation', {
    width: W, height: 72, paddingLeft: 48, paddingRight: 48, paddingTop: 0, paddingBottom: 0, gap: 0, fill: bg,
    counterAxisAlignItems: 'CENTER',
  })));

  // Nav logo
  cmds.push(ap('$' + navIdx + '.id', text(args.brand || 'acme', {
    fontSize: 20, color: text1, fontName: { family: 'Inter', style: 'Bold' },
  })));

  // Nav spacer (pushes links right)
  var spacerIdx = cmds.length;
  cmds.push(ap('$' + navIdx + '.id', frame('_spacer', {
    width: 1, height: 1, fill: bg, primaryAxisSizingMode: 'FILL',
  })));

  // Nav links container
  var navLinksIdx = cmds.length;
  cmds.push(ap('$' + navIdx + '.id', hframe('Nav Links', {
    gap: 32, fill: bg, counterAxisAlignItems: 'CENTER',
  })));

  for (var i = 0; i < navItems.length; i++) {
    cmds.push(ap('$' + navLinksIdx + '.id', text(navItems[i], {
      fontSize: 14, color: text2, fontName: { family: 'Inter', style: 'Medium' },
    })));
  }

  // Nav CTA
  var navBtnIdx = cmds.length;
  cmds.push(ap('$' + navIdx + '.id', hframe('Nav CTA', {
    height: 40, paddingLeft: 20, paddingRight: 20, paddingTop: 0, paddingBottom: 0,
    fill: brand, cornerRadius: 8,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + navBtnIdx + '.id', text('Get started', {
    fontSize: 14, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // ── Divider ──
  cmds.push(ap('$0.id', rect('Nav Divider', { width: W, height: 1, fill: divider })));

  // ── Hero Section ──
  var heroIdx = cmds.length;
  cmds.push(ap('$0.id', frame('Hero Section', {
    width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48,
    gap: 32, fill: bg,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  // Overline badge
  var badgeIdx = cmds.length;
  cmds.push(ap('$' + heroIdx + '.id', hframe('Badge', {
    paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
    fill: dark ? '#1a1a36' : '#f0f0ff', cornerRadius: 20,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER', gap: 8,
  })));
  cmds.push(ap('$' + badgeIdx + '.id', text('✦', { fontSize: 10, color: brand })));
  cmds.push(ap('$' + badgeIdx + '.id', text('Now available — v2.0 is here', {
    fontSize: 12, color: dark ? '#b0b0d0' : '#5555aa', fontName: { family: 'Inter', style: 'Medium' },
  })));

  // Hero heading
  cmds.push(ap('$' + heroIdx + '.id', text(title, {
    fontSize: 64, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  // Hero subtitle
  cmds.push(ap('$' + heroIdx + '.id', text(subtitle, {
    fontSize: 20, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Hero button row
  var btnRowIdx = cmds.length;
  cmds.push(ap('$' + heroIdx + '.id', hframe('Hero Buttons', {
    gap: 12, fill: bg,
    primaryAxisAlignItems: 'CENTER',
  })));

  // Primary CTA
  var pBtnIdx = cmds.length;
  cmds.push(ap('$' + btnRowIdx + '.id', hframe('Primary CTA', {
    height: 52, paddingLeft: 28, paddingRight: 28, paddingTop: 0, paddingBottom: 0,
    fill: brand, cornerRadius: 12,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + pBtnIdx + '.id', text(ctaText, {
    fontSize: 16, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Secondary CTA
  var sBtnIdx = cmds.length;
  cmds.push(ap('$' + btnRowIdx + '.id', hframe('Secondary CTA', {
    height: 52, paddingLeft: 28, paddingRight: 28, paddingTop: 0, paddingBottom: 0,
    fill: 'transparent', cornerRadius: 12,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + sBtnIdx + '.id', text('See how it works →', {
    fontSize: 16, color: text2, fontName: { family: 'Inter', style: 'Medium' },
  })));

  // ── Social proof line ──
  var proofIdx = cmds.length;
  cmds.push(ap('$' + heroIdx + '.id', hframe('Social Proof', {
    gap: 8, fill: bg, counterAxisAlignItems: 'CENTER',
    paddingTop: 16,
  })));
  cmds.push(ap('$' + proofIdx + '.id', text('★★★★★', {
    fontSize: 14, color: '#fbbf24',
  })));
  cmds.push(ap('$' + proofIdx + '.id', text('Loved by 10,000+ teams', {
    fontSize: 13, color: text3, fontName: { family: 'Inter', style: 'Medium' },
  })));

  // ── Stats Section ──
  var statsIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Stats Bar', {
    width: W, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48,
    gap: 0, fill: bg2,
    primaryAxisAlignItems: 'CENTER',
  })));

  // Stats inner container (centered, max-width)
  var statsInnerIdx = cmds.length;
  cmds.push(ap('$' + statsIdx + '.id', hframe('Stats Inner', {
    width: contentW, gap: 0, fill: bg2,
  })));

  for (var s = 0; s < stats.length; s++) {
    var statIdx = cmds.length;
    var statW = Math.floor(contentW / stats.length);
    cmds.push(ap('$' + statsInnerIdx + '.id', frame('Stat: ' + stats[s].label, {
      width: statW, paddingTop: 24, paddingBottom: 24, gap: 4, fill: bg2,
      primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
    })));
    cmds.push(ap('$' + statIdx + '.id', text(stats[s].value, {
      fontSize: 36, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    })));
    cmds.push(ap('$' + statIdx + '.id', text(stats[s].label, {
      fontSize: 14, color: text3, fontName: { family: 'Inter', style: 'Medium' },
    })));
  }

  // ── Features Section ──
  var featIdx = cmds.length;
  cmds.push(ap('$0.id', frame('Features Section', {
    width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48,
    gap: 48, fill: bg,
    counterAxisAlignItems: 'CENTER',
  })));

  // Features header
  var featHeaderIdx = cmds.length;
  cmds.push(ap('$' + featIdx + '.id', frame('Features Header', {
    gap: 16, fill: bg, counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + featHeaderIdx + '.id', text('Everything you need', {
    fontSize: 40, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));
  cmds.push(ap('$' + featHeaderIdx + '.id', text('Powerful features to help your team ship faster\nand with more confidence.', {
    fontSize: 18, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Feature card row
  var cardRowIdx = cmds.length;
  cmds.push(ap('$' + featIdx + '.id', hframe('Feature Cards', {
    width: contentW, gap: 24, fill: bg,
  })));

  for (var f = 0; f < features.length; f++) {
    var cardW = Math.floor((contentW - (features.length - 1) * 24) / features.length);
    var cardIdx = cmds.length;
    cmds.push(ap('$' + cardRowIdx + '.id', frame(features[f].title, {
      width: cardW, paddingTop: 32, paddingBottom: 32, paddingLeft: 28, paddingRight: 28,
      gap: 16, fill: cardBg, cornerRadius: 16,
    })));

    // Icon circle
    var iconIdx = cmds.length;
    cmds.push(ap('$' + cardIdx + '.id', hframe('Icon', {
      width: 48, height: 48, fill: dark ? '#1c1c3a' : '#f0f0ff', cornerRadius: 12,
      primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
    })));
    cmds.push(ap('$' + iconIdx + '.id', text(features[f].icon, { fontSize: 20 })));

    // Card title
    cmds.push(ap('$' + cardIdx + '.id', text(features[f].title, {
      fontSize: 20, color: text1, fontName: { family: 'Inter', style: 'Semi Bold' },
    })));

    // Card description
    cmds.push(ap('$' + cardIdx + '.id', text(features[f].desc, {
      fontSize: 15, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    })));

    // Learn more link
    cmds.push(ap('$' + cardIdx + '.id', text('Learn more →', {
      fontSize: 14, color: brand, fontName: { family: 'Inter', style: 'Medium' },
    })));
  }

  // ── CTA Section ──
  var ctaSectionIdx = cmds.length;
  cmds.push(ap('$0.id', frame('CTA Section', {
    width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48,
    gap: 0, fill: bg2,
    counterAxisAlignItems: 'CENTER',
  })));

  // CTA card
  var ctaCardIdx = cmds.length;
  cmds.push(ap('$' + ctaSectionIdx + '.id', frame('CTA Card', {
    width: contentW, paddingTop: 64, paddingBottom: 64, paddingLeft: 48, paddingRight: 48,
    gap: 28, fill: dark ? '#14142e' : '#ffffff', cornerRadius: 20,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(ap('$' + ctaCardIdx + '.id', text('Ready to get started?', {
    fontSize: 44, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  cmds.push(ap('$' + ctaCardIdx + '.id', text('Join thousands of teams already shipping faster.\nNo credit card required.', {
    fontSize: 18, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  var ctaBtnRowIdx = cmds.length;
  cmds.push(ap('$' + ctaCardIdx + '.id', hframe('CTA Buttons', {
    gap: 12, fill: dark ? '#14142e' : '#ffffff',
  })));

  var ctaPrimaryIdx = cmds.length;
  cmds.push(ap('$' + ctaBtnRowIdx + '.id', hframe('CTA Primary', {
    height: 56, paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 0,
    fill: brand, cornerRadius: 12,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + ctaPrimaryIdx + '.id', text(ctaText, {
    fontSize: 17, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  var ctaSecIdx = cmds.length;
  cmds.push(ap('$' + ctaBtnRowIdx + '.id', hframe('CTA Secondary', {
    height: 56, paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 0,
    fill: 'transparent', cornerRadius: 12,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + ctaSecIdx + '.id', text('Talk to sales →', {
    fontSize: 17, color: text2, fontName: { family: 'Inter', style: 'Medium' },
  })));

  // ── Footer ──
  cmds.push(ap('$0.id', rect('Footer Divider', { width: W, height: 1, fill: divider })));

  var footerIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Footer', {
    width: W, paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48,
    gap: 0, fill: bg,
    counterAxisAlignItems: 'CENTER',
  })));

  // Footer left
  cmds.push(ap('$' + footerIdx + '.id', text(args.brand || 'acme', {
    fontSize: 16, color: text3, fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Footer spacer
  cmds.push(ap('$' + footerIdx + '.id', frame('_spacer', { width: 1, height: 1, fill: bg, primaryAxisSizingMode: 'FILL' })));

  // Footer right
  cmds.push(ap('$' + footerIdx + '.id', text('© 2025 ' + (args.brand || 'Acme') + ' Inc. All rights reserved.', {
    fontSize: 13, color: text3, fontName: { family: 'Inter', style: 'Regular' },
  })));

  return {
    commands: cmds,
    description: 'Landing page: nav, hero with badge, ' + stats.length + ' stats, ' + features.length + ' feature cards with icons, CTA card, footer. ' + cmds.length + ' elements.',
  };
}

// ═══════════════════════════════════════════
// PRICING PAGE
// ═══════════════════════════════════════════

export function buildPricingPage(args) {
  var brand = args.brandColor || '#6366f1';
  var W = args.width || 1440;
  var contentW = 1080;
  var bg = '#09090f';
  var bg2 = '#0f0f1c';
  var cardBg = '#12122a';
  var text1 = '#f0f0f8';
  var text2 = '#a0a0b8';
  var text3 = '#686880';
  var divider = '#1a1a32';

  var tiers = args.tiers || [
    { name: 'Starter', price: '$0', period: '/mo', desc: 'For side projects and experiments.', features: ['1 project', '1,000 API calls/day', 'Community support', 'Basic analytics'], cta: 'Start free', highlighted: false },
    { name: 'Pro', price: '$29', period: '/mo', desc: 'For growing teams that need more power.', features: ['Unlimited projects', '100,000 API calls/day', 'Priority support', 'Advanced analytics', 'Team collaboration', 'Custom domains', 'Webhooks'], cta: 'Start free trial', highlighted: true },
    { name: 'Enterprise', price: 'Custom', period: '', desc: 'For organizations with advanced needs.', features: ['Everything in Pro', 'Unlimited API calls', 'Dedicated support', 'SSO & SAML', '99.99% SLA', 'Custom integrations', 'On-premise option', 'Audit logs'], cta: 'Contact sales', highlighted: false },
  ];

  var cmds = [];

  // 0: Root
  cmds.push(frame('Pricing Page', { width: W, fill: bg, primaryAxisSizingMode: 'HUG' }));

  // Header
  var headerIdx = cmds.length;
  cmds.push(ap('$0.id', frame('Pricing Header', {
    width: W, paddingTop: 96, paddingBottom: 64, paddingLeft: 48, paddingRight: 48,
    gap: 20, fill: bg,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(ap('$' + headerIdx + '.id', text('Simple, transparent pricing', {
    fontSize: 52, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  cmds.push(ap('$' + headerIdx + '.id', text('No hidden fees. No surprises. Cancel anytime.\nStart free and scale as you grow.', {
    fontSize: 18, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Tier row
  var tierRowIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Pricing Tiers', {
    width: W, paddingLeft: Math.floor((W - contentW) / 2), paddingRight: Math.floor((W - contentW) / 2),
    paddingTop: 0, paddingBottom: 96,
    gap: 20, fill: bg, counterAxisAlignItems: 'STRETCH',
  })));

  for (var t = 0; t < tiers.length; t++) {
    var tier = tiers[t];
    var isHl = tier.highlighted;
    var cardW = Math.floor((contentW - (tiers.length - 1) * 20) / tiers.length);

    var tierIdx = cmds.length;
    cmds.push(ap('$' + tierRowIdx + '.id', frame(tier.name, {
      width: cardW, paddingTop: 36, paddingBottom: 36, paddingLeft: 32, paddingRight: 32,
      gap: 20, cornerRadius: 16,
      fill: isHl ? '#1a1a3e' : cardBg,
    })));

    // Popular badge
    if (isHl) {
      var bIdx = cmds.length;
      cmds.push(ap('$' + tierIdx + '.id', hframe('Popular', {
        paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4,
        fill: brand, cornerRadius: 6,
        primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
      })));
      cmds.push(ap('$' + bIdx + '.id', text('MOST POPULAR', {
        fontSize: 10, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' },
      })));
    }

    // Tier name
    cmds.push(ap('$' + tierIdx + '.id', text(tier.name, {
      fontSize: 22, color: text1, fontName: { family: 'Inter', style: 'Semi Bold' },
    })));

    // Price row
    var priceIdx = cmds.length;
    cmds.push(ap('$' + tierIdx + '.id', hframe('Price', {
      gap: 4, fill: isHl ? '#1a1a3e' : cardBg,
      counterAxisAlignItems: 'BASELINE',
    })));
    cmds.push(ap('$' + priceIdx + '.id', text(tier.price, {
      fontSize: 48, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    })));
    if (tier.period) {
      cmds.push(ap('$' + priceIdx + '.id', text(tier.period, {
        fontSize: 16, color: text3, fontName: { family: 'Inter', style: 'Regular' },
      })));
    }

    // Description
    cmds.push(ap('$' + tierIdx + '.id', text(tier.desc, {
      fontSize: 14, color: text2, fontName: { family: 'Inter', style: 'Regular' },
    })));

    // Divider
    cmds.push(ap('$' + tierIdx + '.id', rect('Divider', {
      width: cardW - 64, height: 1, fill: divider,
    })));

    // Features list
    var featListIdx = cmds.length;
    cmds.push(ap('$' + tierIdx + '.id', frame('Features', {
      gap: 12, fill: isHl ? '#1a1a3e' : cardBg,
    })));

    for (var fi = 0; fi < tier.features.length; fi++) {
      cmds.push(ap('$' + featListIdx + '.id', text('✓  ' + tier.features[fi], {
        fontSize: 14, color: text2, fontName: { family: 'Inter', style: 'Regular' },
      })));
    }

    // CTA button
    var btnIdx = cmds.length;
    cmds.push(ap('$' + tierIdx + '.id', hframe(tier.cta, {
      height: 48, paddingLeft: 24, paddingRight: 24, paddingTop: 0, paddingBottom: 0,
      fill: isHl ? brand : 'transparent',
      cornerRadius: 10,
      primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
      primaryAxisSizingMode: 'FILL',
    })));
    cmds.push(ap('$' + btnIdx + '.id', text(tier.cta, {
      fontSize: 15, color: isHl ? '#ffffff' : brand,
      fontName: { family: 'Inter', style: 'Semi Bold' },
    })));
  }

  return {
    commands: cmds,
    description: 'Pricing page with header and ' + tiers.length + ' tiers (' + tiers.map(function(t) { return t.name; }).join(', ') + '). ' + cmds.length + ' elements.',
  };
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════

export function buildDashboardPage(args) {
  var W = args.width || 1440;
  var brand = args.brandColor || '#6366f1';
  var bg = '#09090f';
  var sidebarBg = '#0c0c18';
  var cardBg = '#12122a';
  var text1 = '#f0f0f8';
  var text2 = '#a0a0b8';
  var text3 = '#686880';
  var divider = '#1a1a32';
  var sideW = 260;

  var metrics = args.metrics || [
    { label: 'Total Revenue', value: '$48,290', change: '+12.5%', positive: true },
    { label: 'Active Users', value: '2,420', change: '+8.3%', positive: true },
    { label: 'Conversion', value: '3.24%', change: '-0.8%', positive: false },
    { label: 'Avg. Session', value: '4m 32s', change: '+15.2%', positive: true },
  ];

  var cmds = [];

  cmds.push(hframe('Dashboard', { width: W, height: 900, fill: bg, gap: 0 }));

  // Sidebar
  var sideIdx = cmds.length;
  cmds.push(ap('$0.id', frame('Sidebar', {
    width: sideW, height: 900, paddingTop: 24, paddingBottom: 24, paddingLeft: 20, paddingRight: 20,
    gap: 4, fill: sidebarBg,
  })));

  cmds.push(ap('$' + sideIdx + '.id', text('◆  Dashboard', {
    fontSize: 16, color: text1, fontName: { family: 'Inter', style: 'Bold' },
  })));

  cmds.push(ap('$' + sideIdx + '.id', frame('_gap', { width: 1, height: 20, fill: sidebarBg })));

  var sideNavItems = [
    { label: 'Overview', active: true },
    { label: 'Analytics', active: false },
    { label: 'Customers', active: false },
    { label: 'Products', active: false },
    { label: 'Settings', active: false },
  ];

  for (var si = 0; si < sideNavItems.length; si++) {
    var navItem = sideNavItems[si];
    var niIdx = cmds.length;
    cmds.push(ap('$' + sideIdx + '.id', hframe(navItem.label, {
      height: 40, paddingLeft: 12, paddingRight: 12, paddingTop: 0, paddingBottom: 0,
      gap: 8, cornerRadius: 8,
      fill: navItem.active ? '#1a1a36' : sidebarBg,
      counterAxisAlignItems: 'CENTER', primaryAxisSizingMode: 'FILL',
    })));
    cmds.push(ap('$' + niIdx + '.id', text(navItem.label, {
      fontSize: 14, color: navItem.active ? text1 : text3,
      fontName: { family: 'Inter', style: navItem.active ? 'Medium' : 'Regular' },
    })));
  }

  // Sidebar divider
  cmds.push(ap('$0.id', rect('Sidebar Divider', { width: 1, height: 900, fill: divider })));

  // Main
  var mainIdx = cmds.length;
  cmds.push(ap('$0.id', frame('Main', {
    width: W - sideW - 1, height: 900,
    paddingTop: 32, paddingBottom: 32, paddingLeft: 40, paddingRight: 40,
    gap: 28, fill: bg,
  })));

  // Header
  cmds.push(ap('$' + mainIdx + '.id', text('Overview', {
    fontSize: 28, color: text1, fontName: { family: 'Inter', style: 'Bold' },
  })));

  // Metrics row
  var metricsRowIdx = cmds.length;
  cmds.push(ap('$' + mainIdx + '.id', hframe('Metrics', {
    gap: 20, fill: bg,
  })));

  var metricW = Math.floor((W - sideW - 1 - 80 - (metrics.length - 1) * 20) / metrics.length);
  for (var mi = 0; mi < metrics.length; mi++) {
    var mIdx = cmds.length;
    cmds.push(ap('$' + metricsRowIdx + '.id', frame(metrics[mi].label, {
      width: metricW, paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
      gap: 8, fill: cardBg, cornerRadius: 12,
    })));
    cmds.push(ap('$' + mIdx + '.id', text(metrics[mi].label, {
      fontSize: 13, color: text3, fontName: { family: 'Inter', style: 'Medium' },
    })));
    cmds.push(ap('$' + mIdx + '.id', text(metrics[mi].value, {
      fontSize: 32, color: text1, fontName: { family: 'Inter', style: 'Bold' },
    })));
    cmds.push(ap('$' + mIdx + '.id', text(metrics[mi].change, {
      fontSize: 13, color: metrics[mi].positive ? '#4ade80' : '#f87171',
      fontName: { family: 'Inter', style: 'Semi Bold' },
    })));
  }

  // Chart
  var chartIdx = cmds.length;
  cmds.push(ap('$' + mainIdx + '.id', frame('Chart Area', {
    paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28,
    gap: 16, fill: cardBg, cornerRadius: 12,
    primaryAxisSizingMode: 'FILL',
  })));

  var chartHeaderIdx = cmds.length;
  cmds.push(ap('$' + chartIdx + '.id', hframe('Chart Header', {
    gap: 12, fill: cardBg, counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(ap('$' + chartHeaderIdx + '.id', text('Revenue Over Time', {
    fontSize: 18, color: text1, fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  cmds.push(ap('$' + chartIdx + '.id', rect('Chart Placeholder', {
    width: W - sideW - 1 - 80 - 56, height: 240, fill: '#16163a', cornerRadius: 8,
  })));

  return {
    commands: cmds,
    description: 'Dashboard with sidebar (' + sideNavItems.length + ' nav items), header, ' + metrics.length + ' metric cards, and chart area. ' + cmds.length + ' elements.',
  };
}

// ═══════════════════════════════════════════
// SECTION BLUEPRINTS
// ═══════════════════════════════════════════

export function buildSection(sectionType, args) {
  switch (sectionType) {
    case 'hero': return buildHeroSection(args);
    case 'features': return buildFeaturesSection(args);
    case 'pricing': return buildPricingSection(args);
    case 'cta': return buildCTASection(args);
    case 'testimonials': return buildTestimonialsSection(args);
    case 'faq': return buildFAQSection(args);
    default: return buildHeroSection(args);
  }
}

function buildHeroSection(args) {
  var W = args.width || 1440;
  var brand = args.brandColor || '#6366f1';
  var bg = '#09090f';
  var cmds = [];

  cmds.push(frame('Hero', { width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48, gap: 32, fill: bg, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }));
  cmds.push(ap('$0.id', text(args.heading || 'Build something great', { fontSize: 64, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(ap('$0.id', text(args.subheading || 'The platform for modern teams.', { fontSize: 20, color: '#a0a0b8', textAlignHorizontal: 'CENTER' })));

  var btnIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('CTA', { height: 52, paddingLeft: 28, paddingRight: 28, paddingTop: 0, paddingBottom: 0, fill: brand, cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + btnIdx + '.id', text(args.ctaText || 'Get started', { fontSize: 16, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));

  return { commands: cmds, description: 'Hero section with heading, subtitle, and CTA.' };
}

function buildFeaturesSection(args) {
  var W = args.width || 1440;
  var features = args.features || [
    { title: 'Fast', desc: 'Blazing fast performance out of the box.' },
    { title: 'Secure', desc: 'Enterprise-grade security by default.' },
    { title: 'Scalable', desc: 'Grows seamlessly with your team.' },
  ];
  var cmds = [];

  cmds.push(frame('Features', { width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48, gap: 48, fill: '#09090f', counterAxisAlignItems: 'CENTER' }));
  cmds.push(ap('$0.id', text(args.heading || 'Features', { fontSize: 40, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var rowIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Cards', { width: 1120, gap: 24, fill: '#09090f' })));

  for (var i = 0; i < features.length; i++) {
    var cw = Math.floor((1120 - (features.length - 1) * 24) / features.length);
    var ci = cmds.length;
    cmds.push(ap('$' + rowIdx + '.id', frame(features[i].title, { width: cw, paddingTop: 32, paddingBottom: 32, paddingLeft: 28, paddingRight: 28, gap: 16, fill: '#12122a', cornerRadius: 16 })));
    cmds.push(ap('$' + ci + '.id', text(features[i].title, { fontSize: 20, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(ap('$' + ci + '.id', text(features[i].desc, { fontSize: 15, color: '#a0a0b8' })));
  }

  return { commands: cmds, description: 'Features section with ' + features.length + ' cards.' };
}

function buildPricingSection(args) { return buildPricingPage(args); }

function buildCTASection(args) {
  var W = args.width || 1440;
  var brand = args.brandColor || '#6366f1';
  var cmds = [];

  cmds.push(frame('CTA', { width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48, gap: 28, fill: '#0f0f1c', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }));
  cmds.push(ap('$0.id', text(args.heading || 'Ready to start?', { fontSize: 44, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(ap('$0.id', text(args.subheading || 'Join thousands of teams shipping faster.', { fontSize: 18, color: '#a0a0b8', textAlignHorizontal: 'CENTER' })));
  var btnIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('CTA Button', { height: 56, paddingLeft: 32, paddingRight: 32, paddingTop: 0, paddingBottom: 0, fill: brand, cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(ap('$' + btnIdx + '.id', text(args.ctaText || 'Get started free', { fontSize: 17, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));

  return { commands: cmds, description: 'CTA section with heading, subtitle, and button.' };
}

function buildTestimonialsSection(args) {
  var W = args.width || 1440;
  var testimonials = args.testimonials || [
    { quote: 'This product transformed how our team works. The speed and reliability are unmatched.', author: 'Sarah Chen', role: 'CTO, TechCorp' },
    { quote: 'Best tool we adopted this year. Our deployment time dropped by 80%.', author: 'Marcus Rivera', role: 'VP Engineering, ScaleUp' },
  ];
  var cmds = [];

  cmds.push(frame('Testimonials', { width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48, gap: 48, fill: '#09090f', counterAxisAlignItems: 'CENTER' }));
  cmds.push(ap('$0.id', text('Trusted by the best teams', { fontSize: 40, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var rowIdx = cmds.length;
  cmds.push(ap('$0.id', hframe('Cards', { width: 1120, gap: 24, fill: '#09090f' })));

  for (var i = 0; i < testimonials.length; i++) {
    var tw = Math.floor((1120 - (testimonials.length - 1) * 24) / testimonials.length);
    var ti = cmds.length;
    cmds.push(ap('$' + rowIdx + '.id', frame('Testimonial', { width: tw, paddingTop: 32, paddingBottom: 32, paddingLeft: 28, paddingRight: 28, gap: 20, fill: '#12122a', cornerRadius: 16 })));
    cmds.push(ap('$' + ti + '.id', text('★★★★★', { fontSize: 16, color: '#fbbf24' })));
    cmds.push(ap('$' + ti + '.id', text('"' + testimonials[i].quote + '"', { fontSize: 16, color: '#d0d0e0', fontName: { family: 'Inter', style: 'Regular' } })));
    cmds.push(ap('$' + ti + '.id', text(testimonials[i].author, { fontSize: 15, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(ap('$' + ti + '.id', text(testimonials[i].role, { fontSize: 13, color: '#686880' })));
  }

  return { commands: cmds, description: 'Testimonials with ' + testimonials.length + ' cards.' };
}

function buildFAQSection(args) {
  var W = args.width || 1440;
  var faqs = args.faqs || [
    { q: 'How do I get started?', a: 'Sign up for a free account and follow our quick-start guide. You will be up and running in less than 5 minutes.' },
    { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no cancellation fees. Cancel with one click from your dashboard.' },
    { q: 'Do you offer support?', a: 'All plans include email support. Pro and Enterprise plans get priority support with guaranteed response times.' },
  ];
  var cmds = [];

  cmds.push(frame('FAQ', { width: W, paddingTop: 96, paddingBottom: 96, paddingLeft: 48, paddingRight: 48, gap: 48, fill: '#09090f', counterAxisAlignItems: 'CENTER' }));
  cmds.push(ap('$0.id', text('Frequently asked questions', { fontSize: 40, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var listIdx = cmds.length;
  cmds.push(ap('$0.id', frame('FAQ List', { width: 720, gap: 12, fill: '#09090f' })));

  for (var i = 0; i < faqs.length; i++) {
    var fIdx = cmds.length;
    cmds.push(ap('$' + listIdx + '.id', frame('FAQ ' + (i + 1), { paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, gap: 8, fill: '#12122a', cornerRadius: 12, primaryAxisSizingMode: 'FILL' })));
    cmds.push(ap('$' + fIdx + '.id', text(faqs[i].q, { fontSize: 16, color: '#f0f0f8', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(ap('$' + fIdx + '.id', text(faqs[i].a, { fontSize: 14, color: '#a0a0b8' })));
  }

  return { commands: cmds, description: 'FAQ section with ' + faqs.length + ' items.' };
}

// ═══════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════

export function getBlueprint(toolName, args) {
  switch (toolName) {
    case 'create_page':
      switch (args.pageType) {
        case 'landing': return buildLandingPage(args);
        case 'pricing': return buildPricingPage(args);
        case 'dashboard': return buildDashboardPage(args);
        default: return buildLandingPage(args);
      }
    case 'create_section':
      return buildSection(args.sectionType, args);
    default:
      return null;
  }
}
