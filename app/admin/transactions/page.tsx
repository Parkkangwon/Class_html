import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authOptions } from '@/lib/auth';

// 가짜 데이터 - 실제로는 데이터베이스에서 가져옵니다
const suspiciousTransactions = [
  {
    id: 'txn_001',
    auctionTitle: '한정판 스니커즈',
    buyer: 'user_a',
    seller: 'user_b',
    amount: 150000,
    status: 'suspicious',
    reason: '비정상적인 입찰 패턴',
    timestamp: '2023-05-20 14:30:22',
  },
  {
    id: 'txn_002',
    auctionTitle: '애플 워치',
    buyer: 'user_c',
    seller: 'user_d',
    amount: 350000,
    status: 'suspicious',
    reason: '동일 IP에서의 다중 계정 입찰',
    timestamp: '2023-05-19 11:15:45',
  },
  {
    id: 'txn_003',
    auctionTitle: '명품 가방',
    buyer: 'user_e',
    seller: 'user_f',
    amount: 1200000,
    status: 'under_review',
    reason: '거래 금액 이상 징후',
    timestamp: '2023-05-18 16:45:30',
  },
];

// 관리자 권한 확인
const isAdmin = (session: any) => {
  return session?.user?.role === 'ADMIN';
};

export default async function TransactionMonitoringPage() {
  const session = await getServerSession(authOptions);
  
  // 관리자 권한 확인
  if (!session || !isAdmin(session)) {
    redirect('/auth/login?error=unauthorized');
  }

  const handleApprove = async (transactionId: string) => {
    'use server';
    // TODO: 거래 승인 API 호출
    console.log('Approving transaction:', transactionId);
  };

  const handleBlock = async (transactionId: string, reason: string) => {
    'use server';
    // TODO: 거래 차단 API 호출
    console.log('Blocking transaction:', transactionId, 'Reason:', reason);
  };

  const stats = [
    {
      title: '의심 거래',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: Icons.alertTriangle,
    },
    {
      title: '차단된 거래',
      value: '5',
      change: '-1',
      changeType: 'decrease',
      icon: Icons.shield,
    },
    {
      title: '검토 완료',
      value: '24',
      change: '+8',
      changeType: 'increase',
      icon: Icons.checkCircle,
    },
    {
      title: '평균 검토 시간',
      value: '12분',
      change: '-3분',
      changeType: 'decrease',
      icon: Icons.clock,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">거래 모니터링</h1>
            <p className="text-muted-foreground">의심스러운 거래를 모니터링하고 관리하세요</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Icons.download className="mr-2 h-4 w-4" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} {stat.changeType === 'increase' ? '▲' : '▼'} 지난주 대비
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>의심 거래 목록</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Icons.refreshCw className="mr-2 h-4 w-4" />
                  새로고침
                </Button>
                <Button variant="outline" size="sm">
                  <Icons.filter className="mr-2 h-4 w-4" />
                  필터
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>거래 ID</TableHead>
                    <TableHead>경매 제목</TableHead>
                    <TableHead>구매자</TableHead>
                    <TableHead>판매자</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>이유</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspiciousTransactions.length > 0 ? (
                    suspiciousTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                        <TableCell className="font-medium">{txn.auctionTitle}</TableCell>
                        <TableCell>{txn.buyer}</TableCell>
                        <TableCell>{txn.seller}</TableCell>
                        <TableCell>{txn.amount.toLocaleString()}원</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">{txn.reason}</div>
                        </TableCell>
                        <TableCell>
                          {txn.status === 'suspicious' ? (
                            <Badge variant="destructive">의심 거래</Badge>
                          ) : (
                            <Badge variant="outline">검토 중</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            <form action={() => handleApprove(txn.id)}>
                              <Button type="submit" size="sm" variant="outline">
                                <Icons.check className="mr-2 h-4 w-4" />
                                승인
                              </Button>
                            </form>
                            <form action={() => handleBlock(txn.id, '부정 거래 의심')}>
                              <Button type="submit" size="sm" variant="destructive">
                                <Icons.ban className="mr-2 h-4 w-4" />
                                차단
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        의심 거래가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>의심 거래 패턴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-muted-foreground">의심 거래 패턴 차트가 여기에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>최근 활동 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="bg-muted rounded-full p-2">
                      <Icons.activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">관리자님이 거래 #txn_00{i}를 승인하셨습니다.</p>
                      <p className="text-xs text-muted-foreground">5분 전</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
