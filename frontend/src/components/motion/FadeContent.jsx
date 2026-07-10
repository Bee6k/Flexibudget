import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Fade / slide-in wrapper — React Bits AnimatedContent style, CSS-only.
 */
export default function FadeContent({
  children,
  delay = 0,
  duration = 450,
  y = 14,
  sx,
  className,
}) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
