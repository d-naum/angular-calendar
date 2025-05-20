import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyLibraryService, LibraryItem } from './my-library.service';

@Component({
  selector: 'lib-my-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-library-container">
      <h2>{{ title }}</h2>
      
      <div class="input-group" *ngIf="showAddForm">
        <input type="text" [(ngModel)]="newItemName" placeholder="Item name" class="form-input" />
        <input type="text" [(ngModel)]="newItemDescription" placeholder="Description (optional)" class="form-input" />
        <button (click)="addItem()" class="btn btn-primary">Add Item</button>
      </div>
      
      <div class="items-list">
        <div *ngIf="libraryService.getItems().length === 0" class="no-items">
          No items available
        </div>
        
        <div *ngFor="let item of libraryService.getItems()" class="item-card">
          <div class="item-header">
            <h3>{{ item.name }}</h3>
            <button (click)="onRemoveItem(item.id)" class="btn btn-danger">Remove</button>
          </div>
          <p *ngIf="item.description">{{ item.description }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-library-container {
      font-family: Arial, sans-serif;
      padding: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h2 {
      color: #333;
      margin-top: 0;
    }
    
    .input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    
    .form-input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      flex: 1;
      min-width: 120px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .item-card {
      border: 1px solid #eee;
      padding: 12px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .item-header h3 {
      margin: 0;
    }
    
    .no-items {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 24px;
      background: #f9f9f9;
      border-radius: 4px;
    }
  `]
})
export class MyLibraryComponent {
  @Input() title: string = 'My Library';
  @Input() showAddForm: boolean = true;
  @Output() itemAdded = new EventEmitter<LibraryItem>();
  @Output() itemRemoved = new EventEmitter<string>();

  newItemName: string = '';
  newItemDescription: string = '';
  
  protected libraryService = inject(MyLibraryService);

  addItem(): void {
    if (!this.newItemName.trim()) return;
    
    const newItem: LibraryItem = {
      id: Date.now().toString(),
      name: this.newItemName,
      description: this.newItemDescription || undefined
    };
    
    this.libraryService.addItem(newItem);
    this.itemAdded.emit(newItem);
    
    // Reset form
    this.newItemName = '';
    this.newItemDescription = '';
  }

  onRemoveItem(id: string): void {
    this.libraryService.removeItem(id);
    this.itemRemoved.emit(id);
  }
}
