import { User } from '@/interfaces/users.interface';
import { BusinessEngagement } from '../interfaces/business-engagement';
import { RepresentingEntity } from '../interfaces/representing.interface';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: BusinessEngagement[];
    messages: string[];
  }
}
