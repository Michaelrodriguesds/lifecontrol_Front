import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AnalyticsService } from '../core/services/data.services';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-top">
        <div>
          <div class="page-title">Analytics 📈</div>
          <div class="page-sub">Visão financeira completa</div>
        </div>
      </div>

      <!-- Skeletons -->
      <ng-container *ngIf="loading()">
        <div class="skel" style="height:100px;margin-bottom:10px"></div>
        <div class="skel" style="height:180px;margin-bottom:10px"></div>
        <div class="skel" style="height:200px"></div>
      </ng-container>

      <ng-container *ngIf="d()">
        <!-- KPI strip -->
        <div class="a-kpis">
          <div class="a-kpi">
            <span class="a-kpi-icon">🎯</span>
            <span class="a-kpi-val indigo">{{ d().goals.total_invested | currency:'BRL':'symbol':'1.0-0' }}</span>
            <span class="a-kpi-lbl">Investido</span>
          </div>
          <div class="a-kpi">
            <span class="a-kpi-icon">💸</span>
            <span class="a-kpi-val red">{{ d().expenses.monthly | currency:'BRL':'symbol':'1.0-0' }}</span>
            <span class="a-kpi-lbl">Mês atual</span>
          </div>
          <div class="a-kpi">
            <span class="a-kpi-icon">✅</span>
            <span class="a-kpi-val green">{{ d().goals.completed }}/{{ d().goals.total }}</span>
            <span class="a-kpi-lbl">Metas</span>
          </div>
          <div class="a-kpi">
            <span class="a-kpi-icon">⚠️</span>
            <span class="a-kpi-val amber">{{ d().expenses.overdue_count }}</span>
            <span class="a-kpi-lbl">Atrasos</span>
          </div>
        </div>

        <!-- Monthly chart -->
        <div class="card" style="margin-top:14px">
          <div class="a-chart-head">
            <span class="a-chart-ttl">Evolução 12 meses</span>
            <span class="badge badge-gray">gastos</span>
          </div>
          <div class="a-bars">
            <div *ngFor="let m of d().charts.monthly_expenses" class="a-bar-col"
              [title]="m.month + ': R$' + m.total.toFixed(0)">
              <div class="a-bar" [style.height.%]="barH(m.total)"></div>
              <span class="a-bar-lbl">{{ m.month }}</span>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="card" style="margin-top:14px" *ngIf="d().charts.top_categories.length">
          <div class="a-chart-ttl" style="margin-bottom:16px">Top categorias</div>
          <div *ngFor="let c of d().charts.top_categories; let i=index" class="a-cat-row">
            <div class="a-cat-rank">#{{ i+1 }}</div>
            <div style="flex:1">
              <div class="a-cat-head">
                <span class="a-cat-name">{{ c.category }}</span>
                <span class="a-cat-val">{{ c.total | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <div class="a-cat-track">
                <div class="a-cat-fill" [style.width.%]="catPct(c.total)" [style.background]="catColors[i]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Goals ring -->
        <div class="card" style="margin-top:14px">
          <div class="a-chart-ttl" style="margin-bottom:16px">Progresso das metas</div>
          <div class="ring-section">
            <svg viewBox="0 0 120 120" class="ring-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-elevated)" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" stroke-width="10"
                stroke-linecap="round" stroke-dasharray="314"
                [attr.stroke-dashoffset]="ringOffset()"
                transform="rotate(-90 60 60)"
                style="transition:stroke-dashoffset 1s ease"/>
              <text x="60" y="56" text-anchor="middle" fill="var(--text-1)" font-size="18" font-weight="800" font-family="Inter">{{ investPct() | number:'1.0-0' }}%</text>
              <text x="60" y="72" text-anchor="middle" fill="var(--text-3)" font-size="10" font-family="Inter">investido</text>
            </svg>
            <div class="ring-stats">
              <div class="ring-stat">
                <span class="rs-lbl">Investido</span>
                <span class="rs-val indigo">{{ d().goals.total_invested | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <div class="ring-stat">
                <span class="rs-lbl">Alvo total</span>
                <span class="rs-val">{{ d().goals.total_target | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <div class="ring-stat">
                <span class="rs-lbl">Faltam</span>
                <span class="rs-val amber">{{ (d().goals.total_target - d().goals.total_invested) | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <div class="ring-stat">
                <span class="rs-lbl">Pendências</span>
                <span class="rs-val red">{{ d().expenses.pending_future | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .a-kpis {
      display:grid; grid-template-columns:repeat(4,1fr); gap:8px;
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--r-lg); padding:14px 10px;
    }
    .a-kpi { display:flex; flex-direction:column; align-items:center; gap:3px; }
    .a-kpi-icon { font-size:18px; }
    .a-kpi-val  { font-size:15px; font-weight:800; color:var(--text-1); }
    .a-kpi-val.indigo { color:var(--indigo); }
    .a-kpi-val.red    { color:var(--red); }
    .a-kpi-val.green  { color:var(--green); }
    .a-kpi-val.amber  { color:var(--amber); }
    .a-kpi-lbl  { font-size:10px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.3px; }

    .a-chart-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .a-chart-ttl  { font-size:14px; font-weight:700; color:var(--text-1); }

    .a-bars { display:flex; align-items:flex-end; gap:3px; height:120px; overflow-x:auto; padding-bottom:22px; }
    .a-bar-col { flex:1; min-width:20px; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; position:relative; }
    .a-bar { width:100%; min-height:3px; background:linear-gradient(180deg,#6366f1,#818cf8); border-radius:3px 3px 0 0; transition:height .6s ease; }
    .a-bar-lbl { position:absolute; bottom:0; font-size:8px; color:var(--text-3); white-space:nowrap; }

    .a-cat-row    { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
    .a-cat-rank   { font-size:12px; font-weight:700; color:var(--text-3); width:20px; }
    .a-cat-head   { display:flex; justify-content:space-between; margin-bottom:4px; }
    .a-cat-name   { font-size:13px; color:var(--text-2); }
    .a-cat-val    { font-size:13px; font-weight:700; color:var(--text-1); }
    .a-cat-track  { height:5px; background:var(--bg-elevated); border-radius:3px; overflow:hidden; }
    .a-cat-fill   { height:100%; border-radius:3px; transition:width .8s ease; }

    .ring-section { display:flex; align-items:center; gap:20px; }
    .ring-svg     { width:130px; height:130px; flex-shrink:0; }
    .ring-stats   { flex:1; display:flex; flex-direction:column; gap:10px; }
    .ring-stat    { display:flex; flex-direction:column; gap:2px; }
    .rs-lbl       { font-size:11px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.3px; }
    .rs-val       { font-size:14px; font-weight:700; color:var(--text-1); }
    .rs-val.indigo{ color:var(--indigo); }
    .rs-val.amber { color:var(--amber); }
    .rs-val.red   { color:var(--red); }
  `],
})
export class AnalyticsComponent implements OnInit {
  private svc = inject(AnalyticsService);
  d = signal<any>(null);
  loading = signal(true);
  catColors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#38bdf8'];

  ngOnInit() {
    this.svc.dashboard().subscribe({
      next: v => { this.d.set(v); this.loading.set(false); },
      error: () => { this.d.set(this.mock()); this.loading.set(false); },
    });
  }

  barH(v:number) { const m=Math.max(...this.d().charts.monthly_expenses.map((x:any)=>x.total),1); return (v/m)*100; }
  catPct(v:number) { const m=Math.max(...this.d().charts.top_categories.map((x:any)=>x.total),1); return (v/m)*100; }
  investPct() { const d=this.d(); return d&&d.goals.total_target ? Math.min(100,(d.goals.total_invested/d.goals.total_target)*100) : 0; }
  ringOffset() { return 314-(314*this.investPct()/100); }

  private mock() {
    const mo=['Jun','Jul','Ago','Set','Out','Nov','Dez','Jan','Fev','Mar','Abr','Mai'];
    return {
      goals:{total:5,active:3,completed:2,total_invested:18500,total_target:60000},
      expenses:{monthly:4200,all_time:52000,pending_future:7800,overdue_count:1},
      items:{count:6,total_value:132000},
      charts:{
        monthly_expenses:mo.map(m=>({month:m,total:Math.random()*5000+1500})),
        top_categories:[
          {category:'Alimentação',total:1800},{category:'Transporte',total:1200},
          {category:'Moradia',total:800},{category:'Lazer',total:650},{category:'Saúde',total:420},
        ],
      },
    };
  }
}
