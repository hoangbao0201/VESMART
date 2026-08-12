import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        code = HttpStatus[status] ?? 'ERROR';
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        if (typeof obj.message === 'string') message = obj.message;
        else if (Array.isArray(obj.message)) {
          message = (obj.message as string[]).join('; ');
        }
        const err = obj.error;
        if (err && typeof err === 'object') {
          const e = err as Record<string, unknown>;
          if (typeof e.code === 'string') code = e.code;
          if ('details' in e) details = e.details;
        } else if (typeof err === 'string') {
          code = err.toUpperCase().replace(/\s+/g, '_');
        } else {
          code = HttpStatus[status] ?? 'ERROR';
        }
        if (obj.details !== undefined) details = obj.details;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      error: { code, details },
    });
  }
}
