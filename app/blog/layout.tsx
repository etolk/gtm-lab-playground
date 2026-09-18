import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tracking Lab | Blog'
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
