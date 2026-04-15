import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get('http://localhost:5000/api/bookings/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setBookings(res.data.bookings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.center}>Loading tickets...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <button style={s.back} onClick={() => navigate('/')}>← Back</button>
          <h1 style={s.title}>MY TICKETS</h1>
          <p style={s.sub}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div style={s.body}>
        {bookings.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '64px', marginBottom: '16px' }}>🎟</p>
            <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No tickets yet</h3>
            <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>Book your first event and your tickets will appear here</p>
            <button style={s.browseBtn} onClick={() => navigate('/')}>Browse Events</button>
          </div>
        ) : (
          <div style={s.tickets}>
            {bookings.map(booking => (
              <div key={booking.id} style={s.ticket}>
                <div style={s.ticketLeft}>
                  <div style={s.ticketTop}>
                    <span style={s.ticketBadge}>CONFIRMED</span>
                    <span style={s.ticketId}>#{booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <h3 style={s.eventName}>{booking.events?.title}</h3>
                  <div style={s.ticketDetails}>
                    <div style={s.ticketDetail}>
                      <span style={s.detailLabel}>DATE</span>
                      <span style={s.detailValue}>{new Date(booking.events?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={s.ticketDetail}>
                      <span style={s.detailLabel}>VENUE</span>
                      <span style={s.detailValue}>{booking.events?.location_name}</span>
                    </div>
                    <div style={s.ticketDetail}>
                      <span style={s.detailLabel}>SEATS</span>
                      <span style={s.detailValue}>{booking.seats}</span>
                    </div>
                    <div style={s.ticketDetail}>
                      <span style={s.detailLabel}>AMOUNT PAID</span>
                      <span style={{ ...s.detailValue, color: 'var(--gold)' }}>₹{booking.total_price}</span>
                    </div>
                  </div>
                </div>
                <div style={s.ticketDivider}>
                  <div style={s.hole} />
                  <div style={s.dashedLine} />
                  <div style={s.hole} />
                </div>
                <div style={s.ticketRight}>
                  <p style={s.qrLabel}>SCAN TO ENTER</p>
                  <img src={booking.qr_code} alt="QR Code" style={s.qr} />
                  <p style={s.qrSub}>Show this at the venue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--dark)' },
  center: { textAlign: 'center', padding: '100px', color: 'var(--gray)', fontSize: '18px' },
  header: { padding: '40px 40px 32px', borderBottom: '1px solid var(--dark4)', background: 'var(--dark2)' },
  back: { background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '16px', display: 'block' },
  title: { fontFamily: 'var(--font-display)', fontSize: '48px', letterSpacing: '3px', color: 'var(--white)', marginBottom: '4px' },
  sub: { color: 'var(--gray)', fontSize: '14px' },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px' },
  empty: { textAlign: 'center', padding: '80px 40px' },
  browseBtn: { padding: '14px 32px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  tickets: { display: 'flex', flexDirection: 'column', gap: '24px' },
  ticket: { display: 'flex', background: 'var(--dark2)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--dark4)' },
  ticketLeft: { flex: 1, padding: '32px' },
  ticketTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  ticketBadge: { background: 'rgba(6,214,160,0.15)', color: '#06d6a0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' },
  ticketId: { color: 'var(--gray)', fontSize: '12px', fontFamily: 'monospace' },
  eventName: { fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '1px', color: 'var(--white)', marginBottom: '24px' },
  ticketDetails: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  ticketDetail: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '10px', color: 'var(--gray)', letterSpacing: '1.5px', textTransform: 'uppercase' },
  detailValue: { fontSize: '15px', color: 'var(--white)', fontWeight: '500' },
  ticketDivider: { width: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: 'var(--dark)', padding: '16px 0' },
  hole: { width: '16px', height: '16px', background: 'var(--dark)', borderRadius: '50%' },
  dashedLine: { flex: 1, borderLeft: '2px dashed var(--dark4)', margin: '8px 0' },
  ticketRight: { width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--dark3)' },
  qrLabel: { fontSize: '10px', color: 'var(--gray)', letterSpacing: '2px', marginBottom: '12px', textAlign: 'center' },
  qr: { width: '120px', height: '120px', borderRadius: '8px', background: 'white', padding: '4px' },
  qrSub: { fontSize: '10px', color: 'var(--gray)', marginTop: '10px', textAlign: 'center' }
};

export default MyTickets;