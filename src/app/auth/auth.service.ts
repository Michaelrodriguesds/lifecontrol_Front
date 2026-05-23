import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private base   = environment.apiUrl;

  currentUser = signal<AuthUser | null>(null);
  isLoading   = signal(false);

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('lc_token') || environment.devMode;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.base}/api/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('lc_token', res.access_token);
        this.currentUser.set(res.user);
      })
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<any>(`${this.base}/api/auth/register`, { name, email, password }).pipe(
      tap(res => {
        localStorage.setItem('lc_token', res.access_token);
        this.currentUser.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('lc_token');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  checkToken() {
    const token = localStorage.getItem('lc_token');
    if (!token) return;
    this.http.get<AuthUser>(`${this.base}/api/auth/me`).subscribe({
      next: u => this.currentUser.set(u),
      error: () => this.logout(),
    });
  }
}
