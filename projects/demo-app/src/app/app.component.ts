import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import directly from library source, not 'my-library', for local development
import { MyLibraryComponent } from '../../../my-library/src/lib/my-library.component';
import { MyLibraryService } from '../../../my-library/src/lib/my-library.service';
import { LibraryItem } from '../../../my-library/src/lib/my-library.service';

@Component({
  selector: 'app-root',  standalone: true,
  imports: [CommonModule, MyLibraryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Library Demo';
  
  constructor(private libraryService: MyLibraryService) {
    // Add some initial items for demo purposes
    this.addSampleItems();
  }
  
  addSampleItems() {
    this.libraryService.addItem({
      id: '1',
      name: 'Sample Item 1',
      description: 'This is a sample item to demonstrate the library'
    });
    
    this.libraryService.addItem({
      id: '2',
      name: 'Sample Item 2',
      description: 'Another sample item with different content'
    });
  }
  
  handleItemAdded(item: LibraryItem) {
    console.log('Item added:', item);
  }
  
  handleItemRemoved(id: string) {
    console.log('Item removed:', id);
  }
}
