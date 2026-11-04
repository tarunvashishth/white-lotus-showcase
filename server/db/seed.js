// Replaces all properties/inquiries with demo data. Run: npm run seed
import { pool } from '../src/db.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/1200/800`;

const properties = [
  ['The Lotus Crest Penthouse', 'Indiranagar', 185000000, 6200, 5, 6,
    'Triple-height penthouse with a private terrace pool and skyline views.',
    'A sky residence spanning the top two floors, with a private lift lobby, a 900 sq ft terrace with plunge pool, Italian marble floors and a fully automated home. Two covered parking bays and concierge service included.', 'crest'],
  ['Embassy Gardens Villa', 'Whitefield', 142000000, 5400, 5, 5,
    'Gated courtyard villa with a landscaped garden and home theatre.',
    'A standalone villa on a 6,000 sq ft plot, with a central courtyard, double-height living room, home theatre, and a staff quarter. Within a gated community with 24x7 security.', 'gardens'],
  ['Sanctum Residences 3BHK', 'Koramangala', 48500000, 2100, 3, 3,
    'Elegant three-bedroom apartment minutes from the startup corridor.',
    'A west-facing apartment on the 12th floor with a large balcony, modular kitchen, and access to a clubhouse, lap pool and co-working lounge.', 'sanctum'],
  ['Jade Pavilion Duplex', 'Sadashivanagar', 225000000, 7800, 6, 7,
    'Heritage-neighbourhood duplex with a private lawn and library.',
    'Set in one of Bengaluru\'s oldest addresses, this duplex has a private lawn, double-height library, wine cellar, and a rooftop sit-out. Only four residences in the building.', 'jade'],
  ['Orchid Skyline 2BHK', 'Hebbal', 26500000, 1450, 2, 2,
    'Lake-facing two-bedroom home with resort-style amenities.',
    'A compact luxury home overlooking Hebbal Lake, with a wraparound balcony, wooden flooring, and 40+ amenities including a sky deck and spa.', 'orchid'],
  ['Palm Meadows Estate', 'Whitefield', 98000000, 4300, 4, 5,
    'Golf-course-facing villa with a private pool.',
    'Four-bedroom villa facing the fairway, with a private pool, landscaped lawn, a study, and a servant quarter. Community offers a golf course, tennis courts and a clubhouse.', 'palm'],
  ['Serene Arc 4BHK', 'Jayanagar', 72000000, 3200, 4, 4,
    'Spacious four-bedroom residence in a leafy, established neighbourhood.',
    'A thoughtfully planned residence with cross-ventilation, a pooja room, a large family lounge and a terrace garden. Walking distance to Jayanagar 4th Block market.', 'serene'],
  ['Zenith One Studio', 'Indiranagar', 14500000, 780, 1, 1,
    'Designer studio apartment ideal for a city pied-à-terre.',
    'Fully furnished studio with a bespoke wardrobe wall, a compact chef\'s kitchen and a city-view balcony. Includes access to a gym and rooftop lounge.', 'zenith'],
];

await pool.query('TRUNCATE inquiries, properties RESTART IDENTITY CASCADE');
for (const [name, location, price, size, beds, baths, description, long, seed] of properties) {
  await pool.query(
    `INSERT INTO properties (name, location, price, size_sqft, bedrooms, bathrooms, description, long_description, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [name, location, price, size, beds, baths, description, long, [img(seed), img(seed + '-2'), img(seed + '-3')]],
  );
}
await pool.query(
  `INSERT INTO inquiries (property_id, name, email, phone, message) VALUES
   (1, 'Ananya Rao', 'ananya@example.com', '+91 98450 11223', 'Interested in a site visit this weekend.'),
   (3, 'Vikram Shah', 'vikram@example.com', '+91 99000 45678', 'Is the unit available for immediate possession?')`,
);
console.log(`Seeded ${properties.length} properties and 2 inquiries.`);
await pool.end();
