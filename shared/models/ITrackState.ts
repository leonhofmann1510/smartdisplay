import { ITrack } from './ITrack';

export interface ITrackState {
  currentTrack: ITrack | null;
  nextTrack   : ITrack | null;
  trackTime   : number
}
