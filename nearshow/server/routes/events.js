const express = require('express');
const router = express.Router();
const supabase = require('../db');
const protect = require('../middleware/auth');

// GET ALL NEARBY EVENTS
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50, category } = req.query;

    let query = supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString());

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter by distance if lat/lng provided
    let events = data;
    if (lat && lng) {
      events = data.filter(event => {
        const distance = getDistance(
          parseFloat(lat), parseFloat(lng),
          event.latitude, event.longitude
        );
        event.distance = parseFloat(distance.toFixed(1));
        return distance <= parseFloat(radius);
      });
      // Sort by nearest first
      events.sort((a, b) => a.distance - b.distance);
    }

    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE EVENT
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Event not found' });

    res.json({ event: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE EVENT (organizer only)
router.post('/', protect(['organizer', 'admin']), async (req, res) => {
  try {
    const {
      title, description, category,
      date, price, total_seats,
      latitude, longitude, location_name
    } = req.body;

    const { data, error } = await supabase
      .from('events')
      .insert([{
        title, description, category,
        date, price, total_seats,
        available_seats: total_seats,
        latitude, longitude, location_name,
        organizer_id: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Event created!', event: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE EVENT (organizer only)
router.put('/:id', protect(['organizer', 'admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('organizer_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Event updated!', event: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE EVENT (organizer only)
router.delete('/:id', protect(['organizer', 'admin']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id)
      .eq('organizer_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Event deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MY EVENTS (organizer)
router.get('/organizer/my-events', protect(['organizer', 'admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ events: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function — calculate distance in km between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;