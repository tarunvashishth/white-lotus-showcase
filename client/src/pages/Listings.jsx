import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, useFetch } from '../api.js';
import PropertyCard, { CardSkeleton } from '../components/PropertyCard.jsx';
import { EmptyState, ErrorState, btn, inputCls } from '../components/ui.jsx';

const CRORE = 1e7;
const SORTS = [
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['size_desc', 'Largest first'],
  ['bedrooms_desc', 'Most bedrooms'],
];

// Filters live in the URL so a filtered view can be shared or bookmarked.
export default function Listings() {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || '';
  const [search, setSearch] = useState(get('q'));

  const set = (key, value) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });

  // Debounce free-text search so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => search !== get('q') && set('q', search.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const apiQuery = new URLSearchParams();
  for (const k of ['location', 'bedrooms', 'sort', 'q']) if (get(k)) apiQuery.set(k, get(k));
  if (get('minCr')) apiQuery.set('minPrice', Math.round(Number(get('minCr')) * CRORE));
  if (get('maxCr')) apiQuery.set('maxPrice', Math.round(Number(get('maxCr')) * CRORE));

  const list = useFetch(() => api(`/properties?${apiQuery}`), [apiQuery.toString()]);
  const locations = useFetch(() => api('/properties/locations'), []);
  const filtersActive = ['location', 'bedrooms', 'minCr', 'maxCr', 'q'].some(get);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-lotus-dark">Our Residences</h1>
        <p className="mt-1 text-stone-600">Bespoke luxury homes across Bengaluru.</p>
      </div>

      <form className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-6" onSubmit={(e) => e.preventDefault()} aria-label="Filter properties">
        <input className={`${inputCls()} col-span-2`} type="search" placeholder="Search by name…" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={inputCls()} aria-label="Location" value={get('location')} onChange={(e) => set('location', e.target.value)}>
          <option value="">All locations</option>
          {(locations.data || []).map((l) => <option key={l}>{l}</option>)}
        </select>
        <select className={inputCls()} aria-label="Minimum bedrooms" value={get('bedrooms')} onChange={(e) => set('bedrooms', e.target.value)}>
          <option value="">Any bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ bedrooms</option>)}
        </select>
        <input className={inputCls()} type="number" min="0" step="0.5" placeholder="Min ₹ Cr" aria-label="Minimum price in crore" value={get('minCr')} onChange={(e) => set('minCr', e.target.value)} />
        <input className={inputCls()} type="number" min="0" step="0.5" placeholder="Max ₹ Cr" aria-label="Maximum price in crore" value={get('maxCr')} onChange={(e) => set('maxCr', e.target.value)} />
        <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-6">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-stone-600">Sort</span>
            <select className={inputCls()} value={get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)}>
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          {filtersActive && (
            <button type="button" className={btn.secondary} onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear filters</button>
          )}
        </div>
      </form>

      {list.error ? (
        <ErrorState error={list.error} onRetry={list.reload} />
      ) : list.loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : list.data.length === 0 ? (
        <EmptyState title="No properties match">
          Try widening your filters.{' '}
          {filtersActive && <button className="text-lotus underline" onClick={() => { setSearch(''); setParams({}, { replace: true }); }}>Clear all filters</button>}
        </EmptyState>
      ) : (
        <>
          <p className="mb-3 text-sm text-stone-500">{list.data.length} {list.data.length === 1 ? 'property' : 'properties'}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.data.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </>
      )}
    </>
  );
}
