import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import { PropertyImage } from '../components/PropertyCard.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { BackLink, EmptyState, ErrorState, Spinner } from '../components/ui.jsx';
import { formatNumber, formatPrice } from '../lib/format.js';

export default function PropertyDetail() {
  const { id } = useParams();
  const { data: p, error, loading, reload } = useFetch(() => api(`/properties/${id}`), [id]);
  const [active, setActive] = useState(0);

  if (loading) return <Spinner label="Loading property…" />;
  if (error?.status === 404) {
    return (
      <EmptyState title="Property not found">
        It may have been removed. <Link to="/" className="text-lotus underline">Browse all properties</Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const specs = [
    ['Price', formatPrice(p.price)],
    ['Size', `${formatNumber(p.size_sqft)} sq ft`],
    ['Bedrooms', p.bedrooms],
    ['Bathrooms', p.bathrooms],
  ];

  return (
    <div>
      <BackLink to="/">All properties</BackLink>
      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[3/2] overflow-hidden rounded-lg bg-stone-200">
            <PropertyImage src={p.images[active]} alt={`${p.name} photo ${active + 1}`} className="h-full w-full object-cover" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {p.images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}`}
                  className={`aspect-[3/2] overflow-hidden rounded-md border-2 ${i === active ? 'border-lotus' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <PropertyImage src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-6 font-serif text-4xl font-bold text-lotus-dark">{p.name}</h1>
          <p className="mt-1 text-stone-600">{p.location}, Bengaluru</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-4">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-stone-500">{k}</dt>
                <dd className="mt-0.5 text-lg font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 font-serif text-2xl font-semibold">About this residence</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-stone-700">{p.long_description || p.description}</p>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <InquiryForm propertyId={p.id} propertyName={p.name} />
        </aside>
      </div>
    </div>
  );
}
