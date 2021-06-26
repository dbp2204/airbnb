import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { TooltipProps as BaseTooltipProps } from '@visx/tooltip/lib/tooltips/Tooltip';
import { PickD3Scale } from '@visx/scale';
import { UseTooltipPortalOptions } from '@visx/tooltip/lib/hooks/useTooltipInPortal';

import TooltipContext from '../context/TooltipContext';
import DataContext from '../context/DataContext';
import getScaleBandwidth from '../utils/getScaleBandwidth';
import isValidNumber from '../typeguards/isValidNumber';
import { GlyphProps as RenderGlyphProps, TooltipContextType } from '../types';

/** fontSize + lineHeight from default styles break precise location of crosshair, etc. */
const TOOLTIP_NO_STYLE: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  fontSize: 0,
  lineHeight: 0,
};

export type RenderTooltipParams<Datum extends object> = TooltipContextType<Datum> & {
  colorScale?: PickD3Scale<'ordinal', string, string>;
};

export type RenderGlyphParams<Datum extends object> = {
  datum: Datum;
  color: string;
  glyphStyle: React.SVGProps<SVGCircleElement>;
};

export type TooltipProps<Datum extends object> = {
  /**
   * When TooltipContext.tooltipOpen=true, this function is invoked and if the
   * return value is non-null, its content is rendered inside the tooltip container.
   * Content will be rendered in an HTML parent.
   */
  renderTooltip: (params: RenderTooltipParams<Datum>) => React.ReactNode;
  /** Function which handles rendering glyphs. */
  renderGlyph?: (params: RenderGlyphProps<Datum>) => React.ReactNode;
  /** Whether to snap tooltip + crosshair x-coord to the nearest Datum x-coord instead of the event x-coord. */
  snapTooltipToDatumX?: boolean;
  /** Whether to snap tooltip + crosshair y-coord to the nearest Datum y-coord instead of the event y-coord. */
  snapTooltipToDatumY?: boolean;
  /** Whether to show a vertical line at tooltip position. */
  showVerticalCrosshair?: boolean;
  /** Whether to show a horizontal line at tooltip position. */
  showHorizontalCrosshair?: boolean;
  /** Whether to show a glyph at the tooltip position for the (single) nearest Datum. */
  showDatumGlyph?: boolean;
  /** Whether to show a glyph for the nearest Datum in each series. */
  showSeriesGlyphs?: boolean;
  /** Optional styles for the vertical crosshair, if visible. */
  verticalCrosshairStyle?: React.SVGProps<SVGLineElement>;
  /** Optional styles for the vertical crosshair, if visible. */
  horizontalCrosshairStyle?: React.SVGProps<SVGLineElement>;
  /** Optional styles for the point, if visible. */
  glyphStyle?: React.SVGProps<SVGCircleElement>;
  /**
   * Tooltip depends on ResizeObserver, which may be pollyfilled globally
   * or injected into this component.
   */
  resizeObserverPolyfill?: UseTooltipPortalOptions['polyfill'];
} & Omit<BaseTooltipProps, 'left' | 'top' | 'children'> &
  Pick<UseTooltipPortalOptions, 'debounce' | 'detectBounds' | 'scroll'>;

const INVISIBLE_STYLES: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  opacity: 0,
  width: 0,
  height: 0,
  pointerEvents: 'none',
};

/**
 * This is a wrapper component which bails early if tooltip is not visible.
 * If scroll detection is enabled in UseTooltipPortalOptions, this avoids re-rendering
 * the component on every scroll. If many charts with Tooltips are rendered on a page,
 * this also avoids creating many resize observers / hitting browser limits.
 */
export default function Tooltip<Datum extends object>(props: TooltipProps<Datum>) {
  const tooltipContext = useContext(TooltipContext) as TooltipContextType<Datum>;

  if (!tooltipContext?.tooltipOpen) return null;

  return <TooltipInner {...props} />;
}

