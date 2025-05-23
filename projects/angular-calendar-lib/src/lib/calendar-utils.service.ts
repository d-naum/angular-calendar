import { Injectable } from '@angular/core';
import { RecurrenceRule, DayOfWeek } from './models/recurrence.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarUtilsService {
  
  constructor() { }
  
  /**
   * Get days in a month
   * @param year Year
   * @param month Month (0-11)
   * @returns Number of days in the month
   */
  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  /**
   * Get the first day of a month
   * @param year Year
   * @param month Month (0-11)
   * @returns Date object for the first day of the month
   */
  getFirstDayOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
  }
  
  /**
   * Get the last day of a month
   * @param year Year
   * @param month Month (0-11)
   * @returns Date object for the last day of the month
   */
  getLastDayOfMonth(year: number, month: number): Date {
    return new Date(year, month + 1, 0);
  }
  
  /**
   * Get the start of a week containing the specified date
   * @param date Date
   * @param startOfWeek Starting day of the week (0 = Sunday)
   * @returns Date object for the first day of the week
   */
  getStartOfWeek(date: Date, startOfWeek: number = 0): Date {
    const day = date.getDay();
    const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
  }
  
  /**
   * Get the end of a week containing the specified date
   * @param date Date
   * @param startOfWeek Starting day of the week (0 = Sunday)
   * @returns Date object for the last day of the week
   */
  getEndOfWeek(date: Date, startOfWeek: number = 0): Date {
    const startDate = this.getStartOfWeek(date, startOfWeek);
    return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
  }
  
  /**
   * Check if two dates are the same (ignoring time)
   * @param date1 First date
   * @param date2 Second date
   * @returns True if dates are the same day
   */
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  /**
   * Check if two dates are in the same month
   * @param date1 First date
   * @param date2 Second date
   * @returns True if dates are in the same month
   */
  isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  }
  
  /**
   * Format a date for display (without time)
   * @param date Date to format
   * @param locale Locale for formatting
   * @returns Formatted date string
   */
  formatDate(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale);
  }
  
  /**
   * Format time for display
   * @param date Date with time to format
   * @param hourFormat 12 or 24 hour format
   * @param locale Locale for formatting
   * @returns Formatted time string
   */
  formatTime(date: Date, hourFormat: '12' | '24' = '12', locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: hourFormat === '12'
    };
    
    return date.toLocaleTimeString(locale, options);
  }
  
  /**
   * Calculate recurrence instances for a recurring event
   * @param rule Recurrence rule
   * @param maxInstances Maximum number of instances to generate
   * @returns Array of dates for the recurrence pattern
   */
  getRecurrenceInstances(rule: RecurrenceRule, maxInstances: number = 100): Date[] {
    const result: Date[] = [];
    const startDate = new Date(rule.startDate);
    const endDate = rule.endDate ? new Date(rule.endDate) : null;
    const count = rule.count || maxInstances;
    
    // Default interval to 1 if not specified
    const interval = rule.interval || 1;
    
    switch(rule.type) {
      case 'daily':
        this.calculateDailyRecurrences(startDate, interval, endDate, count, result);
        break;
        
      case 'weekly':
        this.calculateWeeklyRecurrences(startDate, interval, rule.daysOfWeek || [], endDate, count, result);
        break;
        
      case 'monthly':
        if (rule.dayOfMonth) {
          this.calculateMonthlyDateRecurrences(startDate, interval, rule.dayOfMonth, endDate, count, result);
        } else if (rule.position && rule.dayOfWeekPosition) {
          this.calculateMonthlyPositionalRecurrences(startDate, interval, rule.position, 
            this.getDayOfWeekNumber(rule.dayOfWeekPosition), endDate, count, result);
        }
        break;
        
      case 'yearly':
        this.calculateYearlyRecurrences(startDate, interval, endDate, count, result);
        break;
    }
    
    // Apply exclusions
    if (rule.exdates && rule.exdates.length > 0) {
      return result.filter(date => !rule.exdates!.some(exdate => this.isSameDay(date, exdate)));
    }
    
    return result;
  }
  
  /**
   * Calculate daily recurrence instances
   */
  private calculateDailyRecurrences(
    startDate: Date, 
    interval: number, 
    endDate: Date | null, 
    maxCount: number, 
    result: Date[]
  ): void {
    let currentDate = new Date(startDate);
    let count = 0;
    
    while (
      count < maxCount && 
      (!endDate || currentDate <= endDate)
    ) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + interval);
      count++;
    }
  }
  
  /**
   * Calculate weekly recurrence instances
   */
  private calculateWeeklyRecurrences(
    startDate: Date, 
    interval: number, 
    daysOfWeek: DayOfWeek[], 
    endDate: Date | null, 
    maxCount: number, 
    result: Date[]
  ): void {
    let currentDate = new Date(startDate);
    let count = 0;
    
    // If no days specified, use the start date's day of week
    const daysToInclude = daysOfWeek.length > 0 
      ? daysOfWeek.map(day => this.getDayOfWeekNumber(day))
      : [startDate.getDay()];
    
    while (
      count < maxCount && 
      (!endDate || currentDate <= endDate)
    ) {
      // Check each day of the current week
      const currentWeekStart = this.getStartOfWeek(currentDate);
      
      for (let i = 0; i < 7 && count < maxCount; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(currentWeekStart.getDate() + i);
        
        // Skip if we're before the start date
        if (dayDate < startDate) continue;
        
        // Skip if we're after the end date
        if (endDate && dayDate > endDate) break;
        
        if (daysToInclude.includes(dayDate.getDay())) {
          result.push(new Date(dayDate));
          count++;
        }
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + (7 * interval));
    }
  }
  
  /**
   * Calculate monthly recurrence instances by day of month
   */
  private calculateMonthlyDateRecurrences(
    startDate: Date, 
    interval: number, 
    dayOfMonth: number, 
    endDate: Date | null, 
    maxCount: number, 
    result: Date[]
  ): void {
    let currentDate = new Date(startDate);
    let count = 0;
    
    // Set to the specified day of month for the first occurrence
    currentDate.setDate(dayOfMonth);
    if (currentDate < startDate) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    while (
      count < maxCount && 
      (!endDate || currentDate <= endDate)
    ) {
      // Check if day exists in month (e.g., no February 30)
      const daysInMonth = this.getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      if (dayOfMonth <= daysInMonth) {
        result.push(new Date(currentDate));
        count++;
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + interval);
    }
  }
  
  /**
   * Calculate monthly recurrence instances by position (e.g., "last Sunday")
   */
  private calculateMonthlyPositionalRecurrences(
    startDate: Date, 
    interval: number, 
    position: string, 
    dayOfWeek: number, 
    endDate: Date | null, 
    maxCount: number, 
    result: Date[]
  ): void {
    let currentDate = new Date(startDate);
    let count = 0;
    
    while (
      count < maxCount && 
      (!endDate || currentDate <= endDate)
    ) {
      // Find the date for this positional expression
      const targetDate = this.findPositionalDate(
        currentDate.getFullYear(), 
        currentDate.getMonth(), 
        position, 
        dayOfWeek
      );
      
      // Skip if we're before the start date
      if (targetDate >= startDate) {
        result.push(targetDate);
        count++;
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + interval);
    }
  }
  
  /**
   * Calculate yearly recurrence instances
   */
  private calculateYearlyRecurrences(
    startDate: Date, 
    interval: number, 
    endDate: Date | null, 
    maxCount: number, 
    result: Date[]
  ): void {
    let currentDate = new Date(startDate);
    let count = 0;
    
    while (
      count < maxCount && 
      (!endDate || currentDate <= endDate)
    ) {
      result.push(new Date(currentDate));
      
      // Move to next year
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      count++;
    }
  }
  
  /**
   * Find a date by position in a month (e.g., "last Sunday of March")
   */
  private findPositionalDate(year: number, month: number, position: string, dayOfWeek: number): Date {
    const result = new Date(year, month, 1);
    
    if (position === 'last') {
      // Start from the last day of the month and go backwards
      result.setMonth(month + 1, 0);
      while (result.getDay() !== dayOfWeek) {
        result.setDate(result.getDate() - 1);
      }
    } else {
      // Find the first occurrence of the day
      while (result.getDay() !== dayOfWeek) {
        result.setDate(result.getDate() + 1);
      }
      
      // Advance to the requested position
      const week = this.getPositionNumber(position);
      result.setDate(result.getDate() + (7 * (week - 1)));
    }
    
    return result;
  }
  
  /**
   * Convert position string to number
   */
  private getPositionNumber(position: string): number {
    switch (position) {
      case 'first': return 1;
      case 'second': return 2;
      case 'third': return 3;
      case 'fourth': return 4;
      case 'last': return 5;
      default: return 1;
    }
  }
  
  /**
   * Convert day of week string to number (0-6)
   */
  private getDayOfWeekNumber(day: DayOfWeek): number {
    switch (day) {
      case 'sunday': return 0;
      case 'monday': return 1;
      case 'tuesday': return 2;
      case 'wednesday': return 3;
      case 'thursday': return 4;
      case 'friday': return 5;
      case 'saturday': return 6;
      default: return 0;
    }
  }
}
