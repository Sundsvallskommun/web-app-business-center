import { Body, Param, Delete, Controller, Get, HttpCode, Post, Req, Patch, UseBefore, OnUndefined } from 'routing-controllers';
import authMiddleware from '@middlewares/auth.middleware';
import { HttpException } from '@/exceptions/HttpException';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { IsString } from 'class-validator';
import ApiService from '@/services/api.service';
import { ApiResponseMeta } from '@/interfaces/service';
import { MUNICIPALITY_ID } from '@/config';

interface Response {
  data: NoteApiResponse;
  message: string;
}

interface NoteApiResponse {
  notes: NoteResponse[];
  _meta: ApiResponseMeta;
}

export interface NoteResponse {
  subject: string;
  body: string;
  caseId: string;
  caseLink: string;
  caseType: string;
  externalCaseId: string;
  createdBy: string;
  created: string;
  modified: string;
  modifiedBy: string;
  context: string;
  role: string;
  clientId: string;
}

export type NewNoteOmittedTypes = 'created' | 'modified' | 'modifiedBy';
export interface NewNote extends Omit<NoteResponse, NewNoteOmittedTypes> {
  partyId: string;
}

export type EditNoteOmittedTypes = 'created' | 'modified' | 'createdBy';
export interface EditNote extends Omit<NoteResponse, EditNoteOmittedTypes> {
  partyId: string;
}

export class CreateNoteDto {
  @IsString()
  subject: string;
  @IsString()
  body: string;
  @IsString()
  caseId: string;
  @IsString()
  caseLink: string;
  @IsString()
  caseType: string;
  @IsString()
  externalCaseId: string;
}

@Controller()
export class NotesController {
  private apiService = new ApiService();

  @Get('/notes')
  @OpenAPI({ summary: 'Get a list of notes for current logged in user' })
  @UseBefore(authMiddleware)
  async notes(@Req() req: RequestWithUser): Promise<Response> {
    const { organizationId } = req?.session?.representing;
    const url = `notes/4.0/${MUNICIPALITY_ID}/notes`;
    const params = { partyId: organizationId, municipalityId: `2281` };
    const res = await this.apiService.get<NoteApiResponse>({ url, params });
    if (Array.isArray(res.data?.notes) && res.data?.notes.length < 1) {
      throw new HttpException(404, 'Not Found');
    }
    return { data: res.data, message: 'success' };
  }

  @Post('/notes')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create a new note for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateNoteDto, 'body'))
  async newNote(@Req() req: RequestWithUser, @Body() userData: CreateNoteDto): Promise<any> {
    const { user } = req;
    const { organizationId } = req?.session?.representing;

    const newNote: NewNote = {
      ...userData,
      context: 'MP_BUSINESS_NOTES',
      role: 'BUSINESS_USER',
      clientId: 'MP_BUSINESS',
      partyId: organizationId,
      createdBy: user.name,
    };
    const url = `notes/4.0/${MUNICIPALITY_ID}/notes`;
    const res = await this.apiService.post({ url, data: newNote });
    return { data: res.data, message: 'created' };
  }

  @Patch('/notes/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Edit a note for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateNoteDto, 'body'))
  async editNote(@Req() req: RequestWithUser, @Param('id') id: string, @Body() userData: CreateNoteDto): Promise<void> {
    const { user } = req;
    const { organizationId } = req?.session?.representing;

    const editNote: EditNote = {
      ...userData,
      context: 'MP_BUSINESS_NOTES',
      role: 'BUSINESS_USER',
      clientId: 'MP_BUSINESS',
      partyId: organizationId,
      modifiedBy: user.name,
    };

    const url = `notes/4.0/${MUNICIPALITY_ID}/notes/${id}`;
    await this.apiService.patch({ url, data: editNote });
  }

  @Delete('/notes/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Remove a note for current logged in user' })
  @UseBefore(authMiddleware)
  async deleteNote(@Req() req: RequestWithUser, @Param('id') id: string): Promise<void> {
    const url = `notes/4.0/${MUNICIPALITY_ID}/notes/${id}`;
    await this.apiService.delete({ url });
  }
}
