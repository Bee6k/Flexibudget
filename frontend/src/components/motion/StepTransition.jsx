import { Slide, Fade } from '@mui/material';

export default function StepTransition({ stepKey, direction = 'left', children }) {
  return (
    <Slide in direction={direction} mountOnEnter unmountOnExit timeout={320} key={stepKey}>
      <Fade in timeout={280}>
        <div>{children}</div>
      </Fade>
    </Slide>
  );
}
