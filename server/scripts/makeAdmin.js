/**
 * Safe Admin Bootstrap Script for PrepAI
 * Usage: node scripts/makeAdmin.js <user-email>
 * Example: node scripts/makeAdmin.js admin@example.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const bootstrapAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error('Error: Please provide an email address.');
    console.log('Usage: node scripts/makeAdmin.js <user-email>');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('[Bootstrap] Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.error(`Error: User with email "${email}" not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`[Bootstrap] User "${user.email}" (${user.name}) is ALREADY an admin.`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`[Bootstrap] Success: User "${user.email}" (${user.name}) has been granted the 'admin' role.`);
    }

    await mongoose.disconnect();
    console.log('[Bootstrap] Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('[Bootstrap Error]', err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

bootstrapAdmin();
