import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';
import { Field, btn, inputCls } from '../components/ui.jsx';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { password } });
      setToken(token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.fields?.password || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-lg border border-stone-200 bg-white p-6">
      <h1 className="font-serif text-3xl font-bold text-lotus-dark">Sales team login</h1>
      <Field label="Admin password" error={error}>
        <input type="password" autoFocus autoComplete="current-password" className={inputCls(error)} value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <button className={`${btn.primary} w-full`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
