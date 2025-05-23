import { NgModule } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { DraggableEventComponent } from './draggable-event.component';
import { TimeSlotComponent } from './time-slot.component';
import { DropZoneDirective } from './drop-zone.directive';

@NgModule({
  declarations: [],  
  imports: [
    CalendarComponent,
    DraggableEventComponent,
    TimeSlotComponent,
    DropZoneDirective
  ],
  exports: [
    CalendarComponent,
    DraggableEventComponent,
    TimeSlotComponent,
    DropZoneDirective
  ]
})
export class MyLibraryModule { }
