import { Engagement } from '@/data-contracts/businessengagements/data-contracts';
import { User } from '@/interfaces/users.interface';
import { RepresentingEntity } from '../interfaces/representing.interface';

declare module 'express-session' {
  interface Session {
    returnTo?: string;
    user?: User;
    representing?: RepresentingEntity;
    passport?: any;
    representingBusinessChoices?: Engagement[];
    messages: string[];
  }
}
