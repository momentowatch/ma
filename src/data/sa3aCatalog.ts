// MOMENTO / Casa Watch catalogue.
// One entry per model folder in the CDN repo.
//
// Photos   -> <brandDir>/watches/<folder>/01.webp, 02.webp, ...
// Poster   -> <poster>  (brand poster, used as the card cover only)
//
// TO FIX A PHOTO COUNT: edit imageCount on that one line.
// TO FIX A PRICE:       edit price on that one line.
// TO MOVE A MODEL:      change gender to 'men' or 'women'.
// 'unisex' stays supported by the code below but no model uses it today.

import type { Brand, Gender, MovementKind, SubCollection } from '../types';

export interface Sa3aProduct {
  id: string;
  ref: string;
  brand: Brand;
  brandDir: string;              // 'male' | 'female' — top folder in the CDN repo
  folder: string;                // model slug folder in the CDN repo
  name: string;
  subtitle: string;
  price: number;                 // MAD
  imageCount: number;            // photos 01..imageCount exist in the folder
  photoIndices?: number[];       // explicit whitelist of file numbers that still exist
  movement: MovementKind;
  gender: Gender;                // data layer ONLY — 'unisex' is never shown in the UI
  subCollection: SubCollection;
  poster?: string;               // '' when the brand has no poster
  subCollectionWomen?: SubCollection;
  menImages?: number[];
  womenImages?: number[];
}

