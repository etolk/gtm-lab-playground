import { describe, it, expect } from 'vitest';
import {
  ECOM_ITEM_LIST_ID,
  ECOM_ITEM_LIST_NAME,
  PRODUCT_IDS,
  getProduct,
  getFeaturedProduct,
  getShopListProducts,
} from '@/lib/products';

describe('products catalog', () => {
  it('exposes ecommerce list constants', () => {
    expect(ECOM_ITEM_LIST_ID).toBe('shop_all');
    expect(ECOM_ITEM_LIST_NAME).toBe('Shop All Products');
  });

  it('lists all product ids', () => {
    expect(PRODUCT_IDS).toEqual([
      'lego-data-station',
      'chrome-dino',
      'smart-tag',
      'cloud-mug',
    ]);
  });

  describe('getProduct', () => {
    it('returns a product by id', () => {
      const product = getProduct('cloud-mug');
      expect(product).toBeDefined();
      expect(product?.name).toBe('Cloud Mug');
      expect(product?.price).toBe(15);
      expect(product?.category).toBe('Drinkware');
    });

    it('returns undefined for an unknown id', () => {
      expect(getProduct('does-not-exist')).toBeUndefined();
    });
  });

  describe('getFeaturedProduct', () => {
    it('returns the lego data station with list copy', () => {
      const featured = getFeaturedProduct();
      expect(featured.id).toBe('lego-data-station');
      expect(featured.listTitle).toBe('Build your own analytics hub');
      expect(featured.listDesc).toBeTruthy();
    });
  });

  describe('getShopListProducts', () => {
    it('returns the featured product first, then the rest', () => {
      const list = getShopListProducts();
      expect(list).toHaveLength(PRODUCT_IDS.length);
      expect(list[0].id).toBe('lego-data-station');
      const ids = list.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicates
    });

    it('guarantees list copy on every entry', () => {
      for (const product of getShopListProducts()) {
        expect(product.listTitle).toBeTruthy();
        expect(product.listDesc).toBeTruthy();
      }
    });
  });
});
