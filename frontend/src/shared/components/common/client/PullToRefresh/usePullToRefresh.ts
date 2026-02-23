'use client'

import { useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useRef, useState } from 'react'

const THRESHOLD = 80

export function usePullToRefresh() {
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

  return {
    containerRef,
    indicatorHeight,
    indicatorOpacity,
    isRefreshing,
    pullDistance,
    showIndicator,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  }
}
