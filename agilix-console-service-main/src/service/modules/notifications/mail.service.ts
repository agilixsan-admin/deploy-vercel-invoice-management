import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port'),
      secure: this.configService.get<number>('smtp.port') === 465,
      auth: {
        user: this.configService.get<string>('smtp.username'),
        pass: this.configService.get<string>('smtp.password'),
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const { to, subject, html, attachments } = options;
    const from = this.configService.get<string>('smtp.from');

    this.logger.log(`Sending email to ${to} with subject "${subject}"`);

    try {
      await this.transporter.sendMail({
        from: `"Agilix" <${from}>`,
        to,
        subject,
        html,
        headers: {
          'X-Mailer': 'Agilix Mailer',
          'List-Unsubscribe': `<mailto:${from}?subject=unsubscribe>`,
        },
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? Buffer.from(a.content, 'base64') : a.content,
          contentType: a.contentType,
        })),
      });

      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${to}: ${reason}`);
      throw error;
    }
  }
}
