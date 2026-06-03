import { Suspense } from 'react'
import DashboardClient from './DashboardClient'

function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-[#003087] text-sm">กำลังโหลด...</div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardClient />
    </Suspense>
  )
}
