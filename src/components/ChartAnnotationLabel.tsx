interface ChartViewBox {
  x: number
  y: number
  width: number
  height: number
}

interface ChartAnnotationLabelProps {
  viewBox?: ChartViewBox
  value: string
  fill: string
  icon: 'flag' | 'star'
  position: 'insideTopLeft' | 'insideTopRight'
}

const ICON_SIZE = 10
const GAP = 3
const EDGE_OFFSET = 4

const FLAG_PATH_POLE = 'M3.5 1.5v13'
const FLAG_PATH_FLAG = 'M3.5 2.5h9l-2 3 2 3h-9z'
const STAR_PATH = 'M8 1.2l2.06 4.18 4.6.67-3.33 3.25.79 4.58L8 11.7l-4.12 2.17.79-4.58L1.34 6.05l4.6-.67z'

/**
 * Custom `label` renderer for recharts `ReferenceLine` — draws a small SVG
 * icon (flag or star, geometry copied from FlagIcon / StarFilledIcon in
 * icons.tsx) next to the annotation text instead of an emoji glyph.
 *
 * The icon always sits at a fixed offset from the reference line, and the
 * text grows *away* from the line (textAnchor 'start' for insideTopLeft,
 * 'end' for insideTopRight) — so the icon's position never depends on the
 * text's length, and neither element can grow toward the line or, for the
 * insideTopRight case used near the chart's right edge, off the plot.
 *
 * Used as `label={(props) => <ChartAnnotationLabel {...props} .../>}` so
 * recharts hands us `viewBox` (the reference line's bounding rect) via the
 * function-as-label form (see recharts Label.js `isFunction(content)`).
 */
export function ChartAnnotationLabel({ viewBox, value, fill, icon, position }: ChartAnnotationLabelProps) {
  if (!viewBox || !value) return null

  const lineX = viewBox.x
  const topY = viewBox.y
  const isLeft = position === 'insideTopLeft'

  const iconX = isLeft ? lineX + EDGE_OFFSET : lineX - EDGE_OFFSET - ICON_SIZE
  const iconY = topY + EDGE_OFFSET
  const textX = isLeft ? iconX + ICON_SIZE + GAP : iconX - GAP
  const centerY = iconY + ICON_SIZE / 2
  const scale = ICON_SIZE / 16

  return (
    <g aria-hidden="true">
      <g transform={`translate(${iconX}, ${iconY}) scale(${scale})`}>
        {icon === 'flag' ? (
          <g fill="none" stroke={fill} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d={FLAG_PATH_POLE} />
            <path d={FLAG_PATH_FLAG} />
          </g>
        ) : (
          <path fill={fill} d={STAR_PATH} />
        )}
      </g>
      <text x={textX} y={centerY} fontSize={10} fill={fill} textAnchor={isLeft ? 'start' : 'end'} dominantBaseline="central">
        {value}
      </text>
    </g>
  )
}
