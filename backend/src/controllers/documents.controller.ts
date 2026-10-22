import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { DocumentDetails, DocumentsOverview } from '@/interfaces/document.interface';
import { ApiResponse } from '@/interfaces/service';
import authMiddleware from '@/middlewares/auth.middleware';
import { DocumentDetailsApiResponse, DocumentsOverviewApiResponse } from '@/responses/document.response';
import { DocumentSourceContext } from '@/services/documents/document-source';
import { getDecisionAttachment, getDocumentDetails, getDocumentsOverview } from '@/services/documents/documents.service';
import { getRepresentedPartyId } from '@/utils/getRepresentedPartyId';
import { Controller, Get, Param, Req, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

@Controller()
@UseBefore(authMiddleware)
export class DocumentsController {
  private getContext(req: RequestWithUser): DocumentSourceContext {
    const { representing } = req.session ?? {};

    const partyId = getRepresentedPartyId(representing, req.user);
    if (!partyId) {
      throw new HttpException(400, 'No representing entity found in session');
    }

    const controller = new AbortController();
    req.on('aborted', () => {
      controller.abort();
      req.destroy();
    });

    return { partyId, user: req.user, signal: controller.signal };
  }

  @Get('/documents')
  @OpenAPI({ summary: 'Return the documents of the current representing entity with the decisions each one owns, plus decisions no document owns' })
  @ResponseSchema(DocumentsOverviewApiResponse)
  async getDocuments(@Req() req: RequestWithUser): Promise<ApiResponse<DocumentsOverview>> {
    const data = await getDocumentsOverview(this.getContext(req));

    return { data, message: 'success' };
  }

  @Get('/documents/decisions/:decisionId/attachments/:attachmentId')
  @OpenAPI({ summary: 'Return the content of a decision attachment, base64 encoded' })
  async getDecisionAttachment(
    @Req() req: RequestWithUser,
    @Param('decisionId') decisionId: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<ApiResponse<string>> {
    const base64 = await getDecisionAttachment(decisionId, attachmentId, this.getContext(req));

    // Deliberately a 404 rather than an empty success, so the client can show an error instead
    // of downloading an empty file.
    if (!base64) {
      throw new HttpException(404, 'Attachment not found');
    }

    return { data: base64, message: 'success' };
  }

  @Get('/documents/:id')
  @OpenAPI({ summary: 'Return one document with its decisions and the source payload the detail page needs' })
  @ResponseSchema(DocumentDetailsApiResponse)
  async getDocument(@Req() req: RequestWithUser, @Param('id') id: string): Promise<ApiResponse<DocumentDetails>> {
    const data = await getDocumentDetails(id, this.getContext(req));

    if (!data) {
      throw new HttpException(404, 'Document not found');
    }

    return { data, message: 'success' };
  }
}
