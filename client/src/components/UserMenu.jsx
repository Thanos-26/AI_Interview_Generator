import { useState } from "react"
import { Link } from "react-router-dom"

export default function UserMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <img
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full border cursor-pointer"
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
      />

      {open && (
        <div className="absolute right-0 mt-3 w-56 backdrop-blur rounded-2xl p-3">
          <p className="text-xs text-purple-400">Candidate Mode</p>
          <p className="text-sm mb-2">bhanu@dev.com</p>
          <Link to="/dashboard" className="block py-2">Dashboard</Link>
          <Link to="/" className="block py-2 text-red-400">Logout</Link>
        </div>
      )}
    </div>
  )
}
