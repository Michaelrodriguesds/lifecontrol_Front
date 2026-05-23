import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExpensesService, Expense } from '../core/services/data.services';

const CAT_COLORS: Record<string,string> = {
  'Alimentação':'#22c55e','Transporte':'#6366f1','Lazer':'#f59e0b',
  'Saúde':'#ef4444','Educação':'#38bdf8','Moradia':'#8b5cf6','Outros':'#6b7280',
};

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="page">
      <div class="page-top">
        <div>
          <div class="page-title">Gastos 💸</div>
          <div class="page-sub">{{ filtered().length }} registros</div>
        </div>
      </div>

      <!-- Summary strip -->
      <div class="summary-strip">
        <div class="sum-item">
          <span class="sum-lbl">Total</span>
          <span class="sum-val red">{{ total() | currency:'BRL':'symbol':'1.0-0' }}</span>
        </div>
        <div class="sum-div"></div>
        <div class="sum-item">
          <span class="sum-lbl">Registros</span>
          <span class="sum-val">{{ filtered().length }}</span>
        </div>
        <div class="sum-div"></div>
        <div class="sum-item">
          <span class="sum-lbl">Média</span>
          <span class="sum-val">{{ avg() | currency:'BRL':'symbol':'1.0-0' }}</span>
        </div>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input class="search-input" [(ngModel)]="search" placeholder="Buscar gastos..." />
      </div>

      <!-- Category chips -->
      <div class="chip-group" style="margin-bottom:16px; overflow-x:auto; flex-wrap:nowrap; padding-bottom:4px">
        <button class="chip" [class.selected]="catFilter()===''" (click)="catFilter.set('')">Todos</button>
        <button class="chip" *ngFor="let c of cats()"
          [class.selected]="catFilter()===c" (click)="catFilter.set(c)">{{ c }}</button>
      </div>

      <!-- List -->
      <div *ngIf="filtered().length > 0; else empty">
        <div class="list-item animate-in" *ngFor="let e of filtered()">
          <div class="exp-dot" [style.background]="catColor(e.category_name)"></div>
          <div class="exp-info">
            <div class="exp-title">{{ e.title }}</div>
            <div class="exp-meta">
              <span class="badge badge-gray" *ngIf="e.category_name">{{ e.category_name }}</span>
              <span class="exp-date">{{ e.date | date:'dd/MM/yy' }}</span>
            </div>
          </div>
          <div class="exp-right">
            <div class="exp-amount">-{{ e.amount | currency:'BRL':'symbol':'1.0-0' }}</div>
            <button class="btn-icon danger" style="width:30px;height:30px;font-size:12px" (click)="del(e.id!)">🗑</button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty">
          <div class="empty-icon">💸</div>
          <h3>Nenhum gasto</h3>
          <p>Toque no + para registrar um gasto.</p>
        </div>
      </ng-template>

      <button class="btn-fab" (click)="showForm.set(true)">+</button>
    </div>

    <!-- Sheet -->
    <div class="sheet-overlay" *ngIf="showForm()" (click)="bgClose($event)">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-title">Novo Gasto</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Descrição *</label>
            <input formControlName="title" placeholder="Ex: Supermercado, Gasolina..." />
          </div>
          <div class="fields-row">
            <div class="field">
              <label>Valor (R$) *</label>
              <input type="number" formControlName="amount" placeholder="0,00" step="0.01" />
            </div>
            <div class="field">
              <label>Data</label>
              <input type="date" formControlName="date" />
            </div>
          </div>
          <div class="field">
            <label>Categoria</label>
            <div class="chip-group" style="flex-wrap:wrap">
              <button type="button" class="chip" *ngFor="let c of quickCats"
                [class.selected]="form.value.category_name === c"
                (click)="form.patchValue({category_name: c})">{{ c }}</button>
            </div>
          </div>
          <div class="field">
            <label>Ou digite uma categoria</label>
            <input formControlName="category_name" placeholder="Ex: Farmácia, Streaming..." />
          </div>
          <div class="sheet-actions">
            <button type="button" class="btn btn-ghost btn-sm" (click)="showForm.set(false)">Cancelar</button>
            <button type="submit"  class="btn btn-primary btn-sm" [disabled]="form.invalid">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .summary-strip {
      display: flex; align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: 14px 18px;
      margin-bottom: 14px;
      gap: 0;
    }
    .sum-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
    .sum-div  { width:1px; height:32px; background:var(--border); }
    .sum-lbl  { font-size:11px; color:var(--text-3); font-weight:600; text-transform:uppercase; letter-spacing:.4px; }
    .sum-val  { font-size:17px; font-weight:800; color:var(--text-1); }
    .sum-val.red { color:var(--red); }

    .search-bar {
      display:flex; align-items:center; gap:10px;
      background:var(--bg-input); border:1.5px solid var(--border);
      border-radius:var(--r-full); padding:0 16px; margin-bottom:12px;
      transition:border-color .2s;
    }
    .search-bar:focus-within { border-color:var(--indigo); }
    .search-icon { font-size:16px; color:var(--text-3); }
    .search-input {
      flex:1; background:transparent; border:none; color:var(--text-1);
      font-size:15px; font-family:var(--font); padding:12px 0; outline:none;
    }
    .search-input::placeholder { color:var(--text-3); }

    .exp-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .exp-info { flex:1; min-width:0; }
    .exp-title { font-size:14px; font-weight:600; color:var(--text-1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .exp-meta  { display:flex; align-items:center; gap:6px; margin-top:3px; }
    .exp-date  { font-size:11px; color:var(--text-3); }
    .exp-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
    .exp-amount{ font-size:15px; font-weight:800; color:var(--red); }
  `],
})
export class ExpensesComponent implements OnInit {
  private svc = inject(ExpensesService);
  private fb  = inject(FormBuilder);

  expenses  = signal<Expense[]>([]);
  showForm  = signal(false);
  search    = '';
  catFilter = signal('');

  quickCats = ['Alimentação','Transporte','Lazer','Saúde','Educação','Moradia','Outros'];

  form = this.fb.group({
    title:         ['', Validators.required],
    amount:        [null as any, [Validators.required, Validators.min(.01)]],
    date:          [new Date().toISOString().split('T')[0]],
    category_name: [''],
  });

  filtered = computed(() => {
    let list = this.expenses();
    const s = this.search.toLowerCase();
    if (s) list = list.filter(e => e.title.toLowerCase().includes(s) || (e.category_name||'').toLowerCase().includes(s));
    if (this.catFilter()) list = list.filter(e => e.category_name === this.catFilter());
    return list;
  });

  total = computed(() => this.filtered().reduce((s,e)=>s+e.amount, 0));
  avg   = computed(() => { const l = this.filtered(); return l.length ? this.total()/l.length : 0; });

  cats = computed(() => [...new Set(this.expenses().map(e=>e.category_name).filter(Boolean) as string[])]);

  ngOnInit() { this.load(); }

  load() {
    this.svc.list().subscribe({
      next: e => this.expenses.set(e),
      error: () => this.expenses.set(this.mock()),
    });
  }

  submit() {
    if (this.form.invalid) return;
    const val: any = { ...this.form.value };
    if (val.date) val.date = new Date(val.date).toISOString();
    this.svc.create(val).subscribe(() => {
      this.load(); this.showForm.set(false);
      this.form.reset({ date: new Date().toISOString().split('T')[0] });
    });
  }

  del(id: string) {
    if (confirm('Excluir?')) this.svc.delete(id).subscribe(()=>this.load());
  }

  bgClose(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sheet-overlay')) this.showForm.set(false);
  }

  catColor(cat?: string|null) { return cat ? (CAT_COLORS[cat] || '#6b7280') : '#6b7280'; }

  private mock(): Expense[] {
    const cats = ['Alimentação','Transporte','Lazer','Saúde','Outros'];
    return Array.from({length:12},(_,i)=>({
      id:String(i), title:['Supermercado','Gasolina','Cinema','Farmácia','Netflix','Ifood','Uber','Luz','Internet','Academia','Roupas','Jantar fora'][i],
      amount:Math.round(Math.random()*400+50),
      category_name:cats[i%5],
      date:new Date(Date.now()-i*86400000*4).toISOString(),
    }));
  }
}
