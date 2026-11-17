"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: string | number | null | undefined
  onChange: (raw: string) => void
}

/**
 * Formatea un string crudo ("296901" o "296901.5") al formato es-CO con
 * puntos como separador de miles y coma como decimal: "296.901,5".
 */
function formatThousands(raw: string): string {
  if (raw === "" || raw === null || raw === undefined) return ""
  const [intPart, decPart] = raw.split(".")
  const digits = intPart.replace(/[^\d-]/g, "")
  const sign = digits.startsWith("-") ? "-" : ""
  const abs = digits.replace(/^-/, "")
  const withDots = abs.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  if (decPart !== undefined) return `${sign}${withDots},${decPart}`
  return `${sign}${withDots}`
}

/**
 * Convierte un input del usuario en formato es-CO ("296.901,50") a la forma
 * canónica numérica ("296901.50") que se almacena en el estado y se manda al
 * backend. Acepta también el formato simple sin separadores.
 */
function parseMoney(input: string): string {
  if (!input) return ""
  let cleaned = input.replace(/\./g, "").replace(/,/g, ".")
  cleaned = cleaned.replace(/[^\d.]/g, "")
  const firstDot = cleaned.indexOf(".")
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, "")
  }
  return cleaned
}

export const MoneyInput = React.forwardRef<HTMLInputElement, Props>(
  function MoneyInput({ value, onChange, className, ...rest }, ref) {
    const raw =
      value === null || value === undefined || value === ""
        ? ""
        : String(value)
    const display = formatThousands(raw)

    return (
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={(e) => onChange(parseMoney(e.target.value))}
        className={cn(className)}
      />
    )
  },
)

export default MoneyInput
