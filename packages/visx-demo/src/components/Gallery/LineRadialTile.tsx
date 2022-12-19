import React from 'react';
import LineRadial, {
  LineRadialProps,
  background,
  blue,
} from '@visx/demo-shape-line-radial/Example';
import GalleryTile from '../GalleryTile';

export { default as packageJson } from '@visx/demo-shape-line-radial/package.json';

const tileStyles = { background };
const detailsStyles = { color: blue };
const exampleProps = { animate: false };

export default function LineRadialTile() {
  return (
    <GalleryTile<LineRadialProps>
      title="Radial Lines"
      description="<Shape.LineRadial />"
      exampleProps={exampleProps}
      exampleRenderer={LineRadial}
      exampleUrl="/lineradial"
      tileStyles={tileStyles}
      detailsStyles={detailsStyles}
    />
  );
}
