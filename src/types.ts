export type Category = 'all' | 'men' | 'women';
export type Gender = 'men' | 'women' | 'unisex';

/** Brands actually present in the CDN catalog (22). */
export type Brand =
  | 'Boss'
  | 'Bvlgari'
  | 'Cartier'
  | 'Casio'
  | 'Chanel'
  | 'D1 Milano'
  | 'Daniel Wellington'
  | 'Emporio Armani'
  | 'G-Shock'
  | 'Guess'
  | 'Hanboro'
  | 'Hublot'
  | 'IEKE'
  | 'Michael Kors'
  | 'Oliya'
  | 'Omega'
  | 'Patek Philippe'
  | 'Reloj'
  | 'Richard Mille'
  | 'Rolex'
  | 'Tissot'
  | 'Tommy Hilfiger';

/** Collections used by the real catalog. */
export type SubCollection =
  | 'Classic Dress'
  | 'Chronograph'
  | 'Automatic'
  | 'Sport & GMT'
  | 'Datejust Heritage'
  | 'Petite Elegance'
  | 'Steel Lady'
  | 'Jewelry & Bracelet';

export type MovementKind = 'quartz' | 'chrono' | 'auto';

export interface WatchSpecs {
  caseMaterial: string;
  diameter: string;
  thickness: string;
  movement: string;
  powerReserve: string;
  waterResistance: string;
  strapMaterial: string;
  glass: string;
  buckle: string;
}

export interface Watch {
  id: string;                 // listing id: 'guess-classic' or 'cartier-ballon-bleu--women'
  productId: string;          // underlying product id, shared by both variants
  name: string;
  subtitle: string;
  brand: Brand;
  category: Category;         // the grid this listing belongs to
  /**
   * DATA-ONLY value. 'unisex' means: expand this folder into two independent
   * listings, one per gender, each showing only its own audited photos.
   * It must NEVER be rendered, labelled, filtered on, or spoken to the customer.
   */
  gender: Gender;             // 'unisex' when the reference exists on both sides
  variantOf?: string;         // internal only — equals productId on dual-placed refs
  internalVariant?: 'men' | 'women'; // internal only — NEVER rendered
  counterpartId?: string;     // internal only — sibling listing in the other grid
  subCollection: SubCollection;
  referenceNumber: string;    // DISPLAYED code, identical on both sides: 'CW-CAR-01'
  sku: string;                // internal fulfilment code: 'CW-CAR-01-M' / 'CW-CAR-01-W'
  price: number;
  currency: 'MAD';
  formattedPrice: string;     // `${price} dhs`
  shortDescription: string;
  fullDescription: string;
  photoIndices: number[];     // original 1-based indices shown by this listing
  images: string[];           // jsDelivr urls, same order as photoIndices
  imageFallbacks: string[];   // raw.githubusercontent urls, same order
  coverImage?: string;        // brand poster shown first on the card
  coverFallback?: string;     // raw.githubusercontent url for that poster
  sourceFolder: string;
  specs: WatchSpecs;
  highlights: string[];
  isNewRelease?: boolean;
  isLimitedEdition?: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  storySnippet: string;
  disclaimer?: string;
}

export interface FilterOptions {
  search: string;
  brand: Brand | 'All';
  subCollection: SubCollection | 'All Collections';
  priceMin: number;
  priceMax: number;
  caseMaterial: string;
  movement: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface CartItem {
  id: string;
  watch: Watch;
  quantity: number;
  selectedPhotoNumber?: number;
  engravingText?: string;
  giftWrapping?: boolean;
}

export type ViewMode = 'grid' | 'editorial';
