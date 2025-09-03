import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AttendanceService } from '@/services/attendance.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const attendanceService = new AttendanceService();
    const rankings = await attendanceService.getAttendanceRanking(limit);

    return NextResponse.json({
      success: true,
      data: rankings
    });
  } catch (error: any) {
    console.error('출석 랭킹 조회 중 오류 발생:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || '출석 랭킹을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export { GET };

export const dynamic = 'force-dynamic';
