import 'reflect-metadata';

import ApiService from '@/services/api.service';
import {
  BASE_URL_PREFIX,
  CREDENTIALS,
  LOG_FORMAT,
  MUNICIPALITY_ID,
  NODE_ENV,
  ORIGIN,
  PORT,
  SAML_CALLBACK_URL,
  SAML_ENTRY_SSO,
  SAML_FAILURE_REDIRECT,
  SAML_IDP_PUBLIC_CERT,
  SAML_ISSUER,
  SAML_LOGOUT_URL,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  SAML_SUCCESS_REDIRECT,
  SECRET_KEY,
  SESSION_MEMORY,
  SWAGGER_ENABLED,
} from '@config';
import errorMiddleware from '@middlewares/error.middleware';
import { Strategy, VerifiedCallback } from '@node-saml/passport-saml';
import { logger, stream } from '@utils/logger';
import prisma from '@utils/prisma';
import bodyParser from 'body-parser';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { existsSync, mkdirSync } from 'fs';
import helmet from 'helmet';
import hpp from 'hpp';
import createMemoryStore from 'memorystore';
import morgan from 'morgan';
import passport from 'passport';
import { join } from 'path';
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import createFileStore from 'session-file-store';
import swaggerUi from 'swagger-ui-express';
import { getApiBase } from './config/api-config';
import { HttpException } from './exceptions/HttpException';
import { Profile } from './interfaces/profile.interface';
import { RepresentingMode } from './interfaces/representing.interface';
import { User } from './interfaces/users.interface';
import { additionalConverters } from './utils/custom-validation-classes';
import { isValidUrl } from './utils/util';

const SessionStoreCreate = SESSION_MEMORY ? createMemoryStore(session) : createFileStore(session);
const sessionTTL = 4 * 24 * 60 * 60;
// NOTE: memory uses ms while file uses seconds
const sessionStore = new SessionStoreCreate(SESSION_MEMORY ? { checkPeriod: sessionTTL * 1000 } : { sessionTTL, path: './data/sessions' });
const apiService = new ApiService();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

