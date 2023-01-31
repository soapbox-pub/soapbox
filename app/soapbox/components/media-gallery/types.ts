import type { Property } from 'csstype';

interface Dimensions {
  w: Property.Width | number,
  h: Property.Height | number,
  t?: Property.Top,
  r?: Property.Right,
  b?: Property.Bottom,
  l?: Property.Left,
  float?: Property.Float,
  pos?: Property.Position,
}

interface SizeData {
  style: React.CSSProperties,
  itemsDimensions: Dimensions[],
  size: number,
  width: number,
}

export type {
  Dimensions,
  SizeData,
};