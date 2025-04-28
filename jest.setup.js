import '@testing-library/jest-dom';

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  JWT_SECRET: 'test-jwt-secret',
};

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock Vercel Analytics
jest.mock('@vercel/analytics', () => ({
  inject: jest.fn(),
}));

// Mock Mixpanel
jest.mock('mixpanel', () => ({
  init: () => ({
    track: jest.fn(),
    people: {
      set: jest.fn(),
    },
  }),
})); 