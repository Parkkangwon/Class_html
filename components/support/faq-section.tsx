import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "경매에 참여하는 방법이 궁금해요.",
    answer: "회원가입 후 로그인하시면 모든 경매에 참여하실 수 있습니다. 원하시는 상품을 찾아 '입찰하기' 버튼을 클릭하시면 됩니다."
  },
  {
    question: "입찰 금액은 어떻게 정하나요?",
    answer: "각 경매에는 현재 최고 입찰가와 입찰 단위가 표시됩니다. 이전 입찰가보다 높은 금액으로 입찰하실 수 있으며, 최소 입찰 단위는 상품별로 상이할 수 있습니다."
  },
  {
    question: "낙찰된 상품은 어떻게 받나요?",
    answer: "낙찰이 완료되면 이메일로 안내드리며, 마이페이지에서 결제를 완료하실 수 있습니다. 결제 완료 후 배송이 시작됩니다."
  },
  {
    question: "환불 정책이 어떻게 되나요?",
    answer: "상품 수령 후 7일 이내에만 환불이 가능합니다. 단, 상품의 상태가 판매 시와 동일해야 하며, 배송비는 환불되지 않습니다."
  },
  {
    question: "계정을 분실했을 경우 어떻게 하나요?",
    answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하시거나, 고객센터로 문의해주시면 안내 도와드리겠습니다."
  }
]

export function FAQSection() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">자주 묻는 질문</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
