const express = require('express');
const router = express.Router();
const supabase = require('../db');
const protect = require('../middleware/auth');

// GET ALL EVENTS
router.get('/events', protect(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ events: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL BOOKINGS
router.get('/bookings', protect(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(title)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ bookings: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL USERS
router.get('/users', protect(['admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;