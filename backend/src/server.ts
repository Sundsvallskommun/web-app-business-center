import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import { CaseController } from '@controllers/case.controller';
import validateEnv from '@utils/validateEnv';
import { BusinessEngagementController } from '@controllers/business-engagement.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { UserController } from '@controllers/user.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { FeedbackController } from '@controllers/feedback.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { HealthController } from './controllers/health.controller';
import { ContactSettingsController } from './controllers/contact-settings.controller';
import { CaseDataController } from '@/controllers/case-data.controller';

validateEnv();

const app = new App([
  IndexController,
  CaseController,
  CaseDataController,
  BusinessEngagementController,
  RepresentingController,
  UserController,
  NotificationsController,
  FeedbackController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
]);

app.listen();
