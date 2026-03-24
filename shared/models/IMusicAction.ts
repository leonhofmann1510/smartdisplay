export interface IMusicAction {
  action: 'play' | 'pause' | 'next' | 'prev' | 'seek';
  value ?: number;
}
