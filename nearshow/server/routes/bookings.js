const express = require('express');
const router = express.Router();
const supabase = require('../db');
const protect = require('../middleware/auth');
const QRCode = require('qrcode');

// CREATE BOOKING
router.post('/', protect(['user', 'organizer', 'admin']), async (req, res) => {
  try {
    const { event_id, seats } = req.body;
    const user_id = req.user.id;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.available_seats < seats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const total_price = event.price * seats;

    // Generate QR code
    const qrData = JSON.stringify({
      event_id,
      user_id,
      seats,
      event_title: event.title,
      total_price
    });
    const qr_code = await QRCode.toDataURL(qrData);

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{ user_id, event_id, seats, total_price, qr_code }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Reduce available seats
    const { error: updateError } = await supabase
      .from('events')
      .update({ available_seats: event.available_seats - seats })
      .eq('id', event_id);

    if (updateError) throw updateError;

    res.status(201).json({
      message: 'Booking successful!',
      booking: {
        id: booking.id,
        event_title: event.title,
        seats: booking.seats,
        total_price: booking.total_price,
        qr_code: booking.qr_code
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MY BOOKINGS
router.get('/my', protect(['user', 'organizer', 'admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, events(title, date, location_name, latitude, longitude)`)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ bookings: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE BOOKING
router.get('/:id', protect(['user', 'organizer', 'admin']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, events(title, date, location_name)`)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Booking not found' });

    res.json({ booking: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;