const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('-------------------------------------------');
  console.log('ADMIN_PASSWORD_HASH:');
  console.log(hash);
  console.log('-------------------------------------------');
  console.log('Now create a document in Firestore:');
  console.log('Path: /internal/config');
  console.log('Fields:');
  console.log('  adminUser: "your_username"');
  console.log('  adminPasswordHash: "' + hash + '"');
  console.log('-------------------------------------------');
}

const password = process.argv[2];
if (!password) {
  console.log('Usage: node generate_admin_hash.js <your_password>');
} else {
  generateHash(password);
}
