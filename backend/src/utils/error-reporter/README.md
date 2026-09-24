# error-reporter

Generisk felrapportering till en Slack-kanal via Incoming Webhook. Skickar appnamn, miljö,
tidsstämpel, statuskod, felmeddelande och endpoint när något går fel i backend.

Modulen är byggd för att kunna kopieras rakt in i en annan Node-backend. Den importerar
inget utanför den här mappen förutom `axios`, och läser aldrig `process.env` själv —
all konfiguration injiceras. Det är hela poängen: värdappen äger sina env-variabler, och
en flytt till ett publicerat npm-paket blir en ren mappflytt utan kodändring.

## Koppla in i en app

**1. Kopiera mappen** till appens `src/utils/error-reporter/`. Enda beroendet är `axios`.

**2. Initiera vid uppstart**, före att servern börjar lyssna:

```ts
import { initErrorReporter } from '@utils/error-reporter';
import { logger } from '@utils/logger';

initErrorReporter({
  webhookUrl: process.env.SLACK_WEBHOOK_URL,
  appName: 'Mina sidor företag',
  environment: 'TEST',
  logger,
});
```

**3. Rapportera från appens felhanterare.** Anropet är synkront och kastar aldrig, så det
kan läggas var som helst utan try/catch runt:

```ts
import { reportError } from '@utils/error-reporter';

reportError({
  status,
  message,
  method: req.method,
  path: req.path,
  requestId: req.headers['x-request-id'] as string | undefined,
  stack: error.stack,
});
```

Saknas `webhookUrl` är modulen helt inaktiv — inga nätverksanrop, inga sidoeffekter. Det är
så lokal utveckling och testkörningar hålls tysta.

## Konfiguration

| Fält | Default | Beskrivning |
|---|---|---|
| `webhookUrl` | – | Slack Incoming Webhook. Tom eller icke-http stänger av modulen. |
| `appName` | – | Visas i notisens rubrik. |
| `environment` | – | Visas bredvid appnamnet, t.ex. `TEST` eller `PRODUCTION`. |
| `minStatus` | `400` | Lägsta statuskod som rapporteras. Sätt `500` för att bara larma på serverfel. |
| `ignoreStatuses` | `[]` | Statuskoder som hoppas över trots `minStatus`, t.ex. `[401, 404]`. |
| `ignoreMessages` | `[]` | Felmeddelanden som hoppas över. Delsträngsmatchning, skiftlägesokänslig. |
| `dedupeWindowMs` | `300000` | Hur länge ett identiskt fel tystas efter att ha rapporterats. |
| `maxReportsPerWindow` | `20` | Tak för antal notiser per fönster, över alla fel. |
| `timeoutMs` | `3000` | Timeout för webhook-anropet. |
| `logger` | – | Valfri `{ warn, error }` dit modulen loggar sina egna misslyckanden. |

## Att tysta förväntade fel

Inloggningsfel är det vanligaste bruset: varje utgången session ger en 401, och det är inte
ett driftfel. Två sätt att filtrera, med olika precision:

`ignoreStatuses: [401]` tystar allt med den statuskoden — enkelt, men döljer också en 401
som beror på en verklig bugg i autentiseringen.

`ignoreMessages: ['NOT_AUTHORIZED', 'AUTH_FAILED']` tystar bara de meddelanden som en
normal sessionsutgång producerar. En 401 med något annat meddelande når fortfarande kanalen.
Det är oftast det man vill, och därför det denna app använder som default.

Filtret matchar delsträngar utan hänsyn till skiftläge, så `'permission'` fångar både
`You do not have permission to access this resource.` och `Permission denied`.

## Vad modulen skyddar mot

**Personuppgifter.** Varje strängfält maskeras innan det lämnar processen: personnummer,
organisationsnummer, UUID/partyId, e-post, telefonnummer och bearer-tokens. Det behövs
eftersom identifierare rutinmässigt hamnar i det vi rapporterar — upstream-URL:er innehåller
personnummer och valideringsfel ekar användarens indata. En Slack-kanal är en betydligt
mindre kontrollerad plats än en roterande loggfil. Se `redact.ts`.

**Notisstormar.** Ett nedsläckt beroende skulle annars bli hundratals meddelanden. Samma fel
(statuskod + normaliserad path + meddelande) postas högst en gång per fönster, och nästa
notis av samma typ berättar hur många som undertrycktes. Ovanpå det finns ett globalt tak per
fönster som postar en enda varning och sedan tystnar. Se `throttle.ts`.

**Att felhanteringen går sönder.** `reportError()` returnerar direkt, gör POST:en
fire-and-forget med timeout, och sväljer alla egna fel. En trasig webhook påverkar aldrig
svaret till klienten.

## Skapa webhooken

Slack → *Create an app* → *Incoming Webhooks* → *Add New Webhook to Workspace* → välj kanal.
URL:en som genereras är hemlig och ska hanteras som vilken annan credential som helst — den
ger vem som helst rätt att posta i kanalen.

Använd olika webhooks (och gärna olika kanaler) per miljö, så att TEST-brus inte dränker
produktionslarm.
