/**
 * Registry of e-services that can be started from "Mina sidor" → Ansök.
 *
 * Adding a new e-service is one entry here plus a route under
 * /privat/ansok/<key>. The index page (/privat/ansok) renders this
 * list as cards and does not know anything about individual services.
 */

export interface EService {
  /** Stable key — also used as URL segment under /privat/ansok/. */
  key: string;
  /** Card title shown to the applicant. */
  title: string;
  /** One-line lead text under the title on the index card. */
  description: string;
  /** Route that starts the application flow. */
  href: string;
}

export const E_SERVICES: EService[] = [
  {
    key: 'ekonomiskt-bistand',
    title: 'Ekonomiskt bistånd',
    description: 'Ansök om försörjningsstöd hos Individ- och familjeförvaltningen.',
    href: '/privat/ansok/ekonomiskt-bistand',
  },
];
