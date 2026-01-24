import { FaSun, FaMoon } from "react-icons/fa"
import { useState } from "react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  const toggle = () => {
    document.documentElement.classList.toggle("dark")
    setDark(!dark)
  }

  return (
    <button onClick={toggle} className="p-2 rounded-full backdrop-blur">
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  )
}
