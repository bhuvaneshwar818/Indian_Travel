import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.join(__dirname, 'src', 'lib', 'indianTravelData.js');

import('./src/lib/indianTravelData.js').then(module => {
  const data = module.indianTravelData;
  const imagesBase = path.join(__dirname, 'public', 'assets', 'images', 'locations');
  let updateCount = 0;

  for (const stateObj of data) {
    const stateName = stateObj.state;
    const places = stateObj.places;
    
    const stateDir = path.join(imagesBase, stateName);
    if (!fs.existsSync(stateDir)) {
      continue;
    }

    for (const loc of places) {
      const locName = loc.name;
      const exts = ['.jpg', '.jpeg', '.png', '.webp'];
      let foundExt = null;
      
      for (const ext of exts) {
        // Handle special characters in file names (e.g. '&', '(')
        // Some file names might not match exactly if there are spaces or special chars in unexpected ways, 
        // but the directory output showed exact matches like "Tirupati (Venkateswara Temple).jpg"
        const imgPath = path.join(stateDir, locName + ext);
        if (fs.existsSync(imgPath)) {
          foundExt = ext;
          break;
        }
      }
      
      if (foundExt) {
        loc.image = `/assets/images/locations/${stateName}/${locName}${foundExt}`;
        updateCount++;
      }
    }
  }

  const newContent = 'export const indianTravelData = ' + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(dataFile, newContent, 'utf8');
  console.log(`Updated ${updateCount} images!`);
}).catch(err => {
  console.error("Failed", err);
});
