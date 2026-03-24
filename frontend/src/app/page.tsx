'use client';

import { useAppContext } from '@contexts/app.context';
import { getRepresentingModeRoute } from '@utils/representingModeRoute';
import { redirect } from 'next/navigation';

export default function Index() {
  const { representingMode } = useAppContext();
  redirect(`${getRepresentingModeRoute(representingMode)}`);
}
