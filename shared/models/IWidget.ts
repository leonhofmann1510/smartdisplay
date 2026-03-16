import type { IPosition } from './IPosition';

export interface IWidget {
  componentName: string,
  id: string,
  props: {
    position: IPosition,
    specific: Object
  }
}