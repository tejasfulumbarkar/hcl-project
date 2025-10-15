const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('POST /api/contact received:', { name, email, message });
    if (!name || !email || !message) return res.status(400).json({ message: 'Missing fields' });
    const c = await Contact.create({ name, email, message });
    console.log('Contact saved:', c._id);
    // return the created document to help debugging
    res.json({ message: 'Thanks for contacting us', contact: c });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
