'use client'

import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { ModeToggle } from '@/shared/components/common/client/ModeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

type Props = {
  userName?: string
  userEmail?: string
  userImage?: string | null
  pathname?: string
  onSignOut: () => void
}

export function HeaderPresenter({ userName, userEmail, userImage, pathname, onSignOut }: Props) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="flex h-14 items-center justify-between px-6">
        {/* 左側: ロゴ + ナビゲーション */}
        <div className="flex items-center gap-6">
          <Link href="/subscriptions" className="text-lg font-bold text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            SubsQ
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/subscriptions"
              className={cn(
                'text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                pathname === '/subscriptions' && 'font-medium',
              )}
            >
              サブスク一覧
            </Link>
            <Link
              href="/payment-methods"
              className={cn(
                'text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                pathname === '/payment-methods' && 'font-medium',
              )}
            >
              支払い方法
            </Link>
          </nav>
        </div>

        {/* 右側: モード切替 + ユーザーメニュー */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {userImage ? <AvatarImage src={userImage} alt={userName || 'ユーザー'} /> : null}
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">ユーザーメニュー</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName || 'ユーザー'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
