const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// create feedback (public)
router.post('/', async (req, res) => {
  try {
    const { productId, type, rating, message, email } = req.body;
    console.log('POST /api/feedback received:', { productId, type, rating, message, email });
    if (!type || !message) return res.status(400).json({ message: 'Missing fields' });
    const fb = await Feedback.create({ productId, type, rating, message, email });
    console.log('Feedback saved:', fb._id);
    res.status(201).json({ message: 'Feedback received', feedback: fb });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// list feedback (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const q = req.query || {};
    const items = await Feedback.find(q).sort({ createdAt: -1 }).limit(200).lean();
    res.json(items);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
