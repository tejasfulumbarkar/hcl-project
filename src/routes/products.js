const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// List products
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Get single
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// Create (admin)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, category, image } = req.body;
    const product = await Product.create({ title, description, price, category, image, createdBy: req.user.id });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
