import { Resend } from 'resend';
import { env } from '../env.js';

const client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!client) {
    console.log('[email:stub]', opts.to, '|', opts.subject);
    return { id: 'stub' };
  }
  const { data, error } = await client.emails.send({
    from: env.EMAIL_FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text,
  });
  if (error) throw new Error(error.message);
  return data!;
}
