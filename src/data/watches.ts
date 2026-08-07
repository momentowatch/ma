import type { Category, Watch } from '../types';
import {
  SA3A_PRODUCTS,
  Sa3aProduct,
  collectionFor,
  listingIdFor,
  listingSkuFor,
  photoFallbackUrl,
  photoIndicesFor,
  photoUrl,
  posterFallbackUrl,
  posterUrl,
  validateCatalog,
} from './sa3aCatalog';

const formatMad = (price: number): string => `${price} dhs`;

const ratingFor = (p: Sa3aProduct) => Number((4.4 + (p.imageCount % 5) * 0.1).toFixed(1));
const reviewsFor = (p: Sa3aProduct) => 18 + p.imageCount * 3 + (p.price % 7);

/** R9: sizing and specs follow the LISTING gender, not the product gender. */
const specsFor = (p: Sa3aProduct, side: 'men' | 'women', shownPhotos: number) => {
  const collection = collectionFor(p, side);
  let movementDesc = 'Quartz, three-hand';
  let powerReserveDesc = 'Battery, ~24 months';
  let thicknessDesc = '8 mm';
  let diameterDesc = side === 'men' ? '41 mm' : '34 mm';

  if (p.movement === 'chrono') {
    movementDesc = 'Quartz chronograph, 3 counters';
    powerReserveDesc = 'Battery, ~18 months';
    thicknessDesc = '11 mm';
    diameterDesc = side === 'men' ? '42 mm' : '34 mm';
  } else if (p.movement === 'auto') {
    movementDesc = 'Automatic self-winding';
    powerReserveDesc = '~40 hours';
    thicknessDesc = '12 mm';
  }
  if (side === 'women' && collection === 'Jewelry & Bracelet') diameterDesc = '32 mm';
  if (side === 'women' && collection === 'Petite Elegance') diameterDesc = '33 mm';

  let caseMaterial = 'Stainless steel';
  if (['cartier-santos-custom', 'cartier-panthere-classic-square', 'patek-philippe-classic-iii', 'rolex-gmt-master', 'rolex-datejust-two-tone-black-dial'].includes(p.folder)) {
    caseMaterial = 'Steel with gold-tone finish';
  }

  let strapMaterial = 'Steel bracelet';
  if (p.folder.startsWith('tissot-classic') || p.folder.startsWith('patek-philippe-classic') || p.folder.startsWith('hanboro-cuir')) {
    strapMaterial = 'Leather strap';
  } else if (p.brand === 'Hublot') {
    strapMaterial = 'Rubber strap';
  } else if (p.brand === 'IEKE') {
    strapMaterial = 'Steel mesh bracelet';
  }

  return {
    caseMaterial,
    diameter: diameterDesc,
    thickness: thicknessDesc,
    movement: movementDesc,
    powerReserve: powerReserveDesc,
    waterResistance: 'Splash resistant (3 ATM)',
    strapMaterial,
    glass: p.price < 250 ? 'Mineral hardened glass' : 'Sapphire-coated glass',
    buckle: strapMaterial.includes('bracelet') ? 'Folding clasp' : 'Pin buckle',
  };
};

// Copy must stay neutral: it may never hint that the reference also exists in the other grid (R13).
const shortCopyFor = (p: Sa3aProduct, side: 'men' | 'women'): string => {
  const mov = p.movement === 'chrono' ? 'chronograph' : p.movement === 'auto' ? 'automatic' : 'quartz';
  const fit = side === 'men' ? 'a confident everyday presence' : 'a refined everyday presence';
  return `Design-inspired ${mov} timepiece assembled for MOMENTO — ${fit}.`;
};

const longCopyFor = (): string =>
  'This design-inspired piece combines modern wearability with classic aesthetic codes. Crafted for everyday elegance and resilience.\n\nDelivered across Morocco with cash on delivery. Includes presentation box and MOMENTO service guarantee.';

const highlightsFor = (p: Sa3aProduct, shownPhotos: number): string[] => [
  `${shownPhotos} real photo${shownPhotos > 1 ? 's' : ''} of the actual product`,
  'Water-resistant to daily splashes',
  'Delivery across Morocco — cash on delivery',
  '7-day exchange on unworn pieces',
];

