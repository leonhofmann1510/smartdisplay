export interface ICalendarEvent {
  id: string;
  name: string;
  date: string;      // start date YYYY-MM-DD
  endDate?: string;  // optional end date YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}
