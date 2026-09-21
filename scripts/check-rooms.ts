import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const apiKey = process.env.DAILY_API_KEY;
  const res = await fetch('https://api.daily.co/v1/rooms', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const data = await res.json();
  console.log('Daily rooms:', JSON.stringify(data, null, 2));
}

check().catch(console.error);
