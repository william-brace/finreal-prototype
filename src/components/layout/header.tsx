'use client'

import Link from "next/link"

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold">FinReal</h1>
          <nav>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Projects</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">John Doe</span>
          <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png" alt="Logo" className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  )
} 