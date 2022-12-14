import pino = require('pino');
import { ILogger, ILoggerConfig, TLoggerParameters } from './types';
import { LOGGER_LEVEL_MAP } from './constants';
import { colorize, createErrorlog, createLog } from './utils';

class Logger implements ILogger {
  private logger;

  constructor(config: ILoggerConfig) {
    const { level: levelKey, target } = config;
    const level = LOGGER_LEVEL_MAP[levelKey];
    const toConsole = { target: 'pino-pretty', level, options: {} };
    const toStdOut = {
      target: 'pino/file',
      level,
      options: { destination: 1 },
    };
    const transport =  target === 'stdout' ? toStdOut : toConsole;
    const options = { level, transport };
    this.logger = pino.default(options);
  }

  fatal(...message: TLoggerParameters) {
    const [error, errorMmessage] = createErrorlog(message);
    this.logger.fatal(error, colorize(errorMmessage, 'FATAL'));
  }

  error(...message: TLoggerParameters) {
    const [error, errorMmessage] = createErrorlog(message);
    this.logger.error(error, colorize(errorMmessage, 'ERROR'));
  }

  warn(...message: TLoggerParameters) {
    const [first, second] = createErrorlog(message);
    this.logger.warn(first, colorize(second, 'WARN'));
  }

  info(...message: TLoggerParameters) {
    const [first, second] = createLog(message);
    this.logger.info(first, colorize(second, 'INFO'));
  }

  debug(...message: TLoggerParameters) {
    const [first, second] = createLog(message);
    this.logger.debug(first, colorize(second, 'DEBUG'));
  }
}

export = Logger;
