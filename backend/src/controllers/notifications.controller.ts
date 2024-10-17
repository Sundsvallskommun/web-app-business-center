import { Controller, Body, Req, Get, Post, UseBefore, HttpCode, Delete } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import authMiddleware from '@middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import prisma from '@utils/prisma';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { IsString } from 'class-validator';
interface ReadNotifications {
  caseId: string;
}

interface Response {
  data: ReadNotifications[];
  message: string;
}

export class CreateReadNotificationsDto {
  @IsString()
  caseId: string;
}

@Controller()
export class NotificationsController {
  @Get('/notifications/read')
  @OpenAPI({ summary: 'Return read notifications for user' })
  @UseBefore(authMiddleware)
  async getUser(@Req() req: RequestWithUser): Promise<Response> {
    const { name } = req.user;

    if (!name) {
      throw new HttpException(400, 'Bad Request');
    }

    const userNotifications = await prisma.userReadNotification.findMany({
      where: {
        userId: req.user.partyId,
      },
    });

    const readNotifications = userNotifications.map(x => {
      return { caseId: x.caseId };
    });

    if (Array.isArray(readNotifications) && readNotifications.length < 1) {
      throw new HttpException(404, 'Not Found');
    }

    const resToSend: Response = { data: readNotifications, message: 'success' };
    return resToSend;
  }

  @Post('/notifications/read')
  @HttpCode(201)
  @OpenAPI({ summary: 'Create new read notifications for current logged in user' })
  @UseBefore(authMiddleware, validationMiddleware(CreateReadNotificationsDto, 'body'))
  async newReadNotification(@Req() req: RequestWithUser, @Body() userData: CreateReadNotificationsDto): Promise<any> {
    const { partyId } = req.user;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    await prisma.userReadNotification.create({
      data: {
        userId: partyId,
        caseId: userData.caseId,
      },
    });

    return { message: 'created' };
  }

  @Delete('/notifications/read/all')
  @OpenAPI({ summary: 'Mark all read notifications for current logged in user' })
  @UseBefore(authMiddleware)
  async clearNotifications(@Req() req: RequestWithUser): Promise<any> {
    const { partyId } = req.user;

    if (!partyId) {
      throw new HttpException(400, 'Bad Request');
    }

    await prisma.userReadNotification.deleteMany({
      where: {
        userId: req.user.partyId,
      },
    });

    await prisma.userSettings.update({
      where: {
        userId: req.user.partyId,
      },
      data: {
        readNotificationsClearedDate: new Date().toISOString(),
      },
    });

    return { message: 'all cleared' };
  }
}
