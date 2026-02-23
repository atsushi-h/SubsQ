'use client'

import { PullToRefreshPresenter } from './PullToRefreshPresenter'
import { usePullToRefresh } from './usePullToRefresh'

type Props = {
  children: React.ReactNode
}

export function PullToRefreshContainer({ children }: Props) {
  const {
    containerRef,
    indicatorRef,
    isRefreshing,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  } = usePullToRefresh()

  return (
    <PullToRefreshPresenter
      containerRef={containerRef}
      indicatorRef={indicatorRef}
      isRefreshing={isRefreshing}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {children}
    </PullToRefreshPresenter>
  )
}
