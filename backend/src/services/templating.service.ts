import { MUNICIPALITY_ID, TEMPLATING_BASE_URL } from '@config';
import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@utils/logger';
import axios from 'axios';

/**
 * Transport for the templating service.
 *
 * Like caremanagement, templating is reached directly on TEMPLATING_BASE_URL (Drakel), not through
 * the shared API gateway, and (in dev) requires no authorization. We use the "direct" render
 * endpoint: the caller provides the full template contents (here: a finished HTML document) and the
 * service returns a rendered PDF. No template needs to be pre-registered.
 *
 * @see POST /{municipalityId}/render/direct/pdf — body { content: <base64 html> } → { output: <base64 pdf> }
 */

interface DirectRenderResponse {
  /** The rendered PDF, BASE64-encoded. */
  output?: string;
}

/**
 * Renders a finished HTML document to a PDF via templating and returns the raw PDF bytes.
 * Throws an HttpException on any failure so callers that must not proceed without the PDF
 * (e.g. attaching an application sammanställning) fail loudly rather than silently dropping it.
 */
export const renderPdfFromHtml = async (html: string): Promise<Buffer> => {
  const base = String(TEMPLATING_BASE_URL ?? '').replace(/\/+$/, '');
  if (!base) {
    throw new HttpException(500, 'TEMPLATING_BASE_URL is not configured');
  }
  const url = `${base}/${MUNICIPALITY_ID}/render/direct/pdf`;

  try {
    const res = await axios.post<DirectRenderResponse>(
      url,
      { content: Buffer.from(html, 'utf-8').toString('base64') },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const output = res.data?.output;
    if (!output) {
      throw new Error('templating returned an empty output');
    }
    return Buffer.from(output, 'base64');
  } catch (error) {
    logger.error(`[templating] render/direct/pdf failed: ${(error as Error)?.message ?? error}`);
    throw new HttpException(502, 'Kunde inte generera PDF för ansökan');
  }
};
