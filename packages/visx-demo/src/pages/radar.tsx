import React from 'react';
import Radar from '@visx/demo-radar/Example';
import packageJson from '@visx/demo-radar/package.json';
import Show from '../components/Show';
import RadarSource from '!!raw-loader!../sandboxes/visx-radar/Example';

function RadarPage() {
  return (
    <Show
      margin={{ top: 0, right: 0, bottom: 50, left: 0 }}
      component={Radar}
      title="Radar"
      codeSandboxDirectoryName="visx-radar"
      packageJson={packageJson}
    >
      {RadarSource}
    </Show>
  );
}
export default RadarPage;
