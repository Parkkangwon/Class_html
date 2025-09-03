'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useWebSocket } from '@/contexts/websocket-context';
import { AuctionStatus } from '@prisma/client';

interface BiddingInterfaceProps {
  auctionId: string;
  currentPrice: number;
  bidIncrement: number;
  status: AuctionStatus;
  endDate: Date;
  onBidPlaced: (amount: number) => void;
}

export function BiddingInterface({
  auctionId,
  currentPrice,
  bidIncrement,
  status,
  endDate,
  onBidPlaced,
}: BiddingInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { socket, isConnected } = useWebSocket();
  const [bidAmount, setBidAmount] = useState<number>(currentPrice + bidIncrement);
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isBidding, setIsBidding] = useState(false);

  // Calculate time left until auction ends
  useEffect(() => {
    if (status !== 'ACTIVE') return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('경매 종료');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}일 ${hours}시간 ${minutes}분`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}시간 ${minutes}분 ${seconds}초`);
      } else {
        setTimeLeft(`${minutes}분 ${seconds}초`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, status]);

  // Handle bid submission
  const handlePlaceBid = async () => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '입찰을 하시려면 로그인해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (status !== 'ACTIVE') {
      toast({
        title: '입찰 불가',
        description: '이 경매는 현재 진행 중이 아닙니다.',
        variant: 'destructive',
      });
      return;
    }

    if (bidAmount < currentPrice + bidIncrement) {
      toast({
        title: '입찰 금액 부족',
        description: `최소 입찰 금액은 ${(currentPrice + bidIncrement).toLocaleString()}원 입니다.`,
        variant: 'destructive',
      });
      return;
    }

    if (isAutoBid && (!maxAutoBid || maxAutoBid <= bidAmount)) {
      toast({
        title: '자동 입찰 한도 설정 필요',
        description: '자동 입찰을 사용하시려면 최대 입찰 한도를 현재 입찰가보다 높게 설정해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsBidding(true);
      
      // Emit bid event via WebSocket
      socket?.emit('place_bid', {
        auctionId,
        amount: bidAmount,
        userId: user.id,
        isAutoBid,
        maxAutoBid: isAutoBid ? maxAutoBid : undefined,
      }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          toast({
            title: '입찰 성공',
            description: `성공적으로 ${bidAmount.toLocaleString()}원에 입찰하셨습니다.`,
          });
          onBidPlaced(bidAmount);
          
          // Update bid amount for next bid
          setBidAmount(prev => prev + bidIncrement);
        } else {
          toast({
            title: '입찰 실패',
            description: response.error || '입찰 중 오류가 발생했습니다.',
            variant: 'destructive',
          });
        }
        setIsBidding(false);
      });
    } catch (error) {
      console.error('Bid error:', error);
      toast({
        title: '오류 발생',
        description: '입찰 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setIsBidding(false);
    }
  };

  // Handle auto-bid toggle
  const handleAutoBidToggle = (checked: boolean) => {
    setIsAutoBid(checked);
    if (checked) {
      setMaxAutoBid(bidAmount + bidIncrement * 5);
    } else {
      setMaxAutoBid(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          현재 입찰가: <span className="text-3xl text-primary">{currentPrice.toLocaleString()}원</span>
        </h2>
        {status === 'ACTIVE' && (
          <p className="text-gray-600">
            다음 입찰가: {(currentPrice + bidIncrement).toLocaleString()}원 (입찰 단위: {bidIncrement.toLocaleString()}원)
          </p>
        )}
        {timeLeft && (
          <p className="text-sm text-gray-500 mt-2">
            {status === 'ACTIVE' ? `경매 종료까지: ${timeLeft}` : '경매가 종료되었습니다'}
          </p>
        )}
      </div>

      {status === 'ACTIVE' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bid-amount">입찰 금액 (원)</Label>
            <Input
              id="bid-amount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={currentPrice + bidIncrement}
              step={bidIncrement}
              className="text-lg font-medium"
            />
            <p className="text-sm text-gray-500">
              최소 입찰가: {(currentPrice + bidIncrement).toLocaleString()}원
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-bid"
              checked={isAutoBid}
              onChange={(e) => handleAutoBidToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="auto-bid">자동 입찰 사용</Label>
          </div>

          {isAutoBid && (
            <div className="space-y-2">
              <Label htmlFor="max-bid">최대 입찰 한도 (원)</Label>
              <Input
                id="max-bid"
                type="number"
                value={maxAutoBid || ''}
                onChange={(e) => setMaxAutoBid(Number(e.target.value))}
                min={bidAmount + bidIncrement}
                step={bidIncrement}
                placeholder="최대 입찰 한도를 설정하세요"
              />
              <p className="text-sm text-gray-500">
                자동 입찰을 사용하면 다른 사용자가 입찰할 때마다 자동으로 입찰이 진행됩니다.
              </p>
            </div>
          )}

          <Button
            onClick={handlePlaceBid}
            disabled={isBidding || !isConnected}
            className="w-full py-6 text-lg font-bold"
            size="lg"
          >
            {isBidding
              ? '입찰 중...'
              : isAutoBid
              ? `자동 입찰로 ${bidAmount.toLocaleString()}원 입찰하기`
              : `${bidAmount.toLocaleString()}원 입찰하기`}
          </Button>

          {!isConnected && (
            <p className="text-sm text-yellow-600 text-center">
              실시간 입찰 연결 중... 페이지를 새로고침 해주세요.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-lg font-medium text-gray-700">
            {status === 'COMPLETED'
              ? '이 경매는 종료되었습니다.'
              : status === 'PENDING'
              ? '이 경매는 아직 시작되지 않았습니다.'
              : '이 경매는 취소되었습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
