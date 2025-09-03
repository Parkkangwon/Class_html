'use client';

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { ErrorBoundary } from '@/components/error-handling/error-boundary';
import { PageHeader } from '@/components/common/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SupportTabs, useActiveTab, type TabType } from '@/components/support/support-tabs';
import { LoginPrompt } from '@/components/auth/login-prompt';

// Lazy load tab content components
const FAQSection = dynamic(() => import('@/components/support/faq-section').then(mod => mod.default), { 
  loading: () => <LoadingSpinner className="mt-8" /> 
});
const ContactForm = dynamic(() => import('@/components/support/contact-form').then(mod => mod.default), { 
  loading: () => <LoadingSpinner className="mt-8" /> 
});
const TicketList = dynamic(() => import('@/components/support/ticket-list').then(mod => mod.default), { 
  loading: () => <LoadingSpinner className="mt-8" /> 
});
const AttendanceSection = dynamic(() => import('@/components/attendance/attendance-section').then(mod => mod.default), { 
  loading: () => <LoadingSpinner className="mt-8" /> 
});
const ContactInfo = dynamic(() => import('@/components/support/contact-info').then(mod => mod.default), { 
  loading: () => <LoadingSpinner className="mt-8" /> 
});

const TAB_CONFIG: Record<TabType, { component: React.ComponentType; auth: boolean }> = {
  faq: { component: FAQSection, auth: false },
  contact: { component: ContactForm, auth: true },
  tickets: { component: TicketList, auth: true },
  attendance: { component: AttendanceSection, auth: true },
  info: { component: ContactInfo, auth: false },
};

export default function SupportPage() {
  const { data: session, status } = useSession();
  const { activeTab, setTab } = useActiveTab('faq');

  const isLoading = status === 'loading';

  const renderTabContent = () => {
    const { component: TabComponent, auth } = TAB_CONFIG[activeTab];

    if (isLoading) {
      return <LoadingSpinner className="mt-8" />;
    }

    if (auth && !session) {
      return (
        <LoginPrompt 
          title={`${activeTab === 'tickets' ? '문의 내역' : '1:1 문의'} 확인`}
          description={`로그인하고 ${activeTab === 'tickets' ? '내 문의 내역을' : '1:1 문의를'} 확인해보세요.`}
          callbackUrl={`/support?tab=${activeTab}`}
        />
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner className="mt-8" />}>
        <TabComponent />
      </Suspense>
    );
  };

  return (
    <div className="container py-8">
      <PageHeader
        title="고객 지원"
        description="자주 묻는 질문을 확인하거나 문의사항을 보내주세요."
      />
      <ErrorBoundary>
        <SupportTabs activeTab={activeTab} onTabChange={setTab} />
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </ErrorBoundary>
    </div>
  );
}
