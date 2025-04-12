import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">FinReal</h1>
            <nav>
              <Link href="/" className="text-sm font-medium">Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center">
            <span className="text-sm">a</span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <Button asChild>
            <Link href="/projects/new">Create New Project</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-lg text-gray-600 mb-4">No projects yet</p>
          <p className="text-sm text-gray-500 mb-6">Create your first project to get started.</p>
          <Button asChild>
            <Link href="/projects/new">Create New Project</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
