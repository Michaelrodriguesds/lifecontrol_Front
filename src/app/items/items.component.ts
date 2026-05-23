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
    <div class="p-6 space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Itens & Patrimônio</h1>
          <p class="text-slate-500 text-sm">Veículos, equipamentos e objetos</p>
        </div>
        <button (click)="showForm.set(!showForm())" class="btn-primary">
          {{ showForm() ? '✕' : '+ Novo Item' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="glass-card p-5 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Nome *</label>
              <input [(ngModel)]="form.name" class="dark-input" placeholder="Ex: Honda Civic 2023" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Tipo</label>
              <select [(ngModel)]="form.type" class="dark-input">
                @for (t of types; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Marca</label>
              <input [(ngModel)]="form.brand" class="dark-input" placeholder="Honda" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Modelo</label>
              <input [(ngModel)]="form.model" class="dark-input" placeholder="Civic" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Ano</label>
              <input [(ngModel)]="form.year" type="number" class="dark-input" placeholder="2023" />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1.5 block">Valor de compra (R$)</label>
              <input [(ngModel)]="form.purchase_value" type="number" class="dark-input" />
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button (click)="createItem()" class="btn-primary">Salvar</button>
            <button (click)="showForm.set(false)" class="btn-ghost">Cancelar</button>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="glass-card h-32 animate-pulse"></div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="glass-card p-12 text-center">
          <p class="text-4xl mb-4">📦</p>
          <p class="text-slate-500 text-sm">Nenhum item cadastrado.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (item of items(); track item.id) {
            <div class="glass-card p-5 hover:border-brand-500/30 transition-all">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ getIcon(item.type) }}</span>
                  <div>
                    <h3 class="text-sm font-semibold text-white">{{ item.name }}</h3>
                    <p class="text-xs text-slate-500">{{ item.brand }} {{ item.model }} {{ item.year }}</p>
                  </div>
                </div>
                <button (click)="deleteItem(item.id!)" class="text-slate-600 hover:text-red-400 text-sm p-1">✕</button>
              </div>
              @if (item.purchase_value) {
                <div class="flex gap-4 mt-3 pt-3 border-t border-[rgba(99,102,241,0.1)]">
                  <div>
                    <p class="text-[10px] text-slate-600">Compra</p>
                    <p class="text-sm font-semibold text-slate-300">
                      {{ item.purchase_value | currency:'BRL':'symbol':'1.0-0':'pt' }}
                    </p>
                  </div>
                  @if (item.current_value) {
                    <div>
                      <p class="text-[10px] text-slate-600">Atual</p>
                      <p class="text-sm font-semibold text-emerald-400">
                        {{ item.current_value | currency:'BRL':'symbol':'1.0-0':'pt' }}
                      </p>
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
})
export class ItemsComponent implements OnInit {
  private service = inject(ItemsService);
  items = signal<Item[]>([]);
  loading = signal(true);
  showForm = signal(false);
  form: Partial<Item> = { name: '', type: 'other', tags: [] };
  types = [
    { value: 'vehicle', label: '🚗 Veículo' },
    { value: 'motorcycle', label: '🏍️ Moto' },
    { value: 'computer', label: '💻 Computador' },
    { value: 'project', label: '📁 Projeto' },
    { value: 'service', label: '⚙️ Serviço' },
    { value: 'appliance', label: '📱 Eletrônico' },
    { value: 'other', label: '📦 Outro' },
  ];

  getIcon(type: string) { return TYPE_ICONS[type] || '📦'; }
  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: i => { this.items.set(i); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createItem() {
    if (!this.form.name) return;
    this.service.create(this.form).subscribe(() => {
      this.showForm.set(false);
      this.form = { name: '', type: 'other', tags: [] };
      this.loadItems();
    });
  }

  deleteItem(id: string) {
    this.service.delete(id).subscribe(() => this.loadItems());
  }
}
