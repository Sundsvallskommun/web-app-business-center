import 'reflect-metadata';

import {
  BASE_URL_PREFIX,
  CREDENTIALS,
  LOG_FORMAT,
  NODE_ENV,
  ORIGIN,
  PORT,
  SAML_CALLBACK_URL,
  SAML_ENTRY_SSO,
  SAML_FAILURE_REDIRECT,
  SAML_IDP_PUBLIC_CERT,
  SAML_ISSUER,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  SAML_SUCCESS_REDIRECT,
  SECRET_KEY,
  SESSION_MEMORY,
  SWAGGER_ENABLED,
} from '@config';
import { Strategy, VerifiedCallback } from '@node-saml/passport-saml';
import { getMetadataArgsStorage, useExpressServer } from 'routing-controllers';
import { logger, stream } from '@utils/logger';

import ApiService from '@/services/api.service';
import { HttpException } from './exceptions/HttpException';
import { Profile } from './interfaces/profile.interface';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import createFileStore from 'session-file-store';
import createMemoryStore from 'memorystore';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import errorMiddleware from '@middlewares/error.middleware';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import passport from 'passport';
import prisma from '@utils/prisma';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

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
    //attributeConsumingServiceIndex: '2',
    //xmlSignatureTransforms: ['test'],
    //authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:unspecified'],
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    callbackUrl: SAML_CALLBACK_URL,
    entryPoint: SAML_ENTRY_SSO,
    //decryptionPvk: SAML_PRIVATE_KEY,
    privateKey: SAML_PRIVATE_KEY,
    // Identity Provider's public key
    idpCert: SAML_IDP_PUBLIC_CERT,
    issuer: SAML_ISSUER,
    wantAssertionsSigned: false,
    // signatureAlgorithm: 'sha256',
    // digestAlgorithm: 'sha256',
    // maxAssertionAgeMs: 2592000000,
    // authnRequestBinding: 'HTTP-POST',
    //logoutUrl: 'http://194.71.24.30/sso',
    logoutCallbackUrl: SAML_LOGOUT_CALLBACK_URL,
    wantAuthnResponseSigned: false,
    audience: false,
  },
  async function (profile: Profile, done: VerifiedCallback) {
    if (!profile) {
      return done({
        name: 'SAML_MISSING_PROFILE',
        message: 'Missing SAML profile',
      });
    }
    const { givenName, surname, citizenIdentifier } = profile;

    if (!givenName || !surname || !citizenIdentifier) {
      return done({
        name: 'SAML_MISSING_ATTRIBUTES',
        message: 'Missing profile attributes',
      });
    }

    try {
      const personNumber = profile.citizenIdentifier;
      const citizenResult = await apiService.get<any>({ url: `citizen/2.0/${personNumber}/guid` });
      const { data: personId } = citizenResult;

      if (!personId) {
        return done({
          name: 'SAML_CITIZEN_FAILED',
          message: 'Failed to fetch user from Citizen API',
        });
      }

      const findUser = {
        guid: personId,
        name: `${givenName} ${surname}`,
        givenName: givenName,
        surname: surname,
      };

      const userSettings = await prisma.userSettings.findFirst({ where: { userId: findUser.guid } });
      // Create user settings for new users
      if (!userSettings) {
        await prisma.userSettings.create({
          data: {
            userId: findUser.guid,
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

  constructor(Controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.swaggerEnabled = SWAGGER_ENABLED || false;

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

    this.app.use(
      session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
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

    this.app.get(`${BASE_URL_PREFIX}/saml/logout`, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      samlStrategy.logout(req as any, () => {
        req.logout(err => {
          if (err) {
            return next(err);
          }
          // FIXME: should we redirect here or should client do it?
          res.redirect(SAML_LOGOUT_REDIRECT);
        });
      });
    });

    this.app.get(`${BASE_URL_PREFIX}/saml/logout/callback`, bodyParser.urlencoded({ extended: false }), (req, res, next) => {
      // FIXME: is this enough or do we need to do something more?
      req.logout(err => {
        if (err) {
          return next(err);
        }
        // FIXME: should we redirect here or should client do it?
        res.redirect(SAML_LOGOUT_REDIRECT);
      });
    });

    this.app.post(
      `${BASE_URL_PREFIX}/saml/login/callback`,
      bodyParser.urlencoded({ extended: false }),
      (req, res, next) => {
        passport.authenticate('saml', {
          failureRedirect: SAML_FAILURE_REDIRECT,
        })(req, res, next);
      },
      (req, res) => {
        res.redirect(SAML_SUCCESS_REDIRECT);
      },
    );
  }

  private initializeRoutes(controllers: Function[]) {
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

  private initializeSwagger(controllers: Function[]) {
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
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
        description: 'Mina Sidor För Företag',
        title: 'API',
        version: '1.0.0',
      },
    });

    this.app.use(`${BASE_URL_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
