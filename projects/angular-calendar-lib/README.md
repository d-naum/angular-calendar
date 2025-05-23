# @groooh/angular-calendar

A flexible and feature-rich calendar component for Angular applications. This library allows you to easily integrate a calendar with month, week, and day views, event management, drag-and-drop functionality, and recurrence support.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Installation

To install `@groooh/angular-calendar` in your project, run the following command:

```bash
npm install @groooh/angular-calendar
```
Or if you are using yarn:
```bash
yarn add @groooh/angular-calendar
```

## Features

*   **Multiple Views**: Switch between month, week, and day views.
*   **Event Management**: Create, display, edit, and delete calendar events.
*   **Drag & Drop**:
    *   Drag events to reschedule them.
    *   Drag events from an external list onto the calendar.
    *   Resize events in week and day views.
*   **Recurrence**: Support for recurring events (though the full implementation details of recurrence are not fully visible in the provided code snippets, it's a listed model).
*   **Customizable**:
    *   Define event colors and styles.
    *   Control the number of events displayed per day in month view before showing a "more events" indicator.
*   **Navigation**: Easily navigate to the next/previous period or jump to "Today".
*   **Event Click Handling**: Emit events when a calendar date or an event is clicked.
*   **Time Slot Clicking**: Emit events when a time slot in week/day view is clicked.
*   **Standalone Components**: Built with Angular standalone components for easier integration.

## Integration

Follow these steps to integrate `@groooh/angular-calendar` into your Angular application:

1.  **Import the `AngularCalendarModule` (or individual standalone components):**

    The library exports `AngularCalendarModule` which bundles all the calendar components and directives. Alternatively, since the components like `CalendarComponent` are standalone, you can import them directly into your component or module.

    **Option A: Using `AngularCalendarModule` (if you prefer NgModules)**

    If `AngularCalendarModule` is intended to be the primary way to import, ensure it correctly imports and exports all necessary standalone components. Based on the provided `my-library.module.ts` (now `angular-calendar.module.ts`), it seems to be set up to export `CalendarComponent`, `DraggableEventComponent`, `TimeSlotComponent`, and `DropZoneDirective`.

    ```typescript
    // src/app/app.module.ts (or your feature module)
    import { NgModule } from '@angular/core';
    import { BrowserModule } from '@angular/platform-browser';
    import { AngularCalendarModule } from '@groooh/angular-calendar'; // Adjust path if installed from npm

    import { AppComponent } from './app.component';

    @NgModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserModule,
        AngularCalendarModule // Add AngularCalendarModule here
      ],
      providers: [],
      bootstrap: [AppComponent]
    })
    export class AppModule { }
    ```

    **Option B: Using Standalone `CalendarComponent` directly**

    Since `CalendarComponent` is a standalone component, you can import it directly into the `imports` array of another standalone component or an NgModule.

    ```typescript
    // src/app/your-component/your-component.ts
    import { Component } from '@angular/core';
    import { CalendarComponent, CalendarEvent } from '@groooh/angular-calendar'; // Adjust path
    import { CommonModule } from '@angular/common';

    @Component({
      selector: 'app-your-component',
      standalone: true,
      imports: [CommonModule, CalendarComponent], // Import CalendarComponent directly
      template: `
        <lib-calendar
          [events]="calendarEvents"
          (eventClicked)="handleEventClick($event)"
          (dateClicked)="handleDateClick($event)"
          (eventDropped)="handleEventDrop($event)"
          (timeSlotClicked)="handleTimeSlotClick($event)">
        </lib-calendar>
      `
    })
    export class YourComponent {
      calendarEvents: CalendarEvent[] = [
        // Populate with your events
        {
          id: '1',
          title: 'Team Meeting',
          start: new Date(),
          end: new Date(new Date().setHours(new Date().getHours() + 1)),
          color: 'blue',
          draggable: true,
          resizable: true
        }
      ];

      handleEventClick(event: CalendarEvent) {
        console.log('Event clicked:', event);
      }

      handleDateClick(date: Date) {
        console.log('Date clicked:', date);
      }

      handleEventDrop(data: { event: CalendarEvent, newDate: Date, newHour?: number }) {
        console.log('Event dropped:', data.event, 'New Date:', data.newDate, 'New Hour:', data.newHour);
        // Update your event's date/time here
      }

      handleTimeSlotClick(data: { date: Date, hour: number }) {
        console.log('Time slot clicked:', data.date, 'Hour:', data.hour);
        // Logic to handle time slot click, e.g., open new event form
      }
    }
    ```

2.  **Add the calendar component to your template:**

    Use the `lib-calendar` selector in your component's HTML template.

    ```html
    <!-- src/app/your-component/your-component.html -->
    <lib-calendar
      [events]="calendarEvents"
      [currentView]="'month'"
      [selectedDate]="initialDate"
      (eventClicked)="handleEventClick($event)"
      (dateClicked)="handleDateClick($event)"
      (eventDropped)="handleEventDrop($event)"
      (newEvent)="handleNewEvent($event)"
      (timeSlotClicked)="handleTimeSlotClick($event)">
    </lib-calendar>
    ```

3.  **Provide data and handle outputs:**

    *   **`[events]` (Input)**: An array of `CalendarEvent` objects to display on the calendar.
        ```typescript
        // CalendarEvent structure (example, refer to actual model in the library)
        export interface CalendarEvent {
          id: string;
          start: Date;
          end: Date;
          title: string;
          color?: string;       // e.g., 'blue', '#ff0000'
          draggable?: boolean;  // Defaults to true if not provided
          resizable?: boolean;  // For week/day views, defaults to true
          description?: string;
          // Potentially recurrence rule properties
        }
        ```
    *   **`[currentView]` (Input, Optional)**: Set the initial view (`'month'`, `'week'`, or `'day'`). Defaults to `'month'`.
    *   **`[selectedDate]` (Input, Optional)**: Set the initially selected date. Defaults to the current date.
    *   **`(eventClicked)` (Output)**: Emits the `CalendarEvent` when an event is clicked.
    *   **`(dateClicked)` (Output)**: Emits the `Date` when a calendar day cell is clicked (in month view).
    *   **`(timeSlotClicked)` (Output)**: Emits `{ date: Date, hour: number }` when a time slot is clicked in week or day view.
    *   **`(eventDropped)` (Output)**: Emits `{ event: CalendarEvent, newDate: Date, newHour?: number }` when an event is dropped onto a new date/time. `newHour` is present for week/day views.
    *   **`(newEvent)` (Output)**: Emits data when the "add event" button is clicked or a new event is initiated, typically `{ date: Date }`. The component has an internal form for creating/editing events.
    *   **`(eventResized)` (Output)**: Emits `{ event: CalendarEvent, newEnd: Date }` when an event is resized.

4.  **Styling:**

    The component comes with its own styling. Ensure your global styles or build process includes the necessary CSS if it's not automatically handled (e.g., if styles are encapsulated and published with the library).

## Key Components & Functionalities

### `lib-calendar` (CalendarComponent)

This is the main component that renders the calendar.

**Inputs:**
*   `events: CalendarEvent[]`: Array of events to display.
*   `currentView: CalendarViewMode`: Initial view ('month', 'week', 'day').
*   `selectedDate: Date`: Initially selected date.
*   `weekDays: string[]`: Override default weekday names.
*   `hoursOfDay: number[]`: Define the hours to display in week/day views.
*   `maxEventsPerDay: number`: Max events shown in a month day cell before "+X more".

**Outputs:**
*   `dateClicked: EventEmitter<Date>`
*   `eventClicked: EventEmitter<CalendarEvent>`
*   `eventDropped: EventEmitter<{ event: CalendarEvent, newDate: Date, newHour?: number }>`
*   `newEvent: EventEmitter<{ date: Date, hour?: number }>`
*   `viewChanged: EventEmitter<CalendarViewMode>`
*   `dateRangeChanged: EventEmitter<DateRange>`
*   `eventResized: EventEmitter<{ event: CalendarEvent, newEnd: Date }>`

### `lib-draggable-event` (DraggableEventComponent)

Represents an individual event that can be dragged. Used internally by `CalendarComponent`.

**Inputs:**
*   `event: CalendarEvent`
*   `showResizeHandle: boolean`

**Outputs:**
*   `dragStart: EventEmitter<CalendarEvent>`
*   `dragEnd: EventEmitter<{ event: CalendarEvent, newDate?: Date }>` (Note: `newDate` might be handled by the drop zone)
*   `resizeStart: EventEmitter<CalendarEvent>`
*   `resizeEnd: EventEmitter<{ event: CalendarEvent, newEndTime: Date }>` (or similar structure)

### `libDropZone` (DropZoneDirective)

A directive applied to calendar cells (days or time slots) to make them valid drop targets for events.

**Inputs:**
*   `date: Date`
*   `hour?: number` (for week/day views)

**Outputs:**
*   `itemDropped: EventEmitter<{ event: CalendarEvent, date: Date, hour?: number }>```

### `CalendarService`

A service likely used internally for date calculations, event management logic, and view transitions. It exposes types like `CalendarEvent`, `CalendarViewMode`, and `DateRange`.

## Example Usage

```typescript
// In your component.ts
import { Component } from '@angular/core';
import { CalendarEvent, CalendarViewMode } from '@groooh/angular-calendar'; // Adjust if path is different

@Component({
  selector: 'app-root',
  template: `
    <h1>My Calendar</h1>
    <lib-calendar
      [events]="myEvents"
      [currentView]="currentCalendarView"
      (eventClicked)="logEvent('Event Clicked', $event)"
      (dateClicked)="logEvent('Date Clicked', $event)"
      (eventDropped)="handleEventDrop($event)"
      (newEvent)="openMyEventModal($event)">
    </lib-calendar>
  `
})
export class AppComponent {
  currentCalendarView: CalendarViewMode = 'month';
  myEvents: CalendarEvent[] = [
    {
      id: 'evt1',
      title: 'Doctor Appointment',
      start: new Date(2025, 4, 25, 10, 0), // Note: Month is 0-indexed (4 = May)
      end: new Date(2025, 4, 25, 11, 0),
      color: '#1e90ff', // DodgerBlue
      draggable: true,
      resizable: true
    },
    {
      id: 'evt2',
      title: 'Project Deadline',
      start: new Date(2025, 4, 28),
      end: new Date(2025, 4, 28),
      color: 'red',
      draggable: false
    }
    // Add more events
  ];

  logEvent(type: string, eventData: any) {
    console.log(type, eventData);
  }

  handleEventDrop(dropped: { event: CalendarEvent, newDate: Date, newHour?: number }) {
    console.log('Event Dropped:', dropped);
    const eventToUpdate = this.myEvents.find(e => e.id === dropped.event.id);
    if (eventToUpdate) {
      const originalDuration = eventToUpdate.end.getTime() - eventToUpdate.start.getTime();
      eventToUpdate.start = dropped.newHour !== undefined ? 
                            new Date(dropped.newDate.getFullYear(), dropped.newDate.getMonth(), dropped.newDate.getDate(), dropped.newHour, 0) : 
                            dropped.newDate;
      eventToUpdate.end = new Date(eventToUpdate.start.getTime() + originalDuration);
      // Make sure to update your backend or state management system
    }
  }

  openMyEventModal(eventData: { date: Date, hour?: number }) {
    console.log('New event initiated for:', eventData.date, 'at hour:', eventData.hour);
    // Logic to open a modal or form to create a new event
  }
}
```

