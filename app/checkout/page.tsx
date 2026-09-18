'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { CartItem } from '@/lib/products';
import { ECOM_ITEM_LIST_ID, ECOM_ITEM_LIST_NAME } from '@/lib/products';
import { pageTitle } from '@/lib/page-title';
import { getDataLayer, getMockUserId, pushPageView, setSpaPreviousPath } from '@/lib/tracking';

const BEGIN_CHECKOUT_DEDUPE_MS = 1500;

function getCartSignature(items: CartItem[]): string {
    return items
        .map((item) => `${item.id}:${item.quantity}`)
        .sort()
        .join('|');
}

function shouldFireBeginCheckout(items: CartItem[]): boolean {
    if (items.length === 0) return false;
    const now = Date.now();
    const signature = getCartSignature(items);
    const key = `begin_checkout:${signature}`;
    try {
        const last = Number(sessionStorage.getItem(key) || '0');
        if (last > 0 && now - last < BEGIN_CHECKOUT_DEDUPE_MS) {
            return false;
        }
        sessionStorage.setItem(key, String(now));
    } catch {
        // If storage is unavailable, fail open and fire the event.
    }
    return true;
}

type StepConfig = {
  title: string;
  path: string;
  extra_events?: Record<string, unknown>[];
};

const STEP_MAP: Record<number, StepConfig> = {
    0: { title: 'Checkout - Overview', path: '/checkout/overview' },
    1: {
        title: 'Checkout - Shipping Details',
        path: '/checkout/shipping',
    },
    2: { title: 'Checkout - Payment Information', path: '/checkout/payment' },
    3: { title: 'Checkout - Complete', path: '/checkout/complete' }
};

