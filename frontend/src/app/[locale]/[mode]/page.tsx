import { RepresentingMode } from '@interfaces/app';
import { notFound, redirect } from 'next/navigation';
import { getRepresentingModeRoute } from '../../../utils/representingModeRoute';

interface IndexProps {
  params: Promise<{ mode: string }>;
}

export default async function Index(props: IndexProps) {
  const { mode } = await props.params;

  if (mode === 'foretag') {
    redirect(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/oversikt`);
  } else if (mode === 'privat') {
    redirect(`${getRepresentingModeRoute(RepresentingMode.PRIVATE)}/oversikt`);
  } else {
    notFound();
  }
}
