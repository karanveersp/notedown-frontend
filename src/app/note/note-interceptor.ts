import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class NoteInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isNotesRequest = req.url.split('/').includes('notes');
    if (isNotesRequest) {
      // Attach jwt token to request
      const token = 'bearer ' + this.authService.getToken();

      const authorizedRequest = req.clone({
        setHeaders: { Authorization: token }
      });

      return next.handle(authorizedRequest);
    } else {
      return next.handle(req);
    }
  }
}
