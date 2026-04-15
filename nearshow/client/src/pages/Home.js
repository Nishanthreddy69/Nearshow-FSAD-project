import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'concert', 'movie', 'workshop', 'festival', 'sports'];

function Home() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [radius, setRadius] = useState(50);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchEvents(latitude, longitude, radius);
      },
      () => fetchEvents(17.3850, 78.4867, radius)
    );
  }, []);

  const fetchEvents = async (lat, lng, r) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/events/nearby?lat=${lat}&lng=${lng}&radius=${r}`);
      setEvents(res.data.events);
      setFiltered(res.data.events);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleRadiusChange = (e) => {
    const r = e.target.value;
    setRadius(r);
    const loc = location || { lat: 17.3850, lng: 78.4867 };
    fetchEvents(loc.lat, loc.lng, r);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === 'All') setFiltered(events);
    else setFiltered(events.filter(e => e.category === cat));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const categoryColors = {
    concert: '#E63946', movie: '#3a86ff', workshop: '#06d6a0',
    festival: '#FFB703', sports: '#fb5607', other: '#8338ec'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      {/* Navbar */}
      <nav style={nav.bar}>
        <div style={nav.left}>
          <span style={nav.logo} onClick={() => navigate('/')}>NEAR<span style={{ color: 'var(--red)' }}>SHOW</span></span>
          <span style={nav.city}>📍 Hyderabad</span>
        </div>
        <div style={nav.right}>
          {user ? (
            <>
              <span style={nav.greeting}>Hi, {user.name.split(' ')[0]}</span>
              <button style={nav.ghostBtn} onClick={() => navigate('/my-tickets')}>My Tickets</button>
              {user.role === 'organizer' && <button style={nav.ghostBtn} onClick={() => navigate('/organizer')}>Dashboard</button>}
              {user.role === 'admin' && <button style={nav.ghostBtn} onClick={() => navigate('/admin')}>Admin</button>}
              <button style={nav.redBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={nav.ghostBtn} onClick={() => navigate('/login')}>Sign In</button>
              <button style={nav.redBtn} onClick={() => navigate('/register')}>Join Free</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={hero.wrap}>
        <div style={hero.overlay} />
        <div style={hero.content}>
          <p style={hero.eyebrow}>Events happening near you</p>
          <h1 style={hero.heading}>Discover. Book.<br /><span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Experience.</span></h1>
          <div style={hero.radiusBox}>
            <span style={hero.radiusLabel}>Search within {radius} km</span>
            <input type="range" min="5" max="100" value={radius} onChange={handleRadiusChange} style={hero.slider} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={cats.wrap}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            style={{
              ...cats.btn,
              background: activeCategory === cat ? 'var(--red)' : 'var(--dark3)',
              color: activeCategory === cat ? 'white' : 'var(--gray)',
              border: activeCategory === cat ? '1px solid var(--red)' : '1px solid var(--dark4)'
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div style={grid.wrap}>
        <h2 style={grid.heading}>
          {loading ? 'Finding events...' : `${filtered.length} Events Found`}
        </h2>
        {loading ? (
          <div style={grid.loader}>
            {[1,2,3,4].map(i => <div key={i} style={grid.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={grid.empty}>
            <p style={{ fontSize: '48px' }}>🎭</p>
            <p style={{ color: 'var(--gray)', marginTop: '12px' }}>No events found in this area</p>
          </div>
        ) : (
          <div style={grid.cards}>
            {filtered.map(event => (
              <div key={event.id} style={card.wrap} onClick={() => navigate(`/events/${event.id}`)}>
                <div style={{ ...card.banner, background: `linear-gradient(135deg, ${categoryColors[event.category] || '#888'}33, ${categoryColors[event.category] || '#888'}11)` }}>
                  <div style={{ ...card.catBadge, background: categoryColors[event.category] || '#888' }}>
                    {event.category}
                  </div>
                  <div style={card.distBadge}>{event.distance} km</div>
                  <div style={card.bigLetter}>{event.title.charAt(0)}</div>
                </div>
                <div style={card.body}>
                  <h3 style={card.title}>{event.title}</h3>
                  <p style={card.loc}>📍 {event.location_name}</p>
                  <p style={card.date}>🗓 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <div style={card.footer}>
                    <span style={card.price}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</span>
                    <span style={card.seats}>{event.available_seats} seats left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={foot.wrap}>
        <p style={foot.text}>© 2026 NearShow · Built with ❤️ in Hyderabad</p>
      </footer>
    </div>
  );
}

const nav = {
  bar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: 'var(--dark2)', borderBottom: '1px solid var(--dark4)', position: 'sticky', top: 0, zIndex: 100 },
  left: { display: 'flex', alignItems: 'center', gap: '20px' },
  logo: { fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', cursor: 'pointer' },
  city: { fontSize: '13px', color: 'var(--gray)', background: 'var(--dark3)', padding: '4px 12px', borderRadius: '20px' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { fontSize: '14px', color: 'var(--gray)' },
  ghostBtn: { padding: '8px 18px', background: 'transparent', color: 'var(--white)', border: '1px solid var(--dark4)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'var(--transition)' },
  redBtn: { padding: '8px 18px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }
};

const hero = {
  wrap: { position: 'relative', background: 'linear-gradient(135deg, #1a0a0a 0%, #0d0d0d 50%, #0a0a1a 100%)', padding: '80px 40px', overflow: 'hidden' },
  overlay: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.15) 0%, transparent 60%)', pointerEvents: 'none' },
  content: { position: 'relative', maxWidth: '700px' },
  eyebrow: { color: 'var(--red)', fontSize: '13px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' },
  heading: { fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 8vw, 88px)', lineHeight: 1, letterSpacing: '2px', marginBottom: '32px' },
  radiusBox: { display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--dark3)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--dark4)', display: 'inline-flex' },
  radiusLabel: { fontSize: '14px', color: 'var(--gray)', whiteSpace: 'nowrap' },
  slider: { width: '200px', accentColor: 'var(--red)' }
};

const cats = {
  wrap: { display: 'flex', gap: '10px', padding: '24px 40px', overflowX: 'auto', background: 'var(--dark2)', borderBottom: '1px solid var(--dark4)' },
  btn: { padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'var(--transition)', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }
};

const grid = {
  wrap: { maxWidth: '1300px', margin: '0 auto', padding: '40px' },
  heading: { fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '1px', marginBottom: '28px', color: 'var(--light)' },
  loader: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  skeleton: { height: '340px', background: 'var(--dark3)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' },
  empty: { textAlign: 'center', padding: '80px', color: 'var(--gray)' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }
};

const card = {
  wrap: { background: 'var(--dark2)', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--dark4)', transition: 'var(--transition)', ':hover': { transform: 'translateY(-4px)' } },
  banner: { position: 'relative', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bigLetter: { fontFamily: 'var(--font-display)', fontSize: '120px', opacity: 0.15, color: 'white', lineHeight: 1, userSelect: 'none' },
  catBadge: { position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'white' },
  distBadge: { position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: 'rgba(0,0,0,0.6)', color: 'var(--gold)' },
  body: { padding: '20px' },
  title: { fontSize: '17px', fontWeight: '600', color: 'var(--white)', marginBottom: '10px', lineHeight: 1.3 },
  loc: { fontSize: '13px', color: 'var(--gray)', marginBottom: '4px' },
  date: { fontSize: '13px', color: 'var(--gray)', marginBottom: '16px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--dark4)', paddingTop: '14px' },
  price: { fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '1px' },
  seats: { fontSize: '12px', color: 'var(--gray)' }
};

const foot = {
  wrap: { textAlign: 'center', padding: '40px', borderTop: '1px solid var(--dark4)', marginTop: '40px' },
  text: { color: 'var(--gray)', fontSize: '13px' }
};

export default Home;