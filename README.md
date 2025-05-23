# Angular Calendar Workspace

This workspace contains the `@groooh/angular-calendar` library and a demo application.

## @groooh/angular-calendar

A flexible and feature-rich calendar component for Angular applications. This library allows you to easily integrate a calendar with month, week, and day views, event management, drag-and-drop functionality, and recurrence support.

For detailed documentation on the library, please see its [README.md](./projects/angular-calendar-lib/README.md).

### Key Features

*   **Multiple Views**: Switch between month, week, and day views.
*   **Event Management**: Create, display, edit, and delete calendar events.
*   **Drag & Drop**: Reschedule events by dragging, drop external events, and resize events.
*   **Customizable**: Define event colors, styles, and control event display.
*   **Standalone Components**: Built with Angular standalone components for easy integration.

## Demo Application

The `demo-app` project serves as a demonstration of how to use the `@groooh/angular-calendar` library.

To run the demo application:

1.  Ensure dependencies are installed: `npm install`
2.  Build the library (if not already built or if changes were made): `ng build angular-calendar-lib`
3.  Serve the demo application: `ng serve demo-app`

## Development

### Build Library

To build the library, run:

```bash
npm run build angular-calendar-lib
```

### Publishing (Manual via GitHub Actions)

The library is published to npmjs via a manually triggered GitHub Action. This action will:

1.  Read the version from `projects/angular-calendar-lib/package.json`.
2.  Create and push a git tag (e.g., `vX.X.X`).
3.  Build the library.
4.  Publish the package from `dist/angular-calendar-lib` to npmjs.

To trigger the publish action, navigate to the "Actions" tab in the GitHub repository, select the "Publish Library" workflow, and run it from the `main` branch.
