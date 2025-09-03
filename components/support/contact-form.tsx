"use client"

import { useState, useCallback, memo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "이름은 2글자 이상이어야 합니다.",
  }),
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  subject: z.string().min(5, {
    message: "제목은 5글자 이상이어야 합니다.",
  }),
  message: z.string().min(10, {
    message: "내용은 10글자 이상이어야 합니다.",
  }),
  attachments: z.any().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
})

type ContactFormValues = z.infer<typeof formSchema>

const MemoizedFormField = memo(FormField)
const MemoizedInput = memo(Input)
const MemoizedTextarea = memo(Textarea)

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const ContactForm = memo(function ContactForm({ 
  onSuccess, 
  onError 
}: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState<Array<{
    name: string;
    size: number;
    type: string;
  }>>([]);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium",
      attachments: undefined,
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setFilePreviews(files);
      form.setValue('attachments', e.target.files as unknown as FileList);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...filePreviews];
    newFiles.splice(index, 1);
    setFilePreviews(newFiles);
    // TODO: 실제 파일 목록에서도 제거 필요
  };

  const onSubmit = useCallback(async (data: ContactFormValues) => {
    setIsLoading(true);
    
    try {
      // FormData 생성 (파일 업로드용)
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments' && value) {
          Array.from(value as FileList).forEach(file => {
            formData.append('files', file);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });

      // 실제 API 호출 시 사용할 코드 (예시)
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('문의 접수에 실패했습니다.');
      }
      
      // 성공 알림
      toast({
        title: "✅ 문의가 접수되었습니다.",
        description: "빠른 시일 내에 답변드리겠습니다. 문의 내역은 '내 문의내역'에서 확인하실 수 있습니다.",
        duration: 5000,
      });
      
      // 폼 초기화
      form.reset();
      setFilePreviews([]);
      
      // 성공 콜백 호출
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('문의 접수 오류:', error);
      
      // 에러 알림
      toast({
        title: "❌ 오류가 발생했습니다.",
        description: error instanceof Error ? error.message : "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      });
      
      // 에러 콜백 호출
      if (onError) onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MemoizedFormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <MemoizedInput 
                    placeholder="홍길동" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <MemoizedFormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <MemoizedInput 
                    type="email" 
                    placeholder="example@email.com" 
                    {...field} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <MemoizedFormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <MemoizedInput 
                  placeholder="문의 제목을 입력해주세요" 
                  {...field} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <MemoizedFormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>문의 내용</FormLabel>
              <FormControl>
                <MemoizedTextarea
                  placeholder="자세한 문의 내용을 입력해주세요"
                  className="min-h-[180px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          {/* 파일 첨부 */}
          <div>
            <FormLabel>파일 첨부 (선택사항)</FormLabel>
            <Input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="mt-1"
              disabled={isLoading}
            />
            {filePreviews.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">첨부된 파일 ({filePreviews.length}개)</p>
                <div className="space-y-1">
                  {filePreviews.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 text-sm border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Icons.paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{file.name}</span>
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
                        <span className="sr-only">제거</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 우선순위 선택 */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>우선순위</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Icons.send className="mr-2 h-4 w-4" />
                문의 보내기
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
})
