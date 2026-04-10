import { Engagement } from '@/controllers/legal-entity.controller';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';
import { CaseStatusResponse } from '@/data-contracts/casestatus/data-contracts';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: Engagement[];
    messages: string[];
    cache?: {
      cases?: {
        PRIVATE?: CaseStatusResponse[];
        BUSINESS?: {
          [key: string]: CaseStatusResponse[];
        };
      };
    };
  }
}
