import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">⚙️ Configurações</h1>
          <p class="page-subtitle">Personalize sua experiência no LifeControl</p>
        </div>
      </div>

      <div class="settings-layout">
        <!-- DEV MODE card -->
        <div class="settings-card dev-card">
          <div class="dev-header">
            <span class="dev-icon">🛠️</span>
            <div>
              <div class="settings-card-title">Modo Desenvolvimento</div>
              <div class="settings-card-sub">Autenticação desabilitada — ideal para desenvolvimento local</div>
            </div>
            <div class="dev-badge-lg">ATIVO</div>
          </div>
          <div class="dev-info">
            <div class="info-row"><span class="info-label">API URL</span><code class="info-val">http://localhost:8000</code></div>
            <div class="info-row"><span class="info-label">Usuário Dev</span><code class="info-val">dev&#64;lifecontrol.app</code></div>
            <div class="info-row"><span class="info-label">Auth</span><code class="info-val">JWT preparado (DEV_MODE=true no .env)</code></div>
          </div>
        </div>

        <!-- App preferences -->
        <div class="settings-card">
          <div class="settings-card-title">Preferências</div>
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
              <div class="setting-desc">Notificar gastos futuros próximos</div>
            </div>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="notifications" />
              <span class="toggle-track"></span>
            </label>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Dias de antecedência</div>
              <div class="setting-desc">Quantos dias antes do vencimento alertar</div>
            </div>
            <input type="number" class="setting-input-sm" [(ngModel)]="alertDays" min="1" max="30" />
          </div>
        </div>

        <!-- Auth section (prepared) -->
        <div class="settings-card">
          <div class="settings-card-title">Autenticação <span class="badge-soon">Em breve</span></div>
          <p class="settings-card-sub" style="margin-bottom:16px">Configure DEV_MODE=false no .env para ativar login obrigatório.</p>
          <div class="auth-fields">
            <div class="form-group"><label>Email</label><input type="email" placeholder="seu@email.com" disabled /></div>
            <div class="form-group"><label>Nova Senha</label><input type="password" placeholder="••••••••" disabled /></div>
            <button class="btn-primary" disabled>Salvar credenciais</button>
          </div>
        </div>

        <!-- DB status -->
        <div class="settings-card">
          <div class="settings-card-title">Banco de Dados</div>
          <div class="db-info">
            <div class="db-row">
              <span>🍃 MongoDB Atlas</span>
              <span class="db-status" [class.connected]="dbConnected()">{{ dbConnected() ? '✅ Conectado' : '🔴 Offline / Verificando...' }}</span>
            </div>
            <div class="db-desc">Configure a variável MONGO_URL no arquivo <code>.env</code> do backend.</div>
            <div class="code-block"><code>MONGO_URL=mongodb+srv://user:pass&#64;cluster.mongodb.net/lifecontrol</code></div>
          </div>
        </div>

        <!-- Stack -->
        <div class="settings-card">
          <div class="settings-card-title">Stack Tecnológica</div>
          <div class="stack-grid">
            <div class="stack-item" *ngFor="let s of stack">
              <span class="stack-icon">{{ s.icon }}</span>
              <div>
                <div class="stack-name">{{ s.name }}</div>
                <div class="stack-version">{{ s.version }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout { display: flex; flex-direction: column; gap: 20px; max-width: 800px; }
    .settings-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .dev-card { border-color: rgba(245,158,11,.4); background: rgba(245,158,11,.05); }
    .dev-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .dev-icon { font-size: 28px; }
    .dev-badge-lg { margin-left: auto; background: rgba(245,158,11,.2); color: #f59e0b; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(245,158,11,.4); letter-spacing: 1px; }
    .settings-card-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
    .settings-card-sub { font-size: 13px; color: var(--text-muted); }
    .dev-info { display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: flex; gap: 12px; align-items: center; font-size: 13px; }
    .info-label { color: var(--text-muted); width: 90px; }
    .info-val { background: var(--bg-hover); padding: 3px 8px; border-radius: 5px; font-size: 12px; color: var(--accent); font-family: monospace; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); gap: 20px; }
    .setting-row:last-child { border-bottom: none; }
    .setting-info { flex: 1; }
    .setting-label { font-size: 14px; font-weight: 500; color: var(--text-primary); }
    .setting-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .setting-select { padding: 8px 12px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 13px; outline: none; }
    .setting-input-sm { width: 70px; padding: 8px 10px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; text-align: center; outline: none; }
    .toggle { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .toggle-track { position: absolute; inset: 0; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 12px; transition: background .3s; }
    .toggle-track::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 50%; transform: translateY(-50%); background: var(--text-muted); border-radius: 50%; transition: transform .3s, background .3s; }
    .toggle input:checked + .toggle-track { background: var(--accent); border-color: var(--accent); }
    .toggle input:checked + .toggle-track::before { transform: translate(20px,-50%); background: white; }
    .auth-fields { display: flex; flex-direction: column; gap: 12px; opacity: .5; }
    .badge-soon { font-size: 10px; background: var(--bg-hover); color: var(--text-muted); padding: 2px 8px; border-radius: 8px; font-weight: 500; }
    .db-info { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .db-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-secondary); }
    .db-status { font-size: 13px; font-weight: 600; color: var(--text-muted); }
    .db-status.connected { color: #10b981; }
    .db-desc { font-size: 13px; color: var(--text-muted); }
    .code-block { background: var(--bg-hover); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; color: #a78bfa; overflow-x: auto; }
    .stack-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 12px; margin-top: 16px; }
    .stack-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--bg-hover); border-radius: 8px; }
    .stack-icon { font-size: 20px; }
    .stack-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .stack-version { font-size: 11px; color: var(--text-muted); }
  `],
})
export class SettingsComponent {
  currency = 'BRL';
  notifications = true;
  alertDays = 7;
  dbConnected = signal(false);

  stack = [
    { icon: '🅰️', name: 'Angular', version: '19+' },
    { icon: '⚡', name: 'FastAPI', version: '0.115' },
    { icon: '🍃', name: 'MongoDB Atlas', version: 'Cloud' },
    { icon: '🐍', name: 'Python', version: '3.12+' },
    { icon: '🎨', name: 'TailwindCSS', version: '4.x' },
    { icon: '🔒', name: 'JWT Auth', version: 'preparado' },
    { icon: '📊', name: 'ApexCharts', version: '3.54' },
    { icon: '🦾', name: 'Beanie ODM', version: '1.27' },
  ];

  constructor() {
    fetch('http://localhost:8000/health')
      .then(() => this.dbConnected.set(true))
      .catch(() => this.dbConnected.set(false));
  }
}
