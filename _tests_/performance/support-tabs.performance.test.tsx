import { render, screen } from '@testing-library/react';
import { SupportTabs } from '@/components/support/support-tabs';
import { measurePerformance } from 'reassure';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe('SupportTabs Performance', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/support');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('tab=faq'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders within performance budget', async () => {
    await measurePerformance(
      <SupportTabs activeTab="faq" />,
      {
        runs: 10,
        warmup: 2,
        writeFile: false,
      }
    );
  });

  test('handles rapid tab changes', async () => {
    const { user } = await measurePerformance(
      <SupportTabs activeTab="faq" />,
      {
        runs: 1,
        writeFile: false,
        wrapper: ({ children }) => (
          <div>{children}</div>
        ),
      }
    );

    // Simulate rapid tab changes
    const contactTab = screen.getByRole('tab', { name: /문의하기/ });
    const ticketsTab = screen.getByRole('tab', { name: /내 문의내역/ });
    
    await measurePerformance(
      async () => {
        fireEvent.click(contactTab);
        fireEvent.click(ticketsTab);
        fireEvent.click(contactTab);
      },
      {
        runs: 5,
        writeFile: false,
      }
    );
  });
});
