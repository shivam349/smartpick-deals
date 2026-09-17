import fs from 'fs';

const htmlPath = 'C:/Users/sbixb/.gemini/antigravity-ide/brain/9f8f9fa4-03d6-4b26-92e2-f93d5af0e29c/.system_generated/steps/643/content.md';
if (fs.existsSync(htmlPath)) {
  const content = fs.readFileSync(htmlPath, 'utf8');
  
  // Find images
  const regex = /(?:https:)?\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)(?:\?[^\s"'<>]*)?/gi;
  const matches = content.match(regex) || [];
  const unique = Array.from(new Set(matches.map(m => m.startsWith('//') ? 'https:' + m : m)));
  
  console.log("=== Found Image Assets (" + unique.length + ") ===");
  unique.filter(u => u.includes('airdopes') || u.includes('products') || u.includes('files')).slice(0, 15).forEach(u => console.log(u));

  // Check title, specs, description
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  console.log("\nTitle:", titleMatch ? titleMatch[1].trim() : "None");

  const descMatch = content.match(/<meta name="description" content="([^"]+)"/i);
  console.log("Description:", descMatch ? descMatch[1].trim() : "None");
} else {
  console.log("File not found");
}
