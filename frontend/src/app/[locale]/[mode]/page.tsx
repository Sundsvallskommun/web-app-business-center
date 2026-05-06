import { RepresentingMode } from '@interfaces/app';
import { redirect } from 'next/navigation';
import { getRepresentingModeRoute } from '../../../utils/representingModeRoute';

interface IndexProps {
  params: Promise<{ mode: string }>;
}

export default async function Index(props: IndexProps) {
  const { mode } = await props.params;

  if (mode === 'foretag') {
    redirect(`${getRepresentingModeRoute(RepresentingMode.BUSINESS)}/oversikt`);
  } else {
    redirect(`${getRepresentingModeRoute(RepresentingMode.PRIVATE)}/oversikt`);
  }
}
