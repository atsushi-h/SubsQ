'use client'

import { useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

const THRESHOLD = 80

export function usePullToRefresh() {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const isPulling = useRef(false)
  const currentHeight = useRef(0)
  const rafId = useRef<number | null>(null)

  // React の style prop に height/opacity を置かないため、初期値を直接セット
  // cleanup でアンマウント時の RAF をキャンセルしメモリリークを防ぐ
  useLayoutEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.height = '0px'
      indicatorRef.current.style.opacity = '0'
    }
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  const applyIndicatorStyle = (height: number, opacity: number, withTransition: boolean) => {
    if (!indicatorRef.current) return
    indicatorRef.current.style.transition = withTransition
      ? 'height 0.3s ease, opacity 0.3s ease'
      : 'none'
    indicatorRef.current.style.height = `${height}px`
    indicatorRef.current.style.opacity = String(opacity)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return
    // RAF で 1 フレームに 1 回だけ DOM 更新（再レンダリングなし）
    if (rafId.current !== null) return

    const clientY = e.touches[0].clientY
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      const distance = clientY - startY.current
      if (distance > 0) {
        // damping factor でゴムのような抵抗感
        const height = Math.min(distance * 0.5, THRESHOLD * 1.2)
        const opacity = Math.min(height / (THRESHOLD * 0.5), 1)
        currentHeight.current = height
        applyIndicatorStyle(height, opacity, false)
      }
    })
  }

  const handleTouchEnd = async () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    if (!isPulling.current) return
    isPulling.current = false

    if (currentHeight.current >= THRESHOLD * 0.5) {
      currentHeight.current = 0
      applyIndicatorStyle(40, 1, true)
      setIsRefreshing(true)
      try {
        await queryClient.invalidateQueries({ refetchType: 'active' })
      } finally {
        setIsRefreshing(false)
        applyIndicatorStyle(0, 0, true)
      }
    } else {
      currentHeight.current = 0
      applyIndicatorStyle(0, 0, true)
    }
  }

  return {
    containerRef,
    indicatorRef,
    isRefreshing,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  }
}
