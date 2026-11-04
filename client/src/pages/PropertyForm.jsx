import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError, useFetch } from '../api.js';
import { BackLink, ErrorState, Field, Spinner, btn, inputCls } from '../components/ui.jsx';
import { formatPrice } from '../lib/format.js';

const BLANK = { name: '', location: '', price: '', size_sqft: '', bedrooms: '', bathrooms: '1', description: '', long_description: '', images: '' };

// Shared by "add" (/admin/properties/new) and "edit" (/admin/properties/:id/edit).
export default function PropertyForm() {
  const { id } = useParams();
  const editing = !!id;
  const existing = useFetch(() => (editing ? api(`/properties/${id}`) : Promise.resolve(null)), [id]);

  if (existing.loading) return <Spinner />;
  if (existing.error) return <ErrorState error={existing.error} onRetry={existing.reload} />;

  const initial = existing.data
    ? { ...existing.data, images: existing.data.images.join('\n') }
    : BLANK;
  return <FormBody key={id || 'new'} id={id} initial={initial} />;
}

function FormBody({ id, initial }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const bind = (key) => ({
    value: values[key],
    onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    className: inputCls(errors[key]),
    'aria-invalid': !!errors[key],
  });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError('');
    const body = {
      ...values,
      images: values.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      await (id ? api(`/properties/${id}`, { method: 'PUT', body }) : api('/properties', { method: 'POST', body }));
      navigate('/admin');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors(
          // images.N errors are shown on the single images textarea
          Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [k.startsWith('images') ? 'images' : k, v])),
        );
        setFormError('Please fix the highlighted fields.');
      } else if (err.status === 401) {
        navigate('/admin/login');
      } else {
        setFormError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  const priceNum = Number(values.price);

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink to="/admin">Dashboard</BackLink>
      <h1 className="mb-6 mt-3 font-serif text-4xl font-bold text-lotus-dark">{id ? 'Edit property' : 'Add property'}</h1>
      <form onSubmit={submit} noValidate className="space-y-5 rounded-lg border border-stone-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name *" error={errors.name}><input type="text" {...bind('name')} /></Field>
          <Field label="Location (area) *" error={errors.location}><input type="text" placeholder="e.g. Indiranagar" {...bind('location')} /></Field>
          <Field label="Price (₹) *" error={errors.price} hint={priceNum > 0 ? formatPrice(priceNum) : 'Whole rupees, e.g. 85000000'}>
            <input type="number" min="1" step="1" inputMode="numeric" {...bind('price')} />
          </Field>
          <Field label="Size (sq ft) *" error={errors.size_sqft}><input type="number" min="1" step="1" {...bind('size_sqft')} /></Field>
          <Field label="Bedrooms *" error={errors.bedrooms}><input type="number" min="0" step="1" {...bind('bedrooms')} /></Field>
          <Field label="Bathrooms" error={errors.bathrooms}><input type="number" min="0" step="1" {...bind('bathrooms')} /></Field>
        </div>
        <Field label="Short description * (max 300)" error={errors.description}><textarea rows={2} maxLength={300} {...bind('description')} /></Field>
        <Field label="Full description" error={errors.long_description}><textarea rows={6} {...bind('long_description')} /></Field>
        <Field label="Image URLs (one per line)" error={errors.images} hint="Paste image links. The first image is used on listing cards.">
          <textarea rows={4} placeholder="https://…" {...bind('images')} />
        </Field>
        {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
        <div className="flex gap-3">
          <button className={btn.primary} disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Create property'}</button>
          <button type="button" className={btn.secondary} onClick={() => navigate('/admin')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
