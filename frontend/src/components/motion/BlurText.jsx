import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Blur-in text — adapted from React Bits BlurText pattern
 * (https://reactbits.dev/text-animations/blur-text): words fade from blur → sharp.
 */
export default function BlurText({
  text = '',
  delay = 40,
  className,
  sx,
  as: Component = 'span',
}) {
  const words = String(text).split(' ').filter(Boolean);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      component={Component}
      className={className}
      sx={{ display: 'inline', ...sx }}
    >
      {words.map((word, i) => (
        <Box
          component="span"
          key={`${word}-${i}`}
          sx={{
            display: 'inline-block',
            marginRight: '0.28em',
            filter: visible ? 'blur(0px)' : 'blur(8px)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: `filter 0.45s ease ${i * delay}ms, opacity 0.45s ease ${i * delay}ms, transform 0.45s ease ${i * delay}ms`,
          }}
        >
          {word}
        </Box>
      ))}
    </Box>
  );
}
