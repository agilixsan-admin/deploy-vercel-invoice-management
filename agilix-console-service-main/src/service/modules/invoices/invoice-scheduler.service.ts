import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InvoiceRepository } from '../../../repositories/modules/invoice.repository';
import { Invoice } from '../../../models/invoice.model';

@Injectable()
export class InvoiceSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(InvoiceSchedulerService.name);

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    const reminderSchedule =
      this.configService.get<string>('cron.reminderSchedule') ?? '0 8 * * *';
    const overdueSchedule =
      this.configService.get<string>('cron.overdueSchedule') ?? '0 9 * * *';

    // Vercel Serverless doesn't support background cron jobs via SchedulerRegistry.
    // In the future, this should be exposed as an HTTP endpoint triggered by Vercel Cron.
    this.logger.warn('Cron jobs disabled. Vercel Serverless does not support background Node.js cron jobs.');


  }

  /**
   * Scan invoice PENDING due H-0 sampai H-3 yang belum pernah dikirim reminder.
   * Set reminderSentAt setelah job di-enqueue supaya tidak dikirim lagi.
   */
  async handleReminderScan(): Promise<void> {
    this.logger.log(
      '⏰ [Cron] Starting invoice reminder scan (due H-0 to H-3)',
    );

    try {
      const invoices = await this.invoiceRepository.findDueForReminder(3);

      if (invoices.length === 0) {
        this.logger.log('[Cron] No invoices due for reminder today');
        return;
      }

      this.logger.log(
        `[Cron] Found ${invoices.length} invoice(s) due for reminder`,
      );

      let queued = 0;
      for (const invoice of invoices) {
        if (!invoice.tenant) {
          this.logger.warn(
            `[Cron] Invoice ${invoice.id} has no tenant, skipping`,
          );
          continue;
        }

        // Logic temporarily disabled for Vercel deployment. 
        // Need to use MailService directly here in the future.

        // Set flag supaya tidak dikirim lagi
        await this.invoiceRepository.updateFlags(invoice.id, {
          reminderSentAt: new Date(),
        });

        queued++;
      }

      this.logger.log(`[Cron] Reminder scan done — ${queued} job(s) queued`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Cron] Reminder scan failed: ${msg}`);
    }
  }

  /**
   * Scan invoice PENDING overdue yang belum pernah dikirim notifikasi.
   * Set overdueNotifiedAt setelah job di-enqueue.
   *
   * Juga scan invoice overdue yang sudah dikirim notifikasi H+3 lalu (follow-up).
   * Set overdueFollowUpAt setelah job di-enqueue.
   */
  async handleOverdueScan(): Promise<void> {
    this.logger.log('⏰ [Cron] Starting invoice overdue scan');

    try {
      // --- Notifikasi overdue pertama kali ---
      const overdueInvoices = await this.invoiceRepository.findOverdue();

      if (overdueInvoices.length > 0) {
        this.logger.log(
          `[Cron] Found ${overdueInvoices.length} overdue invoice(s) (first notification)`,
        );

        let queued = 0;
        for (const invoice of overdueInvoices) {
          if (!invoice.tenant) {
            this.logger.warn(
              `[Cron] Invoice ${invoice.id} has no tenant, skipping`,
            );
            continue;
          }

          // Logic temporarily disabled for Vercel deployment. 

          // Set flag supaya tidak dikirim lagi
          await this.invoiceRepository.updateFlags(invoice.id, {
            overdueNotifiedAt: new Date(),
          });

          queued++;
        }

        this.logger.log(`[Cron] Overdue scan done — ${queued} job(s) queued`);
      } else {
        this.logger.log('[Cron] No new overdue invoices today');
      }

      // --- Follow-up H+3 dari notifikasi overdue pertama ---
      const followUpInvoices =
        await this.invoiceRepository.findOverdueFollowUp();

      if (followUpInvoices.length > 0) {
        this.logger.log(
          `[Cron] Found ${followUpInvoices.length} overdue invoice(s) for H+3 follow-up`,
        );

        let queued = 0;
        for (const invoice of followUpInvoices) {
          if (!invoice.tenant) {
            this.logger.warn(
              `[Cron] Invoice ${invoice.id} has no tenant, skipping`,
            );
            continue;
          }

          // Logic temporarily disabled for Vercel deployment.

          // Set flag supaya tidak dikirim lagi
          await this.invoiceRepository.updateFlags(invoice.id, {
            overdueFollowUpAt: new Date(),
          });

          queued++;
        }

        this.logger.log(`[Cron] Follow-up scan done — ${queued} job(s) queued`);
      } else {
        this.logger.log('[Cron] No overdue follow-up invoices today');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Cron] Overdue scan failed: ${msg}`);
    }
  }


}
