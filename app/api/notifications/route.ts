import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 읽지 않은 알림 개수 가져오기
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    // 최근 알림 목록 가져오기 (최근 10개)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        link: true,
        relatedItemId: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
    
  } catch (error) {
    console.error('알림 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새로운 알림 생성 (테스트용)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 테스트 알림 생성
    const testNotification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'BID_RECEIVED',
        title: '테스트 알림',
        message: '이것은 테스트 알림입니다.',
        link: '/',
      },
    });

    return NextResponse.json({
      success: true,
      data: testNotification,
    });
    
  } catch (error) {
    console.error('알림 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
