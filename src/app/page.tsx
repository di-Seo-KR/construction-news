import NewsList from "@/components/NewsList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
              K
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 sm:text-lg">
                KBCI 뉴스
              </h1>
              <p className="text-[11px] text-gray-500 sm:text-xs">
                KB신용정보 사내 뉴스 모니터링
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <NewsList />
      </div>
    </main>
  );
}
