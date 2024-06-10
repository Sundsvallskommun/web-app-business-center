import { useEffect, useState } from 'react';

interface WindowSize {
  width?: number;
  height?: number;
  xxs: boolean;
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

export function useWindowSize(): WindowSize {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{ windowSize: WindowSize }>({
    windowSize: {
      width: undefined,
      height: undefined,
      xxs: false,
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
    },
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight,
          xxs: window.innerWidth >= 320,
          xs: window.innerWidth >= 375,
          sm: window.innerWidth >= 640,
          md: window.innerWidth >= 768,
          lg: window.innerWidth >= 1024,
          xl: window.innerWidth >= 1280,
        },
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return { ...windowSize.windowSize };
}
