import winston from 'winston';
import morgan from 'morgan';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(process.cwd(), 'src/assets/logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} : ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),

    new DailyRotateFile({
      dirname: path.join(
        process.cwd(),
        'src/assets/logs/%DATE%'
      ),
      filename: 'access.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),

    new DailyRotateFile({
      dirname: path.join(
        process.cwd(),
        'src/assets/logs/%DATE%'
      ),
      filename: 'error.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    })
  ],
});

const stream = {
  write: (message: string) => logger.info(message.trim()),
};

export const morganMiddleware = morgan(
  ':method :url :status :response-time ms',
  { stream },
);

export { logger };