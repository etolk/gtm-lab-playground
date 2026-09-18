'use client';

import { useEffect, use, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProduct, ECOM_ITEM_LIST_ID, ECOM_ITEM_LIST_NAME } from '@/lib/products';
import { pageTitle } from '@/lib/page-title';
import { getMockUserId, pushPageView, pushToDataLayer } from '@/lib/tracking';

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProduct(id);
  const [added, setAdded] = useState(false);

  const viewItemFired = useRef(false);

  useEffect(() => {
    if (product && !viewItemFired.current) {
      viewItemFired.current = true;
      const currentPath = `/product/${id}`;
      pushPageView({
        pagePath: currentPath,
        pageLocation: window.location.origin + currentPath,
        pageTitle: document.title || pageTitle(product.name),
        pageReferrer: window.spaPreviousPath
          ? window.location.origin + window.spaPreviousPath
          : document.referrer,
        userId: getMockUserId(),
        updatePreviousPath: true,
      });

      pushToDataLayer({
        event: 'view_item',
        ecommerce: {
          currency: 'EUR',
          value: product.price,
          item_list_id: ECOM_ITEM_LIST_ID,
          item_list_name: ECOM_ITEM_LIST_NAME,
          items: [
            {
              item_id: id,
              item_name: product.name,
              price: product.price,
              item_category: product.category,
              quantity: 1,
            },
          ],
        },
      });
    }
  }, [product, id]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'EUR',
        value: product.price,
        item_list_id: ECOM_ITEM_LIST_ID,
        item_list_name: ECOM_ITEM_LIST_NAME,
        items: [
          {
            item_id: id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            quantity: 1,
          },
        ],
      },
    });

    const currentCart = JSON.parse(localStorage.getItem('gtm_cart') || '[]') as {
      id: string;
      quantity: number;
      name: string;
      price: number;
      category: string;
      image: string;
      bgColor: string;
      desc: string;
      features: string[];
    }[];
    const existingItem = currentCart.find((item) => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('gtm_cart', JSON.stringify(currentCart));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="page-container"
      style={{ maxWidth: '1000px', margin: '0 auto' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Link
          href="/shop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'color 0.2s',
            padding: '0.5rem',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Shop
        </Link>
      </div>

      <div className="pdp-grid">
        <div
          style={{
            backgroundColor: product.bgColor,
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            priority
            fetchPriority="high"
            style={{
              width: '100%',
              maxWidth: '400px',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
            }}
            sizes="(max-width: 400px) 100vw, 400px"
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                margin: '0 0 0.5rem 0',
              }}
            >
              {product.category}
            </p>
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0' }}>
              €{product.price.toFixed(2)}
            </p>
          </div>

          <p
            style={{
              color: 'var(--text-muted)',
              lineHeight: 1.8,
            }}
          >
            {product.desc}
          </p>

          <ul
            style={{
              paddingLeft: '1.25rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {product.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <hr className="divider" style={{ width: '100%' }} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <button
              className="button"
              style={{ padding: '1rem', fontSize: '1rem', width: '100%' }}
              onClick={handleAddToCart}
            >
              {added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>

            <Link
              href="/checkout"
              className="button button-outline"
              style={{
                padding: '1rem',
                fontSize: '1rem',
                width: '100%',
                textAlign: 'center',
              }}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
