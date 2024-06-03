export const statusColorMap = (color: string): string => {
  // Colors returned here and that is combined with prefixes like "text-.." need to be safelisted
  switch (color) {
    case 'info':
      return `info`;
    case 'warning':
      return `warning`;
    case 'error':
      return `error`;
    case 'neutral':
      return `neutral-300`;
    default:
      return `neutral-300`;
  }
};

export const statusColorMapOrder = (color: string): number => {
  return ['', 'neutral', 'info', 'warning', 'error'].indexOf(color);
};
