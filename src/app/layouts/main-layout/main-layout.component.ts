import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="shell">
      <!-- Top header -->
      <header class="topbar">
        <div class="topbar-logo">
          <span class="logo-bolt">⚡</span>
          <span class="logo-name">LifeControl</span>
        </div>
        <div class="topbar-dev">DEV</div>
      </header>

      <!-- Page content -->
      <main class="shell-main">
        <router-outlet />
      </main>

      <!-- Bottom tab bar -->
      <nav class="tabbar">
        <a routerLink="/dashboard"  routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">⊞</span>
          <span class="tab-label">Início</span>
        </a>
        <a routerLink="/goals"      routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◎</span>
          <span class="tab-label">Metas</span>
        </a>
        <a routerLink="/expenses"   routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◈</span>
          <span class="tab-label">Gastos</span>
        </a>
        <a routerLink="/notes"      routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◧</span>
          <span class="tab-label">Notas</span>
        </a>
        <a routerLink="/analytics"  routerLinkActive="tab-active" class="tab">
          <span class="tab-icon">◭</span>
          <span class="tab-label">Analytics</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      background: var(--bg);
      overflow: hidden;
    }

    /* ── Topbar ── */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px 10px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }

    .topbar-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-bolt { font-size: 20px; }

    .logo-name {
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -.4px;
    }

    .topbar-dev {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #f59e0b;
      background: rgba(245,158,11,.12);
      border: 1px solid rgba(245,158,11,.3);
      border-radius: 6px;
      padding: 3px 8px;
    }

    /* ── Main ── */
    .shell-main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    /* ── Tab bar ── */
    .tabbar {
      display: flex;
      align-items: stretch;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      height: var(--tab-h);
      flex-shrink: 0;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }

    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-decoration: none;
      color: var(--text-3);
      transition: color .18s;
      -webkit-tap-highlight-color: transparent;
      padding: 6px 4px;
      position: relative;
    }

    .tab:hover { color: var(--text-2); }

    .tab.tab-active { color: var(--indigo); }

    .tab.tab-active::after {
      content: '';
      position: absolute;
      top: 0;
      left: 20%;
      right: 20%;
      height: 2px;
      background: var(--indigo);
      border-radius: 0 0 2px 2px;
    }

    .tab-icon { font-size: 22px; line-height: 1; }

    .tab-label { font-size: 10px; font-weight: 600; letter-spacing: .3px; }
  `],
})
export class MainLayoutComponent {}
