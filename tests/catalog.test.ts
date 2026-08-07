import { describe, it, expect } from 'vitest';
import {
  SA3A_PRODUCTS,
  CATALOG_STATS,
  validateCatalog,
  getProductById,
  photoUrl,
  posterUrl,
  allPhotoIndices,
} from '../src/data/sa3aCatalog';

describe('سلامة الكتالوج', () => {
  it('validateCatalog لا يرجع أي مشكلة', () => {
    expect(validateCatalog()).toEqual([]);
  });

  it('كل معرّف فريد', () => {
    const ids = SA3A_PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('كل مرجع ref فريد ويتبع نمط CW-XXX-00', () => {
    const refs = SA3A_PRODUCTS.map((p) => p.ref);
    expect(new Set(refs).size).toBe(refs.length);
    for (const r of refs) expect(r).toMatch(/^CW-[A-Z0-9]{3}-\d{2}$/);
  });

  it('كل منتج له صورة واحدة على الأقل', () => {
    for (const p of SA3A_PRODUCTS) expect(p.imageCount).toBeGreaterThanOrEqual(1);
  });

  it('CATALOG_STATS متسق مع المصفوفة', () => {
    expect(CATALOG_STATS.products).toBe(SA3A_PRODUCTS.length);
    expect(CATALOG_STATS.menOnly + CATALOG_STATS.womenOnly + CATALOG_STATS.unisex)
      .toBe(SA3A_PRODUCTS.length);
    expect(CATALOG_STATS.photos).toBeGreaterThan(0);
  });

  it('getProductById يعمل ويرجع undefined للمجهول', () => {
    expect(getProductById(SA3A_PRODUCTS[0].id)?.id).toBe(SA3A_PRODUCTS[0].id);
    expect(getProductById('__nope__')).toBeUndefined();
  });

  it('روابط الصور مُرمّزة وتنتهي بـ .webp', () => {
    for (const p of SA3A_PRODUCTS) {
      for (const i of allPhotoIndices(p)) {
        const u = photoUrl(p, i);
        expect(u).toMatch(/\.webp$/);
        expect(u).not.toMatch(/\s/);
      }
      if (p.poster) expect(posterUrl(p)).toMatch(/\.(webp|png|jpg|jpeg)$/);
    }
  });
});
