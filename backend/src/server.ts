import App from '@/app';
import { CaseController } from '@controllers/case.controller';
import { FeedbackController } from '@controllers/feedback.controller';
import { IndexController } from '@controllers/index.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { UserController } from '@controllers/user.controller';
import validateEnv from '@utils/validateEnv';
import { AssetsController } from './controllers/assets.controller';
import { ContactSettingsController } from './controllers/contact-settings.controller';
import { HealthController } from './controllers/health.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { LegalEntityController } from './controllers/legal-entity.controller';

validateEnv();

const app = new App([
  IndexController,
  CaseController,
  AssetsController,
  LegalEntityController,
  RepresentingController,
  UserController,
  NotificationsController,
  FeedbackController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
]);

app.listen();
