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
        fontFamily: "var(--font-m-plus-1p), sans-serif",
        letterSpacing: "2px",
      }}
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login_bg.png')" }}
          />

          <div className="relative z-10 flex h-full flex-col px-[46px] py-[38px]">
            <div className="flex items-center">
              <img
                src="/images/logo.png"
                alt="Activity Tracker"
                className="h-[54px] w-auto object-contain"
              />
            </div>

            <div className="mt-[80px] max-w-[390px]">
              <h1 className="text-[40px] font-medium leading-[1.32] text-[#7c96e8]/90 tracking-[3px]">
                Build a focused space for your tasks, notes, and daily progress.
              </h1>
              <p className="mt-[28px] max-w-[330px] text-[12px] leading-[1.9] text-[#91a4cf]/60">
                A clean productivity dashboard designed to help you track what matters, stay organized, and move through your day with clarity.
              </p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[#08112d]" />
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_42%,rgba(74,102,211,0.14),transparent_38%)]" />

          <div className="relative w-full max-w-[360px] px-0 py-8 sm:py-10">
            <div className="mb-8">
              <h2 className="text-3xl font-medium text-[#718cff]">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#8c98c2]">
                Sign in to your account to continue tracking
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
