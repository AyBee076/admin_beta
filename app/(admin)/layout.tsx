import Sidebar from '@/components/Sidebar'
import LogoutButton from '@/components/LogoutButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <div className="flex justify-end p-4 border-b">
        </div>
        {children}
      </main>
    </div>
  )
}