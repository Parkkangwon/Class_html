import { User, Mail, Phone, MapPin, Globe, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: '이름은 2자 이상이어야 합니다.',
  }),
  nickname: z.string().min(2, {
    message: '닉네임은 2자 이상이어야 합니다.',
  }),
  bio: z.string().max(160).optional(),
  location: z.string().optional(),
  website: z.string().url('유효한 URL을 입력해주세요.').or(z.literal('')),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileTabProps {
  user: any;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (data: ProfileFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ProfileTab({ user, isEditing, onEditToggle, onSave, isSubmitting }: ProfileTabProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      nickname: user?.nickname || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    await onSave(data);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">프로필 정보</h3>
          <p className="text-sm text-muted-foreground">개인 정보를 확인하고 관리하세요.</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <p className="text-sm text-muted-foreground">이름</p>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <p className="text-sm text-muted-foreground">이메일</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          
          {user?.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">전화번호</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          )}
          
          {user?.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">위치</p>
                <p className="font-medium">{user.location}</p>
              </div>
            </div>
          )}
          
          {user?.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">웹사이트</p>
                <a 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {user.website}
                </a>
              </div>
            </div>
          )}
          
          {user?.bio && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">자기소개</p>
              <p className="whitespace-pre-line">{user.bio}</p>
            </div>
          )}
        </div>
        
        <Button onClick={onEditToggle} className="mt-6">
          <Edit2 className="h-4 w-4 mr-2" />
          프로필 수정
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">프로필 수정</h3>
          <p className="text-sm text-muted-foreground">개인 정보를 수정하세요.</p>
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input placeholder="닉네임을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>자기소개</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="자기소개를 입력하세요" 
                    className="min-h-[100px]" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>위치</FormLabel>
                <FormControl>
                  <Input placeholder="위치를 입력하세요" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>웹사이트</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value && !value.match(/^https?:\/\//) && value !== '') {
                        value = 'https://' + value;
                      }
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onEditToggle}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                변경 사항 저장
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
