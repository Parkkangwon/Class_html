import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface LoginPromptProps {
  title?: string;
  description?: string;
  callbackUrl?: string;
}

export function LoginPrompt({
  title = '로그인이 필요합니다',
  description = '이 기능을 이용하시려면 로그인해주세요.',
  callbackUrl = '/',
}: LoginPromptProps) {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit">
            <Icons.lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} passHref>
          <Button className="w-full">
            <Icons.login className="mr-2 h-4 w-4" />
            로그인 하러 가기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