export const SA3A_PRODUCTS: Sa3aProduct[] = [

  // ===== MALE =====
  // Boss
  { id: 'boss-classic', ref: 'CW-BOS-01', brand: 'Boss', brandDir: 'male', folder: 'boss-classic', name: 'Boss Classic', subtitle: 'Stainless steel case - three-hand quartz', price: 200, imageCount: 4, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'https://i.postimg.cc/tCzmsQx2/7.png' },
  { id: 'boss-chronograph', ref: 'CW-BOS-02', brand: 'Boss', brandDir: 'male', folder: 'boss-chronograph', name: 'Boss Chronograph', subtitle: 'Stainless steel case - quartz chronograph', price: 200, imageCount: 2, movement: 'chrono', gender: 'men', subCollection: 'Chronograph', poster: 'male/posters/boss.webp' },
  // Cartier
  { id: 'cartier-classic', ref: 'CW-CAR-01', brand: 'Cartier', brandDir: 'male', folder: 'cartier-classic', name: 'Cartier Tank Classic', subtitle: 'Rectangular Tank-style case - quartz', price: 220, imageCount: 6, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/cartier.webp' },
  { id: 'cartier-santos', ref: 'CW-CAR-02', brand: 'Cartier', brandDir: 'male', folder: 'cartier-santos', name: 'Cartier Santos', subtitle: 'Squared steel case with exposed screws - quartz', price: 210, imageCount: 4, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/cartier.webp' },
  { id: 'cartier-santos-custom', ref: 'CW-CAR-03', brand: 'Cartier', brandDir: 'male', folder: 'cartier-santos-custom', name: 'Cartier Santos Custom', subtitle: 'Two-tone squared case - quartz', price: 220, imageCount: 9, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/cartier.webp' },
  // Casio
  { id: 'casio-classic', ref: 'CW-CAS-01', brand: 'Casio', brandDir: 'male', folder: 'casio-classic', name: 'Casio Classic', subtitle: 'Steel case - three-hand quartz', price: 175, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/casio.webp' },
  // D1 Milano
  { id: 'd1-milano', ref: 'CW-D1M-01', brand: 'D1 Milano', brandDir: 'male', folder: 'd1-milano', name: 'D1 Milano Ultra Thin', subtitle: 'Slim minimalist case - quartz', price: 160, imageCount: 7, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/d1-milano.webp' },
  // Emporio Armani
  { id: 'emporio-armani', ref: 'CW-ARM-01', brand: 'Emporio Armani', brandDir: 'male', folder: 'emporio-armani', name: 'Emporio Armani Chronograph', subtitle: 'Steel case - quartz chronograph', price: 280, imageCount: 4, movement: 'chrono', gender: 'men', subCollection: 'Chronograph', poster: 'male/posters/emporio-armani.webp' },
  // G-Shock
  { id: 'g-shock', ref: 'CW-GSH-01', brand: 'G-Shock', brandDir: 'male', folder: 'g-shock', name: 'G-Shock Digital Sport', subtitle: 'Resin sport case - digital quartz', price: 175, imageCount: 26, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/g-shock.webp' },
  // Guess
  { id: 'guess-classic', ref: 'CW-GUE-01', brand: 'Guess', brandDir: 'male', folder: 'guess-classic', name: 'Guess Classic', subtitle: 'Steel case with crystal accents - quartz', price: 220, imageCount: 4, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/guess.webp' },
  // Hanboro
  { id: 'hanboro-classic', ref: 'CW-HAN-01', brand: 'Hanboro', brandDir: 'male', folder: 'hanboro-classic', name: 'Hanboro Automatic Skeleton', subtitle: 'Open-worked dial - self-winding automatic', price: 200, imageCount: 3, movement: 'auto', gender: 'men', subCollection: 'Automatic', poster: 'male/posters/hanboro.webp' },
  // Hublot
  { id: 'hublot-classic-fusion', ref: 'CW-HUB-01', brand: 'Hublot', brandDir: 'male', folder: 'hublot-classic-fusion', name: 'Hublot Classic Fusion', subtitle: 'Rubber strap - quartz', price: 180, imageCount: 7, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'https://i.postimg.cc/cL0CcY6d/Rolex-Oyster.png' },
  { id: 'hublot-classic-fusion-ii', ref: 'CW-HUB-02', brand: 'Hublot', brandDir: 'male', folder: 'hublot-classic-fusion-ii', name: 'Hublot Classic Fusion II', subtitle: 'Rubber strap - quartz', price: 180, imageCount: 7, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'https://i.postimg.cc/cL0CcY6d/Rolex-Oyster.png' },
  // Omega
  { id: 'omega-automatic', ref: 'CW-OME-01', brand: 'Omega', brandDir: 'male', folder: 'omega-automatic', name: 'Omega Automatic', subtitle: 'Steel case - self-winding automatic', price: 300, imageCount: 7, movement: 'auto', gender: 'men', subCollection: 'Automatic', poster: 'male/posters/omega.webp' },
  { id: 'omega-chronograph', ref: 'CW-OME-02', brand: 'Omega', brandDir: 'male', folder: 'omega-chronograph', name: 'Omega Chronograph', subtitle: 'Steel case - quartz chronograph', price: 290, imageCount: 9, movement: 'chrono', gender: 'men', subCollection: 'Chronograph', poster: 'male/posters/omega.webp' },
  // Patek Philippe
  { id: 'patek-philippe-classic', ref: 'CW-PAT-01', brand: 'Patek Philippe', brandDir: 'male', folder: 'patek-philippe-classic', name: 'Patek Philippe Classic', subtitle: 'Leather strap - quartz', price: 180, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/patek-philippe.webp' },
  { id: 'patek-philippe-classic-ii', ref: 'CW-PAT-02', brand: 'Patek Philippe', brandDir: 'male', folder: 'patek-philippe-classic-ii', name: 'Patek Philippe Classic II', subtitle: 'Steel bracelet - quartz', price: 280, imageCount: 6, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/patek-philippe.webp' },
  { id: 'patek-philippe-classic-iii', ref: 'CW-PAT-03', brand: 'Patek Philippe', brandDir: 'male', folder: 'patek-philippe-classic-iii', name: 'Patek Philippe Classic III', subtitle: 'Two-tone finish - quartz', price: 220, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/patek-philippe.webp' },
  { id: 'patek-philippe-automatic', ref: 'CW-PAT-04', brand: 'Patek Philippe', brandDir: 'male', folder: 'patek-philippe-automatic', name: 'Patek Philippe Nautilus Automatic', subtitle: 'Integrated steel bracelet - self-winding automatic', price: 320, imageCount: 4, movement: 'auto', gender: 'men', subCollection: 'Automatic', poster: 'male/posters/patek-philippe.webp' },
  // Richard Mille
  { id: 'richard-mille', ref: 'CW-RIM-01', brand: 'Richard Mille', brandDir: 'male', folder: 'richard-mille', name: 'Richard Mille Skeleton', subtitle: 'Tonneau case with open-worked dial - quartz', price: 330, imageCount: 21, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/richard-mille.webp' },
  { id: 'richard-mille-scratch', ref: 'CW-RIM-02', brand: 'Richard Mille', brandDir: 'male', folder: 'richard-mille-scratch', name: 'Richard Mille Scratch', subtitle: 'Tonneau case - quartz', price: 300, imageCount: 6, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/richard-mille.webp' },
  // Rolex
  { id: 'rolex-datejust', ref: 'CW-ROL-01', brand: 'Rolex', brandDir: 'male', folder: 'rolex-datejust', name: 'Rolex Datejust', subtitle: 'Jubilee-style bracelet with date window - quartz', price: 200, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Datejust Heritage', poster: 'male/posters/rolex-oyster.webp' },
  { id: 'rolex-daytona', ref: 'CW-ROL-02', brand: 'Rolex', brandDir: 'male', folder: 'rolex-daytona', name: 'Rolex Daytona Chronograph', subtitle: 'Tachymeter bezel - quartz chronograph', price: 300, imageCount: 3, movement: 'chrono', gender: 'men', subCollection: 'Chronograph', poster: 'male/posters/rolex-oyster.webp' },
  { id: 'rolex-gmt-master', ref: 'CW-ROL-03', brand: 'Rolex', brandDir: 'male', folder: 'rolex-gmt-master', name: 'Rolex GMT-Master', subtitle: 'Two-tone bezel with 24h hand - quartz', price: 210, imageCount: 7, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/rolex-oyster.webp' },
  { id: 'rolex-land-dweller', ref: 'CW-ROL-04', brand: 'Rolex', brandDir: 'male', folder: 'rolex-land-dweller', name: 'Rolex Land-Dweller', subtitle: 'Steel case and bracelet - quartz', price: 200, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/rolex-oyster.webp' },
  { id: 'rolex-oyster-perpetual', ref: 'CW-ROL-05', brand: 'Rolex', brandDir: 'male', folder: 'rolex-oyster-perpetual', name: 'Rolex Oyster Perpetual', subtitle: 'Steel Oyster-style bracelet - quartz', price: 210, imageCount: 8, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/rolex-oyster.webp' },
  { id: 'rolex-oyster-perpetual-ii', ref: 'CW-ROL-06', brand: 'Rolex', brandDir: 'male', folder: 'rolex-oyster-perpetual-ii', name: 'Rolex Oyster Perpetual II', subtitle: 'Steel Oyster-style bracelet - quartz', price: 210, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Sport & GMT', poster: 'male/posters/rolex-oyster.webp' },
  // Tissot
  { id: 'tissot-classic', ref: 'CW-TIS-01', brand: 'Tissot', brandDir: 'male', folder: 'tissot-classic', name: 'Tissot Classic', subtitle: 'Leather strap - quartz', price: 175, imageCount: 5, movement: 'quartz', gender: 'men', subCollection: 'Classic Dress', poster: 'male/posters/tissot.webp' },
  // Tommy Hilfiger
  { id: 'tommy-hilfiger-chronograph', ref: 'CW-TOM-01', brand: 'Tommy Hilfiger', brandDir: 'male', folder: 'tommy-hilfiger-chronograph', name: 'Tommy Hilfiger Chronograph', subtitle: 'Steel case - multifunction quartz', price: 200, imageCount: 2, movement: 'chrono', gender: 'men', subCollection: 'Chronograph', poster: 'male/posters/tommy-hilfiger.webp' },

  // ===== FEMALE =====
  // Bvlgari
  { id: 'bvlgari-serpenti', ref: 'CW-BVL-01', brand: 'Bvlgari', brandDir: 'female', folder: 'bvlgari-serpenti', name: 'Bvlgari Serpenti', subtitle: 'Wrapped serpent bracelet - quartz', price: 190, imageCount: 5, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/bvlgari-serpenti.webp' },
  // Cartier
  { id: 'cartier-baignoire', ref: 'CW-CAR-04', brand: 'Cartier', brandDir: 'female', folder: 'cartier-baignoire', name: 'Cartier Baignoire', subtitle: 'Elongated oval case - quartz', price: 200, imageCount: 10, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: '' },
  { id: 'cartier-ballon-bleu', ref: 'CW-CAR-05', brand: 'Cartier', brandDir: 'female', folder: 'cartier-ballon-bleu', name: 'Cartier Ballon Bleu', subtitle: 'Round steel case with blue cabochon crown - quartz', price: 280, imageCount: 2, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: '' },
  { id: 'cartier-panthere', ref: 'CW-CAR-06', brand: 'Cartier', brandDir: 'female', folder: 'cartier-panthere', name: 'Cartier Panthere', subtitle: 'Steel link bracelet - quartz', price: 270, imageCount: 6, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: '' },
  { id: 'cartier-panthere-classic', ref: 'CW-CAR-07', brand: 'Cartier', brandDir: 'female', folder: 'cartier-panthere-classic', name: 'Cartier Panthere Classic', subtitle: 'Steel link bracelet - quartz', price: 190, imageCount: 9, photoIndices: [2, 4, 6, 8, 10, 12, 14, 15, 16], movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: '' },
  { id: 'cartier-panthere-classic-square', ref: 'CW-CAR-08', brand: 'Cartier', brandDir: 'female', folder: 'cartier-panthere-classic-square', name: 'Cartier Panthere Classic Square', subtitle: 'Squared two-tone bracelet - quartz', price: 230, imageCount: 4, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: '' },
  // Casio
  { id: 'casio-couple-carre-bleu', ref: 'CW-CAS-02', brand: 'Casio', brandDir: 'female', folder: 'casio-couple-carre-bleu', name: 'Casio Couple Carre Bleu', subtitle: 'Squared blue dial - quartz', price: 175, imageCount: 5, movement: 'quartz', gender: 'women', subCollection: 'Steel Lady', poster: '' },
  // Chanel
  { id: 'chanel-premiere', ref: 'CW-CHA-01', brand: 'Chanel', brandDir: 'female', folder: 'chanel-premiere', name: 'Chanel Premiere', subtitle: 'Black finish case and bracelet - quartz', price: 190, imageCount: 3, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/chanel-premiere.webp' },
  // Daniel Wellington
  { id: 'daniel-wellington', ref: 'CW-DWE-01', brand: 'Daniel Wellington', brandDir: 'female', folder: 'daniel-wellington', name: 'Daniel Wellington Classic', subtitle: 'Slim case with minimalist dial - quartz', price: 190, imageCount: 5, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/daniel-wellington.webp' },
  { id: 'daniel-wellington-petite', ref: 'CW-DWE-02', brand: 'Daniel Wellington', brandDir: 'female', folder: 'daniel-wellington-petite', name: 'Daniel Wellington Petite', subtitle: 'Petite slim case - quartz', price: 190, imageCount: 2, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/dw.webp' },
  // Emporio Armani
  { id: 'emporio-armani-strass', ref: 'CW-ARM-02', brand: 'Emporio Armani', brandDir: 'female', folder: 'emporio-armani-strass', name: 'Emporio Armani Strass', subtitle: 'Crystal-set bezel - quartz', price: 220, imageCount: 3, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/emporio-armani.webp' },
  // Hanboro
  { id: 'hanboro-cuir-gris-rose-gold', ref: 'CW-HAN-02', brand: 'Hanboro', brandDir: 'female', folder: 'hanboro-cuir-gris-rose-gold', name: 'Hanboro Cuir Gris Rose Gold', subtitle: 'Grey leather strap with rose gold case - quartz', price: 200, imageCount: 6, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/hanboro.webp' },
  { id: 'hanboro-cuir-silver', ref: 'CW-HAN-03', brand: 'Hanboro', brandDir: 'female', folder: 'hanboro-cuir-silver', name: 'Hanboro Cuir Silver', subtitle: 'Leather strap with silver case - quartz', price: 200, imageCount: 12, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/hanboro.webp' },
  { id: 'hanboro-octagone', ref: 'CW-HAN-04', brand: 'Hanboro', brandDir: 'female', folder: 'hanboro-octagone', name: 'Hanboro Octagone', subtitle: 'Octagonal case - quartz', price: 200, imageCount: 10, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/hanboro.webp' },
  // IEKE
  { id: 'ieke-hexagonale-strass', ref: 'CW-IEK-01', brand: 'IEKE', brandDir: 'female', folder: 'ieke-hexagonale-strass', name: 'IEKE Hexagonale Strass', subtitle: 'Hexagonal crystal-set case - quartz', price: 240, imageCount: 7, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/ieke.webp' },
  { id: 'ieke-mini-ronde', ref: 'CW-IEK-02', brand: 'IEKE', brandDir: 'female', folder: 'ieke-mini-ronde', name: 'IEKE Mini Ronde', subtitle: 'Mini round case on steel mesh - quartz', price: 240, imageCount: 7, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/ieke.webp' },
  { id: 'ieke-tank-rectangulaire', ref: 'CW-IEK-03', brand: 'IEKE', brandDir: 'female', folder: 'ieke-tank-rectangulaire', name: 'IEKE Tank Rectangulaire', subtitle: 'Rectangular case on steel mesh - quartz', price: 240, imageCount: 4, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/ieke.webp' },
  // Michael Kors
  { id: 'michael-kors', ref: 'CW-MKO-01', brand: 'Michael Kors', brandDir: 'female', folder: 'michael-kors', name: 'Michael Kors Classic', subtitle: 'Steel bracelet with pave bezel - quartz', price: 220, imageCount: 3, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/michael-kors.webp' },
  // Oliya
  { id: 'oliya', ref: 'CW-OLI-01', brand: 'Oliya', brandDir: 'female', folder: 'oliya', name: 'Oliya Classic', subtitle: 'Slim steel bracelet - quartz', price: 260, imageCount: 8, movement: 'quartz', gender: 'women', subCollection: 'Petite Elegance', poster: 'female/posters/oliya.webp' },
  // Patek Philippe
  { id: 'patek-philippe-nautilus', ref: 'CW-PAT-05', brand: 'Patek Philippe', brandDir: 'female', folder: 'patek-philippe-nautilus', name: 'Patek Philippe Nautilus', subtitle: 'Integrated steel bracelet - quartz', price: 130, imageCount: 5, movement: 'quartz', gender: 'women', subCollection: 'Steel Lady', poster: 'female/posters/patek-philippe.webp' },
  // Reloj
  { id: 'reloj-dama-lujo-con-dije', ref: 'CW-REL-01', brand: 'Reloj', brandDir: 'female', folder: 'reloj-dama-lujo-con-dije', name: 'Reloj Dama Lujo Con Dije', subtitle: 'Bracelet watch with charm pendant - quartz', price: 200, imageCount: 3, movement: 'quartz', gender: 'women', subCollection: 'Jewelry & Bracelet', poster: 'female/posters/reloj.webp' },
  // Rolex
  { id: 'rolex-datejust-cannelee', ref: 'CW-ROL-07', brand: 'Rolex', brandDir: 'female', folder: 'rolex-datejust-cannelee', name: 'Rolex Datejust Cannelee', subtitle: 'Fluted bezel with steel bracelet - quartz', price: 210, imageCount: 20, movement: 'quartz', gender: 'women', subCollection: 'Steel Lady', poster: 'female/posters/rolex.webp' },
  { id: 'rolex-datejust-two-tone-black-dial', ref: 'CW-ROL-08', brand: 'Rolex', brandDir: 'female', folder: 'rolex-datejust-two-tone-black-dial', name: 'Rolex Datejust Two-Tone Black Dial', subtitle: 'Two-tone bracelet with black dial - quartz', price: 200, imageCount: 10, movement: 'quartz', gender: 'women', subCollection: 'Steel Lady', poster: 'female/posters/rolex-oyster.webp' },
  // Tissot
  { id: 'tissot-bellissima', ref: 'CW-TIS-02', brand: 'Tissot', brandDir: 'female', folder: 'tissot-bellissima', name: 'Tissot Bellissima', subtitle: 'Steel bracelet - quartz', price: 200, imageCount: 3, movement: 'quartz', gender: 'women', subCollection: 'Steel Lady', poster: 'female/posters/tissot.webp' },
]

export const CDN_BASE = 'https://cdn.jsdelivr.net/gh/noureddinelmobaraki-web/nl-audio-cdn@main/watch';
export const CDN_FALLBACK_BASE = 'https://raw.githubusercontent.com/noureddinelmobaraki-web/nl-audio-cdn/main/watch';

const pad2 = (n: number): string => String(n).padStart(2, '0');
const seg = (s: string): string => encodeURIComponent(s);

/** Absolute CDN url for one photo of a product (1-based). */
export const photoUrl = (p: Sa3aProduct, index: number): string =>
  [CDN_BASE, seg(p.brandDir), 'watches', seg(p.folder), pad2(index) + '.webp'].join('/');

/** Same photo served from raw.githubusercontent.com (used as <img> onError fallback). */
export const photoFallbackUrl = (p: Sa3aProduct, index: number): string =>
  [CDN_FALLBACK_BASE, seg(p.brandDir), 'watches', seg(p.folder), pad2(index) + '.webp'].join('/');

/** Brand poster for the card cover. Falls back to the first photo when absent. */
export const posterUrl = (p: Sa3aProduct): string =>
  p.poster ? (p.poster.startsWith('http') ? p.poster : [CDN_BASE, p.poster].join('/')) : photoUrl(p, 1);

export const posterFallbackUrl = (p: Sa3aProduct): string =>
  p.poster ? (p.poster.startsWith('http') ? p.poster : [CDN_FALLBACK_BASE, p.poster].join('/')) : photoFallbackUrl(p, 1);

/** Every photo of a product, ordered 01..imageCount. */
export const allPhotoIndices = (p: Sa3aProduct): number[] =>
  p.photoIndices && p.photoIndices.length > 0
    ? p.photoIndices.slice()
    : Array.from({ length: p.imageCount }, (_, i) => i + 1);

/** Resolve which colourways a given side shows. */
export const photoIndicesFor = (p: Sa3aProduct, side: 'men' | 'women'): number[] => {
  if (p.gender !== 'unisex') {
    return p.gender === side ? allPhotoIndices(p) : [];
  }
  const raw = side === 'men' ? p.menImages : p.womenImages;
  const list = raw && raw.length > 0 ? raw : allPhotoIndices(p);
  return Array.from(new Set(list))
    .filter((i) => Number.isInteger(i) && i >= 1 && i <= p.imageCount)
    .sort((a, b) => a - b);
};

export const listingIdFor = (p: Sa3aProduct, side: 'men' | 'women'): string =>
  p.gender === 'unisex' ? `${p.id}--${side}` : p.id;

export const listingSkuFor = (p: Sa3aProduct, side: 'men' | 'women'): string =>
  p.gender === 'unisex' ? `${p.ref}-${side === 'men' ? 'M' : 'W'}` : p.ref;

export const collectionFor = (p: Sa3aProduct, side: 'men' | 'women'): SubCollection =>
  side === 'women' && p.subCollectionWomen ? p.subCollectionWomen : p.subCollection;

export const getProductById = (id: string): Sa3aProduct | undefined =>
  SA3A_PRODUCTS.find((p) => p.id === id);

export const CATALOG_STATS = {
  products: SA3A_PRODUCTS.length,
  photos: SA3A_PRODUCTS.reduce((s, p) => s + p.imageCount, 0),
  menOnly: SA3A_PRODUCTS.filter((p) => p.gender === 'men').length,
  womenOnly: SA3A_PRODUCTS.filter((p) => p.gender === 'women').length,
  unisex: SA3A_PRODUCTS.filter((p) => p.gender === 'unisex').length,
};

/** Dev-only integrity check. */
export const validateCatalog = (): string[] => {
  const problems: string[] = [];
  const ids = new Set<string>();
  const refs = new Set<string>();
  for (const p of SA3A_PRODUCTS) {
    if (ids.has(p.id)) problems.push(`duplicate product id: ${p.id}`);
    if (refs.has(p.ref)) problems.push(`duplicate ref: ${p.ref}`);
    ids.add(p.id);
    refs.add(p.ref);
    if (p.imageCount < 1) problems.push(`${p.id}: imageCount must be >= 1`);
    if (p.gender !== 'unisex' && (p.menImages || p.womenImages)) {
      problems.push(`${p.id}: menImages/womenImages are only allowed on unisex products`);
    }
    for (const [side, arr] of [['menImages', p.menImages], ['womenImages', p.womenImages]] as const) {
      if (!arr) continue;
      for (const i of arr) {
        if (!Number.isInteger(i) || i < 1 || i > p.imageCount) {
          problems.push(`${p.id}: ${side} index ${i} is out of range 1..${p.imageCount}`);
        }
      }
    }
    if (p.gender === 'unisex') {
      if (photoIndicesFor(p, 'men').length === 0) problems.push(`${p.id}: unisex but no photos for men`);
      if (photoIndicesFor(p, 'women').length === 0) problems.push(`${p.id}: unisex but no photos for women`);
    }
  }
  return problems;
};
