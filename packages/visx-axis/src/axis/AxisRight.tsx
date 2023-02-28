import React from 'react';
import cx from 'classnames';
import Axis from './Axis';
import Orientation from '../constants/orientation';
import { SharedAxisProps, AxisScale } from '../types';
import { getTickLabelProps } from '../utils/getTickLabelProps';

export type AxisRightProps<Scale extends AxisScale> = SharedAxisProps<Scale>;

export const rightTickLabelProps = {
  dx: '0.25em',
  dy: '0.25em',
  fill: '#222',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'start',
} as const;

export default function AxisRight<Scale extends AxisScale>({
  axisClassName,
  labelOffset = 36,
  tickLength = 8,
  tickLabelProps,
  ...restProps
}: AxisRightProps<Scale>) {
  return (
    <Axis
      axisClassName={cx('visx-axis-right', axisClassName)}
      labelOffset={labelOffset}
      orientation={Orientation.right}
      tickLabelProps={getTickLabelProps<Scale>(rightTickLabelProps, tickLabelProps)}
      tickLength={tickLength}
      {...restProps}
    />
  );
}
