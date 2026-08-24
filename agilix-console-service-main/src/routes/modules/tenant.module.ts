import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../../models/tenant.model';
import { EmailTemplate } from '../../models/email-template.model';
import { TenantRepository } from '../../repositories/modules/tenant.repository';
import { EmailTemplateRepository } from '../../repositories/modules/email-template.repository';
import { TenantService } from '../../service/modules/tenants/tenant.service';
import { TenantController } from '../../controllers/modules/tenants/tenant.controller';
import { AuditLogModule } from './audit-log.module';
import { RealtimeModule } from './realtime.module';
import { NotificationModule } from './notification.module';
import { WebhookDispatcherService } from '../../service/modules/webhook-dispatcher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, EmailTemplate]),
    AuditLogModule,
    RealtimeModule,
    NotificationModule,
  ],
  controllers: [TenantController],
  providers: [
    TenantRepository,
    EmailTemplateRepository,
    TenantService,
    WebhookDispatcherService,
  ],
  exports: [TenantService],
})
export class TenantModule {}
