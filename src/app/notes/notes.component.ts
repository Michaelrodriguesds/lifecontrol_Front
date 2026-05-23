import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService, Note } from '../core/services/data.services';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-top">
        <div>
          <div class="page-title">Notas 📝</div>
          <div class="page-sub">{{ notes().length }} anotação{{ notes().length !== 1 ? 'ões' : '' }}</div>
        </div>
      </div>

      <!-- Chips de tipo -->
      <div class="chip-group" style="margin-bottom:16px">
        <button class="chip" [class.selected]="typeFilter()===''" (click)="typeFilter.set('')">Todas</button>
        <button class="chip" [class.selected]="typeFilter()==='free'"      (click)="typeFilter.set('free')">📄 Texto</button>
        <button class="chip" [class.selected]="typeFilter()==='checklist'" (click)="typeFilter.set('checklist')">✅ Lista</button>
        <button class="chip" [class.selected]="typeFilter()==='markdown'"  (click)="typeFilter.set('markdown')">✏️ Markdown</button>
      </div>

      <!-- Notes grid -->
      <div class="notes-grid" *ngIf="visible().length > 0; else empty">
        <div class="note-card animate-in" *ngFor="let n of visible()"
          [style.border-color]="n.is_pinned ? 'var(--indigo)' : ''"
          (click)="openEdit(n)">
          <div class="note-head">
            <span class="note-pin" *ngIf="n.is_pinned">📌</span>
            <span class="badge" [class]="typeBadge(n.type)">{{ typeLabel(n.type) }}</span>
            <button class="btn-icon danger" style="width:28px;height:28px;font-size:12px;margin-left:auto"
              (click)="delNote($event, n.id!)">🗑</button>
          </div>
          <div class="note-title">{{ n.title }}</div>
          <div class="note-preview" *ngIf="n.type !== 'checklist' && n.content">
            {{ n.content | slice:0:100 }}{{ (n.content!.length||0) > 100 ? '…' : '' }}
          </div>
          <div class="checklist-prev" *ngIf="n.type === 'checklist'">
            <div *ngFor="let it of (n.checklist||[]).slice(0,3)" class="cl-row">
              <span>{{ it.completed ? '✅' : '⬜' }}</span>
              <span [class.done]="it.completed">{{ it.text }}</span>
            </div>
            <span class="cl-more" *ngIf="(n.checklist?.length||0) > 3">+{{ (n.checklist?.length||0)-3 }} mais</span>
          </div>
          <div class="note-tags" *ngIf="n.tags?.length">
            <span class="badge badge-gray" *ngFor="let t of n.tags">{{ t }}</span>
          </div>
          <div class="note-date">{{ n.updated_at | date:'dd/MM HH:mm' }}</div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty">
          <div class="empty-icon">📝</div>
          <h3>Nenhuma nota</h3>
          <p>Toque no + para criar sua primeira anotação.</p>
        </div>
      </ng-template>

      <button class="btn-fab" (click)="openNew()">+</button>
    </div>

    <!-- Editor sheet -->
    <div class="sheet-overlay" *ngIf="showEditor()" (click)="bgClose($event)">
      <div class="sheet" style="max-height:96vh">
        <div class="sheet-handle"></div>
        <div class="sheet-title">{{ editId ? 'Editar' : 'Nova' }} Nota</div>

        <!-- Tipo -->
        <div class="field">
          <label>Tipo</label>
          <div class="chip-group">
            <button type="button" class="chip" [class.selected]="editType==='free'"      (click)="editType='free'">📄 Texto</button>
            <button type="button" class="chip" [class.selected]="editType==='checklist'" (click)="editType='checklist'">✅ Lista</button>
            <button type="button" class="chip" [class.selected]="editType==='markdown'"  (click)="editType='markdown'">✏️ Markdown</button>
          </div>
        </div>

        <div class="field">
          <label>Título *</label>
          <input [(ngModel)]="editTitle" placeholder="Título da nota..." />
        </div>

        <div class="field" *ngIf="editType !== 'checklist'">
          <label>Conteúdo</label>
          <textarea [(ngModel)]="editContent" rows="5"
            [placeholder]="editType==='markdown' ? '# Título\n\nTexto em **negrito**...' : 'Escreva aqui...'">
          </textarea>
        </div>

        <!-- Checklist -->
        <div class="field" *ngIf="editType === 'checklist'">
          <label>Itens da lista</label>
          <div class="cl-editor">
            <div *ngFor="let it of editChecklist; let i=index" class="cl-edit-row">
              <input type="checkbox" [(ngModel)]="it.completed" />
              <input class="cl-text-input" [(ngModel)]="it.text" placeholder="Item..."
                (keydown.enter)="addItem()" />
              <button class="btn-icon danger" style="width:28px;height:28px" (click)="removeItem(i)">×</button>
            </div>
            <button class="add-item-btn" (click)="addItem()">+ Adicionar item</button>
          </div>
        </div>

        <!-- Tags -->
        <div class="field">
          <label>Tags</label>
          <div class="tags-wrap">
            <span class="tag-chip" *ngFor="let t of editTags; let i=index">
              {{ t }}<button (click)="removeTag(i)">×</button>
            </span>
            <input class="tag-input" [(ngModel)]="tagInput" placeholder="Tag + Enter"
              (keydown.enter)="addTag()" />
          </div>
        </div>

        <label class="pin-toggle">
          <input type="checkbox" [(ngModel)]="editPinned" />
          <span>📌 Fixar nota</span>
        </label>

        <div class="sheet-actions">
          <button class="btn btn-ghost btn-sm" (click)="showEditor.set(false)">Cancelar</button>
          <button class="btn btn-primary btn-sm" (click)="save()" [disabled]="!editTitle.trim()">Salvar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notes-grid { display:flex; flex-direction:column; gap:10px; }

    .note-card {
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:var(--r-lg); padding:14px;
      cursor:pointer; transition:border-color .2s;
    }
    .note-card:hover { border-color:rgba(99,102,241,.4); }

    .note-head { display:flex; align-items:center; gap:6px; margin-bottom:8px; }
    .note-pin  { font-size:14px; }
    .note-title{ font-size:15px; font-weight:700; color:var(--text-1); margin-bottom:6px; }
    .note-preview { font-size:13px; color:var(--text-3); line-height:1.5; margin-bottom:8px; }

    .checklist-prev { display:flex; flex-direction:column; gap:3px; margin-bottom:8px; }
    .cl-row { display:flex; gap:6px; font-size:13px; color:var(--text-2); }
    .cl-row .done { text-decoration:line-through; color:var(--text-3); }
    .cl-more { font-size:11px; color:var(--text-3); }

    .note-tags { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
    .note-date { font-size:11px; color:var(--text-3); }

    /* Editor */
    .cl-editor { display:flex; flex-direction:column; gap:8px; }
    .cl-edit-row { display:flex; align-items:center; gap:8px; }
    .cl-text-input {
      flex:1; background:var(--bg-input); border:1.5px solid var(--border);
      border-radius:var(--r-sm); color:var(--text-1); font-size:15px;
      font-family:var(--font); padding:10px 12px; outline:none;
    }
    .cl-text-input:focus { border-color:var(--indigo); }

    .add-item-btn {
      background:none; border:1.5px dashed var(--border);
      border-radius:var(--r-sm); color:var(--text-3); padding:10px;
      cursor:pointer; font-size:13px; font-family:var(--font);
      transition:all .18s; text-align:left;
    }
    .add-item-btn:hover { border-color:var(--indigo); color:var(--indigo); }

    .tags-wrap {
      display:flex; flex-wrap:wrap; gap:6px; align-items:center;
      background:var(--bg-input); border:1.5px solid var(--border);
      border-radius:var(--r-sm); padding:8px 12px;
    }
    .tags-wrap:focus-within { border-color:var(--indigo); }
    .tag-chip {
      background:var(--indigo-t); color:var(--indigo);
      font-size:12px; padding:3px 8px; border-radius:var(--r-full);
      display:flex; align-items:center; gap:4px;
    }
    .tag-chip button { background:none; border:none; color:inherit; cursor:pointer; font-size:14px; padding:0; }
    .tag-input { background:transparent; border:none; color:var(--text-2); font-size:14px; font-family:var(--font); outline:none; min-width:100px; }

    .pin-toggle { display:flex; align-items:center; gap:8px; font-size:14px; color:var(--text-2); cursor:pointer; margin-bottom:4px; }
    .pin-toggle input { width:16px; height:16px; accent-color:var(--indigo); }
  `],
})
export class NotesComponent implements OnInit {
  private svc = inject(NotesService);

  notes      = signal<Note[]>([]);
  showEditor = signal(false);
  typeFilter = signal('');

  editId       = '';
  editTitle    = '';
  editContent  = '';
  editType     = 'free';
  editPinned   = false;
  editTags: string[] = [];
  editChecklist: { text: string; completed: boolean }[] = [];
  tagInput = '';

  visible = () => {
    const tf = this.typeFilter();
    return tf ? this.notes().filter(n => n.type === tf) : this.notes();
  };

  ngOnInit() { this.load(); }

  load() {
    this.svc.list().subscribe({
      next: n => this.notes.set(n),
      error: () => this.notes.set(this.mock()),
    });
  }

  openNew() {
    this.editId=''; this.editTitle=''; this.editContent='';
    this.editType='free'; this.editPinned=false;
    this.editTags=[]; this.editChecklist=[{text:'',completed:false}];
    this.showEditor.set(true);
  }

  openEdit(n: Note) {
    this.editId      = n.id || '';
    this.editTitle   = n.title;
    this.editContent = n.content || '';
    this.editType    = n.type;
    this.editPinned  = n.is_pinned || false;
    this.editTags    = [...(n.tags || [])];
    this.editChecklist = n.checklist?.length ? [...n.checklist] : [{text:'',completed:false}];
    this.showEditor.set(true);
  }

  save() {
    if (!this.editTitle.trim()) return;
    const data: Partial<Note> = {
      title:     this.editTitle,
      content:   this.editContent,
      type:      this.editType as any,
      is_pinned: this.editPinned,
      tags:      this.editTags,
      checklist: this.editChecklist.filter(i=>i.text.trim()),
    };
    const obs = this.editId ? this.svc.update(this.editId, data) : this.svc.create(data);
    obs.subscribe(() => { this.load(); this.showEditor.set(false); });
  }

  delNote(e: MouseEvent, id: string) {
    e.stopPropagation();
    if (confirm('Excluir nota?')) this.svc.delete(id).subscribe(() => this.load());
  }

  addItem()  { this.editChecklist.push({text:'',completed:false}); }
  removeItem(i: number) { this.editChecklist.splice(i,1); }
  addTag()   { if (this.tagInput.trim() && !this.editTags.includes(this.tagInput.trim())) this.editTags.push(this.tagInput.trim()); this.tagInput=''; }
  removeTag(i: number) { this.editTags.splice(i,1); }

  bgClose(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('sheet-overlay')) this.showEditor.set(false);
  }

  typeLabel(t: string) { return {free:'Texto',markdown:'Markdown',checklist:'Checklist'}[t]||t; }
  typeBadge(t: string) { return {free:'badge-gray',markdown:'badge-indigo',checklist:'badge-green'}[t]||'badge-gray'; }

  private mock(): Note[] {
    return [
      { id:'1', title:'Ideias do projeto', content:'Adicionar notificações push\nMelhorar performance', type:'free', is_pinned:true, tags:['dev'], updated_at:new Date().toISOString() },
      { id:'2', title:'Compras', type:'checklist', checklist:[{text:'Supermercado',completed:true},{text:'Farmácia',completed:false},{text:'Padaria',completed:false}], tags:[], updated_at:new Date().toISOString() },
      { id:'3', title:'Metas 2025', content:'# Objetivos\n\n- Viajar\n- Investir', type:'markdown', tags:['metas'], updated_at:new Date().toISOString() },
    ];
  }
}