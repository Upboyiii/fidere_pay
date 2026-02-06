'use client'

import { useState } from 'react'
import KycDashboard from '@/views/kyc/dashboard'

const LOGOUT_FLAG = 'logout_in_progress'

function getIsLogoutRedirect() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(LOGOUT_FLAG) === 'true'
}

export default function DashboardPage() {
  const [isLogoutRedirect] = useState(getIsLogoutRedirect)

  // 退出流程中先落到本页时只显示 loading，不渲染业务内容，避免被察觉
  if (isLogoutRedirect) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4' />
        </div>
      </div>
    )
  }

  return <KycDashboard />
}
