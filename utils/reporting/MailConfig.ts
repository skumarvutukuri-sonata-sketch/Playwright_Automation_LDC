export interface MailConfiguration {

  host: string;

  port: number;

  secure: boolean;

  username: string;

  password: string;

  from: string;

  to: string[];

  cc?: string[];

  bcc?: string[];

  subjectPrefix: string;

}

export class MailConfig {

  /**
   * Read configuration from .env
   */
  static get(): MailConfiguration {

    return {

      host: process.env.SMTP_HOST ?? '',

      port: Number(process.env.SMTP_PORT ?? 587),

      secure: process.env.SMTP_SECURE === 'true',

      username: process.env.SMTP_USERNAME ?? '',

      password: process.env.SMTP_PASSWORD ?? '',

      from: process.env.EMAIL_FROM ?? '',

      to: (process.env.EMAIL_TO ?? '')
        .split(',')
        .map(email => email.trim())
        .filter(Boolean),

      cc: (process.env.EMAIL_CC ?? '')
        .split(',')
        .map(email => email.trim())
        .filter(Boolean),

      bcc: (process.env.EMAIL_BCC ?? '')
        .split(',')
        .map(email => email.trim())
        .filter(Boolean),

      subjectPrefix:
        process.env.EMAIL_SUBJECT_PREFIX ??
        '[Automation]'

    };

  }

}