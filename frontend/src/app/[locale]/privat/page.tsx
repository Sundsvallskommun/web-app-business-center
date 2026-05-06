import { RepresentingMode } from '@interfaces/app';
import { redirect } from 'next/navigation';
import { getRepresentingModeRoute } from '../../../utils/representingModeRoute';

export default function Index() {
  redirect(`${getRepresentingModeRoute(RepresentingMode.PRIVATE)}/oversikt`);
}
