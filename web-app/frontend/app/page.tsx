import LoginForm from "@/components/auth/LoginForm";
import { M_PLUS_1p } from "next/font/google";

const mPlus1P = M_PLUS_1p({
  variable: "--font-m-plus-1p",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  return (
    <main
      className={`${mPlus1P.variable} min-h-screen overflow-hidden text-white`}
      style={{
        backgroundColor: "#08112d",
        backgroundImage: "url('/images/login_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "var(--font-m-plus-1p), sans-serif",
        letterSpacing: "2px",
      }}
    >
      <img
        src="/images/logo.png"
        alt="Activity Tracker"
        className="absolute left-[20px] top-[20px] z-30 h-[44px] w-auto object-contain lg:left-[46px] lg:top-[38px] lg:h-[54px]"
      />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col">
          <div className="relative z-10 flex h-full flex-col justify-center px-[46px] py-[38px]">
            <div className="max-w-[390px] rounded-[12px] bg-[#09142d]/45 px-[18px] py-[16px] backdrop-blur-[2px]">
              <h1 className="text-[40px] font-medium leading-[1.32] text-[#7c96e8]/90 tracking-[3px]">
                Build a focused space for your tasks, notes, and daily progress.
              </h1>
              <p className="mt-[28px] max-w-[330px] text-[12px] leading-[1.9] text-[#91a4cf]/60">
                A clean productivity dashboard designed to help you track what matters, stay organized, and move through your day with clarity.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:min-h-0 lg:px-12">
          <div className="relative w-full max-w-[360px] rounded-[16px] bg-[#08112d] px-5 py-8 sm:bg-[#08112d] sm:px-6 sm:py-10 lg:bg-transparent lg:px-0 lg:py-10">
            <div className="mb-8">
              <img
                src="/images/welcome-back.png"
                alt="Welcome back. Sign in to your account to continue tracking"
                className="h-auto w-full object-contain"
              />
            </div>
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
