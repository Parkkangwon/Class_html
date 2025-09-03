import { generateMockTickets } from '@/data/mock-tickets';
import type { Ticket } from '@/types/ticket';

// Simple performance measurement for Node.js environment
const measurePerformance = (fn: () => void, iterations: number = 1) => {
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const endTime = performance.now();
  return endTime - startTime;
};

// Mock window.performance if not available (for Node.js environment)
if (typeof performance === 'undefined') {
  global.performance = require('perf_hooks').performance;
}

// Mock the TicketList component's functionality
const processTickets = (tickets: Ticket[], filter: string = '', sortBy: string = '') => {
  // Simulate filtering
  let result = [...tickets];
  
  if (filter) {
    result = result.filter(ticket => 
      ticket.subject.toLowerCase().includes(filter.toLowerCase()) || 
      ticket.status.toLowerCase().includes(filter.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(filter.toLowerCase()) ||
      ticket.category.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  // Simulate sorting
  if (sortBy === 'priority') {
    const priorityOrder: Record<Required<Ticket>['priority'], number> = { 
      'low': 0, 
      'medium': 1, 
      'high': 2, 
      'urgent': 3 
    };
    result.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  } else if (sortBy === 'date') {
    result.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }
  
  return result;
};

// 모의 티켓 데이터 생성 함수를 별도 파일로 분리

describe('TicketList Performance', () => {
  it('1000개 티켓 처리 시간이 100ms 미만이어야 합니다', () => {
    // 테스트 데이터 생성
    const testTickets = generateMockTickets(1000);
    
    // 성능 측정
    const processTime = measurePerformance(() => {
      processTickets(testTickets);
    });
    
    console.log(`1000개 티켓 처리 시간: ${processTime.toFixed(2)}ms`);
    expect(processTime).toBeLessThan(100);
  });
  
  it('필터링 성능 테스트: 1000개 중 조건에 맞는 티켓 필터링이 50ms 미만이어야 합니다', () => {
    const testTickets = generateMockTickets(1000);
    
    const filterTime = measurePerformance(() => {
      processTickets(testTickets, 'high');
    });
    
    console.log(`1000개 티켓 필터링 시간: ${filterTime.toFixed(2)}ms`);
    expect(filterTime).toBeLessThan(50);
  });
  
  it('정렬 성능 테스트: 1000개 티켓 정렬이 50ms 미만이어야 합니다', () => {
    const testTickets = generateMockTickets(1000);
    
    const sortTime = measurePerformance(() => {
      processTickets(testTickets, '', 'priority');
    });
    
    console.log(`1000개 티켓 정렬 시간: ${sortTime.toFixed(2)}ms`);
    expect(sortTime).toBeLessThan(50);
  });
  
  it('복합 작업(필터링 + 정렬) 성능 테스트: 1000개 티켓에 대해 100ms 미만이어야 합니다', () => {
    const testTickets = generateMockTickets(1000);
    
    const combinedTime = measurePerformance(() => {
      // 필터링 후 정렬
      const filtered = processTickets(testTickets, 'high');
      processTickets(filtered, '', 'priority');
    });
    
    console.log(`1000개 티켓 필터링 + 정렬 시간: ${combinedTime.toFixed(2)}ms`);
    expect(combinedTime).toBeLessThan(100);
  });
});
