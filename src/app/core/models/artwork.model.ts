export interface PixelArtwork {
  id: string;
  name: string;
  width: number;
  height: number;
  pixels: string[][];
  palette: string[];
  createdAt: number;
  updatedAt: number;
}

export type ToolType = 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'eyedropper';

export const PALETTES: Record<string, string[]> = {
  'Default': ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#808080','#c0c0c0','#800000','#808000','#008000','#800080','#008080','#000080'],
  'Game Boy': ['#0f380f','#306230','#8bac0f','#9bbc0f'],
  'Pico-8': ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa'],
};
