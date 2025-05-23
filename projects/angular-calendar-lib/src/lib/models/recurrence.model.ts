/**
 * Types of recurrence patterns available for events
 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Days of the week for recurrence
 */
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

/**
 * Position in month (for monthly recurrence)
 */
export type MonthlyPosition = 'first' | 'second' | 'third' | 'fourth' | 'last';

/**
 * Recurrence rule configuration
 */
export interface RecurrenceRule {
  /** Type of recurrence pattern */
  type: RecurrenceType;
  
  /** Interval between occurrences (e.g., every 2 weeks) */
  interval?: number;
  
  /** For weekly recurrence: days of the week */
  daysOfWeek?: DayOfWeek[];
  
  /** For monthly recurrence: day of month (e.g., 15th of each month) */
  dayOfMonth?: number;
  
  /** For monthly recurrence: specific position (e.g., last Sunday) */
  position?: MonthlyPosition;
  
  /** For monthly positional recurrence: which day (e.g., first Monday) */
  dayOfWeekPosition?: DayOfWeek;
  
  /** For yearly recurrence: month of the year (0-11) */
  month?: number;
  
  /** Start date of the recurrence */
  startDate: Date;
  
  /** End date of the recurrence (optional) */
  endDate?: Date;
  
  /** Number of occurrences (if no end date) */
  count?: number;
  
  /** Custom recurrence rule in iCalendar format (RFC 5545) */
  rrule?: string;
  
  /** Dates to exclude from the recurrence pattern */
  exdates?: Date[];
}

/**
 * Extended event with recurrence information
 */
export interface RecurrenceOptions {
  /** Whether the event is recurring */
  isRecurring?: boolean;
  
  /** Recurrence rule for the event */
  recurrenceRule?: RecurrenceRule;
  
  /** ID of the recurrence group (for linking recurring instances) */
  recurrenceGroupId?: string;
  
  /** Whether this is an exception to a recurrence pattern */
  isException?: boolean;
  
  /** Original date of the recurring instance (for exceptions) */
  originalDate?: Date;
}
