const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'src', 'lib', 'indianTravelData.js');
let content = fs.readFileSync(dataFile, 'utf8');

const jsonString = content.replace('export const indianTravelData = ', '').trim().replace(/;$/, '');
let data;
try {
  data = new Function('return ' + jsonString)();
} catch(e) {
  console.error("Failed to parse", e);
  process.exit(1);
}

const imagesBase = path.join(__dirname, 'public', 'assets', 'images', 'locations');
let updateCount = 0;

for (const state in data) {
  const locations = data[state];
  for (const loc of locations) {
    const locName = loc.name;
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
    let foundExt = null;
    
    // Check if state directory exists
    const stateDir = path.join(imagesBase, state);
    if (fs.existsSync(stateDir)) {
      for (const ext of exts) {
        const imgPath = path.join(stateDir, locName + ext);
        if (fs.existsSync(imgPath)) {
          foundExt = ext;
          break;
        }
      }
    }
    
    if (foundExt) {
      loc.image = `/assets/images/locations/${state}/${locName}${foundExt}`;
      updateCount++;
    }
  }
}

const newContent = 'export const indianTravelData = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(dataFile, newContent, 'utf8');
console.log(`Updated ${updateCount} images!`);
