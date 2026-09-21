import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('Sending first email via Resend...');
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'sn343555@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  });

  console.log('Result:', JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error('Error sending email:', err);
  process.exit(1);
});
