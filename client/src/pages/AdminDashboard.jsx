import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import { EmptyState, ErrorState, Spinner, btn } from '../components/ui.jsx';
import { formatDate, formatNumber, formatPrice } from '../lib/format.js';

export default function AdminDashboard() {
  const [tab, setTab] = useState('properties');
  const tabCls = (t) => `border-b-2 px-4 py-2 text-sm font-medium ${tab === t ? 'border-lotus text-lotus-dark' : 'border-transparent text-stone-500 hover:text-ink'}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl font-bold text-lotus-dark">Admin dashboard</h1>
        <Link to="/admin/properties/new" className={btn.primary}>+ Add property</Link>
      </div>
      <div className="mb-6 flex border-b border-stone-200" role="tablist">
        <button role="tab" aria-selected={tab === 'properties'} className={tabCls('properties')} onClick={() => setTab('properties')}>Properties</button>
        <button role="tab" aria-selected={tab === 'inquiries'} className={tabCls('inquiries')} onClick={() => setTab('inquiries')}>Inquiries</button>
      </div>
      {tab === 'properties' ? <PropertiesTable /> : <InquiriesTable />}
    </div>
  );
}

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500';
const td = 'px-4 py-3 align-top text-sm';

function PropertiesTable() {
  const { data, error, loading, reload } = useFetch(() => api('/properties'), []);
  const [deleting, setDeleting] = useState(null);
  const [actionError, setActionError] = useState('');

  async function remove(p) {
    if (!window.confirm(`Delete "${p.name}"? Its inquiries will be deleted too. This cannot be undone.`)) return;
    setDeleting(p.id);
    setActionError('');
    try {
      await api(`/properties/${p.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data.length) return <EmptyState title="No properties yet"><Link to="/admin/properties/new" className="text-lotus underline">Add your first property</Link></EmptyState>;

  return (
    <>
      {actionError && <p role="alert" className="mb-3 text-sm text-red-600">{actionError}</p>}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr><th className={th}>Name</th><th className={th}>Location</th><th className={th}>Price</th><th className={th}>Beds</th><th className={th}>Size</th><th className={th}><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.map((p) => (
              <tr key={p.id}>
                <td className={`${td} font-medium`}><Link to={`/properties/${p.id}`} className="hover:underline">{p.name}</Link></td>
                <td className={td}>{p.location}</td>
                <td className={td}>{formatPrice(p.price)}</td>
                <td className={td}>{p.bedrooms}</td>
                <td className={td}>{formatNumber(p.size_sqft)} sq ft</td>
                <td className={`${td} whitespace-nowrap text-right`}>
                  <Link to={`/admin/properties/${p.id}/edit`} className={`${btn.secondary} mr-2 !px-3 !py-1.5`}>Edit</Link>
                  <button className={btn.danger} disabled={deleting === p.id} onClick={() => remove(p)}>{deleting === p.id ? 'Deleting…' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function InquiriesTable() {
  const { data, error, loading, reload } = useFetch(() => api('/inquiries'), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data.length) return <EmptyState title="No inquiries yet">Buyer inquiries from property pages will appear here.</EmptyState>;

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="min-w-full divide-y divide-stone-200">
        <thead className="bg-stone-50">
          <tr><th className={th}>Received</th><th className={th}>Property</th><th className={th}>Buyer</th><th className={th}>Contact</th><th className={th}>Message</th></tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {data.map((i) => (
            <tr key={i.id}>
              <td className={`${td} whitespace-nowrap text-stone-500`}>{formatDate(i.created_at)}</td>
              <td className={`${td} font-medium`}><Link to={`/properties/${i.property_id}`} className="hover:underline">{i.property_name}</Link></td>
              <td className={td}>{i.name}</td>
              <td className={td}><a href={`mailto:${i.email}`} className="text-lotus hover:underline">{i.email}</a><br /><a href={`tel:${i.phone}`} className="text-stone-600">{i.phone}</a></td>
              <td className={`${td} max-w-xs whitespace-pre-line`}>{i.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
