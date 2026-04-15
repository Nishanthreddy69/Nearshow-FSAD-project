import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: 'concert',
    date: '', price: '', total_seats: '',
    latitude: '', longitude: '', location_name: ''
  });
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'organizer') {
      navigate('/');
      return;
    }
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/events/organizer/my-events',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Event created successfully!');
      setShowForm(false);
      setForm({
        title: '', description: '', category: 'concert',
        date: '', price: '', total_seats: '',
        latitude: '', longitude: '', location_name: ''
      });
      fetchMyEvents();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Organizer Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.name}</p>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/')}>Home</button>
        </div>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Create New Event</h2>
          <form onSubmit={handleCreate}>
            <div style={styles.formGrid}>
              <input
                style={styles.input}
                placeholder="Event Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
              <select
                style={styles.input}
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="concert">Concert</option>
                <option value="movie">Movie</option>
                <option value="workshop">Workshop</option>
                <option value="festival">Festival</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
              <input
                style={styles.input}
                type="datetime-local"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Price (₹)"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Total Seats"
                value={form.total_seats}
                onChange={e => setForm({ ...form, total_seats: e.target.value })}
                required
              />
              <input
                style={styles.input}
                placeholder="Location Name"
                value={form.location_name}
                onChange={e => setForm({ ...form, location_name: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                step="any"
                placeholder="Latitude (e.g. 17.3850)"
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                step="any"
                placeholder="Longitude (e.g. 78.4867)"
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                required
              />
            </div>
            <textarea
              style={styles.textarea}
              placeholder="Event Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
            <button style={styles.submitBtn} type="submit">Create Event</button>
          </form>
        </div>
      )}

      <h2 style={styles.sectionTitle}>My Events ({events.length})</h2>

      {loading ? (
        <p style={styles.loading}>Loading your events...</p>
      ) : events.length === 0 ? (
        <p style={styles.loading}>No events yet. Create your first event!</p>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Event</span>
            <span>Date</span>
            <span>Price</span>
            <span>Seats Left</span>
            <span>Actions</span>
          </div>
          {events.map(event => (
            <div key={event.id} style={styles.tableRow}>
              <div>
                <p style={styles.eventName}>{event.title}</p>
                <p style={styles.eventLocation}>{event.location_name}</p>
              </div>
              <span style={styles.cell}>
                {new Date(event.date).toLocaleDateString('en-IN')}
              </span>
              <span style={styles.cell}>₹{event.price}</span>
              <span style={styles.cell}>{event.available_seats}/{event.total_seats}</span>
              <div style={styles.actions}>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', color: '#333', margin: 0 },
  subtitle: { color: '#666', margin: '4px 0 0' },
  headerBtns: { display: 'flex', gap: '12px' },
  createBtn: { padding: '10px 20px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  backBtn: { padding: '10px 20px', background: 'white', color: '#6c63ff', border: '1px solid #6c63ff', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  message: { background: '#e8ffe8', color: 'green', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  formCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '32px' },
  formTitle: { fontSize: '20px', color: '#333', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', height: '100px', boxSizing: 'border-box', marginBottom: '16px' },
  submitBtn: { padding: '12px 32px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  sectionTitle: { fontSize: '20px', color: '#333', marginBottom: '16px' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  table: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 20px', background: '#f8f7ff', fontWeight: 'bold', color: '#666', fontSize: '14px' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 20px', borderTop: '1px solid #f0f0f0', alignItems: 'center' },
  eventName: { margin: 0, fontWeight: '500', color: '#333' },
  eventLocation: { margin: '4px 0 0', fontSize: '12px', color: '#999' },
  cell: { color: '#555', fontSize: '14px' },
  actions: { display: 'flex', gap: '8px' },
  deleteBtn: { padding: '6px 12px', background: '#fff0f0', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }
};

export default OrganizerDashboard;