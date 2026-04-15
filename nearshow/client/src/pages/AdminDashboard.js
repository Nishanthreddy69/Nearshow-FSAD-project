import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/events', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setEvents(eventsRes.data.events);
      setBookings(bookingsRes.data.bookings);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

  const categoryData = events.reduce((acc, event) => {
    const existing = acc.find(item => item.category === event.category);
    if (existing) existing.count += 1;
    else acc.push({ category: event.category, count: 1 });
    return acc;
  }, []);

  const COLORS = ['#6c63ff', '#ff6584', '#43e97b', '#f7971e', '#00c6ff'];

  if (loading) return <p style={styles.loading}>Loading dashboard...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>NearShow Analytics</p>
        </div>
        <button style={styles.backBtn} onClick={() => navigate('/')}>Home</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Users</p>
          <p style={styles.statValue}>{users.length}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Events</p>
          <p style={styles.statValue}>{events.length}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Bookings</p>
          <p style={styles.statValue}>{bookings.length}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Revenue</p>
          <p style={styles.statValue}>₹{totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Events by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>All Users</h3>
        <div style={styles.tableHeader}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
        </div>
        {users.map(u => (
          <div key={u.id} style={styles.tableRow}>
            <span style={styles.cell}>{u.name}</span>
            <span style={styles.cell}>{u.email}</span>
            <span style={styles.roleBadge}>{u.role}</span>
            <span style={styles.cell}>
              {new Date(u.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>All Bookings</h3>
        <div style={styles.tableHeader}>
          <span>Event</span>
          <span>Seats</span>
          <span>Amount</span>
          <span>Date</span>
        </div>
        {bookings.map(b => (
          <div key={b.id} style={styles.tableRow}>
            <span style={styles.cell}>{b.events?.title}</span>
            <span style={styles.cell}>{b.seats}</span>
            <span style={styles.cell}>₹{b.total_price}</span>
            <span style={styles.cell}>
              {new Date(b.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', color: '#333', margin: 0 },
  subtitle: { color: '#666', margin: '4px 0 0' },
  backBtn: { padding: '10px 20px', background: 'white', color: '#6c63ff', border: '1px solid #6c63ff', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '60px', fontSize: '18px', color: '#666' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  statLabel: { color: '#999', fontSize: '14px', margin: '0 0 8px' },
  statValue: { color: '#6c63ff', fontSize: '32px', fontWeight: 'bold', margin: 0 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' },
  chartCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  chartTitle: { fontSize: '16px', color: '#333', marginBottom: '16px' },
  tableCard: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' },
  tableHeader: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 0', borderBottom: '2px solid #f0f0f0', fontWeight: 'bold', color: '#666', fontSize: '14px' },
  tableRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '12px 0', borderBottom: '1px solid #f8f8f8', alignItems: 'center' },
  cell: { color: '#555', fontSize: '14px' },
  roleBadge: { background: '#e8e6ff', color: '#6c63ff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'inline-block' }
};

export default AdminDashboard;