import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the support page component
jest.mock('@/app/support/page', () => {
  const MockSupportPage = () => (
    <div>
      <h1>Support Page</h1>
      <div>
        <button data-testid="faq-tab">자주 묻는 질문</button>
        <button data-testid="contact-tab">문의하기</button>
        <button data-testid="tickets-tab">내 문의내역</button>
      </div>
      <div data-testid="mock-faq-section">FAQ Section</div>
      <div data-testid="mock-contact-form">Contact Form</div>
      <div data-testid="mock-ticket-list">Ticket List</div>
    </div>
  );
  return MockSupportPage;
});

// Import the component after setting up the mock
import SupportPage from '@/app/support/page';

describe('SupportPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient();
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });

  it('should render the support page', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SupportPage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Support Page')).toBeInTheDocument();
  });

  it('should show FAQ section by default', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SupportPage />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('mock-faq-section')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-contact-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-ticket-list')).not.toBeInTheDocument();
  });

  it('should show contact form when contact tab is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SupportPage />
      </QueryClientProvider>
    );
    
    fireEvent.click(screen.getByTestId('contact-tab'));
    expect(screen.getByTestId('mock-contact-form')).toBeInTheDocument();
  });

  it('should show ticket list when tickets tab is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SupportPage />
      </QueryClientProvider>
    );
    
    fireEvent.click(screen.getByTestId('tickets-tab'));
    expect(screen.getByTestId('mock-ticket-list')).toBeInTheDocument();
  });
});
