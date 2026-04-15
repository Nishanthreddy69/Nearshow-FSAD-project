import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EventDetails() {
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then(res => { setEvent(res.data.event); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true);
    try {
      await axios.post('http://localhost:5000/api/bookings', { event_id: id, seats }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/my-tickets');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    }
    setBooking(false);
  };

  if (loading) return <div style={s.center}>Loading event...</div>;
  if (!event) return <div style={s.center}>Event not found</div>;

  const categoryColors = { concert: '#E63946', movie: '#3a86ff', workshop: '#06d6a0', festival: '#FFB703', sports: '#fb5607' };
  const color = categoryColors[event.category] || '#888';

  return (
    <div style={s.page}>
      <div style={{ ...s.hero, background: `linear-gradient(135deg, ${color}22 0%, var(--dark) 60%)` }}>
        <div style={s.heroInner}>
          <button style={s.back} onClick={() => navigate('/')}>← Back to events</button>
          <div style={{ ...s.catTag, background: color }}>{event.category}</div>
          <h1 style={s.title}>{event.title}</h1>
          <div style={s.metaRow}>
            <span style={s.meta}>🗓 {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span style={s.meta}>📍 {event.location_name}</span>
            <span style={s.meta}>🎟 {event.available_seats} seats left</span>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.left}>
          <div style={s.section}>
            <h2 style={s.sectionTitle}>About this event</h2>
            <p style={s.desc}>{event.description}</p>
          </div>
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Event details</h2>
            <div style={s.detailGrid}>
              {[
                { label: 'Date', value: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) },
                { label: 'Time', value: new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Venue', value: event.location_name },
                { label: 'Category', value: event.category },
                { label: 'Total seats', value: event.total_seats },
                { label: 'Available', value: event.available_seats },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <p style={s.detailLabel}>{item.label}</p>
                  <p style={s.detailValue}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={s.right}>
          <div style={s.bookCard}>
            <div style={s.priceRow}>
              <span style={s.priceLabel}>Price per seat</span>
              <span style={s.price}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</span>
            </div>
            <div style={s.divider} />
            <label style={s.label}>Number of seats</label>
            <div style={s.seatsRow}>
              <button style={s.seatsBtn} onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
              <span style={s.seatsNum}>{seats}</span>
              <button style={s.seatsBtn} onClick={() => setSeats(Math.min(event.available_seats, seats + 1))}>+</button>
            </div>
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total amount</span>
              <span style={s.total}>₹{event.price * seats}</span>
            </div>
            {message && <p style={s.errMsg}>{message}</p>}
            <button style={s.bookBtn} onClick={handleBooking} disabled={booking}>
              {booking ? 'Processing...' : user ? '🎟 Book Now' : '🔐 Login to Book'}
            </button>
            <p style={s.secure}>🔒 Secure booking · Instant QR ticket</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--dark)' },
  center: { textAlign: 'center', padding: '100px', color: 'var(--gray)', fontSize: '18px' },
  hero: { padding: '60px 40px 40px', borderBottom: '1px solid var(--dark4)' },
  heroInner: { maxWidth: '1200px', margin: '0 auto' },
  back: { background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0 },
  catTag: { display: 'inline-block', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'white', marginBottom: '16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '2px', lineHeight: 1.1, marginBottom: '24px', color: 'var(--white)' },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  meta: { fontSize: '14px', color: 'var(--gray)' },
  body: { display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto', padding: '40px' },
  left: { flex: 1 },
  right: { width: '340px', flexShrink: 0 },
  section: { marginBottom: '40px' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px', marginBottom: '16px', color: 'var(--light)' },
  desc: { color: 'var(--gray)', lineHeight: 1.8, fontSize: '15px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  detailItem: { background: 'var(--dark2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--dark4)' },
  detailLabel: { fontSize: '11px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  detailValue: { fontSize: '15px', color: 'var(--white)', fontWeight: '500' },
  bookCard: { background: 'var(--dark2)', border: '1px solid var(--dark4)', borderRadius: '16px', padding: '28px', position: 'sticky', top: '100px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  priceLabel: { color: 'var(--gray)', fontSize: '14px' },
  price: { fontFamily: 'var(--font-display)', fontSize: '36px', color: 'var(--gold)', letterSpacing: '1px' },
  divider: { height: '1px', background: 'var(--dark4)', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' },
  seatsRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
  seatsBtn: { width: '36px', height: '36px', background: 'var(--dark3)', border: '1px solid var(--dark4)', borderRadius: '8px', color: 'white', fontSize: '18px', cursor: 'pointer' },
  seatsNum: { fontSize: '24px', fontWeight: '600', color: 'var(--white)', minWidth: '30px', textAlign: 'center' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  totalLabel: { color: 'var(--gray)', fontSize: '14px' },
  total: { fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--white)' },
  errMsg: { color: '#ff6b75', fontSize: '13px', marginBottom: '12px', textAlign: 'center' },
  bookBtn: { width: '100%', padding: '16px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', marginBottom: '12px' },
  secure: { textAlign: 'center', fontSize: '12px', color: 'var(--gray)' }
};

export default EventDetails;