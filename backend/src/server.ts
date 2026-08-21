import App from '@/app';
import { CaseController } from '@controllers/case.controller';
import { FeedbackController } from '@controllers/feedback.controller';
import { IndexController } from '@controllers/index.controller';
import { NotificationsController } from '@controllers/notifications.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { UserController } from '@controllers/user.controller';
import validateEnv from '@utils/validateEnv';
import { initErrorReporter } from '@utils/error-reporter';
import { logger } from '@utils/logger';
import { ENVIRONMENT, NODE_ENV, SLACK_APP_NAME, SLACK_IGNORE_MESSAGES, SLACK_IGNORE_STATUSES, SLACK_WEBHOOK_URL } from '@config';
import { AssetsController } from './controllers/assets.controller';
import { ContactSettingsController } from './controllers/contact-settings.controller';
import { HealthController } from './controllers/health.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { LegalEntityController } from './controllers/legal-entity.controller';
import { MandateController } from './controllers/mandate.controller';
import { SignController } from './controllers/sign.controller';
import { CitizenController } from './controllers/citizen.controller';
import { DecisionsController } from './controllers/decisions.controller';

validateEnv();

// ENVIRONMENT is deliberately left unset in production (see .env.example.local), so fall
// back to NODE_ENV rather than heading every production alert with "unknown".
const environmentLabel = ENVIRONMENT || (NODE_ENV === 'production' ? 'PRODUCTION' : NODE_ENV ?? 'unknown');

// Inert unless SLACK_WEBHOOK_URL is set, so local and test runs stay silent.
initErrorReporter({
  webhookUrl: SLACK_WEBHOOK_URL,
  appName: SLACK_APP_NAME,
  environment: environmentLabel,
  ignoreStatuses: SLACK_IGNORE_STATUSES,
  ignoreMessages: SLACK_IGNORE_MESSAGES,
  logger,
});

const app = new App([
  IndexController,
  CaseController,
  AssetsController,
  LegalEntityController,
  DecisionsController,
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
