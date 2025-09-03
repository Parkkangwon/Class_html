import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importPaymentService } from '@/services/import-payment.service';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const { imp_uid, merchant_uid } = await request.json();

    if (!imp_uid || !merchant_uid) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 결제 검증 및 처리
    const result = await importPaymentService.verifyPayment(imp_uid, merchant_uid);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error_msg || '결제 검증에 실패했습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('결제 검증 중 오류 발생:', error);
    return NextResponse.json(
      { success: false, error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
