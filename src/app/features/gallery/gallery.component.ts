import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GalleryService } from '../../core/services/gallery.service';
import { CanvasService } from '../../core/services/canvas.service';
import { PixelArtwork } from '../../core/models/artwork.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  private readonly galleryService = inject(GalleryService);
  private readonly canvasService = inject(CanvasService);

  readonly artworks = signal<PixelArtwork[]>([]);

  ngOnInit(): void {
    this.loadArtworks();
  }

  private loadArtworks(): void {
    this.artworks.set(this.galleryService.list().sort((a, b) => b.updatedAt - a.updatedAt));
  }

  getThumbnail(artwork: PixelArtwork): string {
    const w = artwork.width;
    const h = artwork.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = artwork.pixels[y]?.[x];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return canvas.toDataURL('image/png');
  }

  deleteArtwork(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Delete this artwork?')) {
      this.galleryService.delete(id);
      this.loadArtworks();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
