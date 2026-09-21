import dotenv from 'dotenv';
dotenv.config();
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('Checking email delivery status on Resend API...');
  const check = await resend.emails.get('01a0ae2b-880b-77f5-afaf-4767c251d828');
  console.log('Delivery details:', JSON.stringify(check, null, 2));
}

main().catch((err) => {
  console.error('Error fetching email status:', err);
  process.exit(1);
});
