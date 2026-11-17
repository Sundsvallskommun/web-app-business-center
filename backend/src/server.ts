import type { Server } from 'node:http';

import App from '@/app';
import { CaseController } from '@controllers/case.controller';
import { FeedbackController } from '@controllers/feedback.controller';
import { IndexController } from '@controllers/index.controller';
import { RepresentingController } from '@controllers/representing.controller';
import { UserController } from '@controllers/user.controller';
import { logger } from '@utils/logger';
import { closeRedisClient, destroyRedisClient } from '@utils/redis';
import { createSessionStore } from '@utils/session-store';
import validateEnv from '@utils/validateEnv';
import { AssetsController } from '@controllers/assets.controller';
import { ContactSettingsController } from '@controllers/contact-settings.controller';
import { HealthController } from '@controllers/health.controller';
import { InvoicesController } from '@controllers/invoices.controller';
import { LegalEntityController } from '@controllers/legal-entity.controller';
import { MandateController } from '@controllers/mandate.controller';
import { SignController } from '@controllers/sign.controller';
import { CitizenController } from '@controllers/citizen.controller';
import { DocumentsController } from '@controllers/documents.controller';

const controllers = [
  IndexController,
  CaseController,
  AssetsController,
  LegalEntityController,
  DocumentsController,
  RepresentingController,
  UserController,
  FeedbackController,
  InvoicesController,
  HealthController,
  ContactSettingsController,
  SignController,
  MandateController,
  CitizenController,
];

// OpenShift sends SIGTERM and waits terminationGracePeriodSeconds (30 s by default) before SIGKILL.
const SHUTDOWN_GRACE_PERIOD_MS = 10_000;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function markShutdownFailure(message: string, error?: unknown): void {
  logger.error(error === undefined ? message : `${message}: ${errorMessage(error)}`);
  process.exitCode = 1;
}

async function closeHttpServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()));
  });
}

async function gracefullyCloseResources(server: Server): Promise<void> {
  try {
    await closeHttpServer(server);
  } catch (error: unknown) {
    markShutdownFailure('HTTP server shutdown failed', error);
  }

  try {
    await closeRedisClient();
  } catch (error: unknown) {
    markShutdownFailure('Redis shutdown failed', error);
  }
}

function forceCloseResources(server: Server): void {
  markShutdownFailure(`Graceful shutdown exceeded ${SHUTDOWN_GRACE_PERIOD_MS}ms; forcing connections closed`);

  try {
    server.closeAllConnections();
  } catch (error: unknown) {
    markShutdownFailure('Forced HTTP server shutdown failed', error);
  }

  try {
    destroyRedisClient();
  } catch (error: unknown) {
    markShutdownFailure('Forced Redis shutdown failed', error);
  }
}

function beginShutdown(server: Server, signal: NodeJS.Signals): void {
  logger.info(`Received ${signal}; shutting down`);

  const gracefulShutdown = gracefullyCloseResources(server);
  let shutdownTimer: NodeJS.Timeout;
  const shutdownDeadline = new Promise<'timed-out'>(resolve => {
    shutdownTimer = setTimeout(() => resolve('timed-out'), SHUTDOWN_GRACE_PERIOD_MS);
  });

  void Promise.race([gracefulShutdown.then(() => 'complete' as const), shutdownDeadline]).then(result => {
    if (result === 'complete') {
      clearTimeout(shutdownTimer);
      return;
    }

    forceCloseResources(server);
  });
}

async function startServer(): Promise<void> {
  validateEnv();

  let server: Server;

  try {
    // Connects to Redis when REDIS_HOST is set, so a misconfigured pod fails at startup.
    const sessionStore = await createSessionStore();
    const app = new App(controllers, sessionStore);
    server = app.listen();
  } catch (error: unknown) {
    try {
      await closeRedisClient();
    } catch (cleanupError: unknown) {
      logger.error(`Redis cleanup after server startup failure failed: ${errorMessage(cleanupError)}`);
    }

    throw error;
  }

  let shutdownStarted = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shutdownStarted) {
      return;
    }

    shutdownStarted = true;
    beginShutdown(server, signal);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error: unknown) => {
  logger.error(`Server startup failed: ${errorMessage(error)}`);
  process.exitCode = 1;
});
