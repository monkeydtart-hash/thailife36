import { Suspense } from 'react'
import AdminClient from './AdminClient'

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#003087] text-sm">กำลังโหลด...</div>
      </div>
    }>
      <AdminClient />
    </Suspense>
  )
}
