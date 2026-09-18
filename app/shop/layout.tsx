import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tracking Lab | Shop'
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
