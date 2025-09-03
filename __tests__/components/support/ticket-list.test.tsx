import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TicketList } from '@/components/support/ticket-list';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API response
const mockTickets = [
  {
    id: '1',
    subject: '결제 오류 문의',
    status: 'open',
    priority: 'high',
    category: 'billing',
    createdAt: '2025-08-25T10:00:00Z',
    updatedAt: '2025-08-25T10:00:00Z',
    userId: 'user1',
    userName: '테스터',
    lastMessage: '결제가 완료되지 않았습니다.',
    unreadCount: 1,
  },
  {
    id: '2',
    subject: '로그인 문제',
    status: 'in_progress',
    priority: 'medium',
    category: 'technical',
    createdAt: '2025-08-24T15:30:00Z',
    updatedAt: '2025-08-24T16:45:00Z',
    userId: 'user2',
    userName: '사용자2',
    lastMessage: '로그인이 안 돼요',
    unreadCount: 0,
  },
];

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        tickets: mockTickets,
        total: 2,
      }),
  })
) as jest.Mock;

describe('TicketList', () => {
  const queryClient = new QueryClient();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TicketList />
      </QueryClientProvider>
    );
  };

  it('로딩 상태를 올바르게 표시합니다', async () => {
    renderComponent();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('티켓 목록을 성공적으로 불러옵니다', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('결제 오류 문의')).toBeInTheDocument();
      expect(screen.getByText('로그인 문제')).toBeInTheDocument();
    });
  });

  it('상태 필터링이 작동합니다', async () => {
    renderComponent();
    
    // 상태 필터 변경
    const statusFilter = screen.getByLabelText('상태별 필터');
    fireEvent.change(statusFilter, { target: { value: 'open' } });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=open')
      );
    });
  });

  it('검색 기능이 작동합니다', async () => {
    renderComponent();
    
    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('제목 또는 내용 검색');
    fireEvent.change(searchInput, { target: { value: '결제' } });
    
    // 디바운스 대기 (실제로는 useDebounce 사용)
    await new Promise((r) => setTimeout(r, 500));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=결제')
      );
    });
  });

  it('티켓 클릭 시 상세 페이지로 이동합니다', async () => {
    renderComponent();
    
    await waitFor(() => {
      const ticket = screen.getByText('결제 오류 문의');
      fireEvent.click(ticket);
      expect(mockPush).toHaveBeenCalledWith('/support/tickets/1');
    });
  });
});
