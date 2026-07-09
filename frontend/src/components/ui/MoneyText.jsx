import { Typography } from '@mui/material';
import { formatCurrency } from '../../utils/currency';

const moneySx = {
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  fontSize: 'clamp(1.125rem, 2.5vw, 2.125rem)',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
};

export default function MoneyText({ value, variant = 'h3', color, sx, ...props }) {
  return (
    <Typography variant={variant} sx={{ ...moneySx, color, ...sx }} {...props}>
      {formatCurrency(value)}
    </Typography>
  );
}

export const metricValueSx = {
  fontWeight: 700,
  letterSpacing: '-0.015em',
  lineHeight: 1.2,
  fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
  overflowWrap: 'anywhere',
};
