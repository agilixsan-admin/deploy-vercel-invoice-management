import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../../models/invoice.model';
import { Tenant } from '../../models/tenant.model';
import { InvoiceRepository } from '../../repositories/modules/invoice.repository';
import { TenantRepository } from '../../repositories/modules/tenant.repository';
import { InvoiceService } from '../../service/modules/invoices/invoice.service';
import { InvoiceSchedulerService } from '../../service/modules/invoices/invoice-scheduler.service';
import { InvoiceController } from '../../controllers/modules/invoices/invoice.controller';
import { AuditLogModule } from './audit-log.module';
import { RealtimeModule } from './realtime.module';
import { NotificationModule } from './notification.module';
import { EmailTemplate } from '../../models/email-template.model';
import { EmailTemplateRepository } from '../../repositories/modules/email-template.repository';
import { InvoicePdfService } from '../../service/modules/invoices/invoice-pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Tenant, EmailTemplate]),
    AuditLogModule,
    RealtimeModule,
    NotificationModule,
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceRepository,
    TenantRepository,
    InvoiceService,
    InvoiceSchedulerService,
    EmailTemplateRepository,
    InvoicePdfService,
  ],
  exports: [InvoiceService, InvoiceRepository],
})
export class InvoiceModule {}
