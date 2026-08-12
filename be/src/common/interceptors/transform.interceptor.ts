import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessEnvelope<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessEnvelope<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        message: 'OK',
        data: (data === undefined ? null : data) as T,
      })),
    );
  }
}
