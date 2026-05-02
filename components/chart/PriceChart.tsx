// components/chart/PriceChart.tsx
// Raw SVG price history chart — no external chart libraries

import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Polyline,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';
import { PriceRecord } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  history: PriceRecord[];
  averagePrice: number;
  width?: number;
}

const CHART_HEIGHT = 200;
const PADDING = { top: 20, right: 40, bottom: 20, left: 30 };

export default function PriceChart({ history, averagePrice, width }: Props) {
  const CHART_WIDTH = width ?? Dimensions.get('window').width - 40;

  // ── Need at least 2 points to draw a line ──
  if (history.length < 2) {
    return (
      <View style={[styles.container, { height: CHART_HEIGHT + PADDING.top + PADDING.bottom }]}>
        <Text style={styles.placeholder}>
          📊 Simulate price changes to see chart
        </Text>
      </View>
    );
  }

  // ── 1. Calculate drawing area dimensions ──
  const drawWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const drawHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // ── 2. Find price range (min/max) for Y axis scaling ──
  const prices = history.map((r) => r.price);
  const rawMin = Math.min(...prices);
  const rawMax = Math.max(...prices);

  // Add 10% padding to top and bottom so line doesn't touch edges
  const priceRange = rawMax - rawMin || 1;
  const minPrice = rawMin - priceRange * 0.1;
  const maxPrice = rawMax + priceRange * 0.1;
  const priceSpan = maxPrice - minPrice;

  // ── 3. Map price → Y coordinate ──
  // Higher price = lower Y value (SVG Y axis is inverted)
  function toY(price: number): number {
    return PADDING.top + drawHeight - ((price - minPrice) / priceSpan) * drawHeight;
  }

  // ── 4. Map index → X coordinate ──
  function toX(index: number): number {
    return PADDING.left + (index / (history.length - 1)) * drawWidth;
  }

  // ── 5. Build polyline points string ──
  // Format: "x1,y1 x2,y2 x3,y3 ..."
  const linePoints = history
    .map((record, i) => `${toX(i).toFixed(1)},${toY(record.price).toFixed(1)}`)
    .join(' ');

  // ── 6. Build polygon points for gradient fill ──
  // Close the shape at the bottom of the chart
  const bottomLeft = `${toX(0).toFixed(1)},${(PADDING.top + drawHeight).toFixed(1)}`;
  const bottomRight = `${toX(history.length - 1).toFixed(1)},${(PADDING.top + drawHeight).toFixed(1)}`;
  const fillPoints = `${bottomLeft} ${linePoints} ${bottomRight}`;

  // ── 7. Average price line Y position ──
  const avgY = toY(averagePrice);
  const showAvgLine = averagePrice >= minPrice && averagePrice <= maxPrice;

  // ── 8. Y axis labels (5 evenly spaced price labels) ──
  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const price = minPrice + (priceSpan / 4) * i;
    const y = toY(price);
    return { price, y };
  });

  // ── 9. X axis labels (show first, middle, last date) ──
  const xLabelIndices = [
    0,
    Math.floor(history.length / 2),
    history.length - 1,
  ];

  // ── 10. Determine line color based on trend ──
  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const lineColor = lastPrice <= firstPrice ? COLORS.success : COLORS.danger;

  const totalHeight = CHART_HEIGHT + PADDING.top;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Price History</Text>
      <Svg width={CHART_WIDTH} height={totalHeight}>
        <Defs>
          {/* Gradient fill under the line */}
          <LinearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* ── Grid lines (horizontal) ── */}
        {yLabels.map((label, i) => (
          <Line
            key={`grid-${i}`}
            x1={PADDING.left}
            y1={label.y}
            x2={PADDING.left + drawWidth}
            y2={label.y}
            stroke={COLORS.border}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* ── Average price line ── */}
        {showAvgLine && (
          <>
            <Line
              x1={PADDING.left}
              y1={avgY}
              x2={PADDING.left + drawWidth}
              y2={avgY}
              stroke={COLORS.warning}
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <SvgText
  x={PADDING.left + drawWidth - 4}
  y={avgY - 6}
  fontSize="9"
  fill={COLORS.warning}
  textAnchor="end"
  fontWeight="bold"
>
  avg
</SvgText>
          </>
        )}

        {/* ── Gradient fill polygon ── */}
        <Polygon
          points={fillPoints}
          fill="url(#priceGradient)"
        />

        {/* ── Price line ── */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* ── Data point dots ── */}
        {history.map((record, i) => {
          const cx = toX(i);
          const cy = toY(record.price);
          const isFirst = i === 0;
          const isLast = i === history.length - 1;

          // Only show dots for first, last, and every 3rd point
          if (!isFirst && !isLast && i % 3 !== 0) return null;

          return (
            <Circle
              key={`dot-${i}`}
              cx={cx}
              cy={cy}
              r={isLast ? 5 : 3}
              fill={isLast ? lineColor : COLORS.surface}
              stroke={lineColor}
              strokeWidth="2"
            />
          );
        })}

        {/* ── Y axis labels (price) ── */}
{/* ── Y axis labels (price) ── */}
{yLabels.map((label, i) => (
  <SvgText
    key={`ylabel-${i}`}
    x={PADDING.left - 4}
    y={label.y + 4}
    fontSize="10"
    fill={COLORS.textSecondary}
    textAnchor="end"
  >
    {`$${label.price.toFixed(0)}`}
  </SvgText>
))}

        {/* ── X axis labels (dates) ── */}
        {xLabelIndices.map((idx) => {
          const record = history[idx];
          if (!record) return null;
          const x = toX(idx);
          const date = new Date(record.recordedAt);
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <SvgText
              key={`xlabel-${idx}`}
              x={x}
              y={PADDING.top + drawHeight + 20}
              fontSize="10"
              fill={COLORS.textSecondary}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}

        {/* ── Y Axis line ── */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + drawHeight}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* ── X Axis line ── */}
        <Line
          x1={PADDING.left}
          y1={PADDING.top + drawHeight}
          x2={PADDING.left + drawWidth}
          y2={PADDING.top + drawHeight}
          stroke={COLORS.border}
          strokeWidth="1.5"
        />

        {/* ── Latest price label ── */}
{history.length > 0 && (
  <SvgText
    x={toX(history.length - 1)}
    y={toY(lastPrice) - 10}
    fontSize="11"
    fill={lineColor}
    textAnchor="end"
    fontWeight="bold"
  >
    {`$${lastPrice.toFixed(2)}`}
  </SvgText>
)}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: lineColor }]} />
          <Text style={styles.legendText}>Price</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDashed, { borderColor: COLORS.warning }]} />
          <Text style={styles.legendText}>Average</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendTrend, { color: lineColor }]}>
            {lastPrice <= firstPrice ? '↓ Falling' : '↑ Rising'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  placeholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 16,
    height: 2.5,
    borderRadius: 2,
  },
  legendDashed: {
    width: 16,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  legendTrend: {
    fontSize: 11,
    fontWeight: '700',
  },
});