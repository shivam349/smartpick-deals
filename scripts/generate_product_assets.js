const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function makeSvg(name, category, gradientStops, iconElements) {
  return `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
      ${gradientStops}
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.08" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect width="400" height="300" rx="16" fill="url(#bgGrad)" />
  <rect x="12" y="12" width="376" height="276" rx="12" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 4" fill="none" opacity="0.6"/>
  
  <!-- Category Pill -->
  <g transform="translate(30, 30)">
    <rect width="110" height="24" rx="12" fill="#ffffff" opacity="0.9"/>
    <text x="55" y="16" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">
      ${category.toUpperCase()}
    </text>
  </g>

  <!-- Illustration Elements -->
  ${iconElements}

  <!-- Title Bottom Strip -->
  <g transform="translate(30, 246)">
    <rect width="340" height="30" rx="8" fill="#ffffff" opacity="0.95" filter="url(#cardShadow)"/>
    <text x="170" y="20" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12" font-weight="800" text-anchor="middle">
      ${name}
    </text>
  </g>
</svg>`;
}

const products = [
  {
    file: 'keychron-q1-pro.svg',
    name: 'Keychron Q1 Pro Mechanical',
    category: 'Keyboards',
    grad: '<stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/>',
    icons: `
      <!-- Keyboard Silhouette -->
      <rect x="80" y="90" width="240" height="120" rx="10" fill="#1e293b" stroke="#334155" stroke-width="4"/>
      <!-- Key rows -->
      <g fill="#475569">
        <rect x="94" y="104" width="20" height="16" rx="3"/>
        <rect x="120" y="104" width="20" height="16" rx="3"/>
        <rect x="146" y="104" width="20" height="16" rx="3"/>
        <rect x="172" y="104" width="20" height="16" rx="3"/>
        <rect x="198" y="104" width="20" height="16" rx="3"/>
        <rect x="224" y="104" width="20" height="16" rx="3"/>
        <rect x="250" y="104" width="20" height="16" rx="3"/>
        <rect x="276" y="104" width="30" height="16" rx="3" fill="#ea580c"/>
      </g>
      <g fill="#334155">
        <rect x="94" y="126" width="28" height="16" rx="3"/>
        <rect x="128" y="126" width="20" height="16" rx="3"/>
        <rect x="154" y="126" width="20" height="16" rx="3"/>
        <rect x="180" y="126" width="20" height="16" rx="3"/>
        <rect x="206" y="126" width="20" height="16" rx="3"/>
        <rect x="232" y="126" width="20" height="16" rx="3"/>
        <rect x="258" y="126" width="48" height="16" rx="3"/>
      </g>
      <rect x="138" y="172" width="110" height="16" rx="4" fill="#38bdf8"/>
    `
  },
  {
    file: 'logitech-mx-mechanical.svg',
    name: 'Logitech MX Mechanical',
    category: 'Keyboards',
    grad: '<stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#cbd5e1"/>',
    icons: `
      <rect x="70" y="100" width="260" height="100" rx="8" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>
      <rect x="85" y="112" width="160" height="74" rx="4" fill="#334155" opacity="0.6"/>
      <rect x="255" y="112" width="60" height="74" rx="4" fill="#334155" opacity="0.6"/>
      <circle cx="200" cy="180" r="3" fill="#38bdf8"/>
    `
  },
  {
    file: 'logitech-mx-master-3s.svg',
    name: 'Logitech MX Master 3S',
    category: 'Mice',
    grad: '<stop offset="0%" stopColor="#f0f9ff"/><stop offset="100%" stopColor="#bae6fd"/>',
    icons: `
      <!-- Ergonomic Mouse Contour -->
      <path d="M150 200 C140 180, 140 120, 170 95 C195 75, 235 90, 245 130 C255 170, 245 200, 210 215 C180 225, 160 215, 150 200 Z" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
      <!-- Thumb Rest Flare -->
      <path d="M145 155 C125 165, 125 185, 148 198 Z" fill="#334155"/>
      <!-- MagSpeed Metal Scroll Wheel -->
      <rect x="195" y="95" width="12" height="30" rx="6" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="140" cy="175" r="4" fill="#38bdf8"/>
    `
  },
  {
    file: 'logitech-lift-vertical.svg',
    name: 'Logitech Lift Vertical Mouse',
    category: 'Mice',
    grad: '<stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e0e7ff"/>',
    icons: `
      <!-- Vertical Ergonomic Wedge -->
      <path d="M160 215 C130 190, 150 100, 190 85 C230 70, 240 140, 235 210 Z" fill="#475569"/>
      <rect x="200" y="105" width="8" height="24" rx="4" fill="#f59e0b"/>
      <path d="M190 85 L220 180" stroke="#64748b" stroke-width="2"/>
    `
  },
  {
    file: 'dell-ultrasharp-32.svg',
    name: 'Dell UltraSharp 32 4K (U3223QE)',
    category: 'Monitors',
    grad: '<stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#1e1b4b"/>',
    icons: `
      <!-- Monitor Stand -->
      <path d="M190 200 L210 200 L205 160 L195 160 Z" fill="#94a3b8"/>
      <rect x="160" y="200" width="80" height="8" rx="4" fill="#64748b"/>
      <!-- Display Panel -->
      <rect x="70" y="70" width="260" height="150" rx="6" fill="#020617" stroke="#475569" stroke-width="3"/>
      <!-- Code IDE mockup on screen -->
      <rect x="85" y="85" width="230" height="120" rx="3" fill="#1e293b"/>
      <rect x="95" y="95" width="50" height="6" rx="2" fill="#38bdf8"/>
      <rect x="95" y="108" width="90" height="5" rx="2" fill="#94a3b8"/>
      <rect x="110" y="120" width="70" height="5" rx="2" fill="#a855f7"/>
      <rect x="110" y="132" width="120" height="5" rx="2" fill="#f59e0b"/>
    `
  },
  {
    file: 'lg-34wn80c-ultrawide.svg',
    name: 'LG 34-Inch Curved UltraWide',
    category: 'Monitors',
    grad: '<stop offset="0%" stopColor="#090d16"/><stop offset="100%" stopColor="#1e293b"/>',
    icons: `
      <path d="M60 90 Q 200 105 340 90 L335 180 Q 200 195 65 180 Z" fill="#0f172a" stroke="#475569" stroke-width="3"/>
      <path d="M175 190 Q 200 215 225 190" stroke="#94a3b8" stroke-width="6" fill="none"/>
    `
  },
  {
    file: 'macbook-pro-14-m3.svg',
    name: 'Apple MacBook Pro 14" M3',
    category: 'Laptops',
    grad: '<stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#cbd5e1"/>',
    icons: `
      <!-- Laptop Screen Lid -->
      <rect x="110" y="75" width="180" height="115" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
      <rect x="120" y="85" width="160" height="95" rx="2" fill="#1e1b4b"/>
      <!-- Notch -->
      <rect x="190" y="85" width="20" height="6" rx="2" fill="#0f172a"/>
      <!-- Laptop Base -->
      <path d="M80 190 L320 190 L305 202 L95 202 Z" fill="#94a3b8"/>
      <rect x="175" y="190" width="50" height="3" fill="#cbd5e1"/>
    `
  },
  {
    file: 'dell-xps-15.svg',
    name: 'Dell XPS 15 OLED',
    category: 'Laptops',
    grad: '<stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#94a3b8"/>',
    icons: `
      <rect x="105" y="80" width="190" height="110" rx="4" fill="#020617" stroke="#334155" stroke-width="2"/>
      <path d="M75 190 L325 190 L310 200 L90 200 Z" fill="#64748b"/>
      <circle cx="200" cy="135" r="14" fill="#38bdf8" opacity="0.4"/>
    `
  },
  {
    file: 'herman-miller-aeron.svg',
    name: 'Herman Miller Aeron Chair',
    category: 'Desk Setup',
    grad: '<stop offset="0%" stopColor="#f0fdf4"/><stop offset="100%" stopColor="#bbf7d0"/>',
    icons: `
      <!-- Ergonomic Mesh Backrest -->
      <path d="M165 70 C155 100, 155 130, 160 150 L240 150 C245 130, 245 100, 235 70 Q 200 60 165 70 Z" fill="#334155" stroke="#0f172a" stroke-width="2"/>
      <!-- Seat Pan -->
      <path d="M150 155 Q 200 170 250 155 L245 175 Q 200 185 155 175 Z" fill="#1e293b"/>
      <!-- Gas Lift & Star Base -->
      <line x1="200" y1="180" x2="200" y2="210" stroke="#475569" stroke-width="6"/>
      <path d="M160 215 L200 208 L240 215" stroke="#334155" stroke-width="4"/>
    `
  },
  {
    file: 'uplift-v2-standing-desk.svg',
    name: 'Uplift V2 Standing Desk',
    category: 'Desk Setup',
    grad: '<stop offset="0%" stopColor="#ecfdf5"/><stop offset="100%" stopColor="#a7f3d0"/>',
    icons: `
      <!-- Desktop Surface -->
      <rect x="70" y="110" width="260" height="18" rx="4" fill="#b45309" stroke="#78350f" stroke-width="2"/>
      <!-- Dual Motors Legs -->
      <rect x="100" y="128" width="16" height="85" fill="#334155"/>
      <rect x="284" y="128" width="16" height="85" fill="#334155"/>
      <!-- Feet -->
      <rect x="80" y="210" width="56" height="8" rx="2" fill="#1e293b"/>
      <rect x="264" y="210" width="56" height="8" rx="2" fill="#1e293b"/>
      <!-- Digital Handset -->
      <rect x="270" y="118" width="22" height="8" rx="1" fill="#0284c7"/>
    `
  },
  {
    file: 'sony-wh-1000xm5.svg',
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Headphones',
    grad: '<stop offset="0%" stopColor="#fffbeb"/><stop offset="100%" stopColor="#fde68a"/>',
    icons: `
      <!-- Headband Arch -->
      <path d="M140 160 C140 90, 260 90, 260 160" stroke="#0f172a" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Earcups -->
      <ellipse cx="135" cy="165" rx="22" ry="32" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="265" cy="165" rx="22" ry="32" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <circle cx="135" cy="165" r="6" fill="#f59e0b"/>
    `
  },
  {
    file: 'bose-qc-ultra.svg',
    name: 'Bose QuietComfort Ultra',
    category: 'Headphones',
    grad: '<stop offset="0%" stopColor="#fff7ed"/><stop offset="100%" stopColor="#ffedd5"/>',
    icons: `
      <!-- Charging Case -->
      <rect x="140" y="120" width="120" height="80" rx="30" fill="#1e293b" stroke="#334155" stroke-width="3"/>
      <!-- Earbuds -->
      <ellipse cx="180" cy="100" rx="12" ry="18" fill="#0f172a"/>
      <ellipse cx="220" cy="100" rx="12" ry="18" fill="#0f172a"/>
      <circle cx="200" cy="160" r="3" fill="#10b981"/>
    `
  },
  {
    file: 'roost-v3-laptop-stand.svg',
    name: 'Roost V3 Ultra-Portable Stand',
    category: 'Desk Setup',
    grad: '<stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/>',
    icons: `
      <!-- Scissor Stand Struts -->
      <line x1="140" y1="210" x2="200" y2="100" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
      <line x1="260" y1="210" x2="200" y2="100" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
      <line x1="150" y1="140" x2="250" y2="140" stroke="#38bdf8" stroke-width="4"/>
      <!-- Hooks -->
      <circle cx="140" cy="210" r="8" fill="#ea580c"/>
      <circle cx="260" cy="210" r="8" fill="#ea580c"/>
    `
  },
  {
    file: 'twelve-south-curve.svg',
    name: 'Twelve South Curve Stand',
    category: 'Desk Setup',
    grad: '<stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#cbd5e1"/>',
    icons: `
      <!-- Sweeping Matte Aluminum Arc -->
      <path d="M120 210 C130 140, 160 110, 240 100 C270 95, 280 120, 240 180" stroke="#0f172a" stroke-width="12" stroke-linecap="round" fill="none"/>
    `
  },
  {
    file: 'benq-screenbar-halo.svg',
    name: 'BenQ ScreenBar Halo',
    category: 'Productivity',
    grad: '<stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#312e81"/>',
    icons: `
      <!-- Lightbar -->
      <rect x="100" y="80" width="200" height="12" rx="4" fill="#475569"/>
      <!-- Soft Downward Light Beam -->
      <polygon points="110,92 290,92 340,210 60,210" fill="#fef08a" opacity="0.15"/>
      <!-- Wireless Control Puck -->
      <circle cx="200" cy="180" r="24" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="200" cy="180" r="8" fill="#f59e0b"/>
    `
  },
  {
    file: 'caldigit-ts4-dock.svg',
    name: 'CalDigit TS4 Thunderbolt 4',
    category: 'Productivity',
    grad: '<stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#e2e8f0"/>',
    icons: `
      <!-- Vertical Aluminum Dock Block -->
      <rect x="150" y="80" width="100" height="140" rx="8" fill="#64748b" stroke="#475569" stroke-width="3"/>
      <!-- Fluted Cooling Fins -->
      <line x1="165" y1="95" x2="165" y2="205" stroke="#334155" stroke-width="2"/>
      <line x1="180" y1="95" x2="180" y2="205" stroke="#334155" stroke-width="2"/>
      <line x1="195" y1="95" x2="195" y2="205" stroke="#334155" stroke-width="2"/>
      <!-- Indicator LED -->
      <circle cx="225" cy="100" r="3" fill="#38bdf8"/>
    `
  },
  {
    file: 'orbitkey-desk-mat.svg',
    name: 'Orbitkey Desk Mat & Cable Bar',
    category: 'Desk Setup',
    grad: '<stop offset="0%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#cbd5e1"/>',
    icons: `
      <!-- Vegan Leather Desk Mat -->
      <rect x="70" y="110" width="260" height="110" rx="8" fill="#1e293b"/>
      <!-- Magnetic Toolbar Bar -->
      <rect x="70" y="110" width="260" height="20" rx="4" fill="#0f172a"/>
      <!-- Magnetic Cable Anchor -->
      <circle cx="120" cy="120" r="6" fill="#f59e0b"/>
    `
  },
  {
    file: 'anker-737-power-bank.svg',
    name: 'Anker 737 Power Bank (24K)',
    category: 'Productivity',
    grad: '<stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#1e293b"/>',
    icons: `
      <!-- Power Brick -->
      <rect x="160" y="80" width="80" height="140" rx="10" fill="#334155" stroke="#0f172a" stroke-width="3"/>
      <!-- Smart OLED Display -->
      <rect x="175" y="95" width="50" height="40" rx="4" fill="#020617"/>
      <text x="200" y="118" fill="#10b981" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">140W</text>
      <!-- USB-C Ports -->
      <rect x="180" y="150" width="16" height="6" rx="2" fill="#64748b"/>
      <rect x="204" y="150" width="16" height="6" rx="2" fill="#64748b"/>
    `
  }
];

for (const p of products) {
  const svgContent = makeSvg(p.name, p.category, p.grad, p.icons);
  fs.writeFileSync(path.join(targetDir, p.file), svgContent.trim());
}

console.log(`Generated ${products.length} product vector assets in ${targetDir}`);
