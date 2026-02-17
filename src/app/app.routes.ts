import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./features/editor/editor.component').then(m => m.EditorComponent),
  },
];
