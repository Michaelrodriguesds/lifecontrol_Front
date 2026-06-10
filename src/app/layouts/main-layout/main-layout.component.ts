// src/app/layouts/main-layout/main-layout.component.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-logo">
          <span class="logo-bolt">⚡</span>
          <span class="logo-name">LifeControl</span>
        </div>
        <button class="logout-btn" (click)="logout()" title="Sair">
          <span class="logout-avatar">{{ initial() }}</span>
          <span class="logout-label">Sair</span>
        </button>
      </header>

      <main class="shell-main">
        <router-outlet />
      </main>

      <nav class="tabbar">
        <a routerLink="/dashboard" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">⊞</span>
          <span class="tab-label">Início</span>
        </a>
        <a routerLink="/goals" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◎</span>
          <span class="tab-label">Metas</span>
        </a>
        <a routerLink="/expenses" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◈</span>
          <span class="tab-label">Gastos</span>
        </a>
        <a routerLink="/work" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">🛵</span>
          <span class="tab-label">Trabalho</span>
        </a>
        <a routerLink="/notes" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◧</span>
          <span class="tab-label">Notas</span>
        </a>
        <a routerLink="/analytics" routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◭</span>
          <span class="tab-label">Análise</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .shell {
      display: flex; flex-direction: column;
      height: 100vh; height: 100dvh;
      background: var(--bg); overflow: hidden;
    }

    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px 10px;
      background: var(--bg-card); border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .topbar-logo { display: flex; align-items: center; gap: 8px; }
    .logo-bolt   { font-size: 20px; }
    .logo-name   {
      font-size: 18px; font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: -.4px;
    }

    .logout-btn {
      display: flex; align-items: center; gap: 7px;
      background: var(--bg-elevated, rgba(255,255,255,.04));
      border: 1px solid var(--border); border-radius: 20px;
      padding: 5px 12px 5px 6px; cursor: pointer;
      color: var(--text-2); font-size: 12px; font-weight: 600;
      font-family: var(--font, inherit); transition: all .18s;
    }
    .logout-btn:hover {
      border-color: rgba(239,68,68,.5); color: #ef4444;
      background: rgba(239,68,68,.07);
    }
    .logout-avatar {
      width: 26px; height: 26px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      color: #fff; font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }

    .shell-main {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    .tabbar {
      display: flex; align-items: stretch;
      background: var(--bg-card); border-top: 1px solid var(--border);
      height: var(--tab-h); flex-shrink: 0;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    .tab {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 3px;
      text-decoration: none; color: var(--text-3);
      transition: color .18s; -webkit-tap-highlight-color: transparent;
      padding: 5px 2px; position: relative;
    }
    .tab:hover { color: var(--text-2); }
    .tab.tab-active { color: var(--indigo); }
    .tab.tab-active::after {
      content: ''; position: absolute; top: 0; left: 15%; right: 15%;
      height: 2px; background: var(--indigo); border-radius: 0 0 2px 2px;
    }
    .tab-icon  { font-size: 20px; line-height: 1; }
    .tab-label { font-size: 9px; font-weight: 600; letter-spacing: .2px; }
  `],
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  initial() {
    return (this.auth.currentUser()?.name || '?').charAt(0).toUpperCase();
  }

  logout() {
    this.auth.logout();
  }
}