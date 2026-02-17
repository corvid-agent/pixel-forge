import { Injectable } from '@angular/core';
import { PixelArtwork } from '../models/artwork.model';

const STORAGE_KEY = 'pixel-forge-gallery';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  list(): PixelArtwork[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as PixelArtwork[];
    } catch {
      return [];
    }
  }

  getById(id: string): PixelArtwork | undefined {
    return this.list().find(a => a.id === id);
  }

  save(artwork: PixelArtwork): void {
    const all = this.list();
    const idx = all.findIndex(a => a.id === artwork.id);
    if (idx >= 0) {
      all[idx] = artwork;
    } else {
      all.push(artwork);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  delete(id: string): void {
    const all = this.list().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
}
