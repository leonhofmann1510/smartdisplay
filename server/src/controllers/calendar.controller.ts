import { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { JsonHandler } from "../utils/jsonHandler";
import { ICalendarEvent } from "../../../shared/models/ICalendarEvent";
import { io } from "../index";

let store: JsonHandler | null = null;
const getStore = (): Promise<JsonHandler> => {
  if (!store) return JsonHandler.open('calendarData').then(s => (store = s));
  return Promise.resolve(store);
};

const sortEventsByDate = (events: ICalendarEvent[]): ICalendarEvent[] => {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getEvents = async (req: Request, res: Response) => {
  const store = await getStore();
  const events = store.get<ICalendarEvent[]>("events") ?? [];
  sendSuccess(res, sortEventsByDate(events), "Events retrieved successfully");
};

export const getThisWeekEvents = async (req: Request, res: Response) => {
  const store = await getStore();
  const events = store.get<ICalendarEvent[]>("events") ?? [];

  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const thisWeekEvents = events.filter(event => {
    const eventStart = new Date(event.date);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    return eventStart <= sunday && eventEnd >= monday;
  });

  sendSuccess(res, sortEventsByDate(thisWeekEvents), "This week events retrieved successfully");
};

export const addEvent = async (req: Request, res: Response) => {
  const store = await getStore();
  const { name, date, endDate } = req.body;

  const newEvent: ICalendarEvent = {
    id: Date.now().toString(),
    name,
    date,
    ...(endDate ? { endDate } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const events = store.get<ICalendarEvent[]>("events") ?? [];
  events.push(newEvent);
  store.set("events", events as unknown as Parameters<typeof store.set>[1]);

  io.emit('calendarChange', sortEventsByDate(events));
  sendSuccess(res, newEvent, "Event added successfully");
};

export const updateEvent = async (req: Request, res: Response) => {
  const store = await getStore();
  const { id } = req.params;
  const { name, date, endDate } = req.body;

  const events = store.get<ICalendarEvent[]>("events") ?? [];
  const eventIndex = events.findIndex(e => e.id === id);

  if (eventIndex === -1) {
    return sendSuccess(res, null, "Event not found", 404);
  }

  if (name) events[eventIndex].name = name;
  if (date) events[eventIndex].date = date;
  if ('endDate' in req.body) {
    if (endDate) events[eventIndex].endDate = endDate;
    else delete events[eventIndex].endDate;
  }
  events[eventIndex].updatedAt = new Date().toISOString();
  store.set("events", events as unknown as Parameters<typeof store.set>[1]);

  io.emit('calendarChange', sortEventsByDate(events));
  sendSuccess(res, events[eventIndex], "Event updated successfully");
};

export const deleteEvent = async (req: Request, res: Response) => {
  const store = await getStore();
  const { id } = req.params;

  let events = store.get<ICalendarEvent[]>("events") ?? [];
  const originalLength = events.length;
  events = events.filter(e => e.id !== id);

  if (events.length === originalLength) {
    return sendSuccess(res, null, "Event not found", 404);
  }

  store.set("events", events as unknown as Parameters<typeof store.set>[1]);

  io.emit('calendarChange', sortEventsByDate(events));
  sendSuccess(res, null, "Event deleted successfully");
};
