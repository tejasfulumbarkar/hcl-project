const mongoose = require('mongoose');
const Feedback = require('../src/models/Feedback');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sustain_bottles';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', uri);
    const docs = await Feedback.find().sort({ createdAt: -1 }).limit(20).lean();
    console.log('Latest feedback documents (up to 20):');
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
