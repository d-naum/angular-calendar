import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CalendarComponent, CalendarEvent, CalendarService } from '@groooh/angular-calendar';

type DemoId = 'basics' | 'drag-resize' | 'all-day' | 'operations' | 'overflow';

interface CalendarDemo {
  id: DemoId;
  title: string;
  description: string;
  view: 'month' | 'week' | 'day';
  startHour: number;
  endHour: number;
  hourFormat: '12' | '24';
  maxEventsPerDay: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Calendar Demo';
  selectedDemoId: DemoId = 'basics';
  calendarKey = 0;
  calendarVisible = true;
  readonly demos: CalendarDemo[] = [
    { id: 'basics', title: 'Basic scheduling', description: 'Month, week, and day views with editable appointments.', view: 'month', startHour: 8, endHour: 18, hourFormat: '12', maxEventsPerDay: 3 },
    { id: 'drag-resize', title: 'Drag and resize', description: 'Move appointments across slots and adjust their duration.', view: 'week', startHour: 8, endHour: 19, hourFormat: '12', maxEventsPerDay: 3 },
    { id: 'all-day', title: 'All-day and multi-day', description: 'Milestones, leave, and multi-day events in the month view.', view: 'month', startHour: 8, endHour: 18, hourFormat: '12', maxEventsPerDay: 3 },
    { id: 'operations', title: '24-hour operations', description: 'A day schedule for teams that work around the clock.', view: 'day', startHour: 0, endHour: 23, hourFormat: '24', maxEventsPerDay: 3 },
    { id: 'overflow', title: 'Busy calendar', description: 'A dense month with a controlled event-overflow indicator.', view: 'month', startHour: 8, endHour: 18, hourFormat: '12', maxEventsPerDay: 2 }
  ];

  constructor(private calendarService: CalendarService) {
    this.loadDemo(this.selectedDemoId);
  }

  get selectedDemo(): CalendarDemo {
    return this.demos.find((demo) => demo.id === this.selectedDemoId)!;
  }

  selectDemo(demoId: DemoId): void {
    if (demoId !== this.selectedDemoId) {
      this.loadDemo(demoId);
    }
  }

  setTimeForDate(date: Date, hours: number, minutes: number): Date {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  handleEventCreated(event: CalendarEvent): void {
    console.log('Event created:', event);
  }

  handleEventUpdated(event: CalendarEvent): void {
    console.log('Event updated:', event);
  }

  handleEventDeleted(eventId: string): void {
    console.log('Event deleted:', eventId);
  }

  handleDateSelected(date: Date): void {
    console.log('Date selected:', date);
  }

  private loadDemo(demoId: DemoId): void {
    const shouldRemount = this.calendarKey > 0;
    this.selectedDemoId = demoId;
    this.calendarService.reset();
    this.getDemoEvents(demoId).forEach((event) => this.calendarService.createEvent(event));
    this.calendarKey++;

    if (shouldRemount) {
      this.calendarVisible = false;
      setTimeout(() => this.calendarVisible = true);
    }
  }

  private getDemoEvents(demoId: DemoId): Omit<CalendarEvent, 'id'>[] {
    const today = new Date();
    const dateAt = (offset: number, hour = 9): Date => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return this.setTimeForDate(date, hour, 0);
    };
    const event = (title: string, offset: number, hour: number, duration: number, color: string, options: Partial<Omit<CalendarEvent, 'id' | 'title' | 'start' | 'end' | 'color'>> = {}): Omit<CalendarEvent, 'id'> => ({
      title,
      start: dateAt(offset, hour),
      end: dateAt(offset, hour + duration),
      color: { primary: color, textColor: '#ffffff' },
      ...options
    });

    switch (demoId) {
      case 'drag-resize':
        return [event('Design review', 0, 9, 2, '#2563eb', { draggable: true, resizable: true }), event('Client workshop', 1, 11, 2, '#d97706', { draggable: true, resizable: true }), event('Focus time', 2, 14, 2, '#059669', { draggable: true, resizable: true })];
      case 'all-day':
        return [{ title: 'Company offsite', start: dateAt(1), end: dateAt(3), allDay: true, color: { primary: '#7c3aed', textColor: '#ffffff' }, draggable: true }, { title: 'Annual leave', start: dateAt(5), end: dateAt(7), allDay: true, color: { primary: '#db2777', textColor: '#ffffff' }, draggable: true }, event('Handover', 8, 10, 1, '#2563eb', { draggable: true })];
      case 'operations':
        return [event('Night shift', 0, 0, 6, '#4338ca', { draggable: true, resizable: true }), event('Morning handoff', 0, 7, 1, '#0891b2', { draggable: true, resizable: true }), event('System maintenance', 0, 13, 2, '#dc2626', { draggable: true, resizable: true }), event('Evening coverage', 0, 18, 4, '#16a34a', { draggable: true, resizable: true })];
      case 'overflow':
        return [event('Standup', 1, 9, 1, '#2563eb'), event('Interview', 1, 11, 1, '#9333ea'), event('Planning', 1, 13, 1, '#d97706'), event('Demo', 1, 15, 1, '#059669'), event('Support', 1, 16, 1, '#dc2626'), event('Review', 3, 10, 1, '#2563eb')];
      default:
        return [event('Team standup', 0, 9, 1, '#2563eb', { draggable: true, resizable: true }), event('Client presentation', 1, 14, 2, '#d97706', { draggable: true, resizable: true }), event('Project deadline', 3, 9, 1, '#dc2626', { allDay: true, draggable: true })];
    }
  }
}