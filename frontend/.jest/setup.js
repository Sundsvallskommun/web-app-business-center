import '@testing-library/jest-dom/extend-expect';
global.XMLHttpRequest = undefined;

global.resizeWindow = (width, height) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

const ResizeObserverMock = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => {
    return 'Next image stub';
  },
}));

jest.mock('next/router', () => ({
  push: jest.fn().mockImplementation(() => Promise.resolve()),
  back: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
  query: {},
  route: '',
  beforePopState: jest.fn(() => null),
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn().mockImplementation(() => Promise.resolve()),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    prefetch: jest.fn(() => null),
  }),
}));
