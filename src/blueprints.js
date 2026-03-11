// ═══════════════════════════════════════════
// CONDUCTOR — Blueprints
// ═══════════════════════════════════════════
// Each blueprint generates a complete command sequence.
// Commands reference previous results via '$N.id' tokens.
// All values are grid-aligned and design-intelligent.

import { snapToGrid, generateTypeScale, generateSemanticColors, generatePalette } from './design/intelligence.js';

// ─── Helpers ───

function frame(name, opts) {
  return {
    type: 'create_frame',
    data: Object.assign({
      name: name,
      direction: 'VERTICAL',
      padding: 0,
      gap: 0,
      fill: '#0f0f1a',
      cornerRadius: 0,
    }, opts),
  };
}

function hframe(name, opts) {
  return frame(name, Object.assign({ direction: 'HORIZONTAL' }, opts));
}

function text(content, opts) {
  return {
    type: 'create_text',
    data: Object.assign({
      text: content,
      fontSize: 16,
      color: '#ffffff',
      fontName: { family: 'Inter', style: 'Regular' },
    }, opts),
  };
}

function rect(name, opts) {
  return {
    type: 'create_rect',
    data: Object.assign({ name: name, width: 100, height: 100 }, opts),
  };
}

function appendTo(parentRef, cmd) {
  cmd.data.parentId = parentRef;
  return cmd;
}

// ═══════════════════════════════════════════
// PAGE BLUEPRINTS
// ═══════════════════════════════════════════

