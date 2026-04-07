import { useHttp } from "./useHttp";
import type { IBasicInfo } from '@/../../shared/models/IBasicInfo';
import type { IWeatherResponse } from '@/../../shared/models/IWeatherResponse';
import type { IApiResponse } from '@/../../shared/models/IApiResponse';
import type { IQuote } from '@/../../shared/models/IQuote'
import type { IArt } from '@/../../shared/models/IArt'
import type { IWidget } from '@/../../shared/models/IWidget'
import type { ITrackState } from '@/../../shared/models/ITrackState'
import type { IMusicAction } from '@/../../shared/models/IMusicAction'
import type { ITodo } from '@/../../shared/models/ITodo'
import type { ICalendarEvent } from '@/../../shared/models/ICalendarEvent'

const { get, post, put, del } = useHttp();
const APIURL = import.meta.env.VITE_APIURL;

const getBasicInfo = (): Promise<IBasicInfo> =>
  get<IApiResponse<IBasicInfo>>(`${APIURL}/widget/basicInfo`).then(res => res.data!);

const getWeather = (): Promise<IWeatherResponse> =>
  get<IApiResponse<IWeatherResponse>>(`${APIURL}/widget/currentWeather`).then(res => res.data!);

const getRandomQuote = (): Promise<IQuote> =>
  get<IApiResponse<IQuote>>(`${APIURL}/widget/randomQuote`).then(res => res.data!);

const getRandomArt = (): Promise<IArt> =>
  get<IApiResponse<IArt>>(`${APIURL}/widget/randomArt`).then(res => res.data!);

const getWidgets = (): Promise<IWidget[]> =>
  get<IApiResponse<IWidget[]>>(`${APIURL}/control/getWidgets`).then(res => res.data!);

const setWidgets = (widgets: IWidget[]): Promise<IWidget[]> =>
  post<IApiResponse<IWidget[]>>(`${APIURL}/control/setWidgets`, widgets).then(res => res.data!);

const getMusicState = (): Promise<ITrackState> =>
  get<IApiResponse<ITrackState>>(`${APIURL}/widget/music/state`).then(res => res.data!);

const postMusicAction = (action: IMusicAction): Promise<ITrackState> =>
  post<IApiResponse<ITrackState>>(`${APIURL}/widget/music/action`, action).then(res => res.data!);

const syncTrackTime = (trackTime: number): Promise<void> =>
  post<IApiResponse<null>>(`${APIURL}/widget/music/sync`, { trackTime }).then(() => {});

// Todo API
const getTodos = (): Promise<ITodo[]> =>
  get<IApiResponse<ITodo[]>>(`${APIURL}/todo/list`).then(res => res.data ?? []);

const addTodo = (text: string): Promise<ITodo> =>
  post<IApiResponse<ITodo>>(`${APIURL}/todo/add`, { text }).then(res => res.data!);

const updateTodo = (id: string, text: string): Promise<ITodo> =>
  put<IApiResponse<ITodo>>(`${APIURL}/todo/update/${id}`, { text }).then(res => res.data!);

const deleteTodo = (id: string): Promise<void> =>
  del<IApiResponse<null>>(`${APIURL}/todo/delete/${id}`).then(() => {});

// Calendar API
const getCalendarEvents = (): Promise<ICalendarEvent[]> =>
  get<IApiResponse<ICalendarEvent[]>>(`${APIURL}/calendar/events`).then(res => res.data ?? []);

const getThisWeekEvents = (): Promise<ICalendarEvent[]> =>
  get<IApiResponse<ICalendarEvent[]>>(`${APIURL}/calendar/thisweek`).then(res => res.data ?? []);

const addCalendarEvent = (name: string, date: string): Promise<ICalendarEvent> =>
  post<IApiResponse<ICalendarEvent>>(`${APIURL}/calendar/add`, { name, date }).then(res => res.data!);

const updateCalendarEvent = (id: string, name: string, date: string): Promise<ICalendarEvent> =>
  put<IApiResponse<ICalendarEvent>>(`${APIURL}/calendar/update/${id}`, { name, date }).then(res => res.data!);

const deleteCalendarEvent = (id: string): Promise<void> =>
  del<IApiResponse<null>>(`${APIURL}/calendar/delete/${id}`).then(() => {});

export const useApi = () => {
  return {
    getBasicInfo,
    getWeather,
    getRandomQuote,
    getRandomArt,
    getWidgets,
    setWidgets,
    getMusicState,
    postMusicAction,
    syncTrackTime,
    getTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    getCalendarEvents,
    getThisWeekEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
  };
};
