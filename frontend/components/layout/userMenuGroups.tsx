import { Link } from '@sk-web-gui/react';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export const userMenuGroups = [
  {
    label: 'Main',
    showLabel: false,
    showOnDesktop: false,
    showOnMobile: true,
    elements: [
      {
        label: 'Översikt',
        element: (active: boolean) => (
          <Link key={'oversikt'} href="/oversikt" className={`usermenu-item ${active ? 'active' : ''} block lg:hidden`}>
            Översikt
          </Link>
        ),
      },
      {
        label: 'Företagsuppgifter',
        element: (active: boolean) => (
          <Link
            key={'foretagsuppgifter'}
            href="/foretagsuppgifter"
            className={`usermenu-item ${active ? 'active' : ''} block lg:hidden`}
          >
            Företagsuppgifter
          </Link>
        ),
      },
      {
        label: 'Kontaktuppgifter',
        element: (active: boolean) => (
          <Link
            key={'kontaktuppgifter'}
            href="/kontaktuppgifter"
            className={`usermenu-item ${active ? 'active' : ''} block lg:hidden`}
          >
            Kontaktuppgifter
          </Link>
        ),
      },
      {
        label: 'Fakturor',
        element: (active: boolean) => (
          <Link key={'fakturor'} href="/fakturor" className={`usermenu-item ${active ? 'active' : ''} block lg:hidden`}>
            Fakturor
          </Link>
        ),
      },
    ],
  },
  {
    label: 'Relaterade webbplatser',
    showLabel: true,
    showOnDesktop: true,
    showOnMobile: true,
    elements: [
      {
        label: 'E-tjänster',
        element: (active: boolean) => (
          <Link
            external
            key={'e-services'}
            href="https://e-tjanster.sundsvall.se/"
            className={`usermenu-item ${active ? 'active' : ''}`}
          >
            E-tjänster
          </Link>
        ),
      },
      {
        label: 'Företagscenter Sundsvall',
        element: (active: boolean) => (
          <Link
            external
            key={'business-center'}
            href="https://foretagscentersundsvall.se/"
            className={`usermenu-item ${active ? 'active' : ''}`}
          >
            Företagscenter Sundsvall
          </Link>
        ),
      },
    ],
  },
  {
    label: 'Logga ut',
    showLabel: true,
    showOnDesktop: true,
    showOnMobile: true,
    elements: [
      {
        label: 'Byt företag',
        element: (active: boolean) => (
          <Link key={'change-foretag'} href={`/valj-foretag`} className={`usermenu-item ${active ? 'active' : ''}`}>
            <BusinessOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
            <span className="inline">Byt företag</span>
          </Link>
        ),
      },
      {
        label: 'Logga ut',
        element: (active: boolean) => (
          <Link
            key={'logout'}
            href={`${process.env.NEXT_PUBLIC_API_URL}/saml/logout`}
            className={`usermenu-item ${active ? 'active' : ''}`}
          >
            <LogoutOutlinedIcon className="material-icon mr-sm" aria-hidden="true" />
            <span className="inline">Logga ut</span>
          </Link>
        ),
      },
    ],
  },
];
