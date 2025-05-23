import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-time-slot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-slot"
      [class.current-hour]="isCurrentHour"
      [class.highlight]="highlight">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .time-slot {
      height: 60px;
      border-bottom: 1px solid #e5e5e5;
      position: relative;
      min-width: 100%;
    }
    
    .time-slot:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .time-slot.current-hour {
      background-color: rgba(66, 133, 244, 0.05);
    }
    
    .time-slot.highlight {
      background-color: rgba(66, 133, 244, 0.1);
    }
  `]
})
export class TimeSlotComponent {
  @Input() hour!: number;
  @Input() date!: Date;
  @Input() isCurrentHour: boolean = false;
  @Input() highlight: boolean = false;
  
  @Output() clicked = new EventEmitter<{ date: Date, hour: number }>();
  
  constructor(public elementRef: ElementRef) {}
  
  get slotTop(): number {
    return this.elementRef.nativeElement.offsetTop;
  }
  
  get slotHeight(): number {
    return this.elementRef.nativeElement.clientHeight;
  }
}
