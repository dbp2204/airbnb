import React from 'react';
import { shallow } from 'enzyme';

import { scaleLinear } from '@visx/scale/src/src';
import { Axis, AxisRight } from '../src';

const axisProps = {
  scale: scaleLinear({
    range: [10, 0],
    round: true,
    domain: [0, 10],
  }),
};

describe('<AxisRight />', () => {
  it('should be defined', () => {
    expect(AxisRight).toBeDefined();
  });

  it('should render with class .visx-axis-right', () => {
    const wrapper = shallow(<AxisRight {...axisProps} />);
    expect(wrapper.prop('axisClassName')).toBe('visx-axis-right');
  });

  it('should set user-specified axisClassName, axisLineClassName, labelClassName, and tickClassName', () => {
    const axisClassName = 'axis-test-class';
    const axisLineClassName = 'axisline-test-class';
    const labelClassName = 'label-test-class';
    const tickClassName = 'tick-test-class';

    const wrapper = shallow(
      <AxisRight
        {...axisProps}
        axisClassName={axisClassName}
        axisLineClassName={axisLineClassName}
        labelClassName={labelClassName}
        tickClassName={tickClassName}
      />,
    );

    const axis = wrapper.find(Axis);
    expect(axis.prop('axisClassName')).toMatch(axisClassName);
    expect(axis.prop('axisLineClassName')).toBe(axisLineClassName);
    expect(axis.prop('labelClassName')).toBe(labelClassName);
    expect(axis.prop('tickClassName')).toBe(tickClassName);
  });

  it('should default labelOffset prop to 36', () => {
    const wrapper = shallow(<AxisRight {...axisProps} />);
    expect(wrapper.prop('labelOffset')).toBe(36);
  });

  it('should set labelOffset prop', () => {
    const labelOffset = 3;
    const wrapper = shallow(<AxisRight {...axisProps} labelOffset={labelOffset} />);
    expect(wrapper.prop('labelOffset')).toEqual(labelOffset);
  });

  it('should default tickLength prop to 8', () => {
    const wrapper = shallow(<AxisRight {...axisProps} />);
    expect(wrapper.prop('tickLength')).toBe(8);
  });

  it('should set tickLength prop', () => {
    const tickLength = 15;
    const wrapper = shallow(<AxisRight {...axisProps} tickLength={tickLength} />);
    expect(wrapper.prop('tickLength')).toEqual(tickLength);
  });

  it('should set label prop', () => {
    const label = 'test';
    const wrapper = shallow(<AxisRight {...axisProps} label={label} />).dive();
    const text = wrapper.find('.visx-axis-label');
    expect(text.prop('children')).toEqual(label);
  });
});
