import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tracking Lab | Form'
};

export default function FormLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
