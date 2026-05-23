import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../core/services/data.services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-top">
        <div>
          <div class="page-title">Olá 👋</div>
          <div class="page-sub">{{ today }}</div>
        </div>
      </div>

      <!-- Skeletons -->
      <ng-container *ngIf="loading()">
        <div class="skel" style="height:80px;margin-bottom:10px"></div>
        <div class="skel" style="height:80px;margin-bottom:10px"></div>
        <div class="skel" style="height:160px;margin-bottom:10px"></div>
      </ng-container>

      <!-- KPIs -->
      <ng-container *ngIf="d()">
        <div class="kpi-row">
          <div class="kpi-card kpi-indigo">
            <div class="kpi-top">
              <span class="kpi-emoji">🎯</span>
              <span class="badge badge-indigo">Metas</span>
            </div>
            <div class="kpi-val">{{ d().goals.total_invested | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="kpi-sub">{{ d().goals.active }} ativas · {{ d().goals.completed }} concluídas</div>
          </div>
          <div class="kpi-card kpi-red">
            <div class="kpi-top">
              <span class="kpi-emoji">💸</span>
              <span class="badge badge-red">Gastos</span>
            </div>
            <div class="kpi-val">{{ d().expenses.monthly | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="kpi-sub">este mês</div>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card kpi-amber">
            <div class="kpi-top">
              <span class="kpi-emoji">⏳</span>
              <span class="badge badge-amber">Futuros</span>
            </div>
            <div class="kpi-val">{{ d().expenses.pending_future | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="kpi-sub" [class.overdue]="d().expenses.overdue_count > 0">
              {{ d().expenses.overdue_count > 0 ? d().expenses.overdue_count + ' em atraso ⚠️' : 'tudo em dia ✓' }}
            </div>
          </div>
          <div class="kpi-card kpi-green">
            <div class="kpi-top">
              <span class="kpi-emoji">📦</span>
              <span class="badge badge-green">Itens</span>
            </div>
            <div class="kpi-val">{{ d().items.total_value | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="kpi-sub">{{ d().items.count }} cadastrados</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card mt-16">
          <div class="chart-head">
            <span class="chart-ttl">Gastos mensais</span>
            <span class="badge badge-gray">12 meses</span>
          </div>
          <div class="bar-wrap">
            <div *ngFor="let m of d().charts.monthly_expenses" class="bar-col"
                 [title]="m.month + ': R$' + m.total.toFixed(0)">
              <div class="bar-fill" [style.height.%]="barH(m.total)"></div>
              <span class="bar-lbl">{{ m.month }}</span>
            </div>
          </div>
        </div>

        <!-- Top categories -->
        <div class="card mt-16" *ngIf="d().charts.top_categories.length">
          <div class="chart-ttl" style="margin-bottom:14px">Por categoria</div>
          <div *ngFor="let c of d().charts.top_categories" class="cat-row">
            <span class="cat-name">{{ c.category }}</span>
            <div class="cat-track">
              <div class="cat-fill" [style.width.%]="catPct(c.total)"></div>
            </div>
            <span class="cat-val">{{ c.total | currency:'BRL':'symbol':'1.0-0' }}</span>
          </div>
        </div>

        <!-- Quick nav -->
        <div class="quick-grid mt-16">
          <a routerLink="/goals"    class="quick-btn"><span>🎯</span><span>Metas</span></a>
          <a routerLink="/expenses" class="quick-btn"><span>💸</span><span>Novo gasto</span></a>
          <a routerLink="/items"    class="quick-btn"><span>📦</span><span>Itens</span></a>
          <a routerLink="/settings" class="quick-btn"><span>⚙️</span><span>Config</span></a>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }

    .kpi-card {
      border-radius: var(--r-lg);
      padding: 16px;
      border: 1px solid transparent;
      display: flex; flex-direction: column; gap: 6px;
    }
    .kpi-card.kpi-indigo { background: var(--indigo-t); border-color: rgba(99,102,241,.25); }
    .kpi-card.kpi-red    { background: var(--red-t);    border-color: rgba(239,68,68,.25); }
    .kpi-card.kpi-amber  { background: var(--amber-t);  border-color: rgba(245,158,11,.25); }
    .kpi-card.kpi-green  { background: var(--green-t);  border-color: rgba(34,197,94,.25); }

    .kpi-top { display: flex; align-items: center; justify-content: space-between; }
    .kpi-emoji { font-size: 20px; }
    .kpi-val { font-size: 20px; font-weight: 800; color: var(--text-1); letter-spacing: -.5px; }
    .kpi-sub { font-size: 11px; color: var(--text-3); font-weight: 500; }
    .kpi-sub.overdue { color: var(--red); }

    .mt-16 { margin-top: 16px; }

    .chart-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .chart-ttl  { font-size: 14px; font-weight: 700; color: var(--text-1); }

    .bar-wrap {
      display: flex; align-items: flex-end; gap: 3px;
      height: 100px; overflow-x: auto; padding-bottom: 22px;
    }
    .bar-col {
      flex: 1; min-width: 20px;
      display: flex; flex-direction: column; align-items: center;
      height: 100%; justify-content: flex-end; position: relative;
    }
    .bar-fill {
      width: 100%; min-height: 3px;
      background: linear-gradient(180deg,#6366f1,#818cf8);
      border-radius: 3px 3px 0 0;
      transition: height .5s ease;
    }
    .bar-lbl {
      position: absolute; bottom: 0;
      font-size: 8px; color: var(--text-3); white-space: nowrap;
    }

    .cat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cat-name { font-size: 12px; color: var(--text-2); width: 90px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cat-track { flex: 1; height: 5px; background: var(--bg-elevated); border-radius: 3px; overflow: hidden; }
    .cat-fill  { height: 100%; background: linear-gradient(90deg,#6366f1,#a78bfa); border-radius: 3px; transition: width .6s; }
    .cat-val   { font-size: 12px; font-weight: 700; color: var(--text-1); min-width: 70px; text-align: right; }

    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px; }
    .quick-btn {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 16px 12px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      text-decoration: none; color: var(--text-2);
      font-size: 12px; font-weight: 600;
      transition: all .18s;
      -webkit-tap-highlight-color: transparent;
    }
    .quick-btn span:first-child { font-size: 24px; }
    .quick-btn:hover { border-color: var(--indigo); color: var(--indigo); background: var(--indigo-t); }
  `],
})
export class DashboardComponent implements OnInit {
  private svc = inject(AnalyticsService);
  d = signal<any>(null);
  loading = signal(true);

  get today() {
    return new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  }

  ngOnInit() {
    this.svc.dashboard().subscribe({
      next: v => { this.d.set(v); this.loading.set(false); },
      error: () => { this.d.set(this.mock()); this.loading.set(false); },
    });
  }

  barH(v: number) {
    const max = Math.max(...this.d().charts.monthly_expenses.map((m:any)=>m.total), 1);
    return (v/max)*100;
  }
  catPct(v: number) {
    const max = Math.max(...this.d().charts.top_categories.map((c:any)=>c.total), 1);
    return (v/max)*100;
  }

  private mock() {
    const mo = ['Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai'];
    return {
      goals:    { total:4, active:3, completed:1, total_invested:14800, total_target:55000 },
      expenses: { monthly:3600, all_time:31000, pending_future:6200, overdue_count:1 },
      items:    { count:5, total_value:128000 },
      charts: {
        monthly_expenses: mo.map(m=>({ month:m, total:Math.random()*4500+800 })),
        top_categories: [
          { category:'Alimentação', total:1400 },
          { category:'Transporte',  total:900  },
          { category:'Lazer',       total:700  },
          { category:'Saúde',       total:500  },
          { category:'Outros',      total:250  },
        ],
      },
    };
  }
}
