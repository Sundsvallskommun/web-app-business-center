import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { Decision as ByggrDecision, DecisionDocument, ErrandDecisions, KeyValue } from '@/data-contracts/byggrintegrator/data-contracts';
import { ByggrErrandDetails, DecisionAttachment, DecisionItem, DocumentStatus, toCompositeId } from '@/interfaces/document.interface';
import { User } from '@/interfaces/users.interface';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { DocumentSourceAdapter, DocumentSourceContext, DocumentSourceResult, SourceDocument } from './document-source';

/**
 * byggr-integrator as a document source.
 *
 * A byggR errand (a building permit case) is the document itself: the case the party applied
 * for, with the decisions made on it and the decision documents under each. Nothing here is
 * matched against other sources, so `matchKeys` stays empty.
 *
 * byggR is keyed on legal id (personal or organisation number), not party id, so the adapter
 * reads `ctx.identifier`. The integrator only answers for errands where that identifier is the
 * applicant, and 404s otherwise, so it enforces ownership on every call.
 *
 * The errand list upstream only carries case numbers, while the description, status and dates
 * the listing shows live on the decisions. So the listing reads the errand list and then the
 * decisions of every errand, in parallel, and builds full documents from them. An errand whose
 * decisions cannot be read still shows, as a bare document titled by its case number, and the
 * source is reported unavailable so the client can say the listing is incomplete. Opening a
 * document re-reads just that errand through `fetchDetails`.
 */

const SOURCE = 'BYGGR' as const;

const defaultApi = new ApiService();

type Api = Pick<ApiService, 'get'>;

const applicantBase = (identifier: string): string =>
  `${getApiBase('byggrintegrator')}/${MUNICIPALITY_ID}/applicants/${encodeURIComponent(identifier)}`;

const isNotFound = (error: unknown): boolean => (error as { status?: number })?.status === 404;

