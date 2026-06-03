import { Asset } from '@/data-contracts/partyassets/data-contracts';

// Human-readable detail of a service-style asset (e.g. paratransit), resolved
// from the asset's json parameter form data against its RJSF schema.
export interface ServiceDetails {
  restyp: string[];
  transportMode: string[];
  aids: string[];
  addon: string[];
  comment: string;
  isWinterService: boolean;
}

export type AssetWithService = Asset & { service?: ServiceDetails };
