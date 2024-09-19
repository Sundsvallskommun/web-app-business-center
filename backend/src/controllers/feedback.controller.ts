import { Controller, Body, Post, HttpCode, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { validationMiddleware } from '@middlewares/validation.middleware';
import { IsString } from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import { FEEDBACK_EMAIL, MUNICIPALITY_ID } from '@config';
import authMiddleware from '@/middlewares/auth.middleware';
import ApiService from '@/services/api.service';

const messageHTML = (body: string) => {
  const lines = sanitizeHtml(body, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .split('\n')
    .map(line => (line ? '<p>' + line + '</p>' : '<br>'))
    .join('');
  const msg = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback för Mina sidor företag</title>
</head>
<body>
    <p><strong>Användarens feedback:</strong></p>
    ${lines}
</body>
</html>
  `;
  return msg.trim();
};

const message = (body: string) => {
  const msg = body;
  return msg.trim();
};

const base64Encode = (str: string) => {
  return Buffer.from(str, 'utf-8').toString('base64');
};

export class FeedbackDto {
  @IsString()
  body: string;
}

@Controller()
export class FeedbackController {
  private apiService = new ApiService();

  @Post('/feedback')
  @HttpCode(201)
  @OpenAPI({ summary: 'Send feedback to chosen email adresses' })
  @UseBefore(authMiddleware, validationMiddleware(FeedbackDto, 'body'))
  async sendFeedback(@Body() userData: FeedbackDto): Promise<any> {
    const mailAdresses = FEEDBACK_EMAIL.split(',');
    mailAdresses.forEach(async email => {
      const sendFeedback = {
        sender: {
          name: 'Mina sidor företag',
          address: 'no-reply@sundsvall.se',
        },
        emailAddress: email,
        subject: 'Feedback för Mina sidor företag',
        message: message(userData.body),
        htmlMessage: base64Encode(messageHTML(userData.body)),
      };
      const url = `messaging/5.0/${MUNICIPALITY_ID}/email`;
      const res = await this.apiService.post({ url, data: sendFeedback });
    });

    return { message: 'feedback sent' };
  }
}
