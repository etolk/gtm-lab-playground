'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getFeaturedProduct,
  getShopListProducts,
  ECOM_ITEM_LIST_ID,
  ECOM_ITEM_LIST_NAME,
  type ShopProduct,
} from '@/lib/products';
import { pageTitle } from '@/lib/page-title';
import { getMockUserId, getSpaPreviousPath, pushPageView, pushToDataLayer } from '@/lib/tracking';

export default function Shop() {
  const viewedListRef = useRef(false);
  const featuredProduct = getFeaturedProduct();
  const listProducts = useMemo(() => getShopListProducts(), []);
  const mockProducts = listProducts.slice(1);

  useEffect(() => {
    if (!viewedListRef.current) {
      const currentPath = '/shop';
      const previousPath = getSpaPreviousPath();
      pushPageView({
        pagePath: currentPath,
        pageLocation: window.location.origin + currentPath,
        pageTitle: document.title || pageTitle('Shop'),
        pageReferrer: previousPath ? window.location.origin + previousPath : document.referrer,
        userId: getMockUserId(),
        updatePreviousPath: true,
      });

      pushToDataLayer({
        event: 'view_item_list',
        ecommerce: {
          item_list_id: ECOM_ITEM_LIST_ID,
          item_list_name: ECOM_ITEM_LIST_NAME,
          items: listProducts.map((p, i) => ({
            item_id: p.id,
            item_name: p.name,
            price: p.price,
            item_category: p.category,
            index: i + 1,
          })),
        },
      });
      viewedListRef.current = true;
    }
  }, [listProducts]);

  const pushSelectItem = (product: ShopProduct, index: number) => {
    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        item_list_id: ECOM_ITEM_LIST_ID,
        item_list_name: ECOM_ITEM_LIST_NAME,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            item_category: product.category,
            index: index + 1,
          },
        ],
      },
    });
  };

  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: '1rem',
          marginBottom: '-1rem',
        }}
      >
        <Link
          href="/"
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
          Back to Home
        </Link>
      </div>
      <h1 style={{ marginTop: '2rem', fontSize: '2rem' }}>
        Official Tracking Playground Merchandise
      </h1>
      <p
        className="subtitle"
        style={{
          margin: '0 auto 1.5rem auto',
          maxWidth: '600px',
          lineHeight: 1.8,
        }}
      >
        This application simulates a standard ecommerce funnel. Interact with
        the store to push custom <code>view_item_list</code>,{' '}
        <code>select_item</code>, <code>view_item</code>, <code>add_to_cart</code>
        , <code>begin_checkout</code>, <code>add_shipping_info</code>,{' '}
        <code>add_payment_info</code>, and <code>purchase</code> events.
      </p>

      <div
        className="card featured-card product-card"
        style={{
          backgroundColor: featuredProduct.bgColor,
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          minHeight: '300px',
        }}
      >
        <div
          className="featured-content"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              fontSize: '1rem',
              color: '#5f6368',
              margin: '0 0 1rem 0',
            }}
          >
            {featuredProduct.category}
          </p>
          <h3
            style={{
              fontSize: '2.25rem',
              fontWeight: 600,
              color: '#3c4043',
              margin: '0 0 1rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            {featuredProduct.listTitle}
          </h3>
          <p
            style={{
              fontSize: '1rem',
              color: '#5f6368',
              margin: '0 0 2rem 0',
            }}
          >
            {featuredProduct.listDesc}
          </p>
          <Link
            href={`/product/${featuredProduct.id}`}
            className="button button-outline"
            onClick={() => pushSelectItem(featuredProduct, 0)}
          >
            View Product
          </Link>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
          }}
        >
          <Image
            src={featuredProduct.image}
            alt={featuredProduct.name}
            width={380}
            height={380}
            priority
            fetchPriority="high"
            style={{
              width: '100%',
              maxWidth: '380px',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
            }}
            sizes="(max-width: 380px) 100vw, 380px"
          />
        </div>
      </div>

      <div className="card-grid">
        {mockProducts.map((p, i) => (
          <div
            key={p.id}
            className="card product-card"
            style={{
              backgroundColor: p.bgColor,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="product-info"
              style={{
                flex: '0 0 auto',
                padding: '3rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '1rem',
                  color: '#5f6368',
                  margin: '0 0 1rem 0',
                }}
              >
                {p.category}
              </p>
              <h3
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 600,
                  color: '#3c4043',
                  margin: '0 0 1rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {p.listTitle}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#5f6368',
                  margin: '0 0 2rem 0',
                }}
              >
                {p.listDesc}
              </p>
              <Link
                href={`/product/${p.id}`}
                className="button button-outline"
                onClick={() => pushSelectItem(p, i + 1)}
              >
                View Product
              </Link>
            </div>
            <div
              style={{
                position: 'relative',
                flex: '1 1 auto',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '300px',
              }}
            >
              <Image
                src={p.image}
                alt={p.name}
                width={340}
                height={300}
                style={{
                  width: '85%',
                  height: 'auto',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply',
                  paddingBottom: '1rem',
                }}
                sizes="(max-width: 400px) 85vw, 340px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
