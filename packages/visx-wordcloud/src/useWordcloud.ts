import { useEffect, useState } from 'react';
import d3Cloud from 'd3-cloud';

export interface BaseDatum {
  text: string;
}

export interface WordcloudConfig<Datum extends BaseDatum> {
  /**
   * Width of the wordcloud layout.
   *
   * @default 0
   */
  width?: number;
  /**
   * Height of the wordcloud layout.
   *
   * @default 0
   */
  height?: number;
  /**
   * Sets the words array.
   *
   * @default []
   */
  words?: Datum[];
  /**
   * Sets the padding accessor function, which indicates the numerical padding for each word.
   *
   * @default 1
   */
  padding?: number | ((datum: Datum, index: number) => number);
  /**
   * Sets the font accessor function, which indicates the font face for each word.
   *
   * @default serif
   */
  font?: string | ((datum: Datum, index: number) => string);
  /**
   * Sets the fontSize accessor function, which indicates the numerical font size for each word.
   *
   * @default function(datum) { return Math.sqrt(datum.value); }
   */
  fontSize?: number | ((datum: Datum, index: number) => number);
  /**
   * Sets the fontStyle accessor function, which indicates the font style for each word.
   *
   * @default normal
   */
  fontStyle?: string | ((datum: Datum, index: number) => string);
  /**
   * Sets the fontWeight accessor function, which indicates the font weight for each word.
   *
   * @default normal
   */
  fontWeight?: string | number | ((datum: Datum, index: number) => string | number);
  /**
   * Sets the rotate accessor function, which indicates the rotation angle (in degrees) for each word.
   *
   * @default function() { return (~~(Math.random() * 6) -3) * 30; }
   */
  rotate?: number | ((datum: Datum, index: number) => number);
  /**
   * Sets the current type of spiral used for positioning words.
   * This can either be one of the two built-in spirals, "archimedean" and "rectangular", or an arbitrary spiral generator can be used.
   *
   * @default archimedean
   */
  spiral?:
    | 'archimedean'
    | 'rectangular'
    | ((size: [number, number]) => (t: number) => [number, number]);
  /**
   * Sets the internal random number generator, used for selecting the initial position of each word,
   * and the clockwise/counterclockwise direction of the spiral for each word. Random function should return a number in the range [0, 1).
   *
   * @default Math.random
   */
  random?: () => number;
}

export function useWordcloud<Datum extends BaseDatum>({
  width,
  height,
  font,
  fontSize,
  fontStyle,
  fontWeight,
  padding,
  random,
  rotate,
  spiral,
  words,
}: WordcloudConfig<Datum>) {
  const [cloudWords, setCloudWords] = useState<d3Cloud.Word[]>([]);

  useEffect(() => {
    const layout = d3Cloud<Datum>();

    if (width !== undefined && height !== undefined) layout.size([width, height]);
    if (words !== undefined) layout.words(words);
    if (random !== undefined) layout.random(random);
    if (font !== undefined) layout.font(font);
    if (padding !== undefined) layout.padding(padding);
    if (fontSize !== undefined) layout.fontSize(fontSize);
    if (fontStyle !== undefined) layout.fontStyle(fontStyle);
    if (fontWeight !== undefined) layout.fontWeight(fontWeight);
    if (rotate !== undefined) layout.rotate(rotate);
    if (spiral !== undefined) layout.spiral(spiral);

    layout.on('end', setCloudWords);
    layout.start();

    return function cleanup() {
      layout.stop();
    };
  }, [
    width,
    height,
    font,
    fontSize,
    fontStyle,
    fontWeight,
    padding,
    random,
    rotate,
    spiral,
    words,
  ]);

  return cloudWords;
}
