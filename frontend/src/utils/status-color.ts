export const statusColorMap = (color: string) => {
  // Colors returned here and that is combined with prefixes like "text-.." need to be safelisted
  let bg = 'bg-neutral-300';
  let border = 'border-neutral-300';
  switch (color) {
    case 'info':
      bg = 'bg-info';
      border = 'border-info';
      break;
    case 'warning':
      bg = 'bg-warning';
      border = 'border-warning';
      break;
    case 'error':
      bg = 'bg-error';
      border = 'border-error';
      break;
    case 'neutral':
      bg = 'bg-neutral-300';
      border = 'border-neutral-300';
      break;
    default:
    //
  }
  return { bg, border };
};

export const statusColorMapOrder = (color: string): number => {
  return ['', 'neutral', 'info', 'warning', 'error'].indexOf(color);
};
