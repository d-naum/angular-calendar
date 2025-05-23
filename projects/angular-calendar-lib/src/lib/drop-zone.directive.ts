import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Input() date!: Date;
  @Input() hour?: number;
  @Output() itemDropped = new EventEmitter<{ date: Date, hour?: number, event: DragEvent }>();
  
  private isDragOver = false;
  
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  
  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): boolean {
    // Check if the drag contains relevant data
    if (event.dataTransfer?.types.includes('text/plain') || 
        event.dataTransfer?.types.includes('application/calendar-event')) {
      // Prevent default to allow the drop
      event.preventDefault();
    }
    return false;
  }
  
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): boolean {
    // Check if the drag contains relevant data - check both formats
    if (event.dataTransfer?.types.includes('text/plain') || 
        event.dataTransfer?.types.includes('application/calendar-event')) {
      // Add visual feedback
      if (!this.isDragOver) {
        this.renderer.addClass(this.elementRef.nativeElement, 'drag-over');
        this.isDragOver = true;
      }
      
      // Allow the drop
      event.dataTransfer.dropEffect = 'move';
      event.preventDefault();
      // Don't stop propagation
    }
    
    return false;
  }
  
  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    // Check if this is really leaving the element and not just entering a child
    // Only remove the class if we're actually leaving the drop zone
    // Get related target and check if it's a child of this element
    const relatedTarget = event.relatedTarget as Node;
    if (relatedTarget && this.elementRef.nativeElement.contains(relatedTarget)) {
      // Still within the element, don't remove class
      return;
    }
    
    // Remove visual feedback
    this.renderer.removeClass(this.elementRef.nativeElement, 'drag-over');
    this.isDragOver = false;
  }
  
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): boolean {
    // Remove visual feedback
    this.renderer.removeClass(this.elementRef.nativeElement, 'drag-over');
    this.isDragOver = false;
    
    // Try to get data from different formats
    let eventData = null;
    if (event.dataTransfer) {
      eventData = event.dataTransfer.getData('text/plain');
      if (!eventData) {
        eventData = event.dataTransfer.getData('application/calendar-event');
      }
    }
    
    // Don't process if no data
    if (!eventData) {
      console.warn('Drop occurred but no valid data was found');
      event.preventDefault();
      return false;
    }
    
    console.log(`Drop successful with event ID: ${eventData} on date: ${this.date}`);
    
    // Emit the drop event with the date and hour information
    this.itemDropped.emit({
      date: this.date,
      hour: this.hour,
      event: event
    });
    
    // Prevent default browser action
    event.preventDefault();
    return false;
  }
}
