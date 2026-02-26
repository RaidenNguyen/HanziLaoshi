
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="font-display bg-[#fff7e0] dark:bg-background-dark text-charcoal dark:text-gray-100 min-h-screen flex flex-col overflow-x-hidden relative transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#ff6933]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#66B0B0]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Navigation - Removed as requested */}
      <div className="w-full h-8"></div>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-6xl bg-white dark:bg-surface-dark rounded-[2rem] shadow-2xl shadow-[#ff6933]/5 overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">

          {/* Left Panel: Mascot & Story */}
          <div className="lg:w-5/12 relative bg-[#66B0B0]/10 dark:bg-[#66B0B0]/5 flex flex-col p-8 lg:p-12 overflow-hidden group">
            {/* Decorative Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-gradient-to-tr from-[#ff6933]/20 to-[#66B0B0]/20 rounded-full blur-3xl opacity-60"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/20 backdrop-blur text-xs font-bold text-[#ff6933] mb-6 border border-[#ff6933]/10">
                  <span>Hành trình mới</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight text-[#2E333D] dark:text-white mb-4">
                  Sẵn sàng <span className="text-[#ff6933]">Trung ngữ?</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Tham gia cùng hàng ngàn học viên chinh phục HSK 1-6.
                </p>
              </div>

              {/* Mascot Image */}
              <div className="mt-8 flex-grow flex items-center justify-center relative">
                <div className="absolute top-0 right-4 bg-white dark:bg-gray-800 p-3 rounded-t-2xl rounded-bl-2xl rounded-br-sm shadow-lg transform rotate-2 animate-bounce duration-[3000ms] z-20 max-w-[140px]">
                  <p className="text-xs font-bold text-center text-[#2E333D] dark:text-white">Đi thôi! ⚔️</p>
                </div>
                <div className="w-full max-w-[320px] aspect-square relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-900/10 border-4 border-white dark:border-gray-700 transform transition-transform duration-700 group-hover:scale-[1.02]">
                  <img alt="Wuxia Cat Mascot" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7E25NvL6uFgFNvz3itq8cEwZMLknhUxlVnFKvftMXwaD7A-Ikz8paPZ2IrAmJTKpdmNAM4apqtnDrX0PHfnsPXmzFfL0_rcWWNWFwS1OlJRc71pJW45Ei93BHbeqv254t-6tV5YGvTjoNzcrvle5A9KQHIPzPr3C6ua1wVKbf5V_qov0PcSyCiQRz0PSdzkcVVvDqTU_Ac6arFvlV2PjsIFzGRULWpngHdARvKnu8aDlf8X9hnQ69aBEKw--makmk9XMzdtg3pPo" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Registration Form */}
          <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-surface-dark">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#2E333D] dark:text-white mb-2">Tạo hồ sơ nhân vật</h1>
                <p className="text-gray-500 dark:text-gray-400">Điền thông tin để bắt đầu hành trình tu luyện.</p>
              </div>

              <Suspense fallback={<div className="text-center p-4">Đang tải...</div>}>
                <RegisterForm />
              </Suspense>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-surface-dark text-gray-500">Hoặc gia nhập bằng</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Button variant="social" className="h-11 text-sm bg-white border-gray-200 hover:bg-gray-50 text-[#2E333D]">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT2b8RrOZnXA1unnnJcl3v5HHEDsudsiH4Ifehyzy9t5kbySdOKnShBYXU0m3m2OyAaCH4OaC8Ps0JCZW5-nM9prAHMEGBjva8lwCyvQgKj9_RPcoqpaSVVP3EwPmVjLwayDYiPlnseVNdYLgIYd4yj3GyN-UeokGZkdTqWFhbQ9A0NBbLbgMdFHUqC1Y9XD7hCQMtd0N4HwGIx6RNKLX0XOdojnAr3DbvXt8piFVe-JaTxQSVl4CEJV11I1h4R9hZgNHrvwwv4OM" alt="Google" className="h-5 w-5 mr-3" />
                    Google
                  </Button>
                  <Button variant="social" className="h-11 text-sm bg-white border-gray-200 hover:bg-gray-50 text-[#2E333D]">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuq5vrjlOP-0bZAgsA2RBXrMRMVc3TEnx2fvbPBxiJaxYHLWO-yicmM66yYQ28ow4II_YHczv4KI6Cc6yg7q-IAL6kSctu2fwFhVMue--87V83umoKv2UcgfNBzWHWcUf-jwqOxAkqVGsOxXlR1cSrn_p57-nj9-L2qTx0EvtAWfVJvsECeoUhzOLinhfeppuysp1_ygpD_9Urr-sV-mpuDXGFDTIhdjmfnWN8UZNAJXlIkcoGgd6791avw8EG4MBP0eJRsJ20vxk" alt="Facebook" className="h-5 w-5 mr-3" />
                    Facebook
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center relative z-10 text-sm text-gray-500">
        © 2025 HSK Master. Made with <span className="text-red-500 inline-block animate-pulse">♥</span> for Vietnamese Students.
      </footer>
    </div>
  );
}
