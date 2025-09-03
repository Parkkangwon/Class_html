import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 가짜 데이터 - 실제로는 데이터베이스에서 가져옵니다
const pendingAuctions = [
  {
    id: '1',
    title: '한정판 스니커즈',
    seller: 'user1',
    startPrice: 100000,
    createdAt: '2023-05-15',
    status: 'pending',
  },
  {
    id: '2',
    title: '애플 워치 시리즈 7',
    seller: 'user2',
    startPrice: 350000,
    createdAt: '2023-05-16',
    status: 'pending',
  },
];

const approvedAuctions = [
  {
    id: '3',
    title: '커피 머신',
    seller: 'user3',
    startPrice: 150000,
    startDate: '2023-05-17',
    endDate: '2023-05-24',
    status: 'approved',
  },
];

const rejectedAuctions = [
  {
    id: '4',
    title: '가짜 명품 가방',
    seller: 'user4',
    startPrice: 50000,
    rejectedReason: '가품 의심 상품',
    status: 'rejected',
  },
];

// 관리자 권한 확인
const isAdmin = (session: any) => {
  return session?.user?.role === 'ADMIN';
};

export default async function AdminAuctionsPage() {
  const session = await getServerSession(authOptions);
  
  // 관리자 권한 확인
  if (!session || !isAdmin(session)) {
    redirect('/auth/login?error=unauthorized');
  }

  const handleApprove = async (auctionId: string) => {
    'use server';
    // TODO: 경매 승인 API 호출
    console.log('Approving auction:', auctionId);
  };

  const handleReject = async (auctionId: string, reason: string) => {
    'use server';
    // TODO: 경매 거절 API 호출
    console.log('Rejecting auction:', auctionId, 'Reason:', reason);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">경매 관리</h1>
            <p className="text-muted-foreground">경매를 승인하거나 거절하세요</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Icons.clock className="h-4 w-4" />
              승인 대기
              <Badge variant="secondary" className="ml-1">
                {pendingAuctions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Icons.checkCircle className="h-4 w-4" />
              승인됨
              <Badge variant="secondary" className="ml-1">
                {approvedAuctions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <Icons.xCircle className="h-4 w-4" />
              거절됨
              <Badge variant="secondary" className="ml-1">
                {rejectedAuctions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="rounded-md border
            ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>경매 제목</TableHead>
                    <TableHead>판매자</TableHead>
                    <TableHead>시작 가격</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAuctions.length > 0 ? (
                    pendingAuctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-medium">{auction.title}</TableCell>
                        <TableCell>{auction.seller}</TableCell>
                        <TableCell>{auction.startPrice.toLocaleString()}원</TableCell>
                        <TableCell>{auction.createdAt}</TableCell>
                        <TableCell>
                          <Badge variant="outline">대기 중</Badge>
                        </TableCell>
                        <TableCell className="flex justify-end space-x-2">
                          <form action={() => handleApprove(auction.id)}>
                            <Button type="submit" size="sm" variant="outline">
                              <Icons.check className="mr-2 h-4 w-4" />
                              승인
                            </Button>
                          </form>
                          <form action={() => handleReject(auction.id, '정책 위반')}>
                            <Button type="submit" size="sm" variant="destructive">
                              <Icons.x className="mr-2 h-4 w-4" />
                              거절
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        승인 대기 중인 경매가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>경매 제목</TableHead>
                    <TableHead>판매자</TableHead>
                    <TableHead>시작 가격</TableHead>
                    <TableHead>시작일</TableHead>
                    <TableHead>종료일</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedAuctions.length > 0 ? (
                    approvedAuctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-medium">{auction.title}</TableCell>
                        <TableCell>{auction.seller}</TableCell>
                        <TableCell>{auction.startPrice.toLocaleString()}원</TableCell>
                        <TableCell>{auction.startDate}</TableCell>
                        <TableCell>{auction.endDate}</TableCell>
                        <TableCell>
                          <Badge variant="success">승인됨</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        승인된 경매가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>경매 제목</TableHead>
                    <TableHead>판매자</TableHead>
                    <TableHead>시작 가격</TableHead>
                    <TableHead>거절 사유</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedAuctions.length > 0 ? (
                    rejectedAuctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-medium">{auction.title}</TableCell>
                        <TableCell>{auction.seller}</TableCell>
                        <TableCell>{auction.startPrice.toLocaleString()}원</TableCell>
                        <TableCell>{auction.rejectedReason}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">거절됨</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        거절된 경매가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
