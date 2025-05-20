import { Injectable, signal } from '@angular/core';

export interface LibraryItem {
  id: string;
  name: string;
  description?: string;
  value?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MyLibraryService {
  private items = signal<LibraryItem[]>([]);

  constructor() { }

  /**
   * Add a new item to the library
   * @param item The item to add
   */
  addItem(item: LibraryItem): void {
    this.items.update(items => [...items, item]);
  }

  /**
   * Remove an item from the library
   * @param id The ID of the item to remove
   */
  removeItem(id: string): void {
    this.items.update(items => items.filter(item => item.id !== id));
  }

  /**
   * Get all items in the library
   * @returns All library items
   */
  getItems(): LibraryItem[] {
    return this.items();
  }

  /**
   * Clear all items from the library
   */
  clear(): void {
    this.items.set([]);
  }
}
