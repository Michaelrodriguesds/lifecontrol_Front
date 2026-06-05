import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService, Item } from '../core/services/items.service';

const TYPE_ICONS: Record<string, string> = {
  vehicle: '🚗', motorcycle: '🏍️', computer: '💻',
  project: '📁', service: '⚙️', appliance: '📱', other: '📦',
};

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-top">
        <div>
          <div class="page-title">Patrimônio 📦</div>
          <div class="page-sub">{{ items().length }} item{{ items().length !== 1 ? 's' : '' }} cadastrado{{ items().length !== 1 ? 's' : '' }}</div>
        </div>
        <button class="btn-primary" (click)="showForm.set(!showForm())">
          {{ showForm() ? '✕ Fechar' : '+ Novo' }}
        </button>
      </div>

      <!-- Formulário -->
      @if (showForm()) {
        <div class="card mb-16 animate-in">
          <div class="form-title">Novo Item</div>

          <div class="form-grid">
            <div class="field">
              <label>Nome *</label>
              <input [(ngModel)]="form.name" placeholder="Ex: Honda Civic 2023" />
            </div>

            <div class="field">
              <label>Tipo</label>
              <select [(ngModel)]="form.type">
                @for (t of types; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>

            <div class="field">
              <label>Marca</label>
              <input [(ngModel)]="form.brand" placeholder="Ex: Honda" />
            </div>

            <div class="field">
              <label>Modelo</label>
              <input [(ngModel)]="form.model" placeholder="Ex: Civic" />
            </div>

            <div class="field">
              <label>Ano</label>
              <input [(ngModel)]="form.year" type="number" placeholder="2023" />
            </div>

            <div class="field">
              <label>Valor de compra (R$)</label>
              <input [(ngModel)]="form.purchase_value" type="number" placeholder="0,00" />
            </div>

            <div class="field field-full">
              <label>Descrição</label>
              <input [(ngModel)]="form.description" placeholder="Observações opcionais..." />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" (click)="createItem()">Salvar item</button>
            <button class="btn-ghost" (click)="showForm.set(false)">Cancelar</button>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="items-grid">
          @for (i of [1,2,3]; track i) {
            <div class="card skel" style="height:120px"></div>
          }
        </div>

      <!-- Vazio -->
      } @else if (items().length === 0) {
        <div class="card empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-title">Nenhum item cadastrado</div>
          <div class="empty-sub">Adicione veículos, eletrônicos e outros bens</div>
        </div>

      <!-- Lista -->
      } @else {
        <div class="items-grid">
          @for (item of items(); track item.id) {
            <div class="item-card card">

              <div class="item-header">
                <div class="item-icon">{{ getIcon(item.type) }}</div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  @if (item.brand || item.model || item.year) {
                    <div class="item-meta">{{ item.brand }} {{ item.model }} {{ item.year }}</div>
                  }
                </div>
                <button class="del-btn" (click)="deleteItem(item.id!)" title="Excluir">✕</button>
              </div>

              @if (item.purchase_value || item.current_value) {
                <div class="item-values">
                  @if (item.purchase_value) {
                    <div class="value-block">
                      <div class="value-label">Compra</div>
                      <div class="value-amount">
                        {{ item.purchase_value | currency:'BRL':'symbol':'1.0-0' }}
                      </div>
                    </div>
                  }
                  @if (item.current_value) {
                    <div class="value-block">
                      <div class="value-label">Atual</div>
                      <div class="value-amount value-current">
                        {{ item.current_value | currency:'BRL':'symbol':'1.0-0' }}
                      </div>
                    </div>
                  }
                </div>
              }

            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .mb-16 { margin-bottom: 16px; }

    /* Formulário */
    .form-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-1);
      margin-bottom: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .field { display: flex; flex-direction: column; gap: 5px; }
    .field-full { grid-column: 1 / -1; }

    .field label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: .4px;
    }

    .field input,
    .field select {
      padding: 10px 12px;
      background: var(--bg-elevated, rgba(255,255,255,.05));
      border: 1px solid var(--border);
      border-radius: var(--r-sm, 8px);
      color: var(--text-1);
      font-size: 14px;
      font-family: var(--font, inherit);
      outline: none;
      transition: border-color .18s;
    }

    .field input:focus,
    .field select:focus {
      border-color: var(--indigo, #6366f1);
    }

    .field input::placeholder { color: var(--text-3); }

    .form-actions {
      display: flex;
      gap: 10px;
    }

    /* Grid de itens */
    .items-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (min-width: 600px) {
      .items-grid { grid-template-columns: 1fr 1fr; }
    }

    /* Card de item */
    .item-card { padding: 14px; }

    .item-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .item-icon {
      font-size: 28px;
      line-height: 1;
      flex-shrink: 0;
    }

    .item-info { flex: 1; min-width: 0; }

    .item-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      font-size: 12px;
      color: var(--text-3);
      margin-top: 2px;
    }

    .del-btn {
      background: none;
      border: none;
      color: var(--text-3);
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color .18s;
      flex-shrink: 0;
    }

    .del-btn:hover { color: #ef4444; }

    /* Valores */
    .item-values {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .value-block { display: flex; flex-direction: column; gap: 2px; }

    .value-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-3);
      text-transform: uppercase;
      letter-spacing: .4px;
    }

    .value-amount {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-1);
    }

    .value-current { color: #22c55e; }

    /* Vazio */
    .empty-state {
      text-align: center;
      padding: 48px 20px;
    }

    .empty-icon  { font-size: 48px; margin-bottom: 12px; }
    .empty-title { font-size: 15px; font-weight: 700; color: var(--text-1); margin-bottom: 6px; }
    .empty-sub   { font-size: 13px; color: var(--text-3); }

    /* Skeleton */
    .skel { animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .5 } }
  `],
})
export class ItemsComponent implements OnInit {
  private service = inject(ItemsService);

  items    = signal<Item[]>([]);
  loading  = signal(true);
  showForm = signal(false);

  form: Partial<Item> = { name: '', type: 'other', tags: [] };

  types = [
    { value: 'vehicle',    label: '🚗 Veículo' },
    { value: 'motorcycle', label: '🏍️ Moto' },
    { value: 'computer',   label: '💻 Computador' },
    { value: 'project',    label: '📁 Projeto' },
    { value: 'service',    label: '⚙️ Serviço' },
    { value: 'appliance',  label: '📱 Eletrônico' },
    { value: 'other',      label: '📦 Outro' },
  ];

  getIcon(type: string) { return TYPE_ICONS[type] || '📦'; }

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: ()    => { this.items.set([]); this.loading.set(false); },
    });
  }

  createItem() {
    if (!this.form.name?.trim()) return;
    this.service.create(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.form = { name: '', type: 'other', tags: [] };
        this.loadItems();
      },
    });
  }

  deleteItem(id: string) {
    if (!confirm('Excluir este item?')) return;
    this.service.delete(id).subscribe(() => this.loadItems());
  }
}