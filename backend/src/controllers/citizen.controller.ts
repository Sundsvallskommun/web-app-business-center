import { MUNICIPALITY_ID } from '@/config';
import { getApiBase } from '@/config/api-config';
import { CitizenExtended } from '@/data-contracts/citizen/data-contracts';
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { CitizenApiResponse } from '@/responses/citizen.response';
import ApiService from '@/services/api.service';
import { logger } from '@/utils/logger';
import { Response } from 'express';
import { Body, Controller, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsString, Length } from 'class-validator';

class CitizenLookupDto {
  @IsString()
  @Length(12, 12)
  personnumber: string;
}

@Controller()
export class CitizenController {
  private readonly apiService = new ApiService();
  private readonly apiBase = getApiBase('citizen');
  private readonly baseUrl = `${this.apiBase}/${MUNICIPALITY_ID}`;

  @Post('/citizen')
  @OpenAPI({ summary: 'Return a citizen' })
  @UseBefore(authMiddleware)
  @ResponseSchema(CitizenApiResponse)
  async getCitizen(
    @Req() req: RequestWithUser,
    @Body() body: CitizenLookupDto,
    @Res() res: Response<CitizenApiResponse>,
  ): Promise<Response<CitizenApiResponse>> {
    const { user } = req;
    const guidUrl = `${this.baseUrl}/${body.personnumber}/guid`;
    try {
      const guid = await this.apiService.get<string>({ url: guidUrl }, user);
      if (!guid) {
        throw new HttpException(404, 'No citizen found');
      }
      const url = `${this.baseUrl}/${guid.data}`;
      const citizen = await this.apiService.get<CitizenExtended>({ url }, user);
      return res.send({
        message: 'success',
        data: { personId: citizen.data.personId, givenname: citizen.data.givenname, lastname: citizen.data.lastname },
      });
    } catch (error) {
      logger.error('Error getting citizen', error);
      throw new HttpException(500, 'Error getting citizen');
    }
  }
}
