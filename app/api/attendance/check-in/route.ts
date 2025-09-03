import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AttendanceService } from '@/services/attendance.service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const attendanceService = new AttendanceService();
    const result = await attendanceService.checkIn(session.user.id);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('출석체크 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '출석체크 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
