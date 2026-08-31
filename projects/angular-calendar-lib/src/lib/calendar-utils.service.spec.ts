import { CalendarUtilsService } from './calendar-utils.service';

describe('CalendarUtilsService', () => {
  const service = new CalendarUtilsService();

  it('calculates the number of days in leap-year February', () => {
    expect(service.getDaysInMonth(2024, 1)).toBe(29);
  });

  it('finds the requested start of week', () => {
    expect(service.getStartOfWeek(new Date(2025, 0, 8), 1)).toEqual(new Date(2025, 0, 6));
  });
});