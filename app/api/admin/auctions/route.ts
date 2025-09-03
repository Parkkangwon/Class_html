import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 관리자 권한 확인
const isAdmin = (session: any) => {
  return session?.user?.role === 'ADMIN';
};

// 경매 상태 업데이트
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 인증 및 권한 확인
  if (!session || !isAdmin(session)) {
    return NextResponse.json(
      { error: '인증되지 않았거나 권한이 없습니다.' },
      { status: 401 }
    );
  }

  try {
    const { auctionId, status, reason } = await request.json();

    // 유효성 검사
    if (!auctionId || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: '잘못된 요청 파라미터입니다.' },
        { status: 400 }
      );
    }

    // 경매 상태 업데이트
    const updatedAuction = await prisma.auction.update({
      where: { id: auctionId },
      data: {
        status,
        ...(status === 'REJECTED' && { rejectionReason: reason }),
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    // TODO: 상태 변경 알림 전송

    return NextResponse.json({ success: true, data: updatedAuction });
  } catch (error) {
    console.error('경매 상태 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 경매 목록 조회
// GET /api/admin/auctions?status=PENDING&page=1&limit=10
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 인증 및 권한 확인
  if (!session || !isAdmin(session)) {
    return NextResponse.json(
      { error: '인증되지 않았거나 권한이 없습니다.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 상태별 경매 목록 조회
    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where: { status },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auction.count({ where: { status } }),
    ]);

    return NextResponse.json({
      success: true,
      data: auctions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('경매 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
