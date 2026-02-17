import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private undoStack = signal<string[][][]>([]);
  private redoStack = signal<string[][][]>([]);

  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);

  pushState(pixels: string[][]): void {
    const snapshot = pixels.map(row => [...row]);
    this.undoStack.update(stack => [...stack, snapshot]);
    this.redoStack.set([]);
  }

  undo(currentPixels: string[][]): string[][] | null {
    const stack = this.undoStack();
    if (stack.length === 0) return null;

    const currentSnapshot = currentPixels.map(row => [...row]);
    this.redoStack.update(s => [...s, currentSnapshot]);

    const previous = stack[stack.length - 1];
    this.undoStack.update(s => s.slice(0, -1));
    return previous.map(row => [...row]);
  }

  redo(currentPixels: string[][]): string[][] | null {
    const stack = this.redoStack();
    if (stack.length === 0) return null;

    const currentSnapshot = currentPixels.map(row => [...row]);
    this.undoStack.update(s => [...s, currentSnapshot]);

    const next = stack[stack.length - 1];
    this.redoStack.update(s => s.slice(0, -1));
    return next.map(row => [...row]);
  }

  clear(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }
}
