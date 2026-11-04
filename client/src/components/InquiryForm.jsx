import { useState } from 'react';
import { api, ApiError } from '../api.js';
import { Field, btn, inputCls } from './ui.jsx';

const EMPTY = { name: '', email: '', phone: '', message: '' };

export default function InquiryForm({ propertyId, propertyName }) {
  const [values, setValues] = useState({ ...EMPTY, message: `I'm interested in ${propertyName}.` });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const bind = (key) => ({
    value: values[key],
    onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    className: inputCls(errors[key]),
    'aria-invalid': !!errors[key],
  });

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError('');
    try {
      await api(`/properties/${propertyId}/inquiries`, { method: 'POST', body: values });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setErrors(err.fields);
      else setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="font-serif text-2xl font-semibold text-green-900">Thank you</h3>
        <p className="mt-1 text-sm text-green-800">Your inquiry about {propertyName} has been received. Our sales team will be in touch shortly.</p>
        <button className={`${btn.secondary} mt-4`} onClick={() => { setSent(false); setValues(EMPTY); }}>Send another inquiry</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-lg border border-stone-200 bg-white p-6">
      <h3 className="font-serif text-2xl font-semibold">Enquire about this property</h3>
      <Field label="Name" error={errors.name}><input type="text" autoComplete="name" {...bind('name')} /></Field>
      <Field label="Email" error={errors.email}><input type="email" autoComplete="email" {...bind('email')} /></Field>
      <Field label="Phone" error={errors.phone}><input type="tel" autoComplete="tel" placeholder="+91 98450 11223" {...bind('phone')} /></Field>
      <Field label="Message" error={errors.message}><textarea rows={4} {...bind('message')} /></Field>
      {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
      <button type="submit" className={`${btn.primary} w-full`} disabled={submitting}>{submitting ? 'Sending…' : 'Send inquiry'}</button>
    </form>
  );
}
