// src/app/core/services/cache.service.ts
//
// Cache em memória com fallback para localStorage.
// Serve dados instantaneamente enquanto busca a versão atualizada em segundo plano.
//
import { Injectable } from '@angular/core';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  data: any;
  ts:   number; // timestamp da gravação
}

@Injectable({ providedIn: 'root' })
export class CacheService {

  // Cache em memória (perdido ao fechar o app — rápido e sempre atualizado)
  private mem = new Map<string, CacheEntry>();

  /** Salva dados no cache em memória e no localStorage (para uso offline). */
  set(key: string, data: any): void {
    const entry: CacheEntry = { data, ts: Date.now() };
    this.mem.set(key, entry);
    try {
      localStorage.setItem(`lc_cache_${key}`, JSON.stringify(entry));
    } catch { /* localStorage cheio — ignora silenciosamente */ }
  }

  /**
   * Retorna dados do cache em memória se frescos (menos de 5 min).
   * Se não tiver em memória, tenta o localStorage (útil ao reabrir o app).
   * Retorna null se não houver nada ou se estiver vencido.
   */
  get<T = any>(key: string): T | null {
    // Tenta memória primeiro (mais rápido)
    const mem = this.mem.get(key);
    if (mem && Date.now() - mem.ts < CACHE_TTL_MS) {
      return mem.data as T;
    }

    // Tenta localStorage (útil offline ou ao reabrir)
    try {
      const raw = localStorage.getItem(`lc_cache_${key}`);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        // localStorage aceita dados mais antigos (até 30 min) para uso offline
        if (Date.now() - entry.ts < 30 * 60 * 1000) {
          this.mem.set(key, entry); // promove para memória
          return entry.data as T;
        }
      }
    } catch { /* JSON inválido — ignora */ }

    return null;
  }

  /** Remove um item do cache (use após mutations para forçar reload). */
  invalidate(key: string): void {
    this.mem.delete(key);
    try { localStorage.removeItem(`lc_cache_${key}`); } catch { }
  }

  /** Remove todos os caches (use no logout). */
  clear(): void {
    this.mem.clear();
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('lc_cache_'))
        .forEach(k => localStorage.removeItem(k));
    } catch { }
  }
}