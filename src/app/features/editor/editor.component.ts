import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanvasService } from '../../core/services/canvas.service';
import { HistoryService } from '../../core/services/history.service';
import { GalleryService } from '../../core/services/gallery.service';
import { ToolType, PALETTES, PixelArtwork } from '../../core/models/artwork.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('pixelCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly canvas = inject(CanvasService);
  private readonly history = inject(HistoryService);
  private readonly gallery = inject(GalleryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastPixel: { x: number; y: number } | null = null;
  private animFrameId = 0;
  private editId: string | null = null;

  readonly tools: { type: ToolType; label: string; icon: string; shortcut: string }[] = [
    { type: 'pen', label: 'Pen', icon: 'P', shortcut: 'P' },
    { type: 'eraser', label: 'Eraser', icon: 'E', shortcut: 'E' },
    { type: 'fill', label: 'Fill', icon: 'F', shortcut: 'F' },
    { type: 'eyedropper', label: 'Pick', icon: 'I', shortcut: 'I' },
  ];

  readonly sizes = [8, 16, 24, 32, 48, 64];
  readonly paletteNames = Object.keys(PALETTES);

  selectedSize = 16;

  get canvasService(): CanvasService { return this.canvas; }
  get historyService(): HistoryService { return this.history; }

  private keyHandler = (e: KeyboardEvent) => this.onKeyDown(e);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const artwork = this.gallery.getById(id);
      if (artwork) {
        this.editId = id;
        this.selectedSize = artwork.width;
        this.canvas.loadPixels(artwork.pixels, artwork.width, artwork.height);
        const paletteName = Object.entries(PALETTES).find(
          ([, v]) => JSON.stringify(v) === JSON.stringify(artwork.palette)
        );
        if (paletteName) {
          this.canvas.setPalette(paletteName[0]);
        }
      }
    }
    document.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    document.removeEventListener('keydown', this.keyHandler);
  }

  ngAfterViewInit(): void {
    const el = this.canvasRef.nativeElement;
    this.ctx = el.getContext('2d')!;
    this.renderLoop();
  }

  private renderLoop(): void {
    this.render();
    this.animFrameId = requestAnimationFrame(() => this.renderLoop());
  }

  private render(): void {
    const el = this.canvasRef.nativeElement;
    const w = this.canvas.canvasWidth();
    const h = this.canvas.canvasHeight();
    el.width = w;
    el.height = h;

    const ctx = this.ctx;
    const zoom = this.canvas.zoom();
    const pixels = this.canvas.pixels();
    const gridW = this.canvas.width();
    const gridH = this.canvas.height();

    // Clear with checkerboard pattern for transparency
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#2a2a2a' : '#242424';
        ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }
    }

    // Draw pixels
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const color = pixels[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        }
      }
    }

    // Draw grid
    if (this.canvas.showGrid() && zoom >= 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= gridW; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom + 0.5, 0);
        ctx.lineTo(x * zoom + 0.5, h);
        ctx.stroke();
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom + 0.5);
        ctx.lineTo(w, y * zoom + 0.5);
        ctx.stroke();
      }
    }
  }

  private getPixelCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const zoom = this.canvas.zoom();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);
    return { x, y };
  }

  onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    const { x, y } = this.getPixelCoords(e);
    const tool = this.canvas.activeTool();

    if (tool === 'eyedropper') {
      this.pickColor(x, y);
      return;
    }

    if (tool === 'fill') {
      this.history.pushState(this.canvas.getSnapshot());
      this.canvas.fill(x, y, this.canvas.activeColor());
      return;
    }

    this.isDrawing = true;
    this.history.pushState(this.canvas.getSnapshot());
    this.applyTool(x, y);
    this.lastPixel = { x, y };
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;
    const { x, y } = this.getPixelCoords(e);
    if (this.lastPixel && x === this.lastPixel.x && y === this.lastPixel.y) return;
    this.applyTool(x, y);
    this.lastPixel = { x, y };
  }

  onMouseUp(): void {
    this.isDrawing = false;
    this.lastPixel = null;
  }

  onMouseLeave(): void {
    this.isDrawing = false;
    this.lastPixel = null;
  }

  private applyTool(x: number, y: number): void {
    const tool = this.canvas.activeTool();
    if (tool === 'pen') {
      this.canvas.setPixel(x, y, this.canvas.activeColor());
    } else if (tool === 'eraser') {
      this.canvas.setPixel(x, y, '');
    }
  }

  private pickColor(x: number, y: number): void {
    const pixels = this.canvas.pixels();
    const color = pixels[y]?.[x];
    if (color) {
      this.canvas.setColor(color);
      this.canvas.setTool('pen');
    }
  }

  selectTool(tool: ToolType): void {
    this.canvas.setTool(tool);
  }

  selectColor(color: string): void {
    this.canvas.setColor(color);
  }

  selectPalette(name: string): void {
    this.canvas.setPalette(name);
  }

  undo(): void {
    const prev = this.history.undo(this.canvas.getSnapshot());
    if (prev) {
      this.canvas.loadPixels(prev, this.canvas.width(), this.canvas.height());
    }
  }

  redo(): void {
    const next = this.history.redo(this.canvas.getSnapshot());
    if (next) {
      this.canvas.loadPixels(next, this.canvas.width(), this.canvas.height());
    }
  }

  toggleGrid(): void {
    this.canvas.toggleGrid();
  }

  clearCanvas(): void {
    this.history.pushState(this.canvas.getSnapshot());
    this.canvas.clear();
  }

  onSizeChange(): void {
    this.history.clear();
    this.canvas.initCanvas(this.selectedSize, this.selectedSize);
  }

  save(): void {
    const name = prompt('Artwork name:', this.editId ? '' : 'Untitled');
    if (name === null) return;

    const now = Date.now();
    const artwork: PixelArtwork = {
      id: this.editId ?? this.gallery.generateId(),
      name: name || 'Untitled',
      width: this.canvas.width(),
      height: this.canvas.height(),
      pixels: this.canvas.getSnapshot(),
      palette: this.canvas.palette(),
      createdAt: this.editId ? (this.gallery.getById(this.editId)?.createdAt ?? now) : now,
      updatedAt: now,
    };

    this.gallery.save(artwork);
    this.editId = artwork.id;
  }

  exportPng(): void {
    const dataUrl = this.canvas.getDataUrl();
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = dataUrl;
    link.click();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      this.save();
      return;
    }

    // Tool shortcuts (single key, no modifiers)
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      const key = e.key.toLowerCase();
      const toolMap: Record<string, ToolType> = { p: 'pen', e: 'eraser', f: 'fill', i: 'eyedropper' };
      if (toolMap[key]) {
        this.canvas.setTool(toolMap[key]);
      }
    }
  }
}
