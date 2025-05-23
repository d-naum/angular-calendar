import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../../angular-calendar-lib/src/lib/calendar.component';
import { CalendarService, CalendarEvent } from '../../../angular-calendar-lib/src/lib/calendar.service';

@Component({
  selector: 'app-root',  
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Calendar Demo';
  
  constructor(private calendarService: CalendarService) {
    // Add sample calendar events
    this.addSampleEvents();
  }

  // Calendar related methods
  addSampleEvents() {
    try {
      // Today's date
      const today = new Date();
      // Day after tomorrow for regular events (to avoid conflict with all-day event)
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      // First, create the all-day event for today
      this.calendarService.createEvent({
        title: 'Project Deadline',
        description: 'Final project submission',
        start: today,
        allDay: true,
        color: { primary: '#8e24aa', textColor: '#ffffff' },
        draggable: true
      });
      
      // Tomorrow event
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.calendarService.createEvent({
        title: 'Client Presentation',
        description: 'Present project progress to the client',
        start: this.setTimeForDate(tomorrow, 14, 0),  // 2:00 PM tomorrow
        end: this.setTimeForDate(tomorrow, 15, 30),   // 3:30 PM tomorrow
        color: { primary: '#e67c73', textColor: '#ffffff' },
        draggable: true,
        resizable: true
      });
      
      // Regular events on day after tomorrow (not on the all-day event day)
      this.calendarService.createEvent({
        title: 'Team Meeting',
        description: 'Weekly team meeting to discuss project progress',
        start: this.setTimeForDate(dayAfterTomorrow, 10, 0),
        end: this.setTimeForDate(dayAfterTomorrow, 11, 30),
        color: { primary: '#3788d8', textColor: '#ffffff' },
        draggable: true,
        resizable: true
      });
      
      // Non-draggable event
      this.calendarService.createEvent({
        title: 'Non-draggable Event',
        description: 'This event should not be draggable',
        start: this.setTimeForDate(dayAfterTomorrow, 14, 0),
        end: this.setTimeForDate(dayAfterTomorrow, 15, 0),
        color: { primary: '#e67c73', textColor: '#ffffff' },
        draggable: false
      });
      
      // Draggable event
      this.calendarService.createEvent({
        title: 'Draggable Event',
        description: 'This event can be dragged to different times',
        start: this.setTimeForDate(dayAfterTomorrow, 16, 0),
        end: this.setTimeForDate(dayAfterTomorrow, 17, 0),
        color: { primary: '#33b679', textColor: '#ffffff' },
        draggable: true
      });
      
      // Multi-day event (spans 3 days)
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const endMultiDay = new Date(nextWeek);
      endMultiDay.setDate(endMultiDay.getDate() + 2);
      
      this.calendarService.createEvent({
        title: 'Conference',
        description: 'Annual tech conference',
        start: nextWeek,
        end: endMultiDay,
        allDay: true,
        color: { primary: '#33b679', textColor: '#ffffff' },
        draggable: true
      });
    } catch (error) {
      console.error('Error creating sample events:', error);
    }
  }
  
  setTimeForDate(date: Date, hours: number, minutes: number): Date {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }
  
  handleEventCreated(event: CalendarEvent) {
    console.log('Event created:', event);
  }
  
  handleEventUpdated(event: CalendarEvent) {
    console.log('Event updated:', event);
  }
  
  handleEventDeleted(eventId: string) {
    console.log('Event deleted:', eventId);
  }
  
  handleDateSelected(date: Date) {
    console.log('Date selected:', date);
  }
}
