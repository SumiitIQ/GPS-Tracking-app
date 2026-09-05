const sharp = require('sharp');
sharp('temp.svg')
  .resize(1024, 1024)
  .png()
  .toFile('assets/images/neon-app-icon.png')
  .then(() => console.log('Successfully created neon-app-icon.png!'))
  .catch(err => console.error(err));
