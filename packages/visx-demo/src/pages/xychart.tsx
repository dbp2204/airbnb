import React from 'react';
import XYChart from '@visx/demo-xychart/Example';
import packageJson from '@visx/demo-xychart/package.json';
import Show from '../components/Show';
import XYChartSource from '!!raw-loader!../sandboxes/visx-xychart/Example';

function XYChartPage() {
  return (
    <Show
      component={XYChart}
      title="XYChart"
      codeSandboxDirectoryName="visx-xychart"
      packageJson={packageJson}
    >
      {XYChartSource}
    </Show>
  );
}
export default XYChartPage;
