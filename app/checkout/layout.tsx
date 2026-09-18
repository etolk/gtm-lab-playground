import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tracking Lab | Checkout'
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
