'use client'

import { PullToRefreshPresenter } from './PullToRefreshPresenter'
import { usePullToRefresh } from './usePullToRefresh'

type Props = {
  children: React.ReactNode
}

export function PullToRefreshContainer({ children }: Props) {
  const {
    containerRef,
    indicatorHeight,
    indicatorOpacity,
    isRefreshing,
    pullDistance,
    showIndicator,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
  } = usePullToRefresh()

  return (
    <PullToRefreshPresenter
      containerRef={containerRef}
      indicatorHeight={indicatorHeight}
      indicatorOpacity={indicatorOpacity}
      isRefreshing={isRefreshing}
      pullDistance={pullDistance}
      showIndicator={showIndicator}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      {children}
    </PullToRefreshPresenter>
  )
}