const samlStrategy = new Strategy(
  {
    disableRequestedAuthnContext: true,
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    callbackUrl: SAML_CALLBACK_URL,
    entryPoint: SAML_ENTRY_SSO,
    privateKey: SAML_PRIVATE_KEY,
    idpCert: SAML_IDP_PUBLIC_CERT,
    issuer: SAML_ISSUER,
    wantAssertionsSigned: false,
    wantAuthnResponseSigned: false,
    audience: false,
    logoutUrl: SAML_LOGOUT_URL,
    logoutCallbackUrl: SAML_LOGOUT_CALLBACK_URL,
  },
  async function (profile: Profile, done: VerifiedCallback) {
    if (!profile) {
      return done({
        name: 'SAML_MISSING_PROFILE',
        message: 'SAML_MISSING_PROFILE',
      });
    }
    const { firstname: givenName, Surname: surname, citizenIdentifier } = profile;

    if (!givenName || !surname || !citizenIdentifier) {
      return done(null, null, {
        name: 'SAML_MISSING_ATTRIBUTES',
        message: 'SAML_MISSING_ATTRIBUTES',
      });
    }

    try {
      const apiBase = getApiBase('citizen');
      const personNumber = profile.citizenIdentifier;
      const url = `${apiBase}/${MUNICIPALITY_ID}/${personNumber}/guid`;
      const citizenResult = await apiService.get<any>({ url }, { session: { user: { username: 'unknown' } } });
      const { data: personId } = citizenResult;

      if (!personId) {
        return done({
          name: 'SAML_CITIZEN_FAILED',
          message: 'Failed to fetch user from Citizen API',
        });
      }

      const findUser: User = {
        partyId: personId,
        personNumber: personNumber,
        name: `${givenName} ${surname}`,
        givenName,
        surname,
        username: 'unknown', // Username is not provided in the SAML profile, set a default value
        nameID: profile.nameID,
        sessionIndex: profile.sessionIndex,
      };

      const userSettings = await prisma.userSettings.findFirst({ where: { userId: findUser.partyId } });
      // Create user settings for new users
      if (!userSettings) {
        await prisma.userSettings.create({
          data: {
            userId: findUser.partyId,
            feedbackLifespan: 'oneMonth',
            readNotificationsClearedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      }
      done(null, findUser);
    } catch (err) {
      if (err instanceof HttpException && err?.status === 404) {
        // TODO: Handle missing person form Citizen?
      }
      done(err);
    }
  },
  async function (profile: Profile, done: VerifiedCallback) {
    return done(null, {});
  },
);

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public swaggerEnabled: boolean;

  constructor(Controllers) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.swaggerEnabled = SWAGGER_ENABLED || false;

    this.initializeDataFolders();

    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    if (this.swaggerEnabled) {
      this.initializeSwagger(Controllers);
    }
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    const samlLimiter = rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
    });
    this.app.set('trust proxy', 1);

    this.app.use(
      session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
          sameSite: 'lax',
        },
      }),
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());
    passport.use('saml', samlStrategy);

    this.app.get(
      `${BASE_URL_PREFIX}/saml/login`,
      (req, res, next) => {
        if (req.session.returnTo) {
          req.query.RelayState = req.session.returnTo;
        } else if (req.query.successRedirect) {
          req.query.RelayState = req.query.successRedirect;
        }
        if (req.query.representingMode) {
          req.session.representing = {
            mode: parseInt(req.query.representingMode as string) as RepresentingMode,
          };
        }
        next();
      },
      (req, res, next) => {
        passport.authenticate('saml', {
          failureRedirect: SAML_FAILURE_REDIRECT,
        })(req, res, next);
      },
    );

    this.app.get(`${BASE_URL_PREFIX}/saml/metadata`, (req, res) => {
      res.type('application/xml');
      const metadata = samlStrategy.generateServiceProviderMetadata(SAML_PUBLIC_KEY, SAML_PUBLIC_KEY);
      res.status(200).send(metadata);
    });

    this.app.get(
      `${BASE_URL_PREFIX}/saml/logout`,
      (req, res, next) => {
        if (req.session.returnTo) {
          req.query.RelayState = req.session.returnTo;
        } else if (req.query.successRedirect) {
          req.query.RelayState = req.query.successRedirect;
        }
        next();
      },
      (req, res, next) => {
        samlStrategy.logout(req as any, (err, url) => {
          logger.info(`Parsing url: ${url}`);
          const parsed = new URL(url);
          parsed.searchParams.set('RelayState', SAML_SUCCESS_REDIRECT);
          logger.info(`Set relay state to: ${SAML_SUCCESS_REDIRECT}`);
          const redirectUrl = parsed.toString();
          if (err) return res.status(500).send(err);
          req.logout(err => {
            if (err) return res.status(500).send(err);
            logger.info(`User ${req.user ? (req.user as User).partyId : 'unknown'} logged out`);
            logger.info(`Using logout url: ${redirectUrl}`);
            res.redirect(redirectUrl); // contains SAMLRequest, RelayState, etc.
          });
        });
      },
    );

    this.app.get(`${BASE_URL_PREFIX}/saml/logout/callback`, samlLimiter, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      let successRedirect: URL = new URL(SAML_LOGOUT_REDIRECT);
      let failureRedirect: URL;
      const urls = req?.body?.RelayState?.split(',') ?? [];

      if (urls.length !== 0) {
        if (isValidUrl(urls[0])) {
          successRedirect = new URL(urls[0]);
        }
        if (isValidUrl(urls[1])) {
          failureRedirect = new URL(urls[1]);
        } else {
          failureRedirect = successRedirect;
        }
      }

      const queries = new URLSearchParams(failureRedirect?.searchParams);

      if (queries) {
        if (req.session.messages?.length > 0) {
          queries.append('failMessage', req.session.messages[0]);
        } else {
          queries.append('failMessage', 'SAML_UNKNOWN_ERROR');
        }
      }

      if (failureRedirect) {
        res.redirect(failureRedirect.toString());
      } else {
        res.redirect(successRedirect.toString());
      }
    });

    this.app.post(`${BASE_URL_PREFIX}/saml/login/callback`, samlLimiter, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      let successRedirect: URL, failureRedirect: URL;

      const urls = req?.body?.RelayState.split(',');

      if (isValidUrl(urls[0])) {
        successRedirect = new URL(urls[0]);
      }
      if (isValidUrl(urls[1])) {
        failureRedirect = new URL(urls[1]);
      } else {
        failureRedirect = successRedirect;
      }

      passport.authenticate('saml', (err, user) => {
        if (err) {
          const queries = new URLSearchParams(failureRedirect.searchParams);
          if (err?.name) {
            queries.append('failMessage', err.name);
          } else {
            queries.append('failMessage', 'SAML_UNKNOWN_ERROR');
          }
          failureRedirect.search = queries.toString();
          res.redirect(failureRedirect.toString());
        } else if (!user) {
          const failMessage = new URLSearchParams(failureRedirect.searchParams);
          failMessage.append('failMessage', 'NO_USER');
          failureRedirect.search = failMessage.toString();
          res.redirect(failureRedirect.toString());
        } else {
          req.login(user, loginErr => {
            if (loginErr) {
              const failMessage = new URLSearchParams(failureRedirect.searchParams);
              failMessage.append('failMessage', 'SAML_UNKNOWN_ERROR');
              failureRedirect.search = failMessage.toString();
              res.redirect(failureRedirect.toString());
            }
            return res.redirect(successRedirect?.toString());
          });
        }
      })(req, res, next);
    });
  }

  private initializeRoutes(controllers) {
    useExpressServer(this.app, {
      routePrefix: BASE_URL_PREFIX,
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      },
      controllers: controllers,
      defaultErrorHandler: false,
    });
  }

  private initializeSwagger(controllers) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
      additionalConverters: additionalConverters,
    });

    const routingControllersOptions = {
      controllers: controllers,
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'basic',
            type: 'http',
          },
        },
      },
      info: {
        description: 'Mina Sidor',
        title: 'API',
        version: '1.0.0',
      },
    });

    this.app.use(`${BASE_URL_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeDataFolders() {
    const databaseDir: string = join(__dirname, '../data/database');
    if (!existsSync(databaseDir)) {
      mkdirSync(databaseDir, { recursive: true });
    }
    const logsDir: string = join(__dirname, '../data/logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const sessionsDir: string = join(__dirname, '../data/sessions');
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }
  }
}

export default App;
