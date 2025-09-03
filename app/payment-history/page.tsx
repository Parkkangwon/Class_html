import { PaymentHistory } from '@/components/payment/payment-history';
import { PageHeader } from '@/components/common/page-header';

export default function PaymentHistoryPage() {
  return (
    <div className="container py-8">
      <PageHeader
        title="결제 내역"
        description="지금까지의 결제 내역을 확인하실 수 있습니다."
      />
      <div className="mt-8">
        <PaymentHistory />
      </div>
    </div>
  );
}
