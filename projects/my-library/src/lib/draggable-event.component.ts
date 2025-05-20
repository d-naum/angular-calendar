import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CalendarEvent } from './calendar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-draggable-event',
  standalone: true,
  imports: [CommonModule],  template: `
    <div class="draggable-event"
      [class.dragging]="isDragging"
      [style.backgroundColor]="event.color?.primary || '#3788d8'"
      [style.borderColor]="event.color?.secondary"
      [style.color]="event.color?.textColor || '#ffffff'"
      [style.cursor]="event.draggable ? 'grab' : 'default'"
      [attr.data-event-id]="event.id"
      [draggable]="event.draggable"
      (dragstart)="handleDragStart($event)"
      (dragend)="handleDragEnd($event)"
      (click)="handleClick($event)">
      <ng-content></ng-content>
      
      <div *ngIf="event.resizable && showResizeHandle" 
        class="resize-handle"
        (mousedown)="onResizeStart($event)">
        ⋮
      </div>
    </div>
  `,
  styles: [`
    .draggable-event {
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      position: relative;
      border-left: 3px solid;
      user-select: none;
      transition: box-shadow 0.2s ease;
    }
    
    .draggable-event.dragging {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      opacity: 0.8;
      cursor: grabbing !important;
      z-index: 100;
    }
    
    .resize-handle {
      position: absolute;
      bottom: 0;
      right: 0;
      padding: 2px;
      cursor: ns-resize;
      font-size: 12px;
      z-index: 5;
    }
  `]
})
export class DraggableEventComponent implements OnInit {
  @Input() event!: CalendarEvent;
  @Input() showResizeHandle: boolean = false;
  @Output() dragStart = new EventEmitter<{ event: CalendarEvent, mouseEvent: MouseEvent }>();
  @Output() dragEnd = new EventEmitter<{ event: CalendarEvent, mouseEvent: MouseEvent, deltaX: number, deltaY: number }>();
  @Output() resizeStart = new EventEmitter<{ event: CalendarEvent, mouseEvent: MouseEvent }>();
  @Output() resizeEnd = new EventEmitter<{ event: CalendarEvent, mouseEvent: MouseEvent, deltaY: number }>();
  
  isDragging = false;
  isResizing = false;
  private startY = 0;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    if (!this.event) {
      console.error('DraggableEventComponent: event input is required');
    }
  }
  
  // Only keep the resize functionality with mouse events
  onResizeStart(event: MouseEvent): void {
    if (!this.event.resizable) return;
    
    this.isResizing = true;
    this.startY = event.clientY;
    
    this.resizeStart.emit({ event: this.event, mouseEvent: event });
    
    event.preventDefault();
    event.stopPropagation();
    
    // Add document event listeners for resizing
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }
  
  private onDocumentMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing) return;
    
    const deltaY = event.clientY - this.startY;
    
    event.preventDefault();
    event.stopPropagation();
  };
  
  private onDocumentMouseUp = (event: MouseEvent): void => {
    if (this.isResizing) {
      this.isResizing = false;
      const deltaY = event.clientY - this.startY;
      this.resizeEnd.emit({ 
        event: this.event, 
        mouseEvent: event,
        deltaY
      });
      
      // Remove document event listeners
      document.removeEventListener('mousemove', this.onDocumentMouseMove);
      document.removeEventListener('mouseup', this.onDocumentMouseUp);
    }
  };
  
  // HTML5 Drag and Drop event handlers
  handleDragStart(event: DragEvent): void {
    if (!this.event.draggable) return;
    
    // Set drag data
    if (event.dataTransfer) {
      // Set the event ID as plain text for compatibility
      event.dataTransfer.setData('text/plain', this.event.id);
      
      // Also set application-specific data format for more reliability
      event.dataTransfer.setData('application/calendar-event', this.event.id);
      
      // Allow only move operations
      event.dataTransfer.effectAllowed = 'move';
      
      // Add a custom ghost image that matches the event style
      const dragImage = document.createElement('div');
      dragImage.textContent = this.event.title;
      dragImage.style.backgroundColor = this.event.color?.primary || '#3788d8';
      dragImage.style.color = this.event.color?.textColor || '#ffffff';
      dragImage.style.padding = '8px 12px';
      dragImage.style.borderRadius = '4px';
      dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.zIndex = '9999';
      dragImage.style.pointerEvents = 'none';
      document.body.appendChild(dragImage);
      
      // Set the drag image with an offset to position it properly
      event.dataTransfer.setDragImage(dragImage, 10, 10);
      
      // Clean up the temporary element
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
    
    this.isDragging = true;
    this.dragStart.emit({ event: this.event, mouseEvent: event as unknown as MouseEvent });
    
    // Don't stop propagation for dragstart - this is key for drag/drop to work
    // event.stopPropagation();
  }
  
  // Handler for the HTML5 dragend event
  handleDragEnd(event: DragEvent): void {
    this.isDragging = false;
    
    this.dragEnd.emit({ 
      event: this.event, 
      mouseEvent: event as unknown as MouseEvent,
      deltaX: 0, 
      deltaY: 0
    });
    
    // Don't stop propagation for dragend
    // event.stopPropagation();
  }
  
  // Handler for click events
  handleClick(event: MouseEvent): void {
    // Don't process click if we were just dragging
    if (this.isDragging) {
      event.stopPropagation();
      return;
    }
    
    // Allow click to propagate to parent event handler
  }
}
