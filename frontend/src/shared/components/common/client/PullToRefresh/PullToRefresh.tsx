'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
}

const THRESHOLD = 80

export function PullToRefresh({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return
    const distance = e.touches[0].clientY - startY.current
    if (distance > 0) {
      // damping factor でゴムのような抵抗感
      setPullDistance(Math.min(distance * 0.5, THRESHOLD * 1.2))
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance >= THRESHOLD * 0.5) {
      setIsRefreshing(true)
      setPullDistance(0)
      try {
        await queryClient.invalidateQueries({ refetchType: 'active' })
      } finally {
        setIsRefreshing(false)
      }
    } else {
      setPullDistance(0)
    }
  }

  const indicatorHeight = pullDistance > 0 ? pullDistance : isRefreshing ? 40 : 0
  const indicatorOpacity = Math.min(pullDistance / (THRESHOLD * 0.5), 1)
  const showIndicator = pullDistance > 0 || isRefreshing

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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </>
  )
}
