# Kommunens Mina Sidor
Mina Sidor för privatpersoner och företagare

## APIer som används

Applikationsanvändaren i WSO2 måste prenumerera på de APIer som används i projektet. Vilka APIer och versioner det gäller definieras på ett ställe i [`backend/src/config/api-config.ts`](backend/src/config/api-config.ts) (`APIS`), som är single source of truth.

## Utveckling

### Kravcn

- Node >= 20 LTS
- Yarn

### Steg för steg

1. Klona ner repot.

```
git clone git@github.com:Sundsvallskommun/web-app-business-center.git
```

2. Installera dependencies för både `backend` och `frontend`

```
cd frontend
yarn install

cd backend
yarn install
```

3. Skapa .env-fil för `frontend`

```
cd frontend
cp .env-example .env
```

Redigera `.env` för behov, för utveckling bör exempelvärdet fungera.

4. Skapa .env-filer för `backend`

```
cd backend
cp .env.example.local .env.development.local
cp .env.example.local .env.test.local
```

redigera `.env.development.local` för behov. URLer, nycklar och cert behöver fyllas i korrekt.

- `CLIENT_KEY` och `CLIENT_SECRET` måste fyllas i för att APIerna ska fungera, du måste ha en applikation från WSO2-portalen
- `SAML_ENTRY_SSO` behöver pekas till en SAML IDP
- `SAML_IDP_PUBLIC_CERT` ska stämma överens med IDPens cert
- `SAML_PRIVATE_KEY` och `SAML_PUBLIC_KEY` behöver bara fyllas i korrekt om man kör mot en riktig IDP

### Session-hantering och Redis

Backend använder `express-session` för sessionshantering. Redis aktiveras genom att sätta `REDIS_HOST`.

| Konfiguration                               | Session store                        | Rekommenderad miljö   |
| ------------------------------------------- | ------------------------------------ | --------------------- |
| `REDIS_HOST` satt                           | Redis                                | OpenShift / multi-pod |
| `REDIS_HOST` ej satt                        | Filbaserad store (`./data/sessions`) | Lokal utveckling      |
| `REDIS_HOST` ej satt, `SESSION_MEMORY=true` | In-memory store                      | Lokal utveckling      |

Med Redis blir backend stateless så att flera poddar kan köras. OAuth-token mot API-gatewayn delas då också mellan poddarna via Redis, och ett lås ser till att bara en podd hämtar ny token åt gången (`src/services/api-token.service.ts`). Utan Redis cachas token i minnet per instans.

Följande miljövariabler sätts via Deployment / Helm / ArgoCD:

```
REDIS_HOST=<redis-hostname>
REDIS_PORT=6379            # valfri, default 6379
REDIS_PASSWORD=<secret>
REDIS_KEY_PREFIX=<prefix>  # valfri, default web-app-business-center
```

Alla Redis-nycklar namnges med `REDIS_KEY_PREFIX`: sessioner sparas under `<prefix>:session:<id>` och gateway-token under `<prefix>:wso2:access_token`. Delar flera appar samma Redis måste prefixet vara unikt per app, annars kan de läsa varandras token.

Om `REDIS_HOST` är satt måste Redis gå att nå vid start, annars startar inte applikationen. Sätts `REDIS_PORT` eller `REDIS_PASSWORD` utan `REDIS_HOST` stoppas applikationen också vid start. När Redis är konfigurerat men inte redo svarar `/health/up` med 503. Vid SIGTERM stängs HTTP-servern och Redis-anslutningen ner kontrollerat.

Lokal utveckling kräver ingen Redis, samma kodbas används i alla miljöer.

## Git Hooks

Behöver man skippa Git hooks (Husky) så kan man följa: https://typicode.github.io/husky/#/?id=bypass-hooks
