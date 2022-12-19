import React from 'react';
import Chord, { ChordProps } from '@visx/demo-chord/Example';
import GalleryTile from '../GalleryTile';

export { default as packageJson } from '@visx/demo-chord/package.json';

const tileStyles = { background: '#e4e3d8' };
const detailsStyles = { color: '#111' };

export default function ChordTile() {
  return (
    <GalleryTile<ChordProps>
      title="Chord"
      description="<Chord.Chord /> & <Chord.Ribbon />"
      exampleRenderer={Chord}
      exampleUrl="/chord"
      tileStyles={tileStyles}
      detailsStyles={detailsStyles}
    />
  );
}
