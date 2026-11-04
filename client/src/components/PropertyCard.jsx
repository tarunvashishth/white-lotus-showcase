import { Link } from 'react-router-dom';
import { formatNumber, formatPrice } from '../lib/format.js';

export const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#e7e2d6"/><text x="50%" y="50%" fill="#8a8168" font-family="Georgia" font-size="42" text-anchor="middle">No image</text></svg>',
);

export function PropertyImage({ src, alt, className }) {
  return (
    <img
      src={src || PLACEHOLDER}
      alt={alt}
      loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER; }}
      className={className}
    />
  );
}

export default function PropertyCard({ p }) {
  return (
    <Link to={`/properties/${p.id}`} className="group overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:shadow-lg">
      <div className="aspect-[3/2] overflow-hidden bg-stone-200">
        <PropertyImage src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl font-semibold leading-tight">{p.name}</h3>
          <span className="shrink-0 font-semibold text-lotus-dark">{formatPrice(p.price)}</span>
        </div>
        <p className="mt-0.5 text-sm text-stone-500">{p.location}, Bengaluru</p>
        <p className="mt-3 line-clamp-2 text-sm text-stone-700">{p.description}</p>
        <p className="mt-3 flex gap-4 border-t border-stone-100 pt-3 text-xs text-stone-600">
          <span>{p.bedrooms} {p.bedrooms === 1 ? 'bed' : 'beds'}</span>
          <span>{p.bathrooms} {p.bathrooms === 1 ? 'bath' : 'baths'}</span>
          <span>{formatNumber(p.size_sqft)} sq ft</span>
        </p>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="aspect-[3/2] bg-stone-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-stone-200" />
        <div className="h-3 w-1/3 rounded bg-stone-200" />
        <div className="h-3 w-full rounded bg-stone-200" />
        <div className="h-3 w-2/3 rounded bg-stone-200" />
      </div>
    </div>
  );
}