function TooltipInner<Datum extends object>({
  debounce,
  detectBounds,
  horizontalCrosshairStyle,
  glyphStyle,
  renderTooltip,
  renderGlyph: renderGlyphProp,
  resizeObserverPolyfill,
  scroll = true,
  showDatumGlyph = false,
  showHorizontalCrosshair = false,
  showSeriesGlyphs = false,
  showVerticalCrosshair = false,
  snapTooltipToDatumX = false,
  snapTooltipToDatumY = false,
  verticalCrosshairStyle,
  ...tooltipProps
}: TooltipProps<Datum>) {
  const { colorScale, theme, innerHeight, innerWidth, margin, xScale, yScale, dataRegistry } =
    useContext(DataContext) || {};
  const tooltipContext = useContext(TooltipContext) as TooltipContextType<Datum>;
  const { containerRef, TooltipInPortal, forceRefreshBounds } = useTooltipInPortal({
    debounce,
    detectBounds,
    polyfill: resizeObserverPolyfill,
    scroll,
  });

  // To correctly position itself in a Portal, the tooltip must know its container bounds
  // this is done by rendering an invisible node whose ref can be used to find its parentElement
  const setContainerRef = useCallback(
    (ownRef: HTMLElement | SVGElement | null) => {
      containerRef(ownRef?.parentElement ?? null);
    },
    [containerRef],
  );

  const tooltipContent = tooltipContext?.tooltipOpen
    ? renderTooltip({ ...tooltipContext, colorScale })
    : null;

  const showTooltip = tooltipContext?.tooltipOpen && tooltipContent != null;

  // useTooltipInPortal is powered by react-use-measure and will update portal positions upon
  // resize and page scroll. however it **cannot** detect when a chart container moves on a
  // page due to animation or drag-and-drop, etc.
  // therefore we force refresh the bounds any time we transition from a hidden tooltip to
  // one that is visible.
  const lastShowTooltip = useRef(false);
  useEffect(() => {
    if (showTooltip && !lastShowTooltip.current) {
      forceRefreshBounds();
    }
    lastShowTooltip.current = showTooltip;
  }, [showTooltip, forceRefreshBounds]);

  let tooltipLeft = tooltipContext?.tooltipLeft;
  let tooltipTop = tooltipContext?.tooltipTop;

  const xScaleBandwidth = xScale ? getScaleBandwidth(xScale) : 0;
  const yScaleBandwidth = yScale ? getScaleBandwidth(yScale) : 0;

  const getDatumLeftTop = useCallback(
    (key: string, datum: Datum) => {
      const entry = dataRegistry?.get(key);
      const xAccessor = entry?.xAccessor;
      const yAccessor = entry?.yAccessor;
      const left =
        xScale && xAccessor
          ? Number(xScale(xAccessor(datum))) + xScaleBandwidth / 2 ?? 0
          : undefined;
      const top =
        yScale && yAccessor
          ? Number(yScale(yAccessor(datum))) + yScaleBandwidth / 2 ?? 0
          : undefined;
      return { left, top };
    },
    [dataRegistry, xScaleBandwidth, yScaleBandwidth, xScale, yScale],
  );

  const nearestDatum = tooltipContext?.tooltipData?.nearestDatum;
  const nearestDatumKey = nearestDatum?.key ?? '';

  // snap x- or y-coord to the actual data point (not event coordinates)
  if (showTooltip && nearestDatum && (snapTooltipToDatumX || snapTooltipToDatumY)) {
    const { left, top } = getDatumLeftTop(nearestDatumKey, nearestDatum.datum);
    tooltipLeft = snapTooltipToDatumX && isValidNumber(left) ? left : tooltipLeft;
    tooltipTop = snapTooltipToDatumY && isValidNumber(top) ? top : tooltipTop;
  }

  // collect positions + styles for glyphs; glyphs always snap to Datum, not event coords
  const glyphs: React.ReactNode[] = [];

  const renderGlyph =
    renderGlyphProp ||
    (<Datum extends object>(props: RenderGlyphProps<Datum>) => {
      const radius = props.size;
      const strokeWidth = Number(glyphStyle?.strokeWidth ?? 1.5);

      return (
        <circle
          className="visx-tooltip-glyph"
          cx={props.x}
          cy={props.y}
          r={radius}
          fill={props.color}
          stroke={theme?.backgroundColor}
          strokeWidth={strokeWidth}
          paintOrder="fill"
          {...glyphStyle}
        />
      );
    });

  if (showTooltip && (showDatumGlyph || showSeriesGlyphs)) {
    const size = Number(glyphStyle?.radius ?? 4);

    if (showSeriesGlyphs) {
      Object.values(tooltipContext?.tooltipData?.datumByKey ?? {}).forEach(({ key, datum }) => {
        const color = colorScale?.(key) ?? theme?.htmlLabel?.color ?? '#222';
        const { left, top } = getDatumLeftTop(key, datum);

        // don't show glyphs if coords are unavailable
        if (!isValidNumber(left) || !isValidNumber(top)) return;

        glyphs.push(
          renderGlyph({
            key,
            color,
            datum,
            index: 0,
            size,
            x: left,
            y: top,
          }),
        );
      });
    } else if (nearestDatum) {
      const { left, top } = getDatumLeftTop(nearestDatumKey, nearestDatum.datum);
      // don't show glyphs if coords are unavailable
      if (isValidNumber(left) && isValidNumber(top)) {
        const color =
          (nearestDatumKey && colorScale?.(nearestDatumKey)) ??
          null ??
          theme?.gridStyles?.stroke ??
          theme?.htmlLabel?.color ??
          '#222';
        glyphs.push(
          renderGlyph({
            key: nearestDatumKey,
            color,
            datum: nearestDatum.datum,
            index: 0,
            size,
            x: left,
            y: top,
          }),
        );
      }
    }
  }

  return (
    // Tooltip can be rendered as a child of SVG or HTML since its output is rendered in a Portal.
    // So use svg element to find container ref because it's a valid child of SVG and HTML parents.
    <>
      <svg ref={setContainerRef} style={INVISIBLE_STYLES} />
      {showTooltip && (
        <>
          {/** To correctly position crosshair / glyphs in a Portal, we leverage the logic in TooltipInPortal */}
          {showVerticalCrosshair && (
            <TooltipInPortal
              className="visx-crosshair visx-crosshair-vertical"
              left={tooltipLeft}
              top={margin?.top}
              offsetLeft={0}
              offsetTop={0}
              detectBounds={false}
              style={TOOLTIP_NO_STYLE}
            >
              <svg width="1" height={innerHeight} overflow="visible">
                <line
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={innerHeight}
                  strokeWidth={1.5}
                  stroke={theme?.gridStyles?.stroke ?? theme?.htmlLabel?.color ?? '#222'}
                  {...verticalCrosshairStyle}
                />
              </svg>
            </TooltipInPortal>
          )}
          {showHorizontalCrosshair && (
            <TooltipInPortal
              className="visx-crosshair visx-crosshair-horizontal"
              left={margin?.left}
              top={tooltipTop}
              offsetLeft={0}
              offsetTop={0}
              detectBounds={false}
              style={TOOLTIP_NO_STYLE}
            >
              <svg width={innerWidth} height="1" overflow="visible">
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={0}
                  y2={0}
                  strokeWidth={1.5}
                  stroke={theme?.gridStyles?.stroke ?? theme?.htmlLabel?.color ?? '#222'}
                  {...horizontalCrosshairStyle}
                />
              </svg>
            </TooltipInPortal>
          )}
          <svg>
            {glyphs.map((glyph, i) => (
              <React.Fragment key={i}>{glyph}</React.Fragment>
            ))}
          </svg>
          <TooltipInPortal
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              ...defaultStyles,
              background: theme?.backgroundColor ?? 'white',
              boxShadow: `0 1px 2px ${
                theme?.htmlLabel?.color ? `${theme?.htmlLabel?.color}55` : '#22222255'
              }`,
              ...theme?.htmlLabel,
            }}
            {...tooltipProps}
          >
            {tooltipContent}
          </TooltipInPortal>
        </>
      )}
    </>
  );
}
