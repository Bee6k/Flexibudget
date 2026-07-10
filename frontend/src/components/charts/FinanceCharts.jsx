import { Box, Typography, Stack, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { chartPalette } from '../../theme/financialColors';
import { TEAL } from '../../theme/surfaces';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';
import { formatShortDate } from '../../utils/dates';
import EmptyState from '../ui/EmptyState';
import { useThemeMode } from '../../context/ThemeContext';

function useChartColors() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  return {
    isDark,
    grid: isDark ? 'rgba(148,183,210,0.12)' : 'rgba(15,23,42,0.07)',
    tick: isDark ? '#9AA8BC' : '#475569',
    primary: isDark ? '#E8EDF5' : '#152A45',
    secondary: isDark ? '#5B6B82' : '#64748B',
    tooltipBg: isDark ? '#172338' : '#FFFFFF',
    tooltipBorder: isDark ? 'rgba(148,183,210,0.18)' : 'rgba(15,23,42,0.1)',
  };
}

function ChartTooltip({ active, payload, label, series }) {
  const colors = useChartColors();
  if (!active || !payload?.length) return null;

  const looksLikeDate = typeof label === 'string' && /^\d{4}-\d{2}-\d{2}/.test(label);
  const title = looksLikeDate ? formatShortDate(label) : (label || '');

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
        bgcolor: colors.tooltipBg,
        border: `1px solid ${colors.tooltipBorder}`,
        boxShadow: colors.isDark
          ? '0 8px 24px rgba(0,0,0,0.45)'
          : '0 8px 24px rgba(15,23,42,0.1)',
        minWidth: 140,
      }}
    >
      {title && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      <Stack spacing={0.75}>
        {payload.map((entry) => {
          const meta = series?.find((s) => s.key === entry.dataKey);
          return (
            <Stack key={entry.dataKey} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: entry.color || meta?.color || colors.primary,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {meta?.label || entry.name}
                </Typography>
              </Stack>
              <Typography variant="caption" fontWeight={700}>
                {formatCurrency(entry.value)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

export function DonutAllocationChart({ tiers, legend = true }) {
  const { mode } = useThemeMode();
  const palette = chartPalette(mode === 'dark');
  const data = (tiers || [])
    .filter((t) => (t.total_cost ?? t.value ?? 0) > 0)
    .map((t) => ({
      name: t.name,
      value: Math.round(t.total_cost ?? t.value ?? 0),
    }));

  if (!data.length) {
    return (
      <EmptyState
        compact
        title="No allocation data"
        description="Add expenses or holdings to see how your money is distributed across priority tiers."
      />
    );
  }

  return (
    <Box>
      <Box sx={{ width: '100%', height: 248 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
              animationDuration={400}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [formatCurrency(v), name]}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid rgba(15,23,42,0.08)',
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {legend && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {data.map((d, i) => (
            <Stack key={d.name} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: palette[i % palette.length], flexShrink: 0 }} />
                <Typography variant="body2" noWrap>{d.name}</Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>{formatCurrency(d.value)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * Balance outlook as grouped bar chart (easier to read than line/area).
 * Downsamples long ranges so bars stay legible — same underlying series.
 */
export function AreaCashFlowChart({ data, emptyAction }) {
  const colors = useChartColors();

  if (!data?.length) {
    return (
      <ChartEmptyState
        title="No forecast yet"
        description="Add your current balance and expected income to project how long your money will last."
        action={emptyAction}
      />
    );
  }

  const maxBalance = Math.max(...data.map((d) => Number(d.balance) || 0));
  if (maxBalance <= 0) {
    return (
      <ChartEmptyState
        title="Balance runs out immediately"
        description="With NPR 0 available and ongoing expenses, there is no runway to chart. Update your balance or reduce spending to see a forecast."
        action={emptyAction}
      />
    );
  }

  const chartData = downsampleBars(data, 28);
  const series = [
    { key: 'balance', label: 'Balance', color: colors.primary },
    { key: 'income', label: 'Income', color: colors.isDark ? TEAL : colors.secondary },
  ];

  return (
    <Box sx={{ width: '100%', height: { xs: 220, sm: 280, md: 320 } }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatShortDate(d)}
            minTickGap={28}
            tick={{ fontSize: 11, fill: colors.tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompactCurrency(v).replace('NPR ', '')}
            tick={{ fontSize: 11, fill: colors.tick }}
            width={48}
            domain={[0, (max) => Math.ceil(max * 1.08)]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<ChartTooltip series={series} />}
            cursor={{ fill: colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
          />
          <Bar
            dataKey="balance"
            name="Balance"
            fill={colors.primary}
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
            animationDuration={550}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill={colors.isDark ? '#2DD4BF' : '#64748B'}
            radius={[6, 6, 0, 0]}
            maxBarSize={18}
            animationDuration={550}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function downsampleBars(rows, maxBars = 28) {
  if (!rows?.length || rows.length <= maxBars) return rows;
  const step = Math.ceil(rows.length / maxBars);
  const out = [];
  for (let i = 0; i < rows.length; i += step) out.push(rows[i]);
  const last = rows[rows.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Horizontal comparison bars via Recharts — income vs spending. */
export function IncomeExpenseBarChart({ expenseTotal, incomeTotal }) {
  const colors = useChartColors();
  const chartData = [
    { name: 'Income', value: Number(incomeTotal) || 0, fill: colors.isDark ? '#E2E8F0' : '#1E3A5F' },
    { name: 'Spending', value: Number(expenseTotal) || 0, fill: colors.isDark ? '#64748B' : '#94A3B8' },
  ];

  return (
    <Box sx={{ py: 0.5 }}>
      <Box sx={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: colors.tick }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCompactCurrency(v).replace('NPR ', '')}
              tick={{ fontSize: 11, fill: colors.tick }}
              width={44}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: colors.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)' }}
              content={<ChartTooltip series={[{ key: 'value', label: 'Amount' }]} />}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56} animationDuration={400}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {incomeTotal === 0 && (
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          No income recorded yet — add salary or freelance payments to compare.
        </Typography>
      )}
    </Box>
  );
}

function ChartEmptyState({ title, description, action }) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      compact
    />
  );
}

export function ChartEmptyAction({ to, label }) {
  return (
    <Button component={RouterLink} to={to} variant="contained" size="small">
      {label}
    </Button>
  );
}
