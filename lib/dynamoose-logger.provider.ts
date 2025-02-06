/* eslint-disable @typescript-eslint/unbound-method */
import { LoggerService } from '@nestjs/common';

type Message = {
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  category: string;
  message: string;
};

export class LoggerProvider {
  constructor(private readonly logger: LoggerService) {}

  log(message: Message): void {
    let method: (message: string) => void;
    switch (message.level) {
      case 'fatal':
      case 'error':
        method = this.logger.error;
        break;
      case 'warn':
        method = this.logger.warn;
        break;
      case 'info':
        method = this.logger.log;
        break;
      case 'debug':
      case 'trace':
        method = this.logger.log;
        break;
    }

    method.bind(this.logger)(
      message.category
        ? `${message.category} - ${message.message}`
        : message.message,
    );
  }
}
