import { BusinessEngagement, BusinessInformation } from '@/interfaces/business-engagement';
import { User } from '@/interfaces/users.interface';

interface RepresentingEntity {
  organizationName: string;
  organizationNumber: string;
  organizationId: string;
  information: BusinessInformation;
}

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingChoices?: BusinessEngagement[];
  }
}