export const fetchApplicantErrands = async (identifier: string, user: User, signal?: AbortSignal, api: Api = defaultApi): Promise<string[]> => {
  const url = `${applicantBase(identifier)}/errands`;

  try {
    const res = await api.get<KeyValue[]>({ url, signal }, user);
    const caseNumbers = (res.data ?? []).map(errand => errand.value?.trim()).filter((caseNumber): caseNumber is string => !!caseNumber);

    return [...new Set(caseNumbers)];
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

export const fetchErrandDecisions = async (
  identifier: string,
  caseNumber: string,
  user: User,
  signal?: AbortSignal,
  api: Api = defaultApi,
): Promise<ErrandDecisions | undefined> => {
  const url = `${applicantBase(identifier)}/errands/decisions`;

  try {
    const res = await api.get<ErrandDecisions>({ url, signal, params: { caseNumber } }, user);
    return res.data ?? undefined;
  } catch (error) {
    if (isNotFound(error)) {
      return undefined;
    }
    throw error;
  }
};

/**
 * A byggR decision is addressed by its event id, but the decisions endpoint upstream is keyed on
 * case number, so the case number travels inside the decision's native id. The event id comes
 * first since it is an integer and cannot contain the separator; the case number may hold
 * anything after it.
 */
const DECISION_ID_SEPARATOR = ':';

export const toDecisionNativeId = (eventId: number, caseNumber: string): string => `${eventId}${DECISION_ID_SEPARATOR}${caseNumber}`;

export const parseDecisionNativeId = (nativeId: string): { eventId: number; caseNumber: string } | undefined => {
  const match = /^(\d+):(.+)$/.exec(nativeId);
  if (!match) return undefined;

  return { eventId: Number(match[1]), caseNumber: match[2] };
};

// byggR knows the document type code, not the media type. The integrator detects the media type
// when the file is read, but the client decides how to save the file before that, so the usual
// office and image formats are mapped from the file name here.
const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  txt: 'text/plain',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  bmp: 'image/bmp',
};

export const fileExtension = (name: string): string | undefined => {
  const lastDot = name.lastIndexOf('.');
  return lastDot > 0 && lastDot < name.length - 1 ? name.slice(lastDot + 1).toLowerCase() : undefined;
};

const mimeTypeFor = (extension?: string): string | undefined => (extension ? MIME_TYPES_BY_EXTENSION[extension] : undefined);

/** Document ids upstream are digits only, which is what lets them fit the numeric attachment id. */
const toAttachmentId = (id?: string): number | undefined => (id && /^\d+$/.test(id) ? Number(id) : undefined);

const toAttachment = (document: DecisionDocument): DecisionAttachment | undefined => {
  const id = toAttachmentId(document.id);
  if (id === undefined || !document.name) return undefined;

  const extension = fileExtension(document.name);
  return { id, name: document.name, mimeType: mimeTypeFor(extension), extension };
};

const hasId = (decision: ByggrDecision): decision is ByggrDecision & { id: number } => Number.isInteger(decision.id);

export const toDecisionItem = (decision: ByggrDecision & { id: number }, caseNumber: string): DecisionItem => ({
  id: toCompositeId(SOURCE, toDecisionNativeId(decision.id, caseNumber)),
  source: SOURCE,
  title: decision.heading?.trim() || undefined,
  outcome: decision.outcome,
  decidedAt: decision.decisionDate,
  validTo: decision.validUntil,
  mainDecision: decision.mainDecision,
  attachments: (decision.documents ?? []).map(toAttachment).filter((attachment): attachment is DecisionAttachment => !!attachment),
});

const startOfToday = (): number => new Date(new Date().toDateString()).getTime();

/**
 * The status of the errand follows its main decision: EXPIRED once the decision's validity has
 * passed, ACTIVE while it is in force or open ended. An errand without decisions has no status.
 */
const toStatus = (decision: DecisionItem | undefined, today = startOfToday()): DocumentStatus | undefined => {
  if (!decision) return undefined;
  if (!decision.validTo) return 'ACTIVE';

  const validTo = new Date(decision.validTo).getTime();
  return Number.isNaN(validTo) || validTo >= today ? 'ACTIVE' : 'EXPIRED';
};

/** The decision the errand is summarised by: the one byggR flags as main, else the newest. */
const mainDecision = (decisions: DecisionItem[]): DecisionItem | undefined => decisions.find(decision => decision.mainDecision) ?? decisions[0];

/** The date of the newest dated decision, for an errand whose main decision carries no date. */
const latestDecided = (decisions: DecisionItem[]): string | undefined =>
  decisions
    .map(decision => decision.decidedAt)
    .filter((date): date is string => !!date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

export const toBareDocument = (caseNumber: string): SourceDocument => ({
  id: toCompositeId(SOURCE, caseNumber),
  source: SOURCE,
  title: caseNumber,
  decisions: [],
  matchKeys: [],
  byggr: { caseNumber },
});

/**
 * The full document for the detail page. `caseNumber` is the one the document was requested by,
 * so the id round trips even if the upstream echoes the case number in another form.
 */
export const toDocument = (caseNumber: string, errand: ErrandDecisions): SourceDocument => {
  const decisions = (errand.decisions ?? []).filter(hasId).map(decision => toDecisionItem(decision, caseNumber));
  const main = mainDecision(decisions);
  const byggr: ByggrErrandDetails = {
    caseNumber,
    description: errand.description?.trim() || undefined,
    propertyDesignation: errand.propertyDesignation?.trim() || undefined,
  };

  return {
    id: toCompositeId(SOURCE, caseNumber),
    source: SOURCE,
    title: byggr.description || caseNumber,
    status: toStatus(main),
    issued: main?.decidedAt ?? latestDecided(decisions),
    validTo: main?.validTo,
    decisions,
    matchKeys: [],
    byggr,
  };
};

const requireIdentifier = (ctx: DocumentSourceContext): string => {
  if (!ctx.identifier) {
    throw new Error('byggR documents require the legal id of the represented party, but the context carries none');
  }
  return ctx.identifier;
};

/**
 * The file endpoint upstream takes a short lived token that the integrator mints into each
 * document's download url. Only the token is lifted from that url; the file is then read through
 * our own, known, gateway base, so a url from upstream can never send the backend anywhere else.
 */
export const fileTokenFrom = (url: string): string | undefined => {
  try {
    const token = new URL(url).searchParams.get('token');
    return token && /^[A-Za-z0-9_-]+$/.test(token) ? token : undefined;
  } catch {
    return undefined;
  }
};

export const createByggrSource = (api: Api = defaultApi): DocumentSourceAdapter => {
  const fetch = async (ctx: DocumentSourceContext): Promise<DocumentSourceResult> => {
    const identifier = requireIdentifier(ctx);
    const caseNumbers = await fetchApplicantErrands(identifier, ctx.user, ctx.signal, api);
    const settled = await Promise.allSettled(caseNumbers.map(caseNumber => fetchErrandDecisions(identifier, caseNumber, ctx.user, ctx.signal, api)));

    let failed = 0;
    const documents = settled.map((result, index) => {
      const caseNumber = caseNumbers[index];

      if (result.status === 'rejected') {
        failed += 1;
        logger.error(`byggR decisions for errand ${caseNumber} could not be fetched: `, result.reason);
        return toBareDocument(caseNumber);
      }
      // A 404 here means the errand list and the decisions endpoint disagree about the applicant;
      // the errand is still listed, there is just nothing more to show about it.
      return result.value ? toDocument(caseNumber, result.value) : toBareDocument(caseNumber);
    });

    return { documents, decisions: [], sources: [{ source: SOURCE, status: failed ? 'UNAVAILABLE' : 'OK' }] };
  };

  const fetchDetails = async (caseNumber: string, ctx: DocumentSourceContext): Promise<SourceDocument | undefined> => {
    if (!ctx.identifier) return undefined;

    const errand = await fetchErrandDecisions(ctx.identifier, caseNumber, ctx.user, ctx.signal, api);
    return errand ? toDocument(caseNumber, errand) : undefined;
  };

  /**
   * The decision is re-read from the party scoped decisions endpoint, which only answers when
   * the identifier is the applicant, and the file is only fetched when the document sits on
   * that decision. The url the request may name is never used; see `fileTokenFrom`.
   */
  const fetchDecisionAttachment = async (decisionNativeId: string, attachmentId: string, ctx: DocumentSourceContext): Promise<string | null> => {
    const parsed = parseDecisionNativeId(decisionNativeId);
    const documentId = toAttachmentId(attachmentId);
    if (!parsed || documentId === undefined || !ctx.identifier) {
      return null;
    }

    const errand = await fetchErrandDecisions(ctx.identifier, parsed.caseNumber, ctx.user, ctx.signal, api).catch(() => undefined);
    const decision = errand?.decisions?.find(candidate => candidate.id === parsed.eventId);
    const document = decision?.documents?.find(candidate => toAttachmentId(candidate.id) === documentId);
    const token = document?.url ? fileTokenFrom(document.url) : undefined;
    if (!token) {
      if (document) {
        logger.error(`byggR document ${documentId} on decision ${parsed.eventId} carries no usable download token`);
      }
      return null;
    }

    const url = `${getApiBase('byggrintegrator')}/${MUNICIPALITY_ID}/files/${documentId}`;

    try {
      const res = await api.get<Buffer>({ url, signal: ctx.signal, params: { token }, responseType: 'arraybuffer' }, ctx.user);
      return res.data ? Buffer.from(res.data).toString('base64') : null;
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  };

  return { source: SOURCE, fetch, fetchDetails, fetchDecisionAttachment };
};

export const byggrSource: DocumentSourceAdapter = createByggrSource();
