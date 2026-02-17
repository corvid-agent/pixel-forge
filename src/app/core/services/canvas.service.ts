import { Injectable, signal, computed } from '@angular/core';
import { ToolType, PALETTES } from '../models/artwork.model';

@Injectable({ providedIn: 'root' })
export class CanvasService {
  readonly width = signal(16);
  readonly height = signal(16);
  readonly pixels = signal<string[][]>([]);
  readonly activeColor = signal('#000000');
  readonly activeTool = signal<ToolType>('pen');
  readonly zoom = signal(16);
  readonly showGrid = signal(true);
  readonly palette = signal<string[]>(PALETTES['Default']);
  readonly paletteName = signal('Default');

  readonly canvasWidth = computed(() => this.width() * this.zoom());
  readonly canvasHeight = computed(() => this.height() * this.zoom());

  constructor() {
    this.initCanvas(this.width(), this.height());
  }

  initCanvas(w: number, h: number): void {
    this.width.set(w);
    this.height.set(h);
    const grid: string[][] = [];
    for (let y = 0; y < h; y++) {
      const row: string[] = [];
      for (let x = 0; x < w; x++) {
        row.push('');
      }
      grid.push(row);
    }
    this.pixels.set(grid);
    this.adjustZoom(w, h);
  }

  private adjustZoom(w: number, h: number): void {
    const maxDim = Math.max(w, h);
    if (maxDim <= 16) {
      this.zoom.set(20);
    } else if (maxDim <= 32) {
      this.zoom.set(14);
    } else {
      this.zoom.set(10);
    }
  }

  setPixel(x: number, y: number, color: string): void {
    const current = this.pixels();
    if (y < 0 || y >= current.length || x < 0 || x >= current[0].length) return;
    const copy = current.map(row => [...row]);
    copy[y][x] = color;
    this.pixels.set(copy);
  }

  fill(startX: number, startY: number, fillColor: string): void {
    const current = this.pixels();
    if (startY < 0 || startY >= current.length || startX < 0 || startX >= current[0].length) return;
    const targetColor = current[startY][startX];
    if (targetColor === fillColor) return;

    const copy = current.map(row => [...row]);
    const w = this.width();
    const h = this.height();
    const stack: [number, number][] = [[startX, startY]];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      if (copy[cy][cx] !== targetColor) continue;
      copy[cy][cx] = fillColor;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    this.pixels.set(copy);
  }

  clear(): void {
    this.initCanvas(this.width(), this.height());
  }

  setTool(tool: ToolType): void {
    this.activeTool.set(tool);
  }

  setColor(color: string): void {
    this.activeColor.set(color);
  }

  setPalette(name: string): void {
    const p = PALETTES[name];
    if (p) {
      this.palette.set(p);
      this.paletteName.set(name);
    }
  }

  toggleGrid(): void {
    this.showGrid.update(v => !v);
  }

  loadPixels(pixels: string[][], w: number, h: number): void {
    this.width.set(w);
    this.height.set(h);
    this.pixels.set(pixels.map(row => [...row]));
    this.adjustZoom(w, h);
  }

  getSnapshot(): string[][] {
    return this.pixels().map(row => [...row]);
  }

  getDataUrl(): string {
    const w = this.width();
    const h = this.height();
    const pixels = this.pixels();
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = pixels[y][x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return canvas.toDataURL('image/png');
  }
}
