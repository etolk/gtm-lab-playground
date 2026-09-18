import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tracking Lab | Media'
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
