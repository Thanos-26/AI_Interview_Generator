export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 
      bg-[radial-gradient(circle_at_10%_10%,rgba(88,28,135,0.15)_0%,transparent_40%),
          radial-gradient(circle_at_90%_90%,rgba(30,58,138,0.15)_0%,transparent_40%)]
      dark:bg-darkBg" />
  )
}
