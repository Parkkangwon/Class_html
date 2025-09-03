import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    // 알림이 존재하는지 확인
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인: 알림 소유자만 삭제 가능
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 알림 삭제 (소프트 딜리트 대신 실제 삭제)
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.',
    });
    
  } catch (error) {
    console.error('알림 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '알림을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
