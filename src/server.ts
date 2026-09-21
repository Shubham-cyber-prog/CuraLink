import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`🚀 CuraLink Auth Server listening on 0.0.0.0:${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🤖 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY?.trim() ? 'Present ✅' : 'Missing ❌'}`);
  console.log(`🤖 GEMINI_MODEL: ${process.env.GEMINI_MODEL?.trim() || '(default: gemini-3.6-flash)'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
