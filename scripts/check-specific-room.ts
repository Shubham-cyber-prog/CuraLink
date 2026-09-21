import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const apiKey = process.env.DAILY_API_KEY;
  const res = await fetch('https://api.daily.co/v1/rooms/curalink-655c44e8-8b1a-4b-5a4bef96', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  console.log('Room check status:', res.status);
  const data = await res.json();
  console.log('Room check response:', JSON.stringify(data, null, 2));
}

check().catch(console.error);