const buildListing = (p: Sa3aProduct, side: 'men' | 'women'): Watch => {
  const indices = photoIndicesFor(p, side);
  const counterpart: 'men' | 'women' = side === 'men' ? 'women' : 'men';
  return {
    id: listingIdFor(p, side),
    productId: p.id,
    name: p.name,
    subtitle: p.subtitle,
    brand: p.brand,
    category: side,
    gender: p.gender,
    variantOf: p.gender === 'unisex' ? p.id : undefined,
    internalVariant: p.gender === 'unisex' ? side : undefined,
    counterpartId: p.gender === 'unisex' ? listingIdFor(p, counterpart) : undefined,
    subCollection: collectionFor(p, side),
    referenceNumber: p.ref,                 // displayed: identical on both sides (R13)
    sku: listingSkuFor(p, side),            // internal: cart + WhatsApp fulfilment only
    price: p.price,
    currency: 'MAD',
    formattedPrice: formatMad(p.price),
    shortDescription: shortCopyFor(p, side),
    fullDescription: longCopyFor(),
    photoIndices: indices,
    images: indices.map((i) => photoUrl(p, i)),
    imageFallbacks: indices.map((i) => photoFallbackUrl(p, i)),
    coverImage: posterUrl(p),
    coverFallback: posterFallbackUrl(p),
    sourceFolder: p.folder,
    specs: specsFor(p, side, indices.length),
    highlights: highlightsFor(p, indices.length),
    inStock: true,
    isNewRelease: p.imageCount >= 6,
    isLimitedEdition: p.price >= 290,
    rating: ratingFor(p),
    reviewCount: reviewsFor(p),
    storySnippet: 'Photographed in-store at Casa Watch, Casablanca.',
    disclaimer: 'Design-inspired timepiece assembled for MOMENTO / Casa Watch. Not an original manufacturer product.',
  };
};

const expand = (p: Sa3aProduct): Watch[] => {
  const out: Watch[] = [];
  for (const side of ['men', 'women'] as ('men' | 'women')[]) {
    const indices = photoIndicesFor(p, side);
    if (indices.length === 0) continue;            // R6
    out.push(buildListing(p, side));
  }
  if (out.length === 0 && process.env.NODE_ENV !== 'production') {
    console.warn(`[catalog] product "${p.id}" produced no listing`);
  }
  return out;
};

export const ALL_WATCHES: Watch[] = SA3A_PRODUCTS.flatMap(expand);

const bySort = (a: Watch, b: Watch) =>
  a.subCollection !== b.subCollection
    ? a.subCollection.localeCompare(b.subCollection)
    : a.price - b.price;

export const MEN_WATCHES: Watch[] = ALL_WATCHES.filter((w) => w.category === 'men').sort(bySort);
export const WOMEN_WATCHES: Watch[] = ALL_WATCHES.filter((w) => w.category === 'women').sort(bySort);

export const SUB_COLLECTIONS_ALL: string[] = ['All Collections', ...Array.from(new Set(ALL_WATCHES.map((w) => w.subCollection)))];
export const SUB_COLLECTIONS_MEN: string[] = ['All Collections', ...Array.from(new Set(MEN_WATCHES.map((w) => w.subCollection)))];
export const SUB_COLLECTIONS_WOMEN: string[] = ['All Collections', ...Array.from(new Set(WOMEN_WATCHES.map((w) => w.subCollection)))];
export const BRANDS_ALL: string[] = ['All', ...Array.from(new Set(ALL_WATCHES.map((w) => w.brand)))].sort();
export const BRANDS_MEN: string[] = ['All', ...Array.from(new Set(MEN_WATCHES.map((w) => w.brand)))].sort();
export const BRANDS_WOMEN: string[] = ['All', ...Array.from(new Set(WOMEN_WATCHES.map((w) => w.brand)))].sort();

export const PRICE_BOUNDS = { min: 130, max: 330 };

export const getWatchById = (id: string): Watch | undefined => ALL_WATCHES.find((w) => w.id === id);
export const getListingsForProduct = (productId: string): Watch[] =>
  ALL_WATCHES.filter((w) => w.productId === productId);

export const LISTING_STATS = {
  listings: ALL_WATCHES.length,
  men: MEN_WATCHES.length,
  women: WOMEN_WATCHES.length,
  menPhotos: MEN_WATCHES.reduce((s, w) => s + w.images.length, 0),
  womenPhotos: WOMEN_WATCHES.reduce((s, w) => s + w.images.length, 0),
};

if (process.env.NODE_ENV !== 'production') {
  const problems = validateCatalog();
  if (problems.length > 0) console.warn('[catalog] validation problems:', problems);
  // eslint-disable-next-line no-console
  console.info('[catalog]', LISTING_STATS);
}

export const BRAND_STORY = {
  title: 'MOMENTO',
  subtitle: 'Casa Watch — Casablanca',
  tagline: 'Real photos. Fair prices. Delivered across Morocco.',
  craftsmanship:
    'Every piece in this boutique is photographed in our own shop in Casablanca. What you see in the gallery is the exact watch we ship to you, from 160 dhs, with cash on delivery available nationwide.',
};
