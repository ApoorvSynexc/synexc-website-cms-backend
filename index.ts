import initializeDatabase from './src/config/database/index.js';
import { initializeApp } from './src/config/index.js';

process.on('uncaughtException', (err) => {
  console.log(' UNCAUGHT EXCEPTION ');
  console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});
process.on('unhandledRejection', (reason, promise) => {
  console.log(' UNHANDLED REJECTION ');
  console.log('Unhandled Rejection at: ', promise, 'REASON: ', reason);
});

initializeDatabase()
  .then((e) => {
    console.log(e);
    initializeApp();
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
