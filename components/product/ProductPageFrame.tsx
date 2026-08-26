'use client'

import type { ReactNode } from 'react'
import { ProductVisualSystem } from './ProductVisualSystem'

type ProductPageFrameProps = {
  children: ReactNode
  product:
    | 'guru'
    | 'predictions'
    | 'timeline'
    | 'reports'
}

export function ProductPageFrame({
  children,
  product,
}: ProductPageFrameProps) {
  return (
    <div
      data-jyoti-product-system="true"
      data-jyoti-product={product}
      className="relative min-h-screen"
    >
      <ProductVisualSystem />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
      >
        <div className="absolute left-[9%] top-[116px] h-px w-[28%] bg-gradient-to-r from-transparent via-[#d9a24b]/20 to-transparent" />

        <div className="absolute right-[8%] top-[74px] h-[290px] w-[290px] rounded-full border border-[#d9a24b]/[0.07]" />

        <div className="absolute right-[13%] top-[122px] h-[195px] w-[195px] rounded-full border border-[#5b9698]/[0.07]" />

        <div className="absolute right-[19%] top-[192px] h-1.5 w-1.5 rounded-full bg-[#dfa84d]/50 shadow-[0_0_16px_rgba(223,168,77,0.30)]" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
