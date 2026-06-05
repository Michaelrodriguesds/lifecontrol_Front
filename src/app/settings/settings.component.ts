import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-top">
        <div>
          <div class="page-title">Configurações ⚙️</div>
          <div class="page-sub">Personalize sua experiência</div>
        </div>
      </div>

      <!-- Perfil -->
      <div class="card mb-16">
        <div class="section-title">Minha Conta</div>
        <div class="profile-row">
          <div class="profile-avatar">{{ initial() }}</div>
          <div class="profile-info">
            <div class="profile-name">{{ user()?.name || '—' }}</div>
            <div class="profile-email">{{ user()?.email || '—' }}</div>
          </div>
        </div>
        <button class="logout-full" (click)="logout()">
          🚪 Sair da conta
        </button>
      </div>

      <!-- Preferências -->
      <div class="card mb-16">
        <div class="section-title">Preferências</div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Moeda padrão</div>
            <div class="setting-desc">Utilizada em toda a aplicação</div>
          </div>
          <select class="setting-select" [(ngModel)]="currency">
            <option value="BRL">🇧🇷 Real (R$)</option>
            <option value="USD">🇺🇸 Dólar (US$)</option>
            <option value="EUR">🇪🇺 Euro (€)</option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Alertas de vencimento</div>
            <div class="setting-desc">Notificar gastos próximos do vencimento</div>
          </div>
          <label class="toggle">
            <input type="checkbox" [(ngModel)]="notifications" />
            <span class="toggle-track"></span>
          </label>
        </div>

        <div class="setting-row" *ngIf="notifications">
          <div class="setting-info">
            <div class="setting-label">Dias de antecedência</div>
            <div class="setting-desc">Quantos dias antes do vencimento alertar</div>
          </div>
          <input type="number" class="setting-input-sm"
            [(ngModel)]="alertDays" min="1" max="30" />
        </div>
      </div>

      <!-- Sobre -->
      <div class="card">
        <div class="section-title">Sobre o App</div>
        <div class="about-row">
          <span class="about-label">Versão</span>
          <span class="about-val">1.0.0</span>
        </div>
        <div class="about-row">
          <span class="about-label">Aplicativo</span>
          <span class="about-val">LifeControl</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .mb-16 { margin-bottom: 16px; }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: .6px;
      margin-bottom: 16px;
    }

    /* Perfil */
    .profile-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }

    .profile-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      color: #fff;
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .profile-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-1);
    }

    .profile-email {
      font-size: 12px;
      color: var(--text-3);
      margin-top: 2px;
    }

    .logout-full {
      width: 100%;
      padding: 11px;
      border-radius: var(--r-sm, 8px);
      border: 1px solid rgba(239,68,68,.3);
      background: rgba(239,68,68,.07);
      color: #ef4444;
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font, inherit);
      cursor: pointer;
      transition: all .18s;
    }

    .logout-full:hover {
      background: rgba(239,68,68,.15);
      border-color: rgba(239,68,68,.5);
    }

    /* Linhas de configuração */
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--border);
      gap: 16px;
    }

    .setting-row:last-child { border-bottom: none; }

    .setting-info { flex: 1; }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-1);
    }

    .setting-desc {
      font-size: 12px;
      color: var(--text-3);
      margin-top: 2px;
    }

    .setting-select {
      padding: 8px 12px;
      background: var(--bg-elevated, rgba(255,255,255,.05));
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-1);
      font-size: 13px;
      font-family: var(--font, inherit);
      outline: none;
    }

    .setting-input-sm {
      width: 70px;
      padding: 8px 10px;
      background: var(--bg-elevated, rgba(255,255,255,.05));
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-1);
      font-size: 14px;
      font-family: var(--font, inherit);
      text-align: center;
      outline: none;
    }

    /* Toggle */
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .toggle input { opacity: 0; width: 0; height: 0; }

    .toggle-track {
      position: absolute;
      inset: 0;
      background: var(--bg-elevated, rgba(255,255,255,.08));
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: background .25s;
    }

    .toggle-track::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--text-3);
      border-radius: 50%;
      transition: transform .25s, background .25s;
    }

    .toggle input:checked + .toggle-track {
      background: var(--indigo, #6366f1);
      border-color: var(--indigo, #6366f1);
    }

    .toggle input:checked + .toggle-track::before {
      transform: translate(20px, -50%);
      background: #fff;
    }

    /* Sobre */
    .about-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }

    .about-row:last-child { border-bottom: none; }
    .about-label { color: var(--text-3); }
    .about-val   { color: var(--text-1); font-weight: 600; }
  `],
})
export class SettingsComponent {
  private auth = inject(AuthService);

  currency      = 'BRL';
  notifications = true;
  alertDays     = 7;

  user    = this.auth.currentUser;

  initial() {
    return (this.auth.currentUser()?.name || '?').charAt(0).toUpperCase();
  }

  logout() {
    this.auth.logout();
  }
}