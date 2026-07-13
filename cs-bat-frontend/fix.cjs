const fs = require('fs');
const path = require('path');
const srcPath = 'c:/Users/Admin/Desktop/new cs/CS Bat/cs-bat-frontend/src';

const replacements = [
  // Backgrounds: Make them slightly deeper to contrast with white cards
  { search: /'#f8fafc'/g, replace: "'#eef2f6'" }, 
  { search: /'#f1f5f9'/g, replace: "'#eef2f6'" },
  { search: /rgba\(248, 250, 252, 0\.96\)/g, replace: "rgba(238, 242, 246, 0.96)" },
  
  // Borders: Replace gray borders with vibrant colored borders in light mode
  { search: /'rgba\(15, 23, 42, 0\.35\)'/g, replace: "'rgba(217, 119, 6, 0.4)'" }, 
  { search: /'rgba\(15, 23, 42, 0\.25\)'/g, replace: "'rgba(217, 119, 6, 0.3)'" },
  { search: /'rgba\(15, 23, 42, 0\.15\)'/g, replace: "'rgba(217, 119, 6, 0.25)'" },
  { search: /'rgba\(15, 23, 42, 0\.05\)'/g, replace: "'rgba(217, 119, 6, 0.15)'" },
  { search: /rgba\(15, 23, 42, 0\.02\)/g, replace: "rgba(217, 119, 6, 0.05)" },
  
  // Box Shadows: Replace flat gray shadows with a slight gold/orange tint to make it look premium
  { search: /0 20px 40px rgba\(15, 23, 42, 0\.05\)/g, replace: "0 20px 40px rgba(217, 119, 6, 0.15)" },
  { search: /0 10px 30px rgba\(0,0,0,0\.05\)/g, replace: "0 10px 30px rgba(217, 119, 6, 0.15)" },
  { search: /0 15px 40px rgba\(243,198,95,0\.15\)/g, replace: "0 15px 40px rgba(217, 119, 6, 0.25)" }
];

fs.readdirSync(srcPath).forEach(file => {
  if (file.endsWith('.jsx')) {
    let content = fs.readFileSync(path.join(srcPath, file), 'utf8');
    let newContent = content;
    replacements.forEach(r => {
      newContent = newContent.replace(r.search, r.replace);
    });
    if (newContent !== content) {
      fs.writeFileSync(path.join(srcPath, file), newContent);
      console.log('Updated ' + file);
    }
  }
});
