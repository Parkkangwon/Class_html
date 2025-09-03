'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/icons';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const formSchema = z.object({
  subject: z.string()
    .min(5, '제목은 5자 이상 입력해주세요.')
    .max(100, '제목은 100자 이하로 입력해주세요.'),
  message: z.string()
    .min(10, '내용은 10자 이상 입력해주세요.')
    .max(5000, '내용은 5000자 이하로 입력해주세요.'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.enum(['general', 'billing', 'technical', 'other']).default('general'),
  attachments: z
    .array(
      z.instanceof(File).refine(
        (file) => file.size <= MAX_FILE_SIZE,
        '파일 크기는 5MB를 초과할 수 없습니다.'
      ).refine(
        (file) => ALLOWED_FILE_TYPES.includes(file.type),
        '지원하지 않는 파일 형식입니다.'
      )
    )
    .max(5, '최대 5개까지 첨부 가능합니다.')
    .optional()
    .default([]),
});

type FormValues = z.infer<typeof formSchema> & {
  attachments: File[];
};

export function NewTicketForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
      priority: 'medium',
      category: 'general',
      attachments: [],
    },
  });

  const { fields: attachmentFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attachments',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      const newFiles = Array.from(e.target.files);
      const currentAttachments = form.getValues('attachments') || [];
      
      // Check total file count
      if (currentAttachments.length + newFiles.length > 5) {
        throw new Error('최대 5개까지 첨부 가능합니다.');
      }

      // Validate each file
      const validFiles: File[] = [];
      
      for (const file of newFiles) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`파일 크기는 5MB를 초과할 수 없습니다. (${file.name})`);
        }
        
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error(`지원하지 않는 파일 형식입니다. (${file.name})`);
        }
        
        validFiles.push(file);
      }
      
      if (validFiles.length > 0) {
        append(validFiles);
        form.clearErrors('attachments');
      }
      
      // Reset file input to allow selecting the same file again
      e.target.value = '';
      
    } catch (error) {
      form.setError('attachments', {
        type: 'manual',
        message: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
      });
    }
  };

  const removeFile = (index: number) => {
    remove(index);
  };

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('파일 업로드에 실패했습니다.');
    }
    
    const data = await response.json();
    return data.url;
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Upload attachments first
      const attachmentUrls = await Promise.all(
        (values.attachments || []).map(file => uploadFile(file))
      );
      
      // Create ticket with attachment URLs
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: values.subject,
          message: values.message,
          priority: values.priority,
          category: values.category,
          attachments: attachmentUrls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const data = await response.json();
      
      toast({
        title: '문의가 접수되었습니다',
        description: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      });
      
      // Redirect to the ticket detail page
      router.push(`/support/tickets/${data.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: '오류 발생',
        description: error instanceof Error ? error.message : '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <Icons.image className="h-4 w-4" />;
      case 'application':
        if (file.type.includes('pdf')) return <Icons.fileText className="h-4 w-4" />;
        if (file.type.includes('word') || file.type.includes('document')) return <Icons.fileText className="h-4 w-4" />;
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return <Icons.table className="h-4 w-4" />;
        return <Icons.file className="h-4 w-4" />;
      default:
        return <Icons.file className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">새 문의 작성</h2>
        <p className="text-muted-foreground">
          문의하실 내용을 상세히 입력해주시면 더 정확한 답변을 드릴 수 있습니다.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 md:col-span-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문의 유형</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="문의 유형을 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">일반 문의</SelectItem>
                        <SelectItem value="billing">결제/환불</SelectItem>
                        <SelectItem value="technical">기술 문의</SelectItem>
                        <SelectItem value="other">기타 문의</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => {
                  const priorityLabels = {
                    low: '낮음',
                    medium: '보통',
                    high: '높음',
                    urgent: '긴급'
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>중요도</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="중요도를 선택해주세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                          <SelectItem value="urgent">긴급</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="문의 제목을 입력해주세요" 
                    {...field} 
                    className="text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>문의 내용</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="문의하실 내용을 자세히 입력해주시면 더 정확한 답변을 드릴 수 있습니다."
                    className="min-h-[200px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="space-y-2">
            <FormLabel>파일 첨부 (선택사항)</FormLabel>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                    form.formState.errors.attachments ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <Icons.upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">파일을 선택하세요</span> 또는 드래그 앤 드롭
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      최대 5개까지 첨부 가능 (각 파일 최대 5MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    disabled={isLoading || (form.getValues('attachments')?.length || 0) >= 5}
                  />
                </label>
              </div>

              {/* File list */}
              {attachmentFields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    첨부된 파일 ({attachmentFields.length}/5)
                  </p>
                  <div className="space-y-2">
                    {attachmentFields.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file)}
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                          disabled={isLoading}
                        >
                          <Icons.x className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {form.formState.errors.attachments && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.attachments.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '문의 등록하기'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
