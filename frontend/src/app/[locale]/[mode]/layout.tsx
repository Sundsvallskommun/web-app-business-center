import { notFound } from 'next/navigation';

const VALID_MODES = ['privat', 'foretag'];

export default async function ModeLayout({ children, params }: { children: React.ReactNode; params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  if (!VALID_MODES.includes(mode)) {
    notFound();
  }

  return children;
}