export default function Checkout() {
    const [step, setStep] = useState(0); // 0: Cart, 1: Shipping, 2: Payment, 3: Complete
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const prevStepRef = useRef<number | null>(null);
    const overviewPageViewPushedRef = useRef(false);
    const completePageViewPushedRef = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }
        setIsMounted(true);
        const savedCart = JSON.parse(localStorage.getItem('gtm_cart') || '[]') as CartItem[];
        setCartItems(savedCart);
    }, []);

    // Fire virtual page_views for steps 0 and 1. Step 2 & 3: handlers (page view first, then ecom event).
    useEffect(() => {
        if (!isMounted) return;
        const dataLayer = getDataLayer();

        if (step === 3) {
            // Fallback: confirmation page view is expected before/with purchase;
            // emit here only if it was not pushed by completePurchase().
            if (!completePageViewPushedRef.current) {
                const completeStep = STEP_MAP[3];
                const paymentStep = STEP_MAP[2];
                pushPageView({
                    pagePath: completeStep.path,
                    pageLocation: window.location.origin + completeStep.path,
                    pageTitle: pageTitle(completeStep.title),
                    pageReferrer: window.location.origin + paymentStep.path,
                    userId: getMockUserId(),
                    updatePreviousPath: true,
                });
                completePageViewPushedRef.current = true;
            }
            prevStepRef.current = step;
            return;
        }

        if (step === 2) {
            prevStepRef.current = step;
            return;
        }

        if (step !== 0 && step !== 1) {
            prevStepRef.current = step;
            return;
        }

        const current = STEP_MAP[step as keyof typeof STEP_MAP];
        if (!current) return;

        const previous = prevStepRef.current !== null ? STEP_MAP[prevStepRef.current as keyof typeof STEP_MAP] : null;
        let pageReferrer = '';
        if (previous) {
            pageReferrer = window.location.origin + previous.path;
        } else {
            const globalSpaOrigin = window.spaPreviousPath;
            if (globalSpaOrigin) pageReferrer = window.location.origin + globalSpaOrigin;
            else {
                const navEntry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (navEntry?.type !== 'reload') pageReferrer = document.referrer;
            }
        }
        const userId = getMockUserId();

        // Step 0: push overview page view once per "show step 0", then begin_checkout if cart has items
        if (step === 0) {
            if (!overviewPageViewPushedRef.current) {
                overviewPageViewPushedRef.current = true;
                pushPageView({
                    pagePath: current.path,
                    pageLocation: window.location.origin + current.path,
                    pageTitle: pageTitle(current.title),
                    pageReferrer,
                    userId,
                });
            }
            if (cartItems.length > 0 && shouldFireBeginCheckout(cartItems)) {
                const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
                dataLayer.push({ ecommerce: null });
                dataLayer.push({
                    event: 'begin_checkout',
                    ecommerce: {
                        currency: 'EUR',
                        value: total,
                        item_list_id: ECOM_ITEM_LIST_ID,
                        item_list_name: ECOM_ITEM_LIST_NAME,
                        items: cartItems.map((item, index) => ({
                            item_id: item.id,
                            item_name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            item_category: item.category,
                            index: index + 1
                        }))
                    }
                });
            }
            setSpaPreviousPath(current.path);
            prevStepRef.current = step;
            return;
        }

        overviewPageViewPushedRef.current = false; // reset when leaving step 0 so "Back to Review" pushes again

        pushPageView({
            pagePath: current.path,
            pageLocation: window.location.origin + current.path,
            pageTitle: pageTitle(current.title),
            pageReferrer,
            userId,
        });
        if (current.extra_events) {
            current.extra_events.forEach((customEvent) => dataLayer.push(customEvent));
        }
        setSpaPreviousPath(current.path);
        prevStepRef.current = step;
    }, [step, isMounted, cartItems]);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataLayer = getDataLayer();
        const paymentStep = STEP_MAP[2];
        const shippingStep = STEP_MAP[1];

        // Fire add_shipping_info first (shipping step completion), then payment page view
        dataLayer.push({ ecommerce: null });
        dataLayer.push({
            event: 'add_shipping_info',
            ecommerce: {
                currency: 'EUR',
                value: cartTotal,
                shipping_tier: 'Standard',
                item_list_id: ECOM_ITEM_LIST_ID,
                item_list_name: ECOM_ITEM_LIST_NAME,
                items: cartItems.map((item, index) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    item_category: item.category,
                    index: index + 1
                }))
            }
        });

        pushPageView({
            pagePath: paymentStep.path,
            pageLocation: window.location.origin + paymentStep.path,
            pageTitle: pageTitle(paymentStep.title),
            pageReferrer: window.location.origin + shippingStep.path,
            userId: getMockUserId(),
            updatePreviousPath: true,
        });
        prevStepRef.current = 2;
        setStep(2);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataLayer = getDataLayer();
        dataLayer.push({ ecommerce: null });
        dataLayer.push({
            event: 'add_payment_info',
            ecommerce: {
                currency: 'EUR',
                value: cartTotal,
                payment_type: 'Credit Card',
                item_list_id: ECOM_ITEM_LIST_ID,
                item_list_name: ECOM_ITEM_LIST_NAME,
                items: cartItems.map((item, index) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    item_category: item.category,
                    index: index + 1
                }))
            }
        });

        // Immediately process the final purchase
        completePurchase();
    };

    const completePurchase = () => {
        const dataLayer = getDataLayer();
        const completeStep = STEP_MAP[3];
        const paymentStep = STEP_MAP[2];

        // Step 3: page view must be first on confirmation "page", then purchase
        pushPageView({
            pagePath: completeStep.path,
            pageLocation: window.location.origin + completeStep.path,
            pageTitle: pageTitle(completeStep.title),
            pageReferrer: window.location.origin + paymentStep.path,
            userId: getMockUserId(),
            updatePreviousPath: true,
        });
        completePageViewPushedRef.current = true;
        prevStepRef.current = 3;

        dataLayer.push({ ecommerce: null });
        dataLayer.push({
            event: 'purchase',
            ecommerce: {
                // eslint-disable-next-line react-hooks/purity -- transaction ID generated on submit, not render
                transaction_id: `T-${Math.floor(Math.random() * 1000000)}`,
                value: cartTotal,
                currency: 'EUR',
                item_list_id: ECOM_ITEM_LIST_ID,
                item_list_name: ECOM_ITEM_LIST_NAME,
                items: cartItems.map((item, index) => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    item_category: item.category,
                    index: index + 1
                }))
            }
        });
        setStep(3);
        localStorage.removeItem('gtm_cart');
    };

    if (!isMounted) return null;

    return (
        <div className="page-container" style={{ alignItems: 'center', textAlign: 'center' }}>
            <h1>Checkout ({step === 3 ? 'Complete' : `Step ${step + 1} of 3`})</h1>


            <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'left', marginTop: '1rem' }}>
                {cartItems.length === 0 && step === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Add some products from the shop before checking out!</p>
                        <Link href="/shop" className="button" style={{ display: 'inline-block' }}>Return to Shop</Link>
                    </div>
                ) : step === 0 ? (
                    <div>
                        <h3>Review Order</h3>
                        <div className="order-items">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="order-item">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="divider" />
                        <div className="order-total">
                            <strong>Total</strong>
                            <strong>€{cartTotal.toFixed(2)}</strong>
                        </div>
                        <button className="button w-full" style={{ marginTop: '1.5rem' }} onClick={() => setStep(1)}>
                            Continue to Shipping
                        </button>
                    </div>
                ) : step === 1 ? (
                    <form key="shipping-form" onSubmit={handleShippingSubmit} className="form-layout">
                        <h3>Shipping Details</h3>
                        <div className="form-group">
                            <label htmlFor="shipping-full-name">Full Name</label>
                            <input id="shipping-full-name" name="shipping-full-name" required type="text" autoComplete="name" defaultValue="Jane Doe" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="shipping-address">Address</label>
                            <input id="shipping-address" name="shipping-address" required type="text" autoComplete="street-address" defaultValue="123 Analytics Way" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="shipping-city">City</label>
                            <input id="shipping-city" name="shipping-city" required type="text" autoComplete="address-level2" defaultValue="Data City" className="form-input" />
                        </div>
                        <button type="submit" className="button w-full" style={{ marginTop: '1rem' }}>
                            Continue to Payment
                        </button>
                        <button type="button" className="button w-full" style={{ backgroundColor: 'transparent', borderColor: 'transparent', color: '#94a3b8' }} onClick={() => setStep(0)}>
                            Back to Review
                        </button>
                    </form>
                ) : step === 2 ? (
                    <form key="payment-form" onSubmit={handlePaymentSubmit} className="form-layout">
                        <h3>Payment Information</h3>
                        <div className="form-group">
                            <label htmlFor="payment-cardholder">Cardholder Name</label>
                            <input id="payment-cardholder" name="payment-cardholder" required type="text" autoComplete="cc-name" defaultValue="Jane Doe" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="payment-card-number">Card Number (Mock)</label>
                            <input id="payment-card-number" name="payment-card-number" required type="text" autoComplete="cc-number" defaultValue="4111 1111 1111 1111" className="form-input" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="payment-expiry">Expiry</label>
                                <input
                                    id="payment-expiry"
                                    name="payment-expiry"
                                    required
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    placeholder="MM/YY"
                                    defaultValue="12/28"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="payment-cvc">CVC</label>
                                <input
                                    id="payment-cvc"
                                    name="payment-cvc"
                                    required
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    maxLength={4}
                                    placeholder="CVC"
                                    defaultValue="123"
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <button type="submit" className="button w-full" style={{ marginTop: '1rem' }}>
                            Pay €{cartTotal.toFixed(2)} & Complete Order
                        </button>
                        <button type="button" className="button w-full" style={{ backgroundColor: 'transparent', borderColor: 'transparent', color: '#94a3b8' }} onClick={() => setStep(1)}>
                            Back to Shipping
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', marginBottom: '1.5rem', color: 'var(--success-text)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Order Confirmed</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>Your transaction was successful. Check your dev console for the multi-step tracking payloads.</p>
                        <Link href="/shop" className="button">Continue Shopping</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
