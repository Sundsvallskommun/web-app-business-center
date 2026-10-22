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
import { MandateController } from './controllers/mandate.controller';
import { SignController } from './controllers/sign.controller';
import { CitizenController } from './controllers/citizen.controller';
import { DocumentsController } from './controllers/documents.controller';

validateEnv();

const app = new App([
  IndexController,
  CaseController,
  AssetsController,
  LegalEntityController,
  DocumentsController,
  RepresentingController,
  UserController,
  NotificationsController,
  FeedbackController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
  SignController,
  MandateController,
  CitizenController,
]);

app.listen();
