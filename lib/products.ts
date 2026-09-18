/**
 * Single source of truth for product catalog.
 * Used by shop listing, product PDP, and product layout metadata.
 */

/** Item list context for ecommerce events (view_item_list through purchase). */
export const ECOM_ITEM_LIST_ID = 'shop_all';
export const ECOM_ITEM_LIST_NAME = 'Shop All Products';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  bgColor: string;
  desc: string;
  features: string[];
  /** Optional card title for shop listing (e.g. "Build your own analytics hub") */
  listTitle?: string;
  /** Optional short description for shop listing card */
  listDesc?: string;
}

/** Product suitable for shop grid/featured cards (includes list copy) */
export type ShopProduct = Product & { listTitle: string; listDesc: string };

/** Item stored in cart (localStorage gtm_cart) and used in checkout */
export type CartItem = Pick<Product, 'id' | 'name' | 'price' | 'category'> & {
  quantity: number;
  image?: string;
  bgColor?: string;
  desc?: string;
  features?: string[];
};

const productDB: Record<string, Product> = {
  'lego-data-station': {
    id: 'lego-data-station',
    name: 'Lego Data Station',
    price: 45.0,
    category: 'Collectibles',
    image: '/images/lego_tracking_set.webp',
    bgColor: '#DDD7D1',
    desc: 'A brick-built analytics command center. This micro-scale data station features a server rack, satellite dish, and a real-time dashboard monitor — the perfect desk companion for data engineers.',
    features: [
      '218 pieces',
      'Includes server rack and satellite dish',
      'Real-time dashboard monitor tile',
    ],
    listTitle: 'Build your own analytics hub',
    listDesc: '€45.00 -  The perfect desk companion',
  },
  'chrome-dino': {
    id: 'chrome-dino',
    name: 'Dino Plush',
    price: 25.0,
    category: 'Accessories',
    image: '/images/chrome_dino.webp',
    bgColor: '#EFECEC',
    desc: 'A soft, premium plush toy representing the iconic offline dinosaur. Never feel disconnected again.',
    features: [
      'Ultra-soft green fabric',
      'Standing posture',
      'Pixel-accurate design',
    ],
    listTitle: 'Offline Buddy',
    listDesc: '€25.00 - Never feel disconnected',
  },
  'smart-tag': {
    id: 'smart-tag',
    name: 'Smart Tag Tracker',
    price: 35.0,
    category: 'Tech',
    image: '/images/smart_tag.webp',
    bgColor: '#E0F4FF',
    desc: 'A precision Bluetooth tracker with an analytics pulse motif. Attach it to anything and never lose track — of your keys or your conversions.',
    features: [
      'Bluetooth 5.3 LE',
      'Sage green accent ring',
      '12-month battery life',
    ],
    listTitle: 'Never Lose Track',
    listDesc: '€35.00 - Bluetooth precision tracker',
  },
  'cloud-mug': {
    id: 'cloud-mug',
    name: 'Cloud Mug',
    price: 15.0,
    category: 'Drinkware',
    image: '/images/cloud_mug.webp',
    bgColor: '#FFF4E0',
    desc: 'A matte white ceramic coffee mug featuring a subtle, stylized cloud logo. Perfect for late-night deployments.',
    features: [
      'Microwave and dishwasher safe',
      '350ml capacity',
      'Matte exterior, glossy interior',
    ],
    listTitle: 'Cloud Powered Brew',
    listDesc: '€15.00 - Scalable caffeine delivery',
  },
};

export const PRODUCT_IDS = Object.keys(productDB) as (keyof typeof productDB)[];

export function getProduct(id: string): Product | undefined {
  return productDB[id];
}

export function getFeaturedProduct(): ShopProduct {
  const p = productDB['lego-data-station']!;
  return {
    ...p,
    listTitle: p.listTitle ?? p.name,
    listDesc: p.listDesc ?? p.desc,
  };
}

/** Returns featured product first, then the rest for shop listing */
export function getShopListProducts(): ShopProduct[] {
  const featured = getFeaturedProduct();
  const others = PRODUCT_IDS.filter((id) => id !== 'lego-data-station').map(
    (id) => {
      const p = productDB[id]!;
      return {
        ...p,
        listTitle: p.listTitle ?? p.name,
        listDesc: p.listDesc ?? p.desc,
      };
    }
  );
  return [featured, ...others];
}
