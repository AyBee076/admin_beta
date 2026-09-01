'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from "@/components/LogoutButton";

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'All products' },
  { href: '/products/new', label: 'Add product' },
  { href: '/categories', label: 'Categories' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 h-screen p-4">
      <h2 className="text-lg font-semibold mb-6 px-2">Clothing Admin</h2>
      <ul className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
      <LogoutButton />
    </nav>
  )
}