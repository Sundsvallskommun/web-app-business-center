import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { ApiResponseMeta } from '@/interfaces/service';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import ApiService from '@/services/api.service';
import authMiddleware from '@middlewares/auth.middleware';
import { IsString } from 'class-validator';
import { Body, Controller, Delete, Get, HttpCode, OnUndefined, Param, Patch, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getRepresentingPartyId } from '../utils/getRepresentingPartyId';

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
  municipalityId: string;
}

export type EditNoteOmittedTypes = 'created' | 'modified' | 'createdBy';
export interface EditNote extends Omit<NoteResponse, EditNoteOmittedTypes> {
  partyId: string;
  municipalityId: string;
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
    const { representing } = req?.session;
    const url = `notes/3.1/notes`;
    const params = { partyId: getRepresentingPartyId(representing), municipalityId: `2281` };
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
    const { representing } = req?.session;

    const newNote: NewNote = {
      ...userData,
      context: 'MP_BUSINESS_NOTES',
      role: 'BUSINESS_USER',
      clientId: 'MP_BUSINESS',
      municipalityId: `2281`,
      partyId: getRepresentingPartyId(representing),
      createdBy: user.name,
    };
    const url = 'notes/3.1/notes';
    const res = await this.apiService.post({ url, data: newNote });
    return { data: res.data, message: 'created' };
  }

  @Patch('/notes/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Edit a note for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateNoteDto, 'body'))
  async editNote(@Req() req: RequestWithUser, @Param('id') id: string, @Body() userData: CreateNoteDto): Promise<void> {
    const { user } = req;
    const { representing } = req?.session;

    const editNote: EditNote = {
      ...userData,
      context: 'MP_BUSINESS_NOTES',
      role: 'BUSINESS_USER',
      clientId: 'MP_BUSINESS',
      municipalityId: `2281`,
      partyId: getRepresentingPartyId(representing),
      modifiedBy: user.name,
    };

    const url = `notes/3.1/notes/${id}`;
    await this.apiService.patch({ url, data: editNote });
  }

  @Delete('/notes/:id')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Remove a note for current logged in user' })
  @UseBefore(authMiddleware)
  async deleteNote(@Req() req: RequestWithUser, @Param('id') id: string): Promise<void> {
    const url = `notes/3.1/notes/${id}`;
    await this.apiService.delete({ url });
  }
}
