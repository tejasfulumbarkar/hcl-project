const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const contactRoutes = require('./src/routes/contact');
const feedbackRoutes = require('./src/routes/feedback');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure CORS preflight requests are handled for all routes
app.options('*', cors());

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

const PORT = parseInt(process.env.PORT, 10) || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sustain_bottles', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// Log the actual database name once connected
mongoose.connection.on('connected', () => {
  try {
    const dbName = (mongoose.connection.db && mongoose.connection.db.databaseName) || 'unknown';
    console.log('Mongoose connected to DB:', dbName);
  } catch (e) { console.log('Mongoose connected (db name unknown)'); }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Try to listen and if port is in use, increment and retry a few times
function startServer(port, attempts = 5) {
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts > 0) {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      setTimeout(() => startServer(port + 1, attempts - 1), 200);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);
