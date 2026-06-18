// src/app/work/work.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService, WorkDayData, MonthlySummary } from '../core/services/work.service';

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const WEEK_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ── Feriados nacionais de data fixa (válidos todo ano) ──────────────────
const FIXED_HOLIDAYS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Consciência Negra
  '12-25', // Natal
];

// ── Feriados móveis (mudam de data todo ano — Carnaval, Páscoa, Corpus Christi) ──
// Adicione aqui as datas de cada ano conforme necessário.
const MOVABLE_HOLIDAYS: Record<string, string[]> = {
  '2025': ['2025-03-03', '2025-03-04', '2025-04-18', '2025-06-19'],
  '2026': ['2026-02-16', '2026-02-17', '2026-04-03', '2026-06-04'],
};

interface CalCell { day: number; date: string; }

function isSunday(date: string): boolean {
  return new Date(date + 'T12:00:00').getDay() === 0;
}

function isHoliday(date: string): boolean {
  const [year, , monthDay] = [date.substring(0,4), '', date.substring(5)];
  if (FIXED_HOLIDAYS.includes(monthDay)) return true;
  return (MOVABLE_HOLIDAYS[year] || []).includes(date);
}

function suggestedRate(date: string): number {
  return (isSunday(date) || isHoliday(date)) ? 250 : 230;
}

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
<div class="page">

  <div class="page-top">
    <div>
      <div class="page-title">Mercado Livre 🛵</div>
      <div class="page-sub">Controle de dias trabalhados</div>
    </div>
  </div>

  <!-- Navegação de mês -->
  <div class="card month-nav mb-12">
    <button class="nav-btn" (click)="prevMonth()">‹</button>
    <span class="month-label">{{ monthName() }} {{ curYear() }}</span>
    <button class="nav-btn" (click)="nextMonth()" [disabled]="isCurrentMonth()">›</button>
  </div>

  <!-- Calendário -->
  <div class="card mb-12">
    <div class="week-header">
      <span *ngFor="let w of weekLabels">{{ w }}</span>
    </div>
    <div class="cal-grid">
      <div *ngFor="let _ of padding()"></div>
      <div *ngFor="let cell of calCells()"
           class="cal-cell"
           [class.is-today]="cell.date === today"
           [class.is-worked]="isWorked(cell.date)"
           [class.is-special]="isSundayOrHoliday(cell.date) && !isWorked(cell.date)"
           [class.is-future]="isFuture(cell.date)"
           (click)="openSheet(cell)">
        <span class="cal-num">{{ cell.day }}</span>
        <div class="cal-dots" *ngIf="isWorked(cell.date)">
          <span class="dot green">✓</span>
          <span class="dot blue" *ngIf="dayRate(cell.date) === 250">🌟</span>
          <span class="dot amber" *ngIf="dayRate(cell.date) === 220">⬇</span>
          <span class="dot orange" *ngIf="dayFuel(cell.date) > 0">⛽</span>
          <span class="dot red" *ngIf="dayPnr(cell.date) > 0">⚠</span>
        </div>
      </div>
    </div>
    <div class="legend">
      <span class="leg"><span class="ldot green"></span>Trabalhado</span>
      <span class="leg"><span class="ldot blue"></span>R$250</span>
      <span class="leg"><span class="ldot amber"></span>R$220</span>
      <span class="leg"><span class="ldot orange"></span>Combustível</span>
      <span class="leg"><span class="ldot red"></span>PNR</span>
    </div>
  </div>

  <!-- Resumo -->
  <ng-container *ngIf="summary()">
    <div class="section-label">💰 Resumo · {{ monthName() }}</div>

    <div class="card total-card mb-12">
      <div class="total-row">
        <div class="total-block">
          <div class="total-lbl">Dias trabalhados</div>
          <div class="total-val">{{ summary()!.total_worked }}</div>
        </div>
        <div class="total-sep"></div>
        <div class="total-block">
          <div class="total-lbl">Líquido do mês</div>
          <div class="total-val green">{{ summary()!.total_net | currency:'BRL':'symbol':'1.2-2' }}</div>
        </div>
      </div>
    </div>

    <div class="card period-card mb-12">
      <div class="period-head">
        <span class="period-title">📅 Dias 1 a 15</span>
        <span class="period-pay">Pago em {{ summary()!.period1.payment_date }}</span>
      </div>
      <div class="period-stats">
        <div class="pstat">
          <div class="pstat-lbl">Dias</div>
          <div class="pstat-val">{{ summary()!.period1.days_worked }}</div>
        </div>
        <div class="pstat">
          <div class="pstat-lbl">Bruto</div>
          <div class="pstat-val">{{ summary()!.period1.gross | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat" *ngIf="summary()!.period1.fuel_deduction > 0">
          <div class="pstat-lbl">⛽ Combustível</div>
          <div class="pstat-val red">−{{ summary()!.period1.fuel_deduction | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat" *ngIf="summary()!.period1.pnr_deduction > 0">
          <div class="pstat-lbl">⚠️ PNR</div>
          <div class="pstat-val red">−{{ summary()!.period1.pnr_deduction | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat pstat-hl">
          <div class="pstat-lbl">Líquido</div>
          <div class="pstat-val green">{{ summary()!.period1.net | currency:'BRL':'symbol':'1.2-2' }}</div>
        </div>
      </div>
    </div>

    <div class="card period-card mb-12">
      <div class="period-head">
        <span class="period-title">📅 Dias 16 ao final</span>
        <span class="period-pay">Pago em {{ summary()!.period2.payment_date }}</span>
      </div>
      <div class="period-stats">
        <div class="pstat">
          <div class="pstat-lbl">Dias</div>
          <div class="pstat-val">{{ summary()!.period2.days_worked }}</div>
        </div>
        <div class="pstat">
          <div class="pstat-lbl">Bruto</div>
          <div class="pstat-val">{{ summary()!.period2.gross | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat" *ngIf="summary()!.period2.fuel_deduction > 0">
          <div class="pstat-lbl">⛽ Combustível</div>
          <div class="pstat-val red">−{{ summary()!.period2.fuel_deduction | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat" *ngIf="summary()!.period2.pnr_deduction > 0">
          <div class="pstat-lbl">⚠️ PNR</div>
          <div class="pstat-val red">−{{ summary()!.period2.pnr_deduction | currency:'BRL':'symbol':'1.0-0' }}</div>
        </div>
        <div class="pstat pstat-hl">
          <div class="pstat-lbl">Líquido</div>
          <div class="pstat-val green">{{ summary()!.period2.net | currency:'BRL':'symbol':'1.2-2' }}</div>
        </div>
      </div>
    </div>
  </ng-container>

  <div class="card" style="text-align:center;padding:40px 20px"
       *ngIf="summary() && summary()!.total_worked === 0">
    <div style="font-size:44px;margin-bottom:10px">🛵</div>
    <div style="font-size:15px;font-weight:700;color:var(--text-1);margin-bottom:6px">Nenhum dia registrado</div>
    <div style="font-size:13px;color:var(--text-3)">Toque em um dia no calendário para marcar</div>
  </div>

</div>

<!-- Bottom Sheet -->
<div class="sheet-overlay" *ngIf="showSheet()" (click)="bgClose($event)">
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">
      {{ sheetDay?.day }}/{{ padMonth() }}/{{ curYear() }}
      <span style="font-size:13px;font-weight:500;color:var(--text-3);margin-left:6px">
        {{ getDayOfWeek(sheetDay?.date || '') }}
      </span>
    </div>

    <!-- Trabalhei hoje? -->
    <div class="sheet-row">
      <div>
        <div class="sr-label">Trabalhei hoje</div>
        <div class="sr-sub">Marcar como dia trabalhado</div>
      </div>
      <label class="toggle">
        <input type="checkbox" [(ngModel)]="editWorked" />
        <span class="toggle-track"></span>
      </label>
    </div>

    <ng-container *ngIf="editWorked">

      <!-- Valor da diária -->
      <div class="sheet-field">
        <label>💰 Valor da diária</label>
        <div class="rate-options">
          <button type="button" class="rate-chip"
                  [class.selected]="editRate === 250"
                  (click)="editRate = 250">
            R$ 250<br><span class="rate-sub">Domingo/Feriado</span>
          </button>
          <button type="button" class="rate-chip"
                  [class.selected]="editRate === 230"
                  (click)="editRate = 230">
            R$ 230<br><span class="rate-sub">Padrão</span>
          </button>
          <button type="button" class="rate-chip"
                  [class.selected]="editRate === 220"
                  (click)="editRate = 220">
            R$ 220<br><span class="rate-sub">Baixo rendimento</span>
          </button>
        </div>
        <span class="field-hint" *ngIf="isSundayOrHoliday(sheetDay?.date || '')">
          📌 Este dia é domingo ou feriado — sugestão automática: R$250
        </span>
      </div>

      <!-- Combustível -->
      <div class="sheet-field">
        <label>⛽ Combustível — valor gasto (R$)</label>
        <input type="number" [(ngModel)]="editFuel"
               placeholder="0,00 se não abasteceu"
               min="0" step="0.01" />
        <span class="field-hint">Digite o valor real gasto no abastecimento</span>
      </div>

      <!-- PNR -->
      <div class="sheet-field">
        <label>⚠️ PNR — valor da cobrança (R$)</label>
        <input type="number" [(ngModel)]="editPnr"
               placeholder="0,00 se não houve PNR"
               min="0" step="0.01" />
        <span class="field-hint">Pedido Não Recebido gera desconto na diária</span>
      </div>

      <!-- Preview do líquido -->
      <div class="preview-box">
        <span style="font-size:13px;font-weight:600;color:var(--text-2)">Líquido do dia</span>
        <span style="font-size:20px;font-weight:800;color:#22c55e">
          {{ dailyNet() | currency:'BRL':'symbol':'1.2-2' }}
        </span>
      </div>
    </ng-container>

    <div class="sheet-actions">
      <button class="btn-ghost btn-sm" (click)="showSheet.set(false)">Cancelar</button>
      <button class="btn-primary btn-sm" (click)="saveDay()">Salvar</button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .mb-12 { margin-bottom: 12px; }
    .section-label { font-size:12px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:.5px; margin:4px 0 10px; }

    .month-nav { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; }
    .nav-btn { background:var(--bg-elevated,rgba(255,255,255,.06)); border:1px solid var(--border); border-radius:8px; width:34px; height:34px; font-size:20px; color:var(--text-1); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .18s; }
    .nav-btn:hover:not([disabled]) { background:var(--indigo-t); border-color:var(--indigo); }
    .nav-btn[disabled] { opacity:.3; cursor:default; }
    .month-label { font-size:16px; font-weight:700; color:var(--text-1); }

    .week-header { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:6px; }
    .week-header span { text-align:center; font-size:10px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:.3px; padding:4px 0; }

    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
    .cal-cell { aspect-ratio:1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; border:1px solid transparent; transition:all .15s; padding:2px; }
    .cal-cell:hover:not(.is-future) { background:var(--bg-elevated,rgba(255,255,255,.05)); border-color:var(--border); }
    .cal-cell.is-today { border-color:var(--indigo,#6366f1)!important; background:rgba(99,102,241,.08); }
    .cal-cell.is-worked { background:rgba(34,197,94,.12); border-color:rgba(34,197,94,.35)!important; }
    .cal-cell.is-special { background:rgba(99,102,241,.06); }
    .cal-cell.is-future { cursor:default; opacity:.35; pointer-events:none; }

    .cal-num { font-size:13px; font-weight:600; color:var(--text-1); line-height:1; }
    .cal-cell.is-today .cal-num { color:var(--indigo,#6366f1); font-weight:800; }
    .cal-cell.is-worked .cal-num { color:#22c55e; }

    .cal-dots { display:flex; gap:1px; margin-top:2px; justify-content:center; flex-wrap:wrap; }
    .dot { font-size:7px; line-height:1; }
    .dot.green { color:#22c55e; } .dot.blue { color:#6366f1; }
    .dot.amber { color:#f59e0b; } .dot.orange { color:#f59e0b; } .dot.red { color:#ef4444; }

    .legend { display:flex; gap:10px; justify-content:center; margin-top:12px; padding-top:10px; border-top:1px solid var(--border); flex-wrap:wrap; }
    .leg { display:flex; align-items:center; gap:4px; font-size:10px; color:var(--text-3); }
    .ldot { width:7px; height:7px; border-radius:50%; }
    .ldot.green { background:#22c55e; } .ldot.blue { background:#6366f1; }
    .ldot.amber { background:#f59e0b; } .ldot.orange { background:#f59e0b; } .ldot.red { background:#ef4444; }

    .total-card { padding:16px; }
    .total-row { display:flex; align-items:center; gap:16px; }
    .total-block { flex:1; text-align:center; }
    .total-lbl { font-size:11px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.4px; }
    .total-val { font-size:22px; font-weight:800; color:var(--text-1); margin-top:4px; }
    .total-val.green { color:#22c55e; }
    .total-sep { width:1px; height:40px; background:var(--border); }

    .period-card { padding:14px; }
    .period-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .period-title { font-size:13px; font-weight:700; color:var(--text-1); }
    .period-pay { font-size:11px; color:var(--indigo,#6366f1); font-weight:600; }
    .period-stats { display:flex; flex-wrap:wrap; gap:8px; }
    .pstat { background:var(--bg-elevated,rgba(255,255,255,.04)); border:1px solid var(--border); border-radius:8px; padding:8px 12px; min-width:68px; }
    .pstat-hl { border-color:rgba(34,197,94,.35); background:rgba(34,197,94,.07); }
    .pstat-lbl { font-size:10px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.3px; }
    .pstat-val { font-size:14px; font-weight:700; color:var(--text-1); margin-top:2px; }
    .pstat-val.green { color:#22c55e; } .pstat-val.red { color:#ef4444; }

    .sheet-row { display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid var(--border); }
    .sr-label { font-size:14px; font-weight:600; color:var(--text-1); }
    .sr-sub { font-size:12px; color:var(--text-3); margin-top:2px; }

    .sheet-field { padding:14px 0; border-bottom:1px solid var(--border); }
    .sheet-field label { display:block; font-size:12px; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:.4px; margin-bottom:8px; }
    .sheet-field input { width:100%; padding:10px 12px; box-sizing:border-box; background:var(--bg-elevated,rgba(255,255,255,.05)); border:1px solid var(--border); border-radius:8px; color:var(--text-1); font-size:16px; font-family:var(--font,inherit); outline:none; }
    .sheet-field input:focus { border-color:var(--indigo,#6366f1); }
    .field-hint { display:block; font-size:11px; color:var(--text-3); margin-top:5px; }

    /* Seletor de diária */
    .rate-options { display:flex; gap:8px; }
    .rate-chip {
      flex:1; padding:10px 6px; border-radius:10px;
      background:var(--bg-elevated,rgba(255,255,255,.05));
      border:1.5px solid var(--border); color:var(--text-2);
      font-size:14px; font-weight:700; cursor:pointer;
      font-family:var(--font,inherit); transition:all .18s;
      text-align:center; line-height:1.3;
    }
    .rate-chip .rate-sub { font-size:10px; font-weight:500; color:var(--text-3); }
    .rate-chip.selected { border-color:var(--indigo,#6366f1); background:rgba(99,102,241,.12); color:var(--indigo,#6366f1); }
    .rate-chip.selected .rate-sub { color:var(--indigo,#6366f1); }

    .preview-box { display:flex; justify-content:space-between; align-items:center; background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.3); border-radius:10px; padding:12px 16px; margin:16px 0; }

    .toggle { position:relative; display:inline-block; width:44px; height:24px; cursor:pointer; flex-shrink:0; }
    .toggle input { opacity:0; width:0; height:0; }
    .toggle-track { position:absolute; inset:0; background:var(--bg-elevated,rgba(255,255,255,.08)); border:1px solid var(--border); border-radius:12px; transition:background .25s; }
    .toggle-track::before { content:''; position:absolute; width:18px; height:18px; left:3px; top:50%; transform:translateY(-50%); background:var(--text-3); border-radius:50%; transition:transform .25s,background .25s; }
    .toggle input:checked + .toggle-track { background:var(--indigo,#6366f1); border-color:var(--indigo,#6366f1); }
    .toggle input:checked + .toggle-track::before { transform:translate(20px,-50%); background:#fff; }

    .btn-sm { font-size:14px; padding:10px 20px; }
  `],
})
export class WorkComponent implements OnInit {
  private svc = inject(WorkService);

  private _now = new Date();
  curYear      = signal(this._now.getFullYear());
  curMonth     = signal(this._now.getMonth());
  weekLabels   = WEEK_LABELS;
  today        = this._fmt(this._now);
  monthName    = computed(() => MONTHS_PT[this.curMonth()]);

  workDays = signal<WorkDayData[]>([]);
  summary  = signal<MonthlySummary | null>(null);

  showSheet = signal(false);
  sheetDay: CalCell | null = null;
  editWorked = false;
  editRate   = 230;
  editFuel   = 0;
  editPnr    = 0;

  dailyNet = computed(() => {
    if (!this.editWorked) return 0;
    return this.editRate - (this.editFuel || 0) - (this.editPnr || 0);
  });

  padding = computed(() => {
    const first = new Date(this.curYear(), this.curMonth(), 1);
    return new Array(first.getDay());
  });

  calCells = computed((): CalCell[] => {
    const last = new Date(this.curYear(), this.curMonth() + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => {
      const d = i + 1;
      return { day: d, date: this._fmt(new Date(this.curYear(), this.curMonth(), d)) };
    });
  });

  isCurrentMonth() {
    return this.curYear() === this._now.getFullYear() && this.curMonth() === this._now.getMonth();
  }

  ngOnInit() { this.load(); }

  load() {
    const month = this._monthKey();
    this.svc.getDays(month).subscribe({
      next: days => this.workDays.set(days),
      error: ()  => this.workDays.set([]),
    });
    this.svc.getSummary(month).subscribe({
      next: s  => this.summary.set(s),
      error: () => this.summary.set(null),
    });
  }

  prevMonth() {
    if (this.curMonth() === 0) { this.curMonth.set(11); this.curYear.update(y => y - 1); }
    else { this.curMonth.update(m => m - 1); }
    this.load();
  }

  nextMonth() {
    if (this.isCurrentMonth()) return;
    if (this.curMonth() === 11) { this.curMonth.set(0); this.curYear.update(y => y + 1); }
    else { this.curMonth.update(m => m + 1); }
    this.load();
  }

  private _day(date: string) { return this.workDays().find(d => d.date === date); }
  isWorked(date: string)  { return this._day(date)?.worked === true; }
  dayRate(date: string)   { return this._day(date)?.daily_rate ?? 0; }
  dayFuel(date: string)   { return this._day(date)?.fuel_amount ?? 0; }
  dayPnr(date: string)    { return this._day(date)?.pnr_amount ?? 0; }
  isFuture(date: string)  { return date > this.today; }
  isSundayOrHoliday(date: string) { return isSunday(date) || isHoliday(date); }

  getDayOfWeek(date: string) {
    if (!date) return '';
    return WEEK_LABELS[new Date(date + 'T12:00:00').getDay()];
  }

  padMonth() { return String(this.curMonth() + 1).padStart(2, '0'); }

  openSheet(cell: CalCell) {
    if (this.isFuture(cell.date)) return;
    this.sheetDay   = cell;
    const existing  = this._day(cell.date);
    this.editWorked = existing?.worked ?? false;
    // Se já existe registro, usa o valor salvo. Senão, sugere automaticamente.
    this.editRate   = existing?.daily_rate ?? suggestedRate(cell.date);
    this.editFuel   = existing?.fuel_amount ?? 0;
    this.editPnr    = existing?.pnr_amount ?? 0;
    this.showSheet.set(true);
  }

  saveDay() {
    if (!this.sheetDay) return;
    this.svc.saveDay({
      date:        this.sheetDay.date,
      worked:      this.editWorked,
      daily_rate:  this.editRate,
      fuel_amount: this.editFuel || 0,
      pnr_amount:  this.editPnr  || 0,
    }).subscribe(() => { this.showSheet.set(false); this.load(); });
  }

  bgClose(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sheet-overlay'))
      this.showSheet.set(false);
  }

  private _fmt(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  private _monthKey() {
    return `${this.curYear()}-${String(this.curMonth()+1).padStart(2,'0')}`;
  }
}