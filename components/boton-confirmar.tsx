'use client'

/** Botón de un formulario de server action que pide confirmación antes de enviar. */
export function BotonConfirmar({
  accion,
  campos,
  pregunta,
  children,
  className,
}: {
  accion: (form: FormData) => Promise<void>
  campos: Record<string, string>
  pregunta: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!confirm(pregunta)) e.preventDefault()
      }}
    >
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <button type="submit" className={className}>{children}</button>
    </form>
  )
}
