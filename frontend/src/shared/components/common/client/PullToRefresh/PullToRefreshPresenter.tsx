'use client'

import type React from 'react'

type Props = {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  indicatorRef: React.RefObject<HTMLDivElement | null>
  isRefreshing: boolean
  onTouchEnd: () => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
}

export function PullToRefreshPresenter({
  children,
  containerRef,
  indicatorRef,
  isRefreshing,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
}: Props) {
  return (
    <>
      {/* height/opacity は usePullToRefresh が直接 DOM 操作するため JSX style prop に含めない */}
      <div
        ref={indicatorRef}
        className="fixed inset-x-0 top-0 z-50 flex items-end justify-center overflow-hidden bg-background/80 backdrop-blur-sm"
      >
        <span className="mb-2 text-sm text-muted-foreground">
          {isRefreshing ? '更新中...' : '↓ 引っ張って更新'}
        </span>
      </div>
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overscroll-y-contain"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </>
  )
}
