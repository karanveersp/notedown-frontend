import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userId: string;
  private token: string;
  private tokenTimer: any;
  private isAuthenticated: boolean;

  authStatusPublisher = new Subject<boolean>();

  constructor(private router: Router, private http: HttpClient) {}

  getAuthObservable() {
    return this.authStatusPublisher.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }

  notifyListeners(authStatus: boolean) {
    this.isAuthenticated = authStatus;
    this.authStatusPublisher.next(authStatus);
  }

  login(email: string, password: string) {
    this.http
      .post<{ token: string; userId: string; expiresIn: number }>(
        'http://localhost:3000/api/user/login',
        { email: email, password: password }
      )
      .subscribe(res => {
        this.token = res.token;
        if (this.token) {
          this.userId = res.userId;
          // expiresIn logic
          this.setAuthTimer(res.expiresIn);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + (res.expiresIn * 1000));

          console.log('Token expiration date:', expirationDate);

          this.saveAuthData(this.token, this.userId, expirationDate);
          this.notifyListeners(true);
          this.router.navigate(['/notes']);
        }
      });
  }


  logout() {
    this.token = null;
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.notifyListeners(false);
    this.router.navigate(['/']);
  }

  signup(email: string, password: string) {
    this.http
      .post<{
        message: string;
        token: string;
        userId: string;
        expiresIn: number;
      }>('http://localhost:3000/api/user/signup', {
        email: email,
        password: password
      })
      .subscribe(res => {
        console.log(res.message);
        this.token = res.token;
        this.userId = res.userId;
        // expiresIn logic
        this.setAuthTimer(res.expiresIn);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + (res.expiresIn * 1000));

        console.log('Token expiration date:', expirationDate);

        this.saveAuthData(this.token, this.userId, expirationDate);
        this.notifyListeners(true);
        this.router.navigate(['/notes']);
      });
  }

  private setAuthTimer(durationInSeconds: number) {
    console.log('Setting timer:', durationInSeconds);
    this.tokenTimer = setTimeout(() => this.logout(), durationInSeconds * 1000);
  }

  private saveAuthData(token: string, userId, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.clear();
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token: token,
      userId: userId,
      expirationDate: new Date(expirationDate)
    };
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    // check if expiration date is still in future
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.setAuthTimer(expiresIn / 1000);
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.notifyListeners(true);
    }
  }


  // TODO - Implement error message handling for login
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code.
      // The repsonse body may contain clues
      console.error(`Backend returned code ${error.status}`);
      console.error(`body was ${error.error}`);
    }
    // Return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later');
  }
}
