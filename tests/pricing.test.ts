import { describe, it, expect } from 'vitest';
import { SA3A_PRODUCTS } from '../src/data/sa3aCatalog';
import {
  ALL_WATCHES, MEN_WATCHES, WOMEN_WATCHES,
  PRICE_BOUNDS, getWatchById, BRANDS_MEN, BRANDS_WOMEN,
} from '../src/data/watches';

describe('الأسعار والقوائم', () => {
  it('كل سعر داخل PRICE_BOUNDS', () => {
    for (const p of SA3A_PRODUCTS) {
      expect(p.price).toBeGreaterThanOrEqual(PRICE_BOUNDS.min);
      expect(p.price).toBeLessThanOrEqual(PRICE_BOUNDS.max);
    }
  });

  it('كل سعر عدد صحيح موجب', () => {
    for (const p of SA3A_PRODUCTS) {
      expect(Number.isInteger(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it('القسمان غير فارغين ومجموعهما يساوي الكل', () => {
    expect(MEN_WATCHES.length).toBeGreaterThan(0);
    expect(WOMEN_WATCHES.length).toBeGreaterThan(0);
    expect(MEN_WATCHES.length + WOMEN_WATCHES.length).toBe(ALL_WATCHES.length);
  });

  it('معرّفات العروض فريدة وقابلة للاسترجاع', () => {
    const ids = ALL_WATCHES.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getWatchById(ids[0])?.id).toBe(ids[0]);
  });

  it('قوائم الماركات تبدأ بـ All وبلا تكرار', () => {
    for (const list of [BRANDS_MEN, BRANDS_WOMEN]) {
      expect(list).toContain('All');
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('لا تظهر كلمة unisex في أي نص مرئي', () => {
    for (const w of ALL_WATCHES) {
      const visible = `${w.name} ${w.subtitle ?? ''} ${w.subCollection}`.toLowerCase();
      expect(visible).not.toContain('unisex');
    }
  });
});
