export default function Loading() {
  return (
    <div
      className="relative flex min-h-[52vh] w-full items-center justify-center bg-[#050d11] px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading JyotiAI"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d7aa57]/25 bg-[#091419]">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#e59a3b]" />
        </div>

        <div>
          <div className="font-heading text-base text-[#f3ecdf]">
            JyotiAI
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-[#8e9996]">
            Loading
          </div>
        </div>
      </div>
    </div>
  )
}
