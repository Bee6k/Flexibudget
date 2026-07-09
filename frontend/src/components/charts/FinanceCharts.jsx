import { Box, Typography, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import { CHART_PALETTE } from '../../theme/financialColors';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate } from '../../utils/dates';

export function DonutAllocationChart({ tiers, legend = true }) {
  const data = (tiers || [])
    .filter((t) => (t.total_cost ?? t.value ?? 0) > 0)
    .map((t) => ({
      name: t.name,
      value: Math.round(t.total_cost ?? t.value ?? 0),
    }));

  if (!data.length) {
    return <Typography variant="body2" color="text.secondary">Add expenses or holdings to see a breakdown.</Typography>;
  }

  return (
    <Box>
      <Box sx={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={58} outerRadius={88} paddingAngle={2} dataKey="value" stroke="transparent">
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {legend && (
        <Stack spacing={0.75} sx={{ mt: 1 }}>
          {data.map((d, i) => (
            <Stack key={d.name} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CHART_PALETTE[i % CHART_PALETTE.length], flexShrink: 0 }} />
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

export function AreaCashFlowChart({ data, dataKey = 'balance', emptyAction }) {
  if (!data?.length) {
    return (
      <ChartEmptyState
        title="No forecast yet"
        description="Add your current balance and expected income to project how long your money will last."
        action={emptyAction}
      />
    );
  }

  const maxBalance = Math.max(...data.map((d) => Number(d[dataKey]) || 0));
  if (maxBalance <= 0) {
    return (
      <ChartEmptyState
        title="Balance runs out immediately"
        description="With NPR 0 available and ongoing expenses, there is no runway to chart. Update your balance or reduce spending to see a forecast."
        action={emptyAction}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="date" tickFormatter={(d) => formatShortDate(d)} minTickGap={24} tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)))}
            tick={{ fontSize: 11 }}
            width={48}
            domain={[0, (max) => Math.ceil(max * 1.08)]}
          />
          <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" strokeDasharray="4 4" />
          <Tooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => formatShortDate(l)} />
          <Area type="monotone" dataKey={dataKey} stroke="#14B8A6" fill="url(#cashGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function IncomeExpenseBarChart({ expenseTotal, incomeTotal }) {
  const items = [
    { name: 'Income', value: incomeTotal, fill: '#10B981' },
    { name: 'Spending', value: expenseTotal, fill: '#EF4444' },
  ];
  const max = Math.max(incomeTotal, expenseTotal, 1);

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', justifyContent: 'center', minHeight: 180, px: 1 }}>
        {items.map((d) => {
          const ratio = d.value / max;
          const barHeight = d.value === 0 ? 10 : Math.max(28, ratio * 120);
          return (
            <Box key={d.name} sx={{ textAlign: 'center', flex: 1, maxWidth: 120 }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 64,
                  height: barHeight,
                  mx: 'auto',
                  mb: 1.25,
                  borderRadius: 1.5,
                  bgcolor: d.value === 0 ? 'transparent' : d.fill,
                  border: d.value === 0 ? '2px dashed' : 'none',
                  borderColor: d.value === 0 ? 'divider' : 'transparent',
                  opacity: d.value === 0 ? 0.55 : 1,
                  transition: 'height 0.4s ease',
                }}
              />
              <Typography variant="caption" color="text.secondary" display="block">{d.name}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>
                {formatCurrency(d.value)}
              </Typography>
            </Box>
          );
        })}
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
    <Box
      sx={{
        height: 280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: action ? 2 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}

export function ChartEmptyAction({ to, label }) {
  return (
    <Button component={RouterLink} to={to} variant="contained" size="small">
      {label}
    </Button>
  );
}
