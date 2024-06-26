import { Controller, Body, Req, Get, UseBefore, Res, Patch, OnUndefined } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import prisma from '@utils/prisma';
import { IsIn } from 'class-validator';
import { validationMiddleware } from '@/middlewares/validation.middleware';
interface UserData {
  name: string;
  userSettings: any;
}

export class PatchUserSettingsDto {
  @IsIn(['untilRemoved', 'oneMonth', 'twoWeeks'])
  feedbackLifespan: string;
}

@Controller()
export class UserController {
  @Get('/me')
  @OpenAPI({ summary: 'Return current user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser, @Res() response: any): Promise<UserData> {
    const { name } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    let userSettings = await prisma.userSettings.findFirst({
      where: {
        userId: req.user.partyId,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: req.user.partyId,
          feedbackLifespan: 'oneMonth',
          readNotificationsClearedDate: new Date().toISOString(),
        },
      });
    }

    userSettings && delete userSettings.id;
    userSettings && delete userSettings.userId;

    const userData: UserData = {
      userSettings,
      name: name,
    };

    return response.send({ data: userData, message: 'success' });
  }

  @Patch('/settings')
  @OnUndefined(204)
  @OpenAPI({ summary: 'Patch user settings' })
  @UseBefore(authMiddleware, validationMiddleware(PatchUserSettingsDto, 'body'))
  async patchSettings(@Req() req: RequestWithUser, @Body() userData: PatchUserSettingsDto): Promise<void> {
    const { partyId } = req.user;

    const newSettings = await prisma.userSettings.update({
      where: {
        userId: partyId,
      },
      data: userData,
    });

    newSettings && delete newSettings.id;
    newSettings && delete newSettings.userId;
  }
}
