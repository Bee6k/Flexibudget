import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getBreadcrumbs } from '../../config/navigation';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="Breadcrumb"
      sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: '0.8125rem' } }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        if (isLast) {
          return (
            <Typography key={crumb.path} color="text.primary" fontWeight={600} fontSize="inherit">
              {crumb.label}
            </Typography>
          );
        }
        return (
          <Link
            key={crumb.path}
            component={RouterLink}
            to={crumb.path}
            underline="hover"
            color="text.secondary"
            fontSize="inherit"
          >
            {crumb.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}
