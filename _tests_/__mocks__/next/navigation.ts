const useRouter = jest.fn(() => ({
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
}));

const useSearchParams = jest.fn(() => ({
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  entries: jest.fn(),
  forEach: jest.fn(),
  toString: jest.fn(),
}));

// Export the mocks
export const usePathname = mockUsePathname;
export const useRouter = mockUseRouter;
export const useSearchParams = mockUseSearchParams;
export const redirect = jest.fn();
export const notFound = jest.fn();
export { useParams } from 'next/navigation';
