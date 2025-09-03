import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AuctionStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { amount, isAutoBid = false, maxAutoBid } = await request.json();

    // 경매 조회
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { error: '경매를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 경매 상태 확인
    if (auction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '이 경매는 현재 진행 중이 아닙니다' },
        { status: 400 }
      );
    }

    // 경매 기간 확인
    const now = new Date();
    if (now < auction.startDate || now > auction.endDate) {
      return NextResponse.json(
        { error: '현재 입찰이 불가능한 경매입니다' },
        { status: 400 }
      );
    }

    // 최소 입찰 금액 계산
    const currentBid = auction.bids[0]?.amount || auction.startPrice;
    const minBid = currentBid + (auction.bidIncrement || 1000);

    if (amount < minBid) {
      return NextResponse.json(
        { error: `최소 입찰 금액은 ${minBid.toLocaleString()}원입니다` },
        { status: 400 }
      );
    }

    // 자동 입찰인 경우 최대 입찰 금액 확인
    if (isAutoBid && (!maxAutoBid || maxAutoBid <= amount)) {
      return NextResponse.json(
        { error: '자동 입찰을 위해서는 현재 입찰가보다 높은 최대 입찰 금액을 설정해주세요' },
        { status: 400 }
      );
    }

    // 입찰 처리
    const [bid, updatedAuction] = await prisma.$transaction([
      // 새 입찰 생성
      prisma.bid.create({
        data: {
          amount,
          auctionId: params.id,
          bidderId: session.user.id,
          isAutoBid,
          maxAutoBid: isAutoBid ? maxAutoBid : null,
        },
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      // 경매 정보 업데이트
      prisma.auction.update({
        where: { id: params.id },
        data: {
          currentPrice: amount,
          bidCount: { increment: 1 },
        },
      }),
    ]);

    // TODO: WebSocket을 통한 실시간 업데이트
    // broadcastNewBid(params.id, bid);

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('입찰 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '입찰 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 경매 상태 확인 및 업데이트 함수 (주기적으로 실행해야 함)
export async function checkAndUpdateAuctionStatus(auctionId: string) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) return;

  const now = new Date();
  let status = auction.status;
  let shouldUpdate = false;

  // 경매 시작
  if (auction.status === 'PENDING' && now >= auction.startDate) {
    status = 'ACTIVE';
    shouldUpdate = true;
  }

  // 경매 종료
  if ((auction.status === 'PENDING' || auction.status === 'ACTIVE') && now >= auction.endDate) {
    status = 'COMPLETED';
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status },
    });

    // TODO: WebSocket을 통한 실시간 업데이트
    // broadcastAuctionStatus(auctionId, status);
  }

  return status;
}
