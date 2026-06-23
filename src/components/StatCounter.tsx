import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../fonts';

const parseStatParts = (numStr: string) => {
  const match = String(numStr).match(/^([+\-]?)(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return { prefix: '', integer: 0, decimal: '', suffix: numStr };

  const rawNum = match[2].replace(',', '.');
  const hasDecimal = rawNum.includes('.');
  const value = parseFloat(rawNum);

  return {
    prefix: match[1],
    integer: value,
    decimal: hasDecimal ? rawNum.split('.')[1] : '',
    suffix: match[3],
  };
};

type StatCounterProps = {
  number: string;
  label: string;
  delay?: number;
};

export const StatCounter: React.FC<StatCounterProps> = ({ number, label, delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const { prefix, integer, decimal, suffix } = parseStatParts(number);

  const countDuration = 45;
  const currentValue = interpolate(localFrame, [0, countDuration], [0, integer], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const displayValue = decimal
    ? `${prefix}${currentValue.toFixed(decimal.length)}${suffix}`
    : `${prefix}${Math.round(currentValue)}${suffix}`;

  const numberOpacity = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const numberScale = interpolate(localFrame, [0, 12], [0.85, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const labelOpacity = interpolate(localFrame, [15, 30], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const labelTranslateY = interpolate(localFrame, [15, 30], [20, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          fontSize: number.length <= 3 ? 220 : number.length <= 5 ? 190 : 160,
          fontWeight: 900,
          color: COLORS.orange,
          lineHeight: 1,
          opacity: numberOpacity,
          transform: `scale(${numberScale})`,
          letterSpacing: -6,
          filter: 'drop-shadow(0 0 28px rgba(232,119,34,0.85)) drop-shadow(0 0 56px rgba(232,119,34,0.45))',
        }}
      >
        {displayValue}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.mediumGray,
          textAlign: 'center',
          opacity: labelOpacity,
          transform: `translateY(${labelTranslateY}px)`,
          maxWidth: 800,
          lineHeight: 1.4,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};
