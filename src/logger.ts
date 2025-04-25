import log4js from 'log4js';
import * as fs from 'fs';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: path.join(logsDir, 'media-sorter.log'),
      maxLogSize: 10 * 1024 * 1024, // 10MB
      backups: 5,
      compress: true
    },
    fileRotate: {
      type: 'dateFile',
      filename: path.join(logsDir, 'media-sorter.log'),
      pattern: '.yyyy-MM-dd',
      keepFileExt: true,
      maxLogSize: 10 * 1024 * 1024, // 10MB
      numBackups: 5,
      compress: true
    }
  },
  categories: {
    default: {
      appenders: ['console', 'fileRotate'],
      level: 'info'
    }
  }
});

const logger = log4js.getLogger();
export default logger;
