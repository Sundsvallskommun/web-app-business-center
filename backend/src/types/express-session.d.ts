import { Engagement } from '@/services/legal-entity.service';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';
import { CaseStatusResponseWithPermissions } from '@/interfaces/case.interface';
import { GrpCollectResponseWithRef, GrpInitiateResponseWithStartTime } from '@/interfaces/grp.interface';
import { SignMandateCache } from '@/interfaces/mandates.interface';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: Engagement[];
    messages: string[];
    cache?: {
      cases: {
        PRIVATE?: CaseStatusResponseWithPermissions[];
        BUSINESS?: {
          [key: string]: CaseStatusResponseWithPermissions[];
        };
      };
    };
    signs: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details: Record<string, any>;
      pending: Record<string, GrpInitiateResponseWithStartTime>;
      completed: Record<string, GrpCollectResponseWithRef>;
      mandates: Record<string, SignMandateCache>;
    };
  }
}
