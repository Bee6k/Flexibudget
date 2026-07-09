import { Typography, Stack, Card, CardContent, Button, Box, Divider } from '@mui/material';
import { formatCurrency } from '../utils/currency';

export default function RecommendationPanel({ recommendations, onAccept, embedded = false }) {
  if (!recommendations || recommendations.length === 0) return null;

  const content = (
    <>
      {!embedded && (
        <>
          <Typography variant="h6" gutterBottom>Suggested actions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            Trimming optional spending could give you more breathing room.
          </Typography>
        </>
      )}
      <Stack spacing={1.5}>
        {recommendations.map((rec) => (
          <Card key={rec.recommendation_id} variant="outlined" sx={{ bgcolor: 'background.default' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Pause {rec.expense_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Saves about {formatCurrency(rec.monthly_cost)}/month · roughly {rec.impact?.days_gained ?? 0} extra days
                  </Typography>
                  {rec.explanation && (
                    <>
                      <Divider sx={{ my: 1.25 }} />
                      <Typography variant="caption" component="div" sx={{ lineHeight: 1.5 }}>
                        {rec.explanation.consequence}
                      </Typography>
                    </>
                  )}
                </Box>
                <Button variant="contained" size="small" onClick={() => onAccept(rec)} sx={{ flexShrink: 0 }}>
                  Remove
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );

  if (embedded) return content;
  return content;
}
