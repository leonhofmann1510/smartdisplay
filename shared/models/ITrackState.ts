import type { ITrack } from './ITrack';

export interface ITrackState {
  currentTrack: ITrack | null;
  nextTrack   : ITrack | null;
  trackTime   : number;
  isPlaying   : boolean;
  playlist    : ITrack[];
}
