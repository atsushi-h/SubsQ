'use client'

import type React from 'react'

type Props = {
  children: React.ReactNode
  containerRef: React.RefObject<HTMLDivElement | null>
  indicatorHeight: number
  indicatorOpacity: number
  isRefreshing: boolean
  pullDistance: number
  showIndicator: boolean
  onTouchEnd: () => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
}

export function PullToRefreshPresenter({
  children,
  containerRef,
  indicatorHeight,
  indicatorOpacity,
  isRefreshing,
  pullDistance,
  showIndicator,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
}: Props) {
  return (
    <>
      {showIndicator && (
        <div
          className="fixed inset-x-0 top-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          style={{
            height: `${indicatorHeight}px`,
            opacity: pullDistance > 0 ? indicatorOpacity : 1,
            transition: pullDistance === 0 ? 'height 0.3s ease, opacity 0.3s ease' : 'none',
          }}
        >
          <span className="mb-2 text-sm text-muted-foreground">
            {isRefreshing ? '更新中...' : '↓ 引っ張って更新'}
          </span>
        </div>
      )}
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
