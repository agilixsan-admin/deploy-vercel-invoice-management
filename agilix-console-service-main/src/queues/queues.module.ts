import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INVOICE_OVERDUE_QUEUE } from './jobs/invoice-overdue.job';
import { INVOICE_REMINDER_QUEUE } from './jobs/invoice-reminder.job';
import { EMAIL_NOTIFICATION_QUEUE } from './jobs/email-notification.job';
import { InvoiceOverdueProcessor } from './processors/invoice-overdue.processor';
import { InvoiceReminderProcessor } from './processors/invoice-reminder.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { RealtimeModule } from '../routes/modules/realtime.module';
import { NotificationModule } from '../routes/modules/notification.module';
import { EmailTemplate } from '../models/email-template.model';
import { EmailTemplateRepository } from '../repositories/modules/email-template.repository';
import { InvoicePdfService } from '../service/modules/invoices/invoice-pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    RealtimeModule,
    NotificationModule,
  ],
  providers: [
    EmailTemplateRepository,
    InvoicePdfService,
  ],
  exports: [],
})
export class QueuesModule {}
