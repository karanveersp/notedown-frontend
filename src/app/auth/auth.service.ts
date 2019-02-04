import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  users = [
    {
      email: 'test@test.com',
      password: 'pw',
      token: 'tk',
      userId: '123'
    },
    {
      email: 'test2@test.com',
      password: 'pw',
      token: 'tk2',
      userId: '1234'
    }
  ];
  private userId: string;
  private token: string;
  private isAuthenticated: boolean;

  authStatusPublisher = new Subject<boolean>();

  constructor(private router: Router) { }

  getAuthObservable() {
    return this.authStatusPublisher.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  notifyListeners(authStatus: boolean) {
    this.isAuthenticated = authStatus;
    this.authStatusPublisher.next(authStatus);
  }

  login(email: string, password: string) {
    if (this.users.find(u => u.email === email && u.password === password)) {
      // sunny day scenario
      this.token = 'token';
      this.userId = '123';
      this.notifyListeners(true);
      this.router.navigate(['/notes']);
    } else {
      return 'Email or password invalid';
    }
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.notifyListeners(false);
    this.router.navigate(['/']);
  }

  signup(email: string, password: string) {
    this.users.push({
      email: email,
      password: password,
      token: 'tk',
      userId: '12345'
    });
    this.notifyListeners(true);
    this.router.navigate(['/notes']);
  }
}
