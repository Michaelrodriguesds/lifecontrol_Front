import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-shell">
      <div class="login-logo">
        <span class="logo-bolt">&#x26A1;</span>
        <span class="logo-name">LifeControl</span>
      </div>
      <p class="login-tagline">Gerencie suas metas e finanças</p>

      <div class="auth-tabs">
        <button class="auth-tab" [class.active]="isLogin()" (click)="setMode('login')">Entrar</button>
        <button class="auth-tab" [class.active]="!isLogin()" (click)="setMode('register')">Criar conta</button>
      </div>

      <div class="login-card">
        <div class="error-msg" *ngIf="error()">&#x26A0;&#xFE0F; {{ error() }}</div>

        <div class="field" *ngIf="!isLogin()">
          <label>Nome *</label>
          <input type="text" [(ngModel)]="name" placeholder="Seu nome" autocomplete="name" />
        </div>

        <div class="field">
          <label>Email *</label>
          <input type="email" [(ngModel)]="email"
            placeholder="seu&#64;email.com" autocomplete="email" />
        </div>

        <div class="field">
          <label>Senha *</label>
          <div class="pass-wrap">
            <input [type]="passType()" [(ngModel)]="password"
              placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
              autocomplete="current-password" />
            <button class="pass-eye" (click)="togglePass()" type="button">
              {{ showPass ? '&#x1F648;' : '&#x1F441;&#xFE0F;' }}
            </button>
          </div>
        </div>

        <button class="btn btn-primary" style="width:100%;margin-top:4px;justify-content:center"
          (click)="submit()" [disabled]="loading()">
          {{ btnLabel() }}
        </button>
      </div>

      <div class="login-footer">LifeControl &#169; {{ year }}</div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
    }

    .login-logo {
      display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
    }
    .logo-bolt { font-size: 36px; }
    .logo-name {
      font-size: 28px; font-weight: 900; letter-spacing: -1px;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .login-tagline {
      font-size: 14px; color: var(--text-3);
      margin-bottom: 28px; text-align: center;
    }

    .auth-tabs {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--r-full);
      padding: 4px;
      margin-bottom: 20px;
      width: 100%; max-width: 360px;
    }

    .auth-tab {
      flex: 1; padding: 9px; border: none; border-radius: var(--r-full);
      background: transparent; color: var(--text-3);
      font-size: 14px; font-weight: 600; font-family: var(--font);
      cursor: pointer; transition: all .2s;
      -webkit-tap-highlight-color: transparent;
    }
    .auth-tab.active {
      background: var(--indigo); color: #fff;
      box-shadow: 0 4px 12px rgba(99,102,241,.4);
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--r-xl);
      padding: 24px 20px;
      width: 100%; max-width: 360px;
    }

    .error-msg {
      background: var(--red-t); border: 1px solid var(--red);
      color: var(--red); border-radius: var(--r-sm);
      padding: 10px 14px; font-size: 13px; font-weight: 500;
      margin-bottom: 14px;
    }

    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 44px !important; }
    .pass-eye {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 16px;
      padding: 4px; line-height: 1;
    }

    .login-footer {
      margin-top: 32px; font-size: 12px; color: var(--text-3);
    }
  `],
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  mode    = signal<'login' | 'register'>('login');
  loading = signal(false);
  error   = signal('');

  showPass = false;
  name     = '';
  email    = '';
  password = '';
  year     = new Date().getFullYear();

  isLogin()  { return this.mode() === 'login'; }
  passType() { return this.showPass ? 'text' : 'password'; }
  togglePass()  { this.showPass = !this.showPass; }
  setMode(m: 'login' | 'register') { this.mode.set(m); this.error.set(''); }

  btnLabel() {
    if (this.loading()) return 'Aguarde...';
    return this.isLogin() ? 'Entrar' : 'Criar conta';
  }

  submit() {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Preencha email e senha.'); return;
    }
    if (!this.isLogin() && !this.name) {
      this.error.set('Informe seu nome.'); return;
    }
    if (this.password.length < 6) {
      this.error.set('Senha deve ter pelo menos 6 caracteres.'); return;
    }

    this.loading.set(true);
    const obs = this.isLogin()
      ? this.auth.login(this.email, this.password)
      : this.auth.register(this.name, this.email, this.password);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading.set(false);
        const msg = err?.error?.detail || 'Erro ao autenticar. Tente novamente.';
        this.error.set(msg);
      },
    });
  }
}