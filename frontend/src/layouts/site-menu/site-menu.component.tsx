'use client';

import { useAppContext } from '../../contexts/app.context';
import { MyPagesBusinessSwitch, MyPagesToggle, useSiteMenuItems } from './site-menu-items';

export const SiteMenu = () => {
  const { isMyPagesModeBusiness } = useAppContext();
  const siteMenuItems = useSiteMenuItems();

  return (
    <nav aria-label="Site menu" className="flex items-center">
      <ul className="flex items-center gap-24">
        {siteMenuItems.map((item, index) => (
          <li key={`${index}`}>{item}</li>
        ))}
        {isMyPagesModeBusiness && (
          <li>
            <MyPagesBusinessSwitch />
          </li>
        )}
        <li>
          <MyPagesToggle />
        </li>
      </ul>
    </nav>
  );
};
