import { Metadata } from 'next';
import { getProduct } from '@/lib/products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  return {
    title: product ? `Tracking Lab | ${product.name}` : 'Tracking Lab | Product',
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
