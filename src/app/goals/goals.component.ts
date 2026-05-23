import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GoalsService, Goal } from '../core/services/goals.service';

const PRI: Record<string, { label:string; badge:string; dot:string }> = {
  low:      { label:'Baixa',   badge:'badge-green', dot:'#22c55e' },
  medium:   { label:'Média',   badge:'badge-amber', dot:'#f59e0b' },
  high:     { label:'Alta',    badge:'badge-red',   dot:'#ef4444' },
  critical: { label:'Crítica', badge:'badge-red',   dot:'#ef4444' },
};

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-top">
        <div>
          <div class="page-title">Metas 🎯</div>
          <div class="page-sub">{{ goals().length }} meta{{ goals().length !== 1 ? 's' : '' }}</div>
        </div>
        <span class="badge badge-green">{{ completed() }} concluída{{ completed() !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Filter chips -->
      <div class="chip-group" style="margin-bottom:16px">
        <button class="chip" [class.selected]="fil()==='all'"       (click)="fil.set('all')">Todas</button>
        <button class="chip" [class.selected]="fil()==='active'"    (click)="fil.set('active')">Ativas</button>
        <button class="chip red"   [class.selected]="fil()==='high'"  (click)="fil.set('high')">🔴 Alta</button>
        <button class="chip green" [class.selected]="fil()==='low'"   (click)="fil.set('low')">🟢 Baixa</button>
        <button class="chip"       [class.selected]="fil()==='done'"  (click)="fil.set('done')">✅ Concluídas</button>
      </div>

      <!-- List -->
      <div *ngIf="visible().length > 0; else empty">
        <div class="goal-card animate-in" *ngFor="let g of visible(); trackBy: trackId">
          <div class="pri-stripe" [style.background]="priDot(g.priority)"></div>

          <div class="goal-body">
            <!-- Top -->
            <div class="goal-top">
              <div class="goal-info">
                <div class="goal-title">{{ g.title }}</div>
                <div class="goal-badges">
                  <span class="badge" [ngClass]="priBadge(g.priority)">
                    {{ priIcon(g.priority) }} {{ priLabel(g.priority) }}
                  </span>
                  <span class="badge badge-gray">{{ statusLabel(g.status) }}</span>
                  <span class="badge badge-sky" *ngIf="g.category">{{ g.category }}</span>
                </div>
              </div>
              <div class="goal-acts">
                <button class="btn-icon" (click)="openTx(g)" title="Investir">＋</button>
                <button class="btn-icon" (click)="openEdit(g)" title="Editar">✏️</button>
                <button class="btn-icon danger" (click)="del(g.id!)" title="Excluir">🗑</button>
              </div>
            </div>

            <!-- Amounts -->
            <div class="goal-amts">
              <div class="amt">
                <span class="amt-l">Investido</span>
                <span class="amt-v">{{ g.current_amount | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <span class="amt-arr">→</span>
              <div class="amt">
                <span class="amt-l">Meta</span>
                <span class="amt-v indigo">{{ g.target_amount | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
              <span class="amt-arr">·</span>
              <div class="amt">
                <span class="amt-l">Faltam</span>
                <span class="amt-v muted">{{ g.remaining_amount | currency:'BRL':'symbol':'1.0-0' }}</span>
              </div>
            </div>

            <!-- Progress -->
            <div class="progress-wrap" style="margin-top:10px">
              <div class="progress-track">
                <div class="progress-fill"
                  [style.width.%]="g.progress_percent"
                  [style.background]="progGrad(g.priority, g.progress_percent)">
                </div>
              </div>
              <span class="progress-pct">{{ g.progress_percent | number:'1.0-1' }}%</span>
            </div>

            <div class="goal-dl" *ngIf="g.deadline">
              📅 {{ g.deadline | date:'dd/MM/yyyy' }}
            </div>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty">
          <div class="empty-icon">🎯</div>
          <h3>Nenhuma meta aqui</h3>
          <p>Toque no + para criar sua primeira meta.</p>
        </div>
      </ng-template>

      <button class="btn-fab" (click)="openNew()">+</button>
    </div>

    <!-- Sheet: criar/editar -->
    <div class="sheet-overlay" *ngIf="showForm()" (click)="bgClose($event)">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">{{ editingId ? 'Editar Meta' : 'Nova Meta' }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Título *</label>
            <input formControlName="title" placeholder="Ex: Viagem, Notebook..." />
          </div>

          <div class="fields-row">
            <div class="field">
              <label>Valor alvo (R$) *</label>
              <input type="number" formControlName="target_amount" placeholder="10000" />
            </div>
            <div class="field">
              <label>Prazo</label>
              <input type="date" formControlName="deadline" />
            </div>
          </div>

          <div class="field">
            <label>Prioridade</label>
            <div class="chip-group">
              <button type="button" class="chip green"
                [class.selected]="form.value.priority === 'low'"
                (click)="form.patchValue({priority:'low'})">🟢 Baixa</button>
              <button type="button" class="chip amber"
                [class.selected]="form.value.priority === 'medium'"
                (click)="form.patchValue({priority:'medium'})">🟡 Média</button>
              <button type="button" class="chip red"
                [class.selected]="form.value.priority === 'high'"
                (click)="form.patchValue({priority:'high'})">🔴 Alta</button>
            </div>
          </div>

          <div class="field">
            <label>Categoria</label>
            <input formControlName="category" placeholder="Ex: Viagem, Investimento..." />
          </div>

          <div class="field">
            <label>Descrição</label>
            <textarea formControlName="description" placeholder="Detalhes opcionais..."></textarea>
          </div>

          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost btn-sm" (click)="showForm.set(false)">Cancelar</button>
            <button type="submit" class="btn btn-primary btn-sm" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sheet: transação -->
    <div class="sheet-overlay" *ngIf="showTx()" (click)="bgCloseTx($event)">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Registrar Investimento</div>

        <div class="tx-row">
          <button class="tx-btn" [class.dep]="txType==='deposit'"    (click)="txType='deposit'">➕ Depósito</button>
          <button class="tx-btn" [class.wit]="txType==='withdrawal'" (click)="txType='withdrawal'">➖ Retirada</button>
        </div>

        <div class="field">
          <label>Valor (R$)</label>
          <input type="number" [(ngModel)]="txAmt" placeholder="500" />
        </div>
        <div class="field">
          <label>Descrição</label>
          <input [(ngModel)]="txDesc" placeholder="Opcional" />
        </div>

        <div class="sheet-actions">
          <button class="btn btn-ghost btn-sm" (click)="showTx.set(false)">Cancelar</button>
          <button class="btn btn-primary btn-sm" (click)="submitTx()" [disabled]="!txAmt">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .goal-card {
      display:flex; background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--r-lg); margin-bottom:12px; overflow:hidden;
      transition:border-color .2s;
    }
    .goal-card:hover { border-color:rgba(99,102,241,.4); }

    .pri-stripe { width:4px; flex-shrink:0; }
    .goal-body  { flex:1; padding:14px 14px 14px 12px; min-width:0; }

    .goal-top  { display:flex; gap:8px; align-items:flex-start; margin-bottom:10px; }
    .goal-info { flex:1; min-width:0; }
    .goal-title{
      font-size:15px; font-weight:700; color:var(--text-1);
      margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .goal-badges { display:flex; flex-wrap:wrap; gap:5px; }
    .goal-acts   { display:flex; gap:5px; flex-shrink:0; }

    .goal-amts {
      display:flex; align-items:center; gap:8px;
      background:var(--bg-elevated); border-radius:8px; padding:8px 10px;
    }
    .amt       { display:flex; flex-direction:column; gap:1px; }
    .amt-l     { font-size:10px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.4px; }
    .amt-v     { font-size:13px; font-weight:700; color:var(--text-1); }
    .amt-v.indigo { color:var(--indigo); }
    .amt-v.muted  { color:var(--text-2); }
    .amt-arr   { color:var(--text-3); font-size:12px; flex-shrink:0; }

    .goal-dl { font-size:11px; color:var(--text-3); margin-top:8px; }

    .tx-row { display:flex; gap:10px; margin-bottom:16px; }
    .tx-btn {
      flex:1; padding:10px; border-radius:var(--r-sm);
      background:var(--bg-input); border:1.5px solid var(--border);
      color:var(--text-2); font-size:14px; font-weight:600;
      cursor:pointer; transition:all .18s; font-family:var(--font);
    }
    .tx-btn.dep { border-color:var(--green); background:var(--green-t); color:var(--green); }
    .tx-btn.wit { border-color:var(--red);   background:var(--red-t);   color:var(--red);   }
  `],
})
export class GoalsComponent implements OnInit {
  private svc = inject(GoalsService);
  private fb  = inject(FormBuilder);

  goals    = signal<Goal[]>([]);
  showForm = signal(false);
  showTx   = signal(false);
  fil      = signal('all');
  editingId: string | null = null;
  txGoalId: string | null = null;
  txType = 'deposit';
  txAmt  = 0;
  txDesc = '';

  completed = computed(() => this.goals().filter(g => g.status === 'completed').length);

  visible = computed(() => {
    const f = this.fil();
    const list = this.goals();
    if (f === 'high')   return list.filter(g => g.priority === 'high' || g.priority === 'critical');
    if (f === 'low')    return list.filter(g => g.priority === 'low');
    if (f === 'active') return list.filter(g => g.status === 'active');
    if (f === 'done')   return list.filter(g => g.status === 'completed');
    return list;
  });

  form = this.fb.group({
    title:         ['', Validators.required],
    target_amount: [null as any, [Validators.required, Validators.min(1)]],
    priority:      ['medium'],
    category:      [''],
    deadline:      [''],
    description:   [''],
  });

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll().subscribe({
      next: (g: Goal[]) => this.goals.set(g),
      error: () => this.goals.set(this.mock()),
    });
  }

  openNew() {
    this.editingId = null;
    this.form.reset({ priority: 'medium' });
    this.showForm.set(true);
  }

  openEdit(g: Goal) {
    this.editingId = g.id || null;
    this.form.patchValue({
      title:         g.title,
      target_amount: g.target_amount,
      priority:      g.priority,
      category:      g.category || '',
      deadline:      '',
      description:   '',
    });
    this.showForm.set(true);
  }

  submit() {
    if (this.form.invalid) return;
    const val: any = { ...this.form.value };
    if (val.deadline) val.deadline = new Date(val.deadline).toISOString();
    const obs = this.editingId
      ? this.svc.update(this.editingId, val)
      : this.svc.create(val);
    obs.subscribe(() => { this.load(); this.showForm.set(false); });
  }

  del(id: string) {
    if (confirm('Excluir esta meta?')) this.svc.delete(id).subscribe(() => this.load());
  }

  openTx(g: Goal) {
    this.txGoalId = g.id!;
    this.txAmt = 0; this.txDesc = ''; this.txType = 'deposit';
    this.showTx.set(true);
  }

  submitTx() {
    if (!this.txAmt || !this.txGoalId) return;
    this.svc.addTransaction(this.txGoalId, {
      amount: this.txAmt,
      type: this.txType as 'deposit' | 'withdrawal',
      description: this.txDesc,
    }).subscribe(() => { this.load(); this.showTx.set(false); });
  }

  bgClose(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sheet-overlay')) this.showForm.set(false);
  }
  bgCloseTx(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sheet-overlay')) this.showTx.set(false);
  }

  trackId(_: number, g: Goal) { return g.id; }

  priDot(p: string)   { return PRI[p]?.dot   || '#6366f1'; }
  priBadge(p: string) { return PRI[p]?.badge  || 'badge-gray'; }
  priLabel(p: string) { return PRI[p]?.label  || p; }
  priIcon(p: string)  {
    if (p === 'high' || p === 'critical') return '🔴';
    if (p === 'low') return '🟢';
    return '🟡';
  }

  statusLabel(s: string) {
    return ({ active:'Ativa', completed:'Concluída', paused:'Pausada', cancelled:'Cancelada' } as any)[s] || s;
  }

  progGrad(priority: string, pct: number) {
    if (pct >= 100) return 'linear-gradient(90deg,#22c55e,#4ade80)';
    if (priority === 'high' || priority === 'critical') return 'linear-gradient(90deg,#ef4444,#f87171)';
    if (priority === 'low')  return 'linear-gradient(90deg,#22c55e,#4ade80)';
    return 'linear-gradient(90deg,#6366f1,#a78bfa)';
  }

  private mock(): Goal[] {
    return [
      { id:'1', title:'Viagem Europa',    target_amount:20000, current_amount:8500,  progress_percent:42.5, remaining_amount:11500, status:'active',    priority:'high',   color:'#ef4444' },
      { id:'2', title:'Notebook Novo',    target_amount:8000,  current_amount:8000,  progress_percent:100,  remaining_amount:0,     status:'completed', priority:'low',    color:'#22c55e' },
      { id:'3', title:'Fundo Emergência', target_amount:15000, current_amount:3200,  progress_percent:21.3, remaining_amount:11800, status:'active',    priority:'medium', color:'#f59e0b' },
      { id:'4', title:'Carro Novo',       target_amount:50000, current_amount:5000,  progress_percent:10,   remaining_amount:45000, status:'active',    priority:'high',   category:'Veículo', color:'#ef4444' },
    ];
  }
}