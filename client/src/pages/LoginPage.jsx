import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { api } from '../api';
import '../dashboard.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('store_admin_token', result.token);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) { setError(err.message || 'Unable to sign in'); }
    finally { setBusy(false); }
  }

  return <div className="tr-dashboard-login">
    <form className="tr-login-card" onSubmit={submit}>
      <Link to="/" className="tr-login-brand"><img src="/trimerge-icon.svg" alt="" /> <span>Trimerge<small>ADMIN WORKSPACE</small></span></Link>
      <div className="tr-login-icon"><LockKeyhole size={21}/></div>
      <h1>Welcome back</h1><p>Sign in to manage your store.</p>
      {error && <div className="tr-alert">{error}</div>}
      <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username" /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" /></label>
      <button className="tr-primary" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowRight size={16}/></button>
      <Link to="/" className="tr-back-store">← Back to storefront</Link>
    </form>
  </div>;
}
