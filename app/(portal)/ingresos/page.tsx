import { PaginaMovimientos } from '@/components/pagina-movimientos'

export default async function Page({ searchParams }: { searchParams: Promise<{ mes?: string; naturaleza?: string }> }) {
  return <PaginaMovimientos tipo="ingreso" filtros={await searchParams} />
}
