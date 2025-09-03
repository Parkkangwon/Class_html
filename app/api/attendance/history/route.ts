import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AttendanceService } from '@/services/attendance.service';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    const attendanceService = new AttendanceService();
    const history = await attendanceService.getAttendanceHistory(session.user.id, page, limit);

    return NextResponse.json({
      success: true,
      data: history.data,
      pagination: history.pagination
    });
  } catch (error: any) {
    console.error('출석 이력 조회 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '출석 이력을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export { GET };

export const dynamic = 'force-dynamic';
