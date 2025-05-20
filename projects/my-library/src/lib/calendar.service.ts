import { Injectable, signal, computed } from '@angular/core';
import { RecurrenceOptions, RecurrenceRule } from './models/recurrence.model';
import { CalendarUtilsService } from './calendar-utils.service';

/**
 * Calendar event color configuration
 */
export interface CalendarEventColor {
  primary: string;   // Main color (background)
  secondary?: string; // Secondary color (border)
  textColor?: string; // Text color
}

/**
 * Calendar event model
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: CalendarEventColor;
  editable?: boolean;
  deletable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  meta?: any; // Custom metadata
  recurrence?: RecurrenceOptions; // Recurrence information
}

/**
 * Date range object for filtering events
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * View mode for calendar display
 */
export type CalendarViewMode = 'day' | 'week' | 'month';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // Private signals for state management
  private events = signal<CalendarEvent[]>([]);
  private selectedDate = signal<Date>(new Date());
  private viewMode = signal<CalendarViewMode>('month');
  
  constructor(private calendarUtils: CalendarUtilsService) {}
  
  // CRUD operations
  
  /**
   * Create a new calendar event
   */
  createEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    // Set proper times for all-day events
    if (event.allDay) {
      const startDate = new Date(event.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = event.end ? new Date(event.end) : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      event = {
        ...event,
        start: startDate,
        end: endDate
      };
    }

    // Check if there's already an all-day event on this date
    if (!event.allDay) {
      const startDate = new Date(event.start);
      const existingAllDayEvent = this.events().find(existingEvent => {
        if (!existingEvent.allDay) return false;
        
        const existingDate = new Date(existingEvent.start);
        return existingDate.getFullYear() === startDate.getFullYear() &&
               existingDate.getMonth() === startDate.getMonth() &&
               existingDate.getDate() === startDate.getDate();
      });

      if (existingAllDayEvent) {
        throw new Error('Cannot create event on a day with an all-day event');
      }
    }

    const newEvent: CalendarEvent = {
      ...event,
      id: this.generateId()
    };
    
    // If this is a recurring event, generate a recurrence group ID
    if (newEvent.recurrence?.isRecurring && newEvent.recurrence.recurrenceRule) {
      newEvent.recurrence.recurrenceGroupId = this.generateId();
    }
    
    this.events.update(events => [...events, newEvent]);
    return newEvent;
  }
  
  /**
   * Get a specific event by ID
   */
  getEvent(id: string): CalendarEvent | undefined {
    return this.events().find(event => event.id === id);
  }
  
  /**
   * Update an existing event
   */
  updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    // If updating to all-day, set proper times
    if (updates.allDay) {
      const startDate = new Date(updates.start || this.getEvent(id)?.start!);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = updates.end ? new Date(updates.end) : new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      updates = {
        ...updates,
        start: startDate,
        end: endDate
      };
    }

    // Check if moving to a day with an all-day event
    if (!updates.allDay && updates.start) {
      const startDate = new Date(updates.start);
      const existingAllDayEvent = this.events().find(existingEvent => {
        if (!existingEvent.allDay || existingEvent.id === id) return false;
        
        const existingDate = new Date(existingEvent.start);
        return existingDate.getFullYear() === startDate.getFullYear() &&
               existingDate.getMonth() === startDate.getMonth() &&
               existingDate.getDate() === startDate.getDate();
      });

      if (existingAllDayEvent) {
        throw new Error('Cannot move event to a day with an all-day event');
      }
    }

    let updatedEvent: CalendarEvent | null = null;
    
    this.events.update(events => 
      events.map(event => {
        if (event.id === id) {
          updatedEvent = { ...event, ...updates };
          return updatedEvent;
        }
        return event;
      })
    );
    
    return updatedEvent;
  }
  
  /**
   * Delete an event by ID
   */
  deleteEvent(id: string): boolean {
    const initialLength = this.events().length;
    this.events.update(events => events.filter(event => event.id !== id));
    return initialLength > this.events().length;
  }
  
  /**
   * Delete all occurrences of a recurring event
   */
  deleteRecurringEvent(recurrenceGroupId: string): boolean {
    if (!recurrenceGroupId) return false;
    
    const initialLength = this.events().length;
    this.events.update(events => events.filter(event => 
      !event.recurrence?.recurrenceGroupId || 
      event.recurrence.recurrenceGroupId !== recurrenceGroupId
    ));
    return initialLength > this.events().length;
  }
  
  /**
   * Get all events
   */
  getAllEvents(): CalendarEvent[] {
    return this.events();
  }
  
  // Date and filtering methods
  
  /**
   * Set the selected date
   */
  setSelectedDate(date: Date): void {
    this.selectedDate.set(date);
  }
  
  /**
   * Get the selected date
   */
  getSelectedDate(): Date {
    return this.selectedDate();
  }
  
  /**
   * Set the calendar view mode
   */
  setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }
  
  /**
   * Get the current view mode
   */
  getViewMode(): CalendarViewMode {
    return this.viewMode();
  }
  
  /**
   * Get events for a specific date
   */
  getEventsForDate(date: Date): CalendarEvent[] {
    // Create date without time parts for comparison
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return this.events().filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
      
      // Handle all-day events
      if (event.allDay) {
        const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
        const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
        
        return eventStartDate <= targetDate && eventEndDate >= targetDate;
      }
      
      // Handle regular events
      return eventStart < nextDay && eventEnd >= targetDate;
    });
  }
  
  /**
   * Get events for a range of dates
   */
  getEventsInRange(range: DateRange): CalendarEvent[] {
    return this.events().filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
      
      return eventStart < range.end && eventEnd >= range.start;
    });
  }
  
  /**
   * Get events for the current week
   */
  getEventsForCurrentWeek(): CalendarEvent[] {
    const today = this.selectedDate();
    const startOfWeek = this.calendarUtils.getStartOfWeek(today);
    const endOfWeek = this.calendarUtils.getEndOfWeek(today);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.getEventsInRange({ start: startOfWeek, end: endOfWeek });
  }
  
  /**
   * Get events for the current month
   */
  getEventsForCurrentMonth(): CalendarEvent[] {
    const today = this.selectedDate();
    const startOfMonth = this.calendarUtils.getFirstDayOfMonth(today.getFullYear(), today.getMonth());
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = this.calendarUtils.getLastDayOfMonth(today.getFullYear(), today.getMonth());
    endOfMonth.setHours(23, 59, 59, 999);
    
    return this.getEventsInRange({ start: startOfMonth, end: endOfMonth });
  }
  
  /**
   * Adjust the time components from a source date to a target date
   */
  private adjustDateTimeForInstance(targetDate: Date, sourceDate: Date): Date {
    const result = new Date(targetDate);
    result.setHours(
      sourceDate.getHours(),
      sourceDate.getMinutes(),
      sourceDate.getSeconds(),
      sourceDate.getMilliseconds()
    );
    return result;
  }
  
  // Helper methods
  
  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Reset the calendar
   */
  reset(): void {
    this.events.set([]);
    this.selectedDate.set(new Date());
    this.viewMode.set('month');
  }
}