export function buildLandingPage(args) {
  var brandColor = args.brandColor || '#6366f1';
  var colors = generateSemanticColors(brandColor);
  var pageWidth = args.width || 1440;
  var dark = args.darkMode !== false;
  var bg = dark ? '#0f0f1a' : '#ffffff';
  var textColor = dark ? '#ffffff' : '#111111';
  var mutedColor = dark ? '#888899' : '#666677';
  var cardBg = dark ? '#16162e' : '#f5f5f7';
  var title = args.title || 'Ship faster with less overhead';
  var subtitle = args.subtitle || 'The modern platform for teams that move fast. Everything you need to build, deploy, and scale.';
  var ctaText = args.ctaText || 'Get started free';
  var navItems = args.navItems || ['Features', 'Pricing', 'Docs', 'Blog'];
  var features = args.features || [
    { icon: '⚡', title: 'Instant Deploy', desc: 'Push to deploy in seconds. Zero config. Automatic HTTPS and global CDN.' },
    { icon: '📈', title: 'Auto Scale', desc: 'Scales to millions automatically. Pay only for what you use.' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'SOC 2 compliant. End-to-end encryption. SSO and RBAC built in.' },
  ];
  var stats = args.stats || [
    { value: '10,000+', label: 'Teams worldwide' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '< 50ms', label: 'Global latency' },
  ];

  var cmds = [];

  // 0: Page root
  cmds.push(frame('Landing Page', { width: pageWidth, height: 2000, fill: bg, gap: 0 }));

  // 1: Nav
  cmds.push(appendTo('$0.id', hframe('Navigation', {
    width: pageWidth, height: 64, padding: 24, gap: 16, fill: bg,
    counterAxisAlignItems: 'CENTER',
  })));

  // 2: Logo
  cmds.push(appendTo('$1.id', text(args.brand || 'acme', {
    fontSize: 18, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
  })));

  // 3: Nav spacer
  cmds.push(appendTo('$1.id', frame('Spacer', {
    width: 1, height: 1, fill: bg,
    primaryAxisSizingMode: 'FILL',
  })));

  // 4-N: Nav links
  for (var i = 0; i < navItems.length; i++) {
    cmds.push(appendTo('$1.id', text(navItems[i], {
      fontSize: 14, color: mutedColor, fontName: { family: 'Inter', style: 'Medium' },
    })));
  }

  // Nav CTA button frame
  var navBtnIdx = cmds.length;
  cmds.push(appendTo('$1.id', hframe('Nav CTA', {
    width: 120, height: 36, padding: 12, gap: 0,
    fill: brandColor, cornerRadius: 8,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(appendTo('$' + navBtnIdx + '.id', text('Sign up', {
    fontSize: 13, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Hero section
  var heroIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('Hero Section', {
    width: pageWidth, height: 520, padding: 80, gap: 24, fill: bg,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  // Hero overline
  cmds.push(appendTo('$' + heroIdx + '.id', text('INTRODUCING ' + (args.brand || 'ACME').toUpperCase(), {
    fontSize: 12, color: brandColor, fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Hero heading
  cmds.push(appendTo('$' + heroIdx + '.id', text(title, {
    fontSize: 56, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  // Hero subtitle
  cmds.push(appendTo('$' + heroIdx + '.id', text(subtitle, {
    fontSize: 18, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Hero button row
  var btnRowIdx = cmds.length;
  cmds.push(appendTo('$' + heroIdx + '.id', hframe('Hero Buttons', {
    width: 340, height: 48, gap: 12, fill: bg,
    primaryAxisAlignItems: 'CENTER',
  })));

  // Primary CTA
  var primaryBtnIdx = cmds.length;
  cmds.push(appendTo('$' + btnRowIdx + '.id', hframe('Primary CTA', {
    width: 160, height: 48, padding: 16, fill: brandColor, cornerRadius: 10,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(appendTo('$' + primaryBtnIdx + '.id', text(ctaText, {
    fontSize: 15, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Secondary CTA
  var secBtnIdx = cmds.length;
  cmds.push(appendTo('$' + btnRowIdx + '.id', hframe('Secondary CTA', {
    width: 160, height: 48, padding: 16, fill: dark ? '#1a1a2e' : '#eeeeee', cornerRadius: 10,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(appendTo('$' + secBtnIdx + '.id', text('View demo →', {
    fontSize: 15, color: dark ? '#ccccdd' : '#333333', fontName: { family: 'Inter', style: 'Medium' },
  })));

  // Stats bar
  var statsIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('Stats Bar', {
    width: pageWidth, height: 120, padding: 48, gap: 80, fill: dark ? '#13132a' : '#f8f8fa',
    counterAxisAlignItems: 'CENTER',
  })));

  for (var s = 0; s < stats.length; s++) {
    var statIdx = cmds.length;
    cmds.push(appendTo('$' + statsIdx + '.id', frame('Stat ' + (s + 1), {
      width: 200, height: 64, gap: 4, fill: dark ? '#13132a' : '#f8f8fa',
      counterAxisAlignItems: 'CENTER',
    })));
    cmds.push(appendTo('$' + statIdx + '.id', text(stats[s].value, {
      fontSize: 32, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    })));
    cmds.push(appendTo('$' + statIdx + '.id', text(stats[s].label, {
      fontSize: 13, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    })));
  }

  // Features section
  var featSectionIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('Features Section', {
    width: pageWidth, padding: 64, gap: 32, fill: bg,
    counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(appendTo('$' + featSectionIdx + '.id', text('Everything you need', {
    fontSize: 36, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  cmds.push(appendTo('$' + featSectionIdx + '.id', text('Powerful features to help your team ship faster and with more confidence.', {
    fontSize: 16, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Feature card row
  var cardRowIdx = cmds.length;
  cmds.push(appendTo('$' + featSectionIdx + '.id', hframe('Feature Cards', {
    width: pageWidth - 128, gap: 20, fill: bg,
  })));

  for (var f = 0; f < features.length; f++) {
    var cardIdx = cmds.length;
    var cardWidth = Math.floor((pageWidth - 128 - (features.length - 1) * 20) / features.length);
    cmds.push(appendTo('$' + cardRowIdx + '.id', frame(features[f].title, {
      width: cardWidth, height: 200, padding: 24, gap: 12, fill: cardBg, cornerRadius: 14,
    })));
    cmds.push(appendTo('$' + cardIdx + '.id', text(features[f].icon + '  ' + features[f].title, {
      fontSize: 18, color: textColor, fontName: { family: 'Inter', style: 'Semi Bold' },
    })));
    cmds.push(appendTo('$' + cardIdx + '.id', text(features[f].desc, {
      fontSize: 14, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    })));
  }

  // CTA section
  var ctaSectionIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('CTA Section', {
    width: pageWidth, padding: 80, gap: 24, fill: dark ? '#0a0a14' : '#f0f0f2',
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(appendTo('$' + ctaSectionIdx + '.id', text('Ready to get started?', {
    fontSize: 40, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  cmds.push(appendTo('$' + ctaSectionIdx + '.id', text('Join thousands of teams already shipping faster.', {
    fontSize: 16, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  var ctaBtnIdx = cmds.length;
  cmds.push(appendTo('$' + ctaSectionIdx + '.id', hframe('CTA Button', {
    width: 200, height: 52, padding: 16, fill: brandColor, cornerRadius: 12,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));
  cmds.push(appendTo('$' + ctaBtnIdx + '.id', text(ctaText, {
    fontSize: 16, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' },
  })));

  // Footer
  var footerIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('Footer', {
    width: pageWidth, height: 80, padding: 24, gap: 16, fill: dark ? '#080812' : '#f5f5f7',
    counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(appendTo('$' + footerIdx + '.id', text('© 2025 ' + (args.brand || 'Acme') + '. All rights reserved.', {
    fontSize: 13, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
  })));

  return {
    commands: cmds,
    description: 'Landing page with nav, hero, stats, features (' + features.length + ' cards), CTA, and footer. ' + cmds.length + ' elements, all auto-layout, ' + (dark ? 'dark' : 'light') + ' theme.',
  };
}

// ═══════════════════════════════════════════
// PRICING PAGE
// ═══════════════════════════════════════════

export function buildPricingPage(args) {
  var brandColor = args.brandColor || '#6366f1';
  var pageWidth = args.width || 1440;
  var bg = '#0f0f1a';
  var textColor = '#ffffff';
  var mutedColor = '#888899';
  var cardBg = '#16162e';
  var tiers = args.tiers || [
    { name: 'Starter', price: '$0', period: '/mo', desc: 'For individuals and small projects', features: ['1 project', '100 API calls/day', 'Community support', 'Basic analytics'], cta: 'Start free', highlighted: false },
    { name: 'Pro', price: '$29', period: '/mo', desc: 'For growing teams that need more', features: ['Unlimited projects', '10,000 API calls/day', 'Priority support', 'Advanced analytics', 'Team collaboration', 'Custom domains'], cta: 'Start free trial', highlighted: true },
    { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations', features: ['Everything in Pro', 'Unlimited API calls', 'Dedicated support', 'SSO & SAML', 'SLA guarantee', 'Custom integrations', 'On-premise option'], cta: 'Contact sales', highlighted: false },
  ];

  var cmds = [];

  // 0: Page
  cmds.push(frame('Pricing Page', { width: pageWidth, height: 1400, fill: bg, gap: 0 }));

  // 1: Header
  var headerIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('Pricing Header', {
    width: pageWidth, padding: 80, gap: 16, fill: bg,
    primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
  })));

  cmds.push(appendTo('$' + headerIdx + '.id', text('Simple, transparent pricing', {
    fontSize: 48, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    textAlignHorizontal: 'CENTER',
  })));

  cmds.push(appendTo('$' + headerIdx + '.id', text('No hidden fees. No surprises. Cancel anytime.', {
    fontSize: 18, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    textAlignHorizontal: 'CENTER',
  })));

  // Tier cards row
  var tierRowIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('Pricing Tiers', {
    width: pageWidth, padding: 48, gap: 20, fill: bg,
    primaryAxisAlignItems: 'CENTER',
  })));

  for (var t = 0; t < tiers.length; t++) {
    var tier = tiers[t];
    var cardW = Math.min(380, Math.floor((pageWidth - 96 - (tiers.length - 1) * 20) / tiers.length));
    var isHighlighted = tier.highlighted;

    var tierIdx = cmds.length;
    cmds.push(appendTo('$' + tierRowIdx + '.id', frame(tier.name + ' Tier', {
      width: cardW, padding: 32, gap: 16, cornerRadius: 16,
      fill: isHighlighted ? '#1e1e40' : cardBg,
    })));

    if (isHighlighted) {
      var badgeIdx = cmds.length;
      cmds.push(appendTo('$' + tierIdx + '.id', hframe('Popular Badge', {
        width: 100, height: 24, padding: 6, fill: brandColor, cornerRadius: 6,
        primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
      })));
      cmds.push(appendTo('$' + badgeIdx + '.id', text('POPULAR', {
        fontSize: 10, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' },
      })));
    }

    cmds.push(appendTo('$' + tierIdx + '.id', text(tier.name, {
      fontSize: 20, color: textColor, fontName: { family: 'Inter', style: 'Semi Bold' },
    })));

    // Price row
    var priceRowIdx = cmds.length;
    cmds.push(appendTo('$' + tierIdx + '.id', hframe('Price', {
      gap: 2, fill: isHighlighted ? '#1e1e40' : cardBg,
      counterAxisAlignItems: 'BASELINE',
    })));
    cmds.push(appendTo('$' + priceRowIdx + '.id', text(tier.price, {
      fontSize: 40, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    })));
    if (tier.period) {
      cmds.push(appendTo('$' + priceRowIdx + '.id', text(tier.period, {
        fontSize: 16, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
      })));
    }

    cmds.push(appendTo('$' + tierIdx + '.id', text(tier.desc, {
      fontSize: 14, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
    })));

    // Divider
    cmds.push(appendTo('$' + tierIdx + '.id', rect('Divider', {
      width: cardW - 64, height: 1, fill: '#252540',
    })));

    // Features
    for (var fi = 0; fi < tier.features.length; fi++) {
      cmds.push(appendTo('$' + tierIdx + '.id', text('✓  ' + tier.features[fi], {
        fontSize: 13, color: mutedColor, fontName: { family: 'Inter', style: 'Regular' },
      })));
    }

    // CTA button
    var tierBtnIdx = cmds.length;
    cmds.push(appendTo('$' + tierIdx + '.id', hframe(tier.cta, {
      height: 44, padding: 12,
      fill: isHighlighted ? brandColor : 'transparent',
      cornerRadius: 8,
      primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER',
      primaryAxisSizingMode: 'FILL',
    })));
    cmds.push(appendTo('$' + tierBtnIdx + '.id', text(tier.cta, {
      fontSize: 14, color: isHighlighted ? '#ffffff' : brandColor,
      fontName: { family: 'Inter', style: 'Semi Bold' },
    })));
  }

  return {
    commands: cmds,
    description: 'Pricing page with ' + tiers.length + ' tiers (' + tiers.map(function(t) { return t.name; }).join(', ') + '). ' + cmds.length + ' elements, all auto-layout.',
  };
}

// ═══════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════

export function buildDashboardPage(args) {
  var pageWidth = args.width || 1440;
  var bg = '#0f0f1a';
  var cardBg = '#16162e';
  var textColor = '#ffffff';
  var mutedColor = '#888899';
  var brandColor = args.brandColor || '#6366f1';
  var metrics = args.metrics || [
    { label: 'Total Revenue', value: '$48,290', change: '+12.5%', positive: true },
    { label: 'Active Users', value: '2,420', change: '+8.3%', positive: true },
    { label: 'Conversion', value: '3.24%', change: '-0.8%', positive: false },
    { label: 'Avg. Session', value: '4m 32s', change: '+15.2%', positive: true },
  ];

  var cmds = [];

  // 0: Page
  cmds.push(hframe('Dashboard', { width: pageWidth, height: 900, fill: bg, gap: 0 }));

  // 1: Sidebar
  var sidebarIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('Sidebar', {
    width: 240, height: 900, padding: 16, gap: 8, fill: '#0a0a14',
  })));

  // Sidebar logo
  cmds.push(appendTo('$' + sidebarIdx + '.id', text('◆  Dashboard', {
    fontSize: 14, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
  })));

  // Sidebar spacer
  cmds.push(appendTo('$' + sidebarIdx + '.id', frame('Spacer', { width: 1, height: 16, fill: '#0a0a14' })));

  // Sidebar nav items
  var sideNavItems = ['Overview', 'Analytics', 'Customers', 'Products', 'Settings'];
  for (var si = 0; si < sideNavItems.length; si++) {
    var navItemIdx = cmds.length;
    cmds.push(appendTo('$' + sidebarIdx + '.id', hframe(sideNavItems[si], {
      height: 36, padding: 12, gap: 8, cornerRadius: 6,
      fill: si === 0 ? '#1a1a30' : '#0a0a14',
      primaryAxisSizingMode: 'FILL', counterAxisAlignItems: 'CENTER',
    })));
    cmds.push(appendTo('$' + navItemIdx + '.id', text(sideNavItems[si], {
      fontSize: 13, color: si === 0 ? textColor : mutedColor,
      fontName: { family: 'Inter', style: si === 0 ? 'Medium' : 'Regular' },
    })));
  }

  // Main content area
  var mainIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('Main Content', {
    width: pageWidth - 240, height: 900, padding: 32, gap: 24, fill: bg,
  })));

  // Header row
  var headerIdx = cmds.length;
  cmds.push(appendTo('$' + mainIdx + '.id', hframe('Header', {
    gap: 16, fill: bg, counterAxisAlignItems: 'CENTER',
    primaryAxisSizingMode: 'FILL',
  })));
  cmds.push(appendTo('$' + headerIdx + '.id', text('Overview', {
    fontSize: 24, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
  })));

  // Metric cards row
  var metricsRowIdx = cmds.length;
  cmds.push(appendTo('$' + mainIdx + '.id', hframe('Metrics', {
    gap: 16, fill: bg, primaryAxisSizingMode: 'FILL',
  })));

  for (var mi = 0; mi < metrics.length; mi++) {
    var metricIdx = cmds.length;
    var metricW = Math.floor((pageWidth - 240 - 64 - (metrics.length - 1) * 16) / metrics.length);
    cmds.push(appendTo('$' + metricsRowIdx + '.id', frame(metrics[mi].label, {
      width: metricW, padding: 20, gap: 8, fill: cardBg, cornerRadius: 12,
    })));
    cmds.push(appendTo('$' + metricIdx + '.id', text(metrics[mi].label, {
      fontSize: 12, color: mutedColor, fontName: { family: 'Inter', style: 'Medium' },
    })));
    cmds.push(appendTo('$' + metricIdx + '.id', text(metrics[mi].value, {
      fontSize: 28, color: textColor, fontName: { family: 'Inter', style: 'Bold' },
    })));
    cmds.push(appendTo('$' + metricIdx + '.id', text(metrics[mi].change, {
      fontSize: 12, color: metrics[mi].positive ? '#4ade80' : '#f87171',
      fontName: { family: 'Inter', style: 'Medium' },
    })));
  }

  // Chart placeholder
  var chartIdx = cmds.length;
  cmds.push(appendTo('$' + mainIdx + '.id', frame('Chart Area', {
    height: 300, padding: 24, gap: 12, fill: cardBg, cornerRadius: 12,
    primaryAxisSizingMode: 'FILL',
  })));
  cmds.push(appendTo('$' + chartIdx + '.id', text('Revenue Over Time', {
    fontSize: 16, color: textColor, fontName: { family: 'Inter', style: 'Semi Bold' },
  })));
  cmds.push(appendTo('$' + chartIdx + '.id', rect('Chart Placeholder', {
    width: 900, height: 200, fill: '#1a1a30', cornerRadius: 8,
  })));

  return {
    commands: cmds,
    description: 'Dashboard with sidebar nav, header, ' + metrics.length + ' metric cards, and chart area. ' + cmds.length + ' elements, all auto-layout.',
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
  var w = args.width || 1440;
  var brandColor = args.brandColor || '#6366f1';
  var cmds = [];

  cmds.push(frame('Hero', { width: w, padding: 80, gap: 24, fill: '#0f0f1a', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }));
  cmds.push(appendTo('$0.id', text(args.heading || 'Build something great', { fontSize: 56, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(appendTo('$0.id', text(args.subheading || 'The platform for modern teams.', { fontSize: 18, color: '#888899', fontName: { family: 'Inter', style: 'Regular' }, textAlignHorizontal: 'CENTER' })));

  var btnIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('CTA', { width: 180, height: 48, padding: 16, fill: brandColor, cornerRadius: 10, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(appendTo('$' + btnIdx + '.id', text(args.ctaText || 'Get started', { fontSize: 15, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));

  return { commands: cmds, description: 'Hero section with heading, subtitle, and CTA.' };
}

function buildFeaturesSection(args) {
  var w = args.width || 1440;
  var features = args.features || [
    { title: 'Fast', desc: 'Blazing fast performance.' },
    { title: 'Secure', desc: 'Enterprise-grade security.' },
    { title: 'Scalable', desc: 'Grows with your team.' },
  ];
  var cmds = [];

  cmds.push(frame('Features', { width: w, padding: 64, gap: 32, fill: '#0f0f1a', counterAxisAlignItems: 'CENTER' }));
  cmds.push(appendTo('$0.id', text(args.heading || 'Features', { fontSize: 36, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var rowIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('Feature Cards', { width: w - 128, gap: 20, fill: '#0f0f1a' })));

  for (var i = 0; i < features.length; i++) {
    var cw = Math.floor((w - 128 - (features.length - 1) * 20) / features.length);
    var ci = cmds.length;
    cmds.push(appendTo('$' + rowIdx + '.id', frame(features[i].title, { width: cw, height: 160, padding: 24, gap: 10, fill: '#16162e', cornerRadius: 12 })));
    cmds.push(appendTo('$' + ci + '.id', text(features[i].title, { fontSize: 18, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(appendTo('$' + ci + '.id', text(features[i].desc, { fontSize: 14, color: '#888899', fontName: { family: 'Inter', style: 'Regular' } })));
  }

  return { commands: cmds, description: 'Features section with ' + features.length + ' cards.' };
}

function buildPricingSection(args) {
  return buildPricingPage(args);
}

function buildCTASection(args) {
  var w = args.width || 1440;
  var brandColor = args.brandColor || '#6366f1';
  var cmds = [];

  cmds.push(frame('CTA Section', { width: w, padding: 80, gap: 24, fill: '#0a0a14', primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' }));
  cmds.push(appendTo('$0.id', text(args.heading || 'Ready to start?', { fontSize: 40, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));
  cmds.push(appendTo('$0.id', text(args.subheading || 'Join thousands of teams.', { fontSize: 16, color: '#888899', fontName: { family: 'Inter', style: 'Regular' }, textAlignHorizontal: 'CENTER' })));

  var btnIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('CTA Button', { width: 200, height: 52, padding: 16, fill: brandColor, cornerRadius: 12, primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' })));
  cmds.push(appendTo('$' + btnIdx + '.id', text(args.ctaText || 'Get started free', { fontSize: 16, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));

  return { commands: cmds, description: 'CTA section with heading, subtitle, and button.' };
}

function buildTestimonialsSection(args) {
  var w = args.width || 1440;
  var testimonials = args.testimonials || [
    { quote: 'This product transformed how our team works. Absolutely incredible.', author: 'Sarah Chen', role: 'CTO, TechCorp' },
    { quote: 'The best tool we have adopted this year. Our productivity doubled.', author: 'Marcus Rivera', role: 'VP Engineering, ScaleUp' },
  ];
  var cmds = [];

  cmds.push(frame('Testimonials', { width: w, padding: 64, gap: 32, fill: '#0f0f1a', counterAxisAlignItems: 'CENTER' }));
  cmds.push(appendTo('$0.id', text('What people say', { fontSize: 36, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var rowIdx = cmds.length;
  cmds.push(appendTo('$0.id', hframe('Testimonial Cards', { width: w - 128, gap: 20, fill: '#0f0f1a' })));

  for (var i = 0; i < testimonials.length; i++) {
    var tw = Math.floor((w - 128 - (testimonials.length - 1) * 20) / testimonials.length);
    var ti = cmds.length;
    cmds.push(appendTo('$' + rowIdx + '.id', frame('Testimonial ' + (i + 1), { width: tw, padding: 24, gap: 16, fill: '#16162e', cornerRadius: 14 })));
    cmds.push(appendTo('$' + ti + '.id', text('"' + testimonials[i].quote + '"', { fontSize: 15, color: '#ccccdd', fontName: { family: 'Inter', style: 'Regular' } })));
    cmds.push(appendTo('$' + ti + '.id', text(testimonials[i].author, { fontSize: 14, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(appendTo('$' + ti + '.id', text(testimonials[i].role, { fontSize: 12, color: '#888899', fontName: { family: 'Inter', style: 'Regular' } })));
  }

  return { commands: cmds, description: 'Testimonials with ' + testimonials.length + ' cards.' };
}

function buildFAQSection(args) {
  var w = args.width || 1440;
  var faqs = args.faqs || [
    { q: 'How do I get started?', a: 'Sign up for free and follow our quick-start guide. Takes less than 5 minutes.' },
    { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no cancellation fees. Cancel with one click.' },
    { q: 'Do you offer support?', a: 'All plans include email support. Pro and Enterprise get priority support.' },
  ];
  var cmds = [];

  cmds.push(frame('FAQ', { width: w, padding: 64, gap: 32, fill: '#0f0f1a', counterAxisAlignItems: 'CENTER' }));
  cmds.push(appendTo('$0.id', text('Frequently asked questions', { fontSize: 36, color: '#ffffff', fontName: { family: 'Inter', style: 'Bold' }, textAlignHorizontal: 'CENTER' })));

  var listIdx = cmds.length;
  cmds.push(appendTo('$0.id', frame('FAQ List', { width: Math.min(700, w - 128), gap: 12, fill: '#0f0f1a' })));

  for (var i = 0; i < faqs.length; i++) {
    var faqIdx = cmds.length;
    cmds.push(appendTo('$' + listIdx + '.id', frame('FAQ ' + (i + 1), { padding: 20, gap: 8, fill: '#16162e', cornerRadius: 10, primaryAxisSizingMode: 'FILL' })));
    cmds.push(appendTo('$' + faqIdx + '.id', text(faqs[i].q, { fontSize: 15, color: '#ffffff', fontName: { family: 'Inter', style: 'Semi Bold' } })));
    cmds.push(appendTo('$' + faqIdx + '.id', text(faqs[i].a, { fontSize: 13, color: '#888899', fontName: { family: 'Inter', style: 'Regular' } })));
  }

  return { commands: cmds, description: 'FAQ section with ' + faqs.length + ' items.' };
}

// ═══════════════════════════════════════════
// BLUEPRINT ROUTER
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
