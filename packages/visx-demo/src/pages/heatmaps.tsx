import React from 'react';
import Heatmaps from '@visx/demo-heatmap/Example';
import packageJson from '@visx/demo-heatmap/package.json';
import Show from '../components/Show';
import HeatmapsSource from '!!raw-loader!../sandboxes/visx-heatmap/Example';

function HeatmapsPage() {
  return (
    <Show
      events
      margin={{
        top: 10,
        left: 40,
        right: 30,
        bottom: 80,
      }}
      component={Heatmaps}
      title="Heatmaps"
      codeSandboxDirectoryName="visx-heatmap"
      packageJson={packageJson}
    >
      {HeatmapsSource}
    </Show>
  );
}
export default HeatmapsPage;
