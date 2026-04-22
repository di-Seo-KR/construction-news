import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="h-0.5 w-full bg-[#FFB81C]" />
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3.5 sm:px-8 sm:py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFB81C] text-base font-extrabold tracking-tight text-gray-900">
            KB
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              KBCI 뉴스
            </h1>
            <p className="text-[12px] text-gray-500 sm:text-[13px]">
              KB신용정보 사내 뉴스 모니터링
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
