const sharp = require('sharp');
sharp('temp_padded.svg')
  .resize(1024, 1024)
  .png()
  .toFile('assets/images/neon-app-icon.png')
  .then(() => console.log('Successfully created neon-app-icon.png with padding!'))
  .catch(err => console.error(err));
