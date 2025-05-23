import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, CalendarService, CalendarViewMode, DateRange } from './calendar.service';
import { DraggableEventComponent } from './draggable-event.component';
import { DropZoneDirective } from './drop-zone.directive';

@Component({
  selector: 'lib-calendar',  standalone: true,
  imports: [CommonModule, FormsModule, DraggableEventComponent, DropZoneDirective],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="calendar-navigation">
          <button class="nav-btn" (click)="navigatePrevious()">&lt;</button>
          <h2 class="calendar-title">{{ getHeaderTitle() }}</h2>
          <button class="nav-btn" (click)="navigateNext()">&gt;</button>
        </div>
        
        <div class="calendar-view-selector">
          <button 
            class="view-btn" 
            [class.active]="currentView === 'month'"
            (click)="setView('month')">Month</button>
          <button 
            class="view-btn" 
            [class.active]="currentView === 'week'"
            (click)="setView('week')">Week</button>
          <button 
            class="view-btn" 
            [class.active]="currentView === 'day'"
            (click)="setView('day')">Day</button>
        </div>
        
        <button class="today-btn" (click)="goToToday()">Today</button>
      </div>
      
      <!-- Month View -->
      <div *ngIf="currentView === 'month'" class="calendar-month-view">
        <div class="weekdays-header">
          <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
        </div>
        
        <div class="month-grid">          <div 
            *ngFor="let date of daysInMonth" 
            class="calendar-day"
            [class.current-month]="isCurrentMonth(date)"
            [class.today]="isToday(date)"
            [class.selected]="isSelected(date)"
            libDropZone
            [date]="date"
            (itemDropped)="onItemDropped($event)"
            (click)="selectDate(date)">
            <div class="date-header">
              <span class="date-number">{{ date.getDate() }}</span>
              <button 
                *ngIf="isCurrentMonth(date)"
                class="add-event-btn" 
                (click)="openNewEventForm(date, $event)">+</button>
            </div>
              <div class="events-container">
              <lib-draggable-event
                *ngFor="let event of getEventsForDate(date)"
                [event]="event"
                [class.event-start]="getEventMultiDayPosition(event, date) === 'start'"
                [class.event-middle]="getEventMultiDayPosition(event, date) === 'middle'"
                [class.event-end]="getEventMultiDayPosition(event, date) === 'end'"
                (click)="onEventClick(event, $event)"
                (dragStart)="onDragStart($event)"
                (dragEnd)="onDragEnd($event, date)">
                {{ event.title }}
              </lib-draggable-event>
              
              <div *ngIf="getEventsForDate(date).length > maxEventsPerDay" class="more-events">
                +{{ getEventsForDate(date).length - maxEventsPerDay }} more
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Week View -->
      <div *ngIf="currentView === 'week'" class="calendar-week-view">
        <div class="weekdays-header">
          <div class="time-gutter"></div>
          <div 
            *ngFor="let date of daysInWeek" 
            class="weekday"
            [class.today]="isToday(date)">
            <div>{{ getDayName(date) }}</div>
            <div class="date-number">{{ date.getDate() }}</div>
          </div>
        </div>
        
        <div class="week-body">
          <div class="time-gutter">
            <div *ngFor="let hour of hoursOfDay" class="hour-cell">
              {{ formatHour(hour) }}
            </div>
          </div>
          
          <div class="days-container">
            <div *ngFor="let date of daysInWeek" class="day-column">            <div *ngFor="let hour of hoursOfDay" 
                 class="hour-cell" 
                 libDropZone
                 [date]="date"
                 [hour]="hour"
                 (itemDropped)="onItemDropped($event)"
                 (click)="onTimeSlotClick(date, hour)">
                <!-- Events will be positioned absolutely over these cells -->
              </div>
                <!-- Events for the day -->
              <lib-draggable-event
                *ngFor="let event of getEventsForDate(date)"
                [event]="event"
                [showResizeHandle]="true"
                [style.position]="'absolute'"
                [style.top.px]="calculateEventTop(event, date)"
                [style.height.px]="calculateEventHeight(event, date)"
                [style.width.calc]="getEventMultiDayPosition(event, date) === 'start' || getEventMultiDayPosition(event, date) === 'middle' ? 'calc(100% + 2px)' : 'calc(100% - 4px)'"
                [class.event-start]="getEventMultiDayPosition(event, date) === 'start'"
                [class.event-middle]="getEventMultiDayPosition(event, date) === 'middle'"
                [class.event-end]="getEventMultiDayPosition(event, date) === 'end'"
                (click)="onEventClick(event, $event)"
                (dragStart)="onDragStart($event)"
                (dragEnd)="onDragEnd($event, date)"
                (resizeStart)="onResizeStart($event)"
                (resizeEnd)="onResizeEnd($event)">
                {{ event.title }}
              </lib-draggable-event>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Day View -->
      <div *ngIf="currentView === 'day'" class="calendar-day-view">
        <div class="day-header">
          <div class="time-gutter"></div>
          <div class="day-title" [class.today]="isToday(selectedDate)">
            <div>{{ getDayName(selectedDate) }}</div>
            <div class="date-number">{{ selectedDate.getDate() }}</div>
          </div>
        </div>
        
        <div class="day-body">
          <div class="time-gutter">
            <div *ngFor="let hour of hoursOfDay" class="hour-cell">
              {{ formatHour(hour) }}
            </div>
          </div>
          
          <div class="day-column">            <div *ngFor="let hour of hoursOfDay" 
                 class="hour-cell" 
                 libDropZone
                 [date]="selectedDate"
                 [hour]="hour"
                 (itemDropped)="onItemDropped($event)"
                 (click)="onTimeSlotClick(selectedDate, hour)">
              <!-- Time slot -->
            </div>
              <!-- Events for the day -->            <lib-draggable-event
                *ngFor="let event of getEventsForDate(selectedDate)"
                [event]="event"
                [showResizeHandle]="true"                [style.position]="'absolute'"
                [style.top.px]="calculateEventTop(event, selectedDate)"
                [style.height.px]="calculateEventHeight(event, selectedDate)"
                [style.width.calc]="getEventMultiDayPosition(event, selectedDate) === 'start' || getEventMultiDayPosition(event, selectedDate) === 'middle' ? 'calc(100% + 2px)' : 'calc(100% - 4px)'"
                [class.event-start]="getEventMultiDayPosition(event, selectedDate) === 'start'"
                [class.event-middle]="getEventMultiDayPosition(event, selectedDate) === 'middle'"
                [class.event-end]="getEventMultiDayPosition(event, selectedDate) === 'end'"
                (click)="onEventClick(event, $event)"
                (dragStart)="onDragStart($event)"
                (dragEnd)="onDragEnd($event, selectedDate)"
                (resizeStart)="onResizeStart($event)"
                (resizeEnd)="onResizeEnd($event)">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div *ngIf="event.description" class="event-description">{{ event.description }}</div>
            </lib-draggable-event>
          </div>
        </div>
      </div>
      
      <!-- New Event Form -->
      <div *ngIf="showEventForm" class="event-form-overlay" (click)="closeEventForm()">
        <div class="event-form" (click)="$event.stopPropagation()">
          <h3>{{ editMode ? 'Edit Event' : 'New Event' }}</h3>
          
          <div class="form-group">
            <label for="eventTitle">Title</label>
            <input type="text" id="eventTitle" [(ngModel)]="newEvent.title" placeholder="Event Title" required>
          </div>
          
          <div class="form-group">
            <label for="eventDescription">Description</label>
            <textarea id="eventDescription" [(ngModel)]="newEvent.description" placeholder="Event Description"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="eventStart">Start</label>
              <input type="datetime-local" id="eventStart" [ngModel]="formatDateForInput(newEvent.start)" (ngModelChange)="updateStartDate($event)">
            </div>
            
            <div class="form-group">
              <label for="eventEnd">End</label>
              <input type="datetime-local" id="eventEnd" [ngModel]="formatDateForInput(newEvent.end)" (ngModelChange)="updateEndDate($event)">
            </div>
          </div>
            <div class="form-group checkbox-group">
            <input type="checkbox" id="allDayEvent" [(ngModel)]="newEvent.allDay">
            <label for="allDayEvent">All Day Event</label>
          </div>
          
          <div class="form-group checkbox-group">
            <input type="checkbox" id="draggableEvent" [(ngModel)]="newEvent.draggable">
            <label for="draggableEvent">Movable Event</label>
          </div>
          
          <div class="form-group">
            <label for="eventColor">Color</label>
            <input type="color" id="eventColor" [(ngModel)]="eventColorInput" (change)="updateEventColor()">
          </div>
          
          <div class="form-actions">
            <button class="btn cancel-btn" (click)="closeEventForm()">Cancel</button>
            <button *ngIf="editMode && newEvent.deletable !== false" class="btn delete-btn" (click)="deleteEvent()">Delete</button>
            <button class="btn save-btn" (click)="saveEvent()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      font-family: Arial, sans-serif;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 16px;
      box-sizing: border-box;
      position: relative;
    }
    
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .calendar-navigation {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .calendar-title {
      margin: 0;
      font-size: 1.5rem;
      min-width: 200px;
      text-align: center;
    }
    
    .nav-btn, .view-btn, .today-btn {
      padding: 8px 12px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      outline: none;
    }
    
    .nav-btn:hover, .view-btn:hover, .today-btn:hover {
      background-color: #e9e9e9;
    }
    
    .calendar-view-selector {
      display: flex;
      gap: 4px;
    }
    
    .view-btn.active {
      background-color: #3788d8;
      color: white;
      border-color: #3788d8;
    }
    
    .weekdays-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: bold;
      border-bottom: 1px solid #eee;
      padding: 8px 0;
      gap: 1px; /* Added to match month-grid gap */
    }
    
    .weekdays-header .weekday {
      padding: 8px;
      box-sizing: border-box; /* Added for consistent width calculation */
    }
    
    /* Month View */
    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: #f0f0f0;
      border: 1px solid #f0f0f0;
    }
    
    .calendar-day {
      min-height: 100px;
      background-color: #fff;
      padding: 4px;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      box-sizing: border-box; /* Ensures padding and border are included in the element's total width and height */
      min-width: 0; /* Ensures grid columns maintain equal width regardless of content */
    }
    
    .calendar-day:hover {
      background-color: #f9f9f9;
    }
    
    .calendar-day.today {
      background-color: #fcf8e3;
    }
    
    .calendar-day.selected {
      background-color: #d9edf7;
    }
    
    .calendar-day:not(.current-month) {
      color: #ccc;
      background-color: #f9f9f9;
    }
    
    .date-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    
    .date-number {
      font-weight: bold;
      font-size: 0.9rem;
    }
    
    .add-event-btn {
      visibility: hidden;
      background-color: #3788d8;
      color: white;
      border: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
    }
    
    .calendar-day:hover .add-event-btn {
      visibility: visible;
    }
    
    .events-container {
      overflow: hidden;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .event-item {
      padding: 2px 4px;
      font-size: 0.8rem;
      border-radius: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    
    .event-item:hover {
      filter: brightness(90%);
    }
    
    .more-events {
      font-size: 0.8rem;
      color: #888;
      margin-top: 2px;
      text-align: center;
    }
    
    /* Week View */
    .calendar-week-view .weekdays-header {
      grid-template-columns: 60px repeat(7, 1fr);
    }
    
    .week-body {
      display: flex;
      height: 600px;
      overflow-y: auto;
    }
    
    .time-gutter {
      width: 60px;
      border-right: 1px solid #eee;
    }
    
    .hour-cell {
      height: 60px;
      border-bottom: 1px solid #eee;
      padding: 2px 4px;
      position: relative;
      box-sizing: border-box; /* Ensure padding and border are within the height */
    }
    
    .time-gutter .hour-cell {
      text-align: right;
      padding-right: 8px;
      font-size: 0.8rem;
      color: #666;
    }
    
    .days-container {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }
      .day-column {
      position: relative;
      border-right: 1px solid #eee;
      overflow: visible; /* Allow multi-day events to cross column boundaries */
      z-index: 1; /* Ensure proper stacking context for events */
    }
    
    .day-column:last-child {
      border-right: none;
    }
    
    .week-event {
      position: absolute;
      left: 2px;
      right: 2px;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.8rem;
      overflow: hidden;
      z-index: 1;
      cursor: pointer;
    }
    
    /* Day View */
    .calendar-day-view .day-header {
      display: grid;
      grid-template-columns: 60px 1fr;
      text-align: center;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    }
    
    .day-body {
      display: flex;
      height: 600px;
      overflow-y: auto;
    }
    
    .day-column {
      flex: 1;
      position: relative;
    }
    
    .day-event {
      position: absolute;
      left: 2px;
      right: 2px;
      padding: 4px;
      border-radius: 3px;
      font-size: 0.9rem;
      z-index: 1;
      cursor: pointer;
      overflow: hidden;
    }
    
    .event-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .event-time {
      font-size: 0.8rem;
      opacity: 0.8;
      margin-bottom: 4px;
    }
    
    .event-description {
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    /* Event Form */
    .event-form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .event-form {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .event-form h3 {
      margin-top: 0;
      margin-bottom: 16px;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
      font-size: 0.9rem;
    }
    
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 0.9rem;
    }
    
    .form-group textarea {
      height: 80px;
      resize: vertical;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .checkbox-group input {
      width: auto;
    }
    
    .checkbox-group label {
      margin-bottom: 0;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
    }
    
    .save-btn {
      background-color: #3788d8;
      color: white;
    }
    
    .cancel-btn {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
    }
    
    .delete-btn {
      background-color: #dc3545;
      color: white;
      margin-right: auto;
    }
    
    /* Draggable event styles */
    ::ng-deep .calendar-month-view lib-draggable-event {
      width: 100%;
      margin-bottom: 2px;
      display: block;
      z-index: 5;
    }
      /* Multi-day event styling for month view */
    ::ng-deep .calendar-month-view lib-draggable-event.event-start .draggable-event {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      margin-right: -1px; /* Create seamless connection */
      width: calc(100% + 1px); /* Slightly wider to connect with next day */
    }
    
    ::ng-deep .calendar-month-view lib-draggable-event.event-middle .draggable-event {
      border-radius: 0;
      margin-left: -1px;
      margin-right: -1px;
      width: calc(100% + 2px); /* Wider to connect with adjacent days */
    }
    
    ::ng-deep .calendar-month-view lib-draggable-event.event-end .draggable-event {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin-left: -1px;
      width: 100%; /* Normal width for end pieces */
    }
    
    ::ng-deep .calendar-month-view lib-draggable-event.event-middle {
      z-index: 4; /* Lower z-index than start and end to handle overlaps */
    }
      ::ng-deep .calendar-week-view lib-draggable-event,
    ::ng-deep .calendar-day-view lib-draggable-event {
      position: absolute;
      left: 0;
      right: 0;
      margin: 0; /* Remove margin to prevent offset */
      z-index: 5;
      overflow: visible; /* Allow content to overflow for multi-day events */
    }
      ::ng-deep .calendar-week-view lib-draggable-event .draggable-event,
    ::ng-deep .calendar-day-view lib-draggable-event .draggable-event {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 4px 8px; /* Add padding for better readability */
      box-sizing: border-box;
      overflow: hidden; /* Hide overflowing text content */
      text-overflow: ellipsis;
    }
    
    /* Improve text display in multi-day events */
    ::ng-deep .calendar-week-view lib-draggable-event .event-title,
    ::ng-deep .calendar-day-view lib-draggable-event .event-title {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.event-middle .event-title,
    ::ng-deep .calendar-day-view lib-draggable-event.event-middle .event-title,
    ::ng-deep .calendar-week-view lib-draggable-event.event-end .event-time,
    ::ng-deep .calendar-day-view lib-draggable-event.event-end .event-time,
    ::ng-deep .calendar-week-view lib-draggable-event.event-middle .event-time,
    ::ng-deep .calendar-day-view lib-draggable-event.event-middle .event-time {
      /* Hide time display for middle and end parts of multi-day events to avoid repetition */
      display: none;
    }/* Multi-day event styling for week and day views */
    ::ng-deep .calendar-week-view lib-draggable-event.event-start .draggable-event,
    ::ng-deep .calendar-day-view lib-draggable-event.event-start .draggable-event {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      right: -2px; /* Extend slightly to the right to create seamless connection */
      clip-path: inset(0 0 0 0); /* Ensures the event doesn't get clipped */
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.event-middle .draggable-event,
    ::ng-deep .calendar-day-view lib-draggable-event.event-middle .draggable-event {
      border-radius: 0;
      left: -2px; /* Extend slightly to the left */
      right: -2px; /* Extend slightly to the right */
      clip-path: inset(0 0 0 0); /* Ensures the event doesn't get clipped */
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.event-end .draggable-event,
    ::ng-deep .calendar-day-view lib-draggable-event.event-end .draggable-event {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      left: -2px; /* Extend slightly to the left to create seamless connection */
      clip-path: inset(0 0 0 0); /* Ensures the event doesn't get clipped */
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.dragging,
    ::ng-deep .calendar-day-view lib-draggable-event.dragging,
    ::ng-deep .calendar-month-view lib-draggable-event.dragging {
      z-index: 1000;
    }
    
    /* Improve stacking of multi-day events */
    ::ng-deep .calendar-week-view lib-draggable-event.event-start {
      z-index: 6; /* Higher than middle and end parts */
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.event-middle {
      z-index: 5; /* Lower than start, higher than end */
    }
    
    ::ng-deep .calendar-week-view lib-draggable-event.event-end {
      z-index: 4; /* Lower than middle and start */
    }
    
    /* Drop zone styles */
    :host ::ng-deep .drag-over {
      background-color: rgba(0, 120, 215, 0.2) !important;
      border: 2px dashed #0078d7 !important;
      box-shadow: inset 0 0 5px rgba(0, 120, 215, 0.3);
      transition: all 0.2s ease;
    }
    
    :host ::ng-deep .calendar-day {
      transition: background-color 0.2s ease;
    }
    
    :host ::ng-deep .hour-cell {
      transition: background-color 0.2s ease;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .calendar-container {
        padding: 8px; /* Reduced padding */
      }

      .calendar-header {
        flex-direction: column;
        align-items: stretch;
        gap: 8px; /* Reduced gap */
      }

      .calendar-title {
        font-size: 1.3rem; /* Slightly smaller title */
      }

      .nav-btn, .view-btn, .today-btn {
        padding: 6px 10px; /* Smaller buttons */
        font-size: 0.85rem;
      }
      
      .calendar-navigation {
        justify-content: space-between; /* Better spacing for nav buttons */
      }
      
      .calendar-view-selector {
        display: grid; /* Changed to grid for better distribution */
        grid-template-columns: repeat(3, 1fr); /* Equal width for view buttons */
        gap: 4px;
        width: 100%;
      }
      
      .today-btn {
        display: block;
        width: 100%;
        margin-top: 8px;
      }

      .weekdays-header .weekday {
        padding: 4px; /* Reduced padding */
        font-size: 0.8rem;
      }

      /* Month View Responsive */
      .calendar-day {
        min-height: 80px; /* Reduced min-height for month days */
        padding: 2px;
      }

      .date-number {
        font-size: 0.8rem;
      }

      .add-event-btn {
        width: 18px;
        height: 18px;
        font-size: 12px;
      }

      .event-item {
        font-size: 0.75rem; /* Smaller event text in month view */
        padding: 1px 2px;
      }

      .more-events {
        font-size: 0.7rem;
      }

      /* Week/Day View Responsive */
      .calendar-week-view .weekdays-header,
      .calendar-day-view .day-header {
        font-size: 0.8rem;
      }
      
      .time-gutter {
        width: 45px; /* Reduced time gutter width */
        font-size: 0.7rem;
      }

      .hour-cell {
        /* height: 50px; */ /* Removed to prevent squeezing column height */
        font-size: 0.7rem;
      }
      
      .week-body, .day-body {
        height: 450px; /* Adjust height for smaller screens */
      }

      .day-event, .week-event {
        font-size: 0.75rem;
      }
      
      .event-title {
        font-size: 0.8rem;
      }
      .event-time, .event-description {
        font-size: 0.7rem;
      }

      /* Event Form Responsive */
      .event-form {
        padding: 15px;
        width: 95%; /* Slightly wider form on small screens */
      }

      .event-form h3 {
        font-size: 1.2rem;
      }
      
      .form-row {
        flex-direction: column;
        gap: 8px; /* Consistent gap */
        margin-bottom: 12px; /* Adjusted margin */
      }

      .form-group label {
        font-size: 0.85rem;
      }

      .form-group input, .form-group textarea {
        padding: 6px;
        font-size: 0.85rem;
      }
      
      .form-actions {
        gap: 6px;
      }

      .btn {
        padding: 6px 12px;
        font-size: 0.85rem;
      }
    }

    /* Additional media query for very small screens */
    @media (max-width: 480px) {
      .calendar-title {
        font-size: 1.1rem;
        min-width: 150px; /* Adjust min-width */
      }

      .nav-btn, .view-btn, .today-btn {
        padding: 5px 8px;
        font-size: 0.8rem;
      }
      
      .weekdays-header {
        /* Optionally hide weekday names and show only first letter or use numbers */
        /* Example: .weekday:first-letter { font-size: 0.9rem; } */
      }
      
      .calendar-day {
        min-height: 60px; /* Further reduce for very small screens */
      }

      .date-number {
        font-size: 0.7rem;
      }
      
      .events-container lib-draggable-event {
        /* On very small screens, you might want to show only dots or a count */
        font-size: 0.7rem;
      }
      
      .time-gutter {
        width: 35px; /* Further reduce time gutter */
        font-size: 0.6rem;
      }

      .hour-cell {
        /* height: 40px; */ /* Removed to prevent squeezing column height */
        font-size: 0.6rem; /* Retaining font-size adjustment from original 480px rule */
      }
      
      /* Hide event descriptions in day/week view on very small screens if too cluttered */
      ::ng-deep .calendar-day-view lib-draggable-event .event-description,
      ::ng-deep .calendar-week-view lib-draggable-event .event-description {
        display: none;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  @Input() defaultView: CalendarViewMode = 'month';
  @Input() maxEventsPerDay: number = 3;  @Input() hourFormat: '12' | '24' = '12';
  @Input() startHour: number = 0; // 12 AM (midnight)
  @Input() endHour: number = 23; // 11 PM
  @Input() defaultEventColor: string = '#3788d8';
  
  @Output() eventClicked = new EventEmitter<CalendarEvent>();
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() eventCreated = new EventEmitter<CalendarEvent>();
  @Output() eventUpdated = new EventEmitter<CalendarEvent>();
  @Output() eventDeleted = new EventEmitter<string>();
  
  private calendarService = inject(CalendarService);
  
  // State variables
  currentView: CalendarViewMode = 'month'; // Default to month view
  selectedDate: Date = new Date();
  daysInMonth: Date[] = [];
  daysInWeek: Date[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hoursOfDay: number[] = [];
  
  // Event form state
  showEventForm: boolean = false;
  editMode: boolean = false;
  eventId: string | null = null;
  newEvent: any = this.getDefaultEvent();
  eventColorInput: string = this.defaultEventColor;
  
  // Flag to prevent event click when dropping
  private preventEventClickOnDrop = false;
  
  ngOnInit(): void {
    this.currentView = this.defaultView;
    this.initCalendar();
    this.generateHoursList();
  }
  
  initCalendar(): void {
    this.selectedDate = this.calendarService.getSelectedDate();
    this.calendarService.setViewMode(this.currentView);
    this.generateCalendarDays();
  }
  
  generateHoursList(): void {
    this.hoursOfDay = [];
    for (let i = this.startHour; i <= this.endHour; i++) {
      this.hoursOfDay.push(i);
    }
  }
  
  // Navigation methods
  navigateNext(): void {
    const date = new Date(this.selectedDate);
    
    switch (this.currentView) {
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'week':
        date.setDate(date.getDate() + 7);
        break;
      case 'day':
        date.setDate(date.getDate() + 1);
        break;
    }
    
    this.selectedDate = date;
    this.calendarService.setSelectedDate(date);
    this.generateCalendarDays();
    this.dateSelected.emit(date);
  }
  
  navigatePrevious(): void {
    const date = new Date(this.selectedDate);
    
    switch (this.currentView) {
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
    }
    
    this.selectedDate = date;
    this.calendarService.setSelectedDate(date);
    this.generateCalendarDays();
    this.dateSelected.emit(date);
  }
  
  goToToday(): void {
    const today = new Date();
    this.selectedDate = today;
    this.calendarService.setSelectedDate(today);
    this.generateCalendarDays();
    this.dateSelected.emit(today);
  }
  
  setView(view: CalendarViewMode): void {
    this.currentView = view;
    this.calendarService.setViewMode(view);
    this.generateCalendarDays();
  }
  
  // Calendar generation methods
  generateCalendarDays(): void {
    switch (this.currentView) {
      case 'month':
        this.generateMonthDays();
        break;
      case 'week':
        this.generateWeekDays();
        break;
      case 'day':
        // No need to generate days for day view
        break;
    }
  }
  
  generateMonthDays(): void {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // First day of the calendar (might be in the previous month)
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstCalendarDay.getDate() - firstCalendarDay.getDay());
    
    // Generate 6 weeks of days
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(firstCalendarDay);
      day.setDate(firstCalendarDay.getDate() + i);
      days.push(day);
    }
    
    this.daysInMonth = days;
  }
  
  generateWeekDays(): void {
    const date = new Date(this.selectedDate);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Start of the week (Sunday)
    date.setDate(date.getDate() - day);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(date);
      weekDay.setDate(date.getDate() + i);
      days.push(weekDay);
    }
    
    this.daysInWeek = days;
  }
  
  // Helper methods
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.selectedDate.getMonth();
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }
  
  isSelected(date: Date): boolean {
    return date.getFullYear() === this.selectedDate.getFullYear() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getDate() === this.selectedDate.getDate();
  }
  
  selectDate(date: Date): void {
    this.selectedDate = date;
    this.calendarService.setSelectedDate(date);
    this.dateSelected.emit(date);
    
    // If in day view, no need to regenerate
    if (this.currentView !== 'day') {
      this.generateCalendarDays();
    }
  }
  
  getDayName(date: Date): string {
    return this.weekDays[date.getDay()];
  }
  
  formatHour(hour: number): string {
    if (this.hourFormat === '12') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour} ${period}`;
    } else {
      return `${hour}:00`;
    }
  }
  
  formatEventTime(event: CalendarEvent): string {
    if (event.allDay) {
      return 'All Day';
    }
    
    const startHour = this.formatTimeFromDate(event.start);
    const endHour = event.end ? this.formatTimeFromDate(event.end) : '';
    
    return endHour ? `${startHour} - ${endHour}` : startHour;
  }
  
  formatTimeFromDate(date: Date): string {
    if (this.hourFormat === '12') {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }
  
  formatDateForInput(date?: Date): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  getHeaderTitle(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    
    switch (this.currentView) {
      case 'month':
        return this.selectedDate.toLocaleDateString(undefined, options);
      case 'week':
        const weekStart = this.daysInWeek[0];
        const weekEnd = this.daysInWeek[this.daysInWeek.length - 1];
        const startMonth = weekStart.toLocaleDateString(undefined, { month: 'short' });
        const endMonth = weekEnd.toLocaleDateString(undefined, { month: 'short' });
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        const year = weekEnd.getFullYear();
        
        if (startMonth === endMonth) {
          return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        } else {
          return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
      case 'day':
        return this.selectedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      default:
        return '';
    }
  }
  
  // Event methods
  getEventsForDate(date: Date): CalendarEvent[] {
    const events = this.calendarService.getEventsForDate(date);
    
    // For month view, limit visible events
    if (this.currentView === 'month') {
      return events.slice(0, this.maxEventsPerDay);
    }
    
    return events;
  }
  calculateEventTop(event: CalendarEvent, date?: Date): number {
    if (event.allDay) return 0;

    // Each minute is 1px if HOUR_HEIGHT = 60
    const HOUR_HEIGHT = 60;
    const calendarStartMinutes = this.startHour * 60;
    
    // For multi-day events, handle positioning based on which day of the event we're showing
    if (event.end && event.start.toDateString() !== event.end.toDateString()) {
      const currentDate = date || (this.currentView === 'day' ? this.selectedDate : new Date());
      const currentDateStr = currentDate.toDateString();
      
      // If this is the start day, use the event start time
      if (event.start.toDateString() === currentDateStr) {
        const eventMinutes = event.start.getHours() * 60 + event.start.getMinutes();
        return Math.max(0, eventMinutes - calendarStartMinutes);
      } 
      // If this is a middle day or end day, start from the beginning of the visible hours
      else {
        return 0;
      }
    }

    // For single-day events, calculate normally
    const eventMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    return Math.max(0, eventMinutes - calendarStartMinutes);
  }
  calculateEventHeight(event: CalendarEvent, date?: Date): number {
    if (event.allDay) return (this.endHour - this.startHour + 1) * 60;

    const start = event.start;
    const end = event.end || new Date(start.getTime() + 3600000); // Default 1 hour

    // Handle multi-day events (show only until end of day or from start of day)
    if (end.getDate() !== start.getDate()) {
      const currentDate = date || (this.currentView === 'day' ? this.selectedDate : new Date());
      const currentDateStr = currentDate.toDateString();
      
      // If this is the start day of the event
      if (start.toDateString() === currentDateStr) {
        const endOfDay = new Date(start);
        endOfDay.setHours(23, 59, 59, 999);
        const duration = (endOfDay.getTime() - start.getTime()) / 60000; // in minutes
        return Math.max(1, duration);
      } 
      // If this is the end day of the event
      else if (end.toDateString() === currentDateStr) {
        const startOfDay = new Date(currentDate);
        startOfDay.setHours(this.startHour, 0, 0, 0);
        const duration = (end.getTime() - startOfDay.getTime()) / 60000; // in minutes
        return Math.max(1, duration);
      }
      // If this is a middle day, show for the entire day
      else {
        return (this.endHour - this.startHour) * 60;
      }
    }

    // Calculate exact duration in minutes for single-day events
    const duration = (end.getTime() - start.getTime()) / 60000;
    return Math.max(1, duration);
  }
  
  onEventClick(event: CalendarEvent, e: MouseEvent): void {
    e.stopPropagation();
    
    // Don't open the edit form if we just dropped an event
    if (this.preventEventClickOnDrop) {
      console.log('Ignoring click after drop operation');
      return;
    }
    
    this.eventClicked.emit(event);
    this.openEditEventForm(event);
  }
  
  onTimeSlotClick(date: Date, hour: number): void {
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);
    
    this.openNewEventForm(startTime);
  }
  
  // Event form methods
  openNewEventForm(date: Date, e?: MouseEvent): void {
    if (e) {
      e.stopPropagation();
    }
    
    const startTime = new Date(date);
    startTime.setHours(this.startHour, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1, 0, 0, 0);
      this.newEvent = {
      title: '',
      description: '',      start: startTime,
      end: endTime,
      allDay: false,
      draggable: false,
      color: { primary: this.defaultEventColor }
    };
    
    this.eventColorInput = this.defaultEventColor;
    this.editMode = false;
    this.eventId = null;
    this.showEventForm = true;
  }
  
  openEditEventForm(event: CalendarEvent): void {
    this.newEvent = { ...event };
    this.eventColorInput = event.color?.primary || this.defaultEventColor;
    this.editMode = true;
    this.eventId = event.id;
    this.showEventForm = true;
  }
  
  closeEventForm(): void {
    this.showEventForm = false;
  }
  
  updateStartDate(dateString: string): void {
    this.newEvent.start = new Date(dateString);
    
    // If end date is before start date, update it
    if (this.newEvent.end && this.newEvent.end < this.newEvent.start) {
      const endTime = new Date(this.newEvent.start);
      endTime.setHours(endTime.getHours() + 1);
      this.newEvent.end = endTime;
    }
  }
  
  updateEndDate(dateString: string): void {
    this.newEvent.end = new Date(dateString);
  }
  
  updateEventColor(): void {
    if (!this.newEvent.color) {
      this.newEvent.color = {};
    }
    
    this.newEvent.color.primary = this.eventColorInput;
    
    // Generate secondary color (lighter)
    const hex = this.eventColorInput.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Lighten by 30%
    const lighten = (c: number): number => Math.min(255, c + (255 - c) * 0.3);
    
    const rLight = Math.round(lighten(r));
    const gLight = Math.round(lighten(g));
    const bLight = Math.round(lighten(b));
    
    this.newEvent.color.secondary = `#${rLight.toString(16).padStart(2, '0')}${gLight.toString(16).padStart(2, '0')}${bLight.toString(16).padStart(2, '0')}`;
    
    // Text color (white or black depending on brightness)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    this.newEvent.color.textColor = brightness > 128 ? '#000000' : '#ffffff';
  }
  
  saveEvent(): void {
    if (!this.newEvent.title) return;
    
    // Make sure there's an end date
    if (!this.newEvent.end) {
      const endTime = new Date(this.newEvent.start);
      endTime.setHours(endTime.getHours() + 1);
      this.newEvent.end = endTime;
    }
    
    // Ensure color is set
    if (!this.newEvent.color) {
      this.newEvent.color = { primary: this.defaultEventColor };
    }
    
    try {
      let savedEvent: CalendarEvent;
      
      if (this.editMode && this.eventId) {
        savedEvent = this.calendarService.updateEvent(this.eventId, this.newEvent)!;
        this.eventUpdated.emit(savedEvent);
      } else {
        savedEvent = this.calendarService.createEvent(this.newEvent);
        this.eventCreated.emit(savedEvent);
      }
      
      this.closeEventForm();
      this.generateCalendarDays();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to save event');
      }
    }
  }
  
  deleteEvent(): void {
    if (!this.editMode || !this.eventId) return;
    
    const deleted = this.calendarService.deleteEvent(this.eventId);
    if (deleted) {
      this.eventDeleted.emit(this.eventId);
      this.closeEventForm();
      this.generateCalendarDays();
    }
  }
  
  // Drag and drop event handling
  onDragStart(eventData: { event: CalendarEvent, mouseEvent: MouseEvent }): void {
    // Set a flag or store the event being dragged if needed
    console.log('Drag started:', eventData.event.title);
  }
    onDragEnd(eventData: { event: CalendarEvent, mouseEvent: MouseEvent, deltaX: number, deltaY: number }, targetDate?: Date): void {
    console.log('Drag ended:', eventData.event.title);
    
    if (!eventData.event.draggable) return;
    
    const originalEvent = eventData.event;
    const originalStart = new Date(originalEvent.start);
    const originalEnd = originalEvent.end ? new Date(originalEvent.end) : new Date(originalStart);
    const eventDuration = originalEnd.getTime() - originalStart.getTime();
    
    let newStart = new Date(originalStart);
    let newEnd = new Date(originalEnd);
    
    try {
      // Different handling based on the current view
      if (this.currentView === 'month' && targetDate) {
        // In month view, we're just changing the day, keeping the same time
        newStart = new Date(targetDate);
        newStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          originalStart.getSeconds()
        );
        
        newEnd = new Date(newStart.getTime() + eventDuration);
      } else if (this.currentView === 'week' || this.currentView === 'day') {
        // In week/day view, handle vertical movement (time change)
        const minutesDelta = Math.round(eventData.deltaY);
        
        newStart = new Date(originalStart);
        newStart.setMinutes(originalStart.getMinutes() + minutesDelta);
        
        // Only handle horizontal movement (day change) in week view if significant
        if (this.currentView === 'week' && Math.abs(eventData.deltaX) > 50) {
          const dayDelta = Math.round(eventData.deltaX / 100); // Assuming each day column is roughly 100px
          newStart.setDate(newStart.getDate() + dayDelta);
        }
        
        // Ensure the new start time is within the visible hours
        const hours = newStart.getHours();
        const minutes = newStart.getMinutes();
        if (hours < this.startHour) {
          newStart.setHours(this.startHour, 0, 0, 0);
        } else if (hours > this.endHour) {
          newStart.setHours(this.endHour, 0, 0, 0);
        }
        
        // Maintain the original duration
        newEnd = new Date(newStart.getTime() + eventDuration);
      }
      
      // Update the event
      const updatedEvent = this.calendarService.updateEvent(originalEvent.id, {
        ...originalEvent,
        start: newStart,
        end: newEnd
      });
      
      // Emit the updated event
      if (updatedEvent) {
        this.eventUpdated.emit(updatedEvent);
        this.generateCalendarDays();
      }
      
      // Set flag to prevent opening event form on drop
      this.preventEventClickOnDrop = true;
      setTimeout(() => {
        this.preventEventClickOnDrop = false;
      }, 300);
    } catch (error) {
      // Revert to original position
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Cannot move event to this date');
      }
    }
  }
  
  onResizeStart(eventData: { event: CalendarEvent, mouseEvent: MouseEvent }): void {
    console.log('Resize started:', eventData.event.title);
  }
  
  onResizeEnd(eventData: { event: CalendarEvent, mouseEvent: MouseEvent, deltaY: number }): void {
    console.log('Resize ended:', eventData.event.title, 'delta:', eventData.deltaY);
    
    if (!eventData.event.resizable) return;
    
    const originalEvent = eventData.event;
    const originalEnd = originalEvent.end ? new Date(originalEvent.end) : new Date(originalEvent.start);
    
    // Calculate new end time based on deltaY (60px = 1 hour)
    const hoursDelta = Math.round(eventData.deltaY / 60);
    
    // Calculate new end time
    const newEnd = new Date(originalEnd);
    newEnd.setHours(originalEnd.getHours() + hoursDelta);
    
    // Ensure end time is after start time
    if (newEnd <= originalEvent.start) {
      // If not, set end to at least 30 minutes after start
      newEnd.setTime(originalEvent.start.getTime() + (30 * 60 * 1000));
    }
    
    // Update the event
    this.calendarService.updateEvent(originalEvent.id, {
      end: newEnd
    });
    
    // Emit the updated event
    const updatedEvent = this.calendarService.getEvent(originalEvent.id);
    if (updatedEvent) {
      this.eventUpdated.emit(updatedEvent);
    }
  }  onItemDropped(dropData: { date: Date, hour?: number, event: DragEvent }): void {
    console.log('Item dropped on date:', dropData.date, 'hour:', dropData.hour);
    
    if (!dropData.event.dataTransfer) {
      console.warn('No dataTransfer object in drop event');
      return;
    }
    
    // Try to get event ID from different data formats
    let eventId = dropData.event.dataTransfer.getData('text/plain');
    if (!eventId) {
      eventId = dropData.event.dataTransfer.getData('application/calendar-event');
    }
    
    if (!eventId) {
      console.warn('No event ID found in drop data');
      return;
    }
    
    const originalEvent = this.calendarService.getEvent(eventId);
    if (!originalEvent || !originalEvent.draggable) {
      console.warn('Event not found or not draggable:', eventId);
      return;
    }
    
    const originalStart = new Date(originalEvent.start);
    const originalEnd = originalEvent.end ? new Date(originalEvent.end) : new Date(originalStart);
    const eventDuration = originalEnd.getTime() - originalStart.getTime();

    // Create the new start date based on where it was dropped
    let newStart = new Date(dropData.date);
    let newEnd: Date; // Declare newEnd here

    if (originalEvent.allDay) {
      // For all-day events, keep original time (usually 00:00) and only update the date part
      newStart.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds(),
        originalStart.getMilliseconds()
      );
      // For all-day events, the end date should also be updated to the new date, preserving its time
      newEnd = new Date(dropData.date); 
      newEnd.setHours(
        originalEnd.getHours(),
        originalEnd.getMinutes(),
        originalEnd.getSeconds(),
        originalEnd.getMilliseconds()
      );
      // If the event duration is less than a full day (which is unusual for allDay events, but to be safe)
      // and the original start and end were on the same day, ensure the new end is also on the same day as newStart.
      if (eventDuration < 24 * 60 * 60 * 1000 && originalStart.toDateString() === originalEnd.toDateString()) {
        if (newEnd.toDateString() !== newStart.toDateString()) {
            newEnd = new Date(newStart.getTime() + eventDuration);
        }
      }

    } else if (this.currentView === 'month') {
      // For month view (non-all-day), we keep the original time but change the date
      newStart.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds(),
        originalStart.getMilliseconds()
      );
      newEnd = new Date(newStart.getTime() + eventDuration);
    } else if (dropData.hour !== undefined) {
      // For week/day views with hour information (and not an all-day event)
      newStart.setHours(dropData.hour, originalStart.getMinutes(), 0, 0);
      newEnd = new Date(newStart.getTime() + eventDuration);
    } else {
      // Fallback or if hour is not defined for week/day (should not happen with current logic)
      newEnd = new Date(newStart.getTime() + eventDuration);
    }

    console.log('Moving event from', originalStart, 'to', newStart, 'new end', newEnd);
    
    // const calculatedNewEnd = new Date(newStart.getTime() + eventDuration); // This line is removed/commented as newEnd is already correctly determined.
    
    try {
      // Update the event with the new dates
      this.calendarService.updateEvent(originalEvent.id, {
        start: newStart,
        end: newEnd // Use the correctly determined newEnd
      });
      
      // Emit the updated event
      const updatedEvent = this.calendarService.getEvent(originalEvent.id);
      if (updatedEvent) {
        this.eventUpdated.emit(updatedEvent);
        
        // Prevent opening the event form by setting a flag
        // with a longer timeout to ensure no accidental clicks are processed
        this.preventEventClickOnDrop = true;
        setTimeout(() => {
          this.preventEventClickOnDrop = false;
        }, 500); // Increased from 300ms to 500ms for better reliability
      } else {
        console.warn('Failed to get updated event after drop');
      }
    } catch (error) {
      console.error('Error updating event after drop:', error);
    }
  }
    getDefaultEvent(): any {
    const start = new Date();
    start.setHours(this.startHour, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    
    return {
      title: '',
      description: '',
      start,      end,
      allDay: false,
      draggable: false,
      color: { primary: this.defaultEventColor }
    };
  }

  getEventMultiDayPosition(event: CalendarEvent, date: Date): 'start' | 'middle' | 'end' | null {
    if (!event.end || event.start.toDateString() === event.end.toDateString()) {
      // Event is single-day
      return null;
    }

    const eventStartDate = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const eventEndDate = new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate());
    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (eventStartDate.getTime() === currentDate.getTime()) {
      return 'start';
    } else if (eventEndDate.getTime() === currentDate.getTime()) {
      return 'end';
    } else {
      return 'middle';
    }
  }
}
