import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(data: EmailData) {
  try {
    const msg = {
      to: data.to,
      from: data.from || process.env.FROM_EMAIL!,
      subject: data.subject,
      html: data.html,
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function generateInvoiceEmail(invoice: { id: string; client_name: string; client_email: string; total: number; due_date: string; business_name?: string }, pdfUrl?: string): EmailData {
  const subject = `Invoice #${invoice.id} from ${invoice.business_name || 'Invox'}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Invoice #${invoice.id}</h2>
      <p>Dear ${invoice.client_name},</p>
      <p>Please find your invoice attached. The total amount due is <strong>$${invoice.total}</strong>.</p>
      <p>Due date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
      ${pdfUrl ? `<p><a href="${pdfUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>` : ''}
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>${invoice.business_name || 'Invox Team'}</p>
    </div>
  `;

  return {
    to: invoice.client_email,
    subject,
    html,
  };
}

export function generateReminderEmail(invoice: { id: string; client_name: string; client_email: string; total: number; due_date: string; business_name?: string }, daysOverdue: number): EmailData {
  const subject = `Payment Reminder: Invoice #${invoice.id} - ${daysOverdue} days overdue`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Payment Reminder</h2>
      <p>Dear ${invoice.client_name},</p>
      <p>This is a friendly reminder that Invoice #${invoice.id} is ${daysOverdue} days overdue.</p>
      <p>Amount due: <strong>$${invoice.total}</strong></p>
      <p>Original due date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
      <p>Please arrange payment at your earliest convenience to avoid any late fees.</p>
      <p>If you've already made the payment, please disregard this reminder.</p>
      <p>Best regards,<br>${invoice.business_name || 'Invox Team'}</p>
    </div>
  `;

  return {
    to: invoice.client_email,
    subject,
    html,
  };
}