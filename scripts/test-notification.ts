import dotenv from 'dotenv';
dotenv.config();
import { NotificationService } from '../src/services/notification.service';

async function testNotification() {
  const service = new NotificationService();
  console.log('Testing CuraLink NotificationService with Resend...');
  const result = await service.send({
    recipientId: 'test-user',
    recipientEmail: 'sn343555@gmail.com',
    subject: 'CuraLink Verification Test',
    body: 'Aapka CuraLink healthcare notification system Resend ke saath bilkul sahi kaam kar raha hai!',
    channels: ['EMAIL'],
  });

  console.log('Notification Service Result:', result);
}

testNotification().catch(console.error);
