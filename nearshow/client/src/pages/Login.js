import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <h1 style={s.bigText}>YOUR NEXT<br /><span style={{ color: 'var(--red)' }}>EXPERIENCE</span><br />AWAITS.</h1>
        <p style={s.sub}>Book events, concerts, movies and more — all happening near you.</p>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <p style={s.brand}>NEAR<span style={{ color: 'var(--red)' }}>SHOW</span></p>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.hint}>Sign in to your account</p>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={s.footer}>Don't have an account? <Link to="/register" style={{ color: 'var(--red)' }}>Join free</Link></p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: 'var(--dark)' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a0505 0%, #0d0d0d 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' },
  bigText: { fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 1.05, letterSpacing: '3px', color: 'var(--white)', marginBottom: '24px' },
  sub: { color: 'var(--gray)', fontSize: '16px', lineHeight: 1.7, maxWidth: '380px' },
  right: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--dark2)', borderLeft: '1px solid var(--dark4)' },
  card: { width: '100%' },
  brand: { fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '2px', marginBottom: '32px', color: 'var(--white)' },
  title: { fontSize: '28px', fontWeight: '600', marginBottom: '8px', color: 'var(--white)' },
  hint: { color: 'var(--gray)', fontSize: '14px', marginBottom: '32px' },
  error: { background: 'rgba(230,57,70,0.1)', border: '1px solid var(--red)', color: '#ff6b75', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', background: 'var(--dark3)', border: '1px solid var(--dark4)', borderRadius: '10px', color: 'var(--white)', fontSize: '15px', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.5px', marginTop: '4px' },
  footer: { textAlign: 'center', marginTop: '24px', color: 'var(--gray)', fontSize: '14px' }
};

export default Login;