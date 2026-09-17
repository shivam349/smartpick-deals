import fs from 'fs';

const htmlPath = 'C:/Users/sbixb/.gemini/antigravity-ide/brain/9f8f9fa4-03d6-4b26-92e2-f93d5af0e29c/.system_generated/steps/643/content.md';
const content = fs.readFileSync(htmlPath, 'utf8');

// Find JSON-LD or product JSON data
const jsonLdMatches = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
console.log("Found JSON-LD blocks:", jsonLdMatches.length);
jsonLdMatches.forEach((b, i) => {
  try {
    const raw = b.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '');
    const data = JSON.parse(raw);
    console.log(`Block ${i}:`, data['@type'] || data['name'], JSON.stringify(data).slice(0, 200));
  } catch(e) {}
});

// Look for spec tables or keys
const specKeywords = ["Playback", "Driver", "Bluetooth", "IPX", "Charging", "Beast", "ENx"];
specKeywords.forEach(k => {
  const r = new RegExp(`([^<>\\n]{0,40}${k}[^<>\\n]{0,80})`, 'gi');
  const found = (content.match(r) || []).slice(0, 3);
  if (found.length) {
    console.log(`\nKey '${k}':`);
    found.forEach(f => console.log("  -", f.trim()));
  }
});
