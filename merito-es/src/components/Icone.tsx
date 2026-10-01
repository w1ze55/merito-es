// Pictogramas do totem: traço único de 1,75 sobre grade de 24.

const TRACOS = {
  visao: (
    <>
      <path d="M4 20h16" />
      <path d="M6.5 16.5v-5" />
      <path d="M11 16.5v-9" />
      <path d="M15.5 16.5v-6.5" />
      <path d="M20 16.5V4.5" />
    </>
  ),
  abastecimento: (
    <>
      <path d="M12 3.5c-3 4-5.5 6.9-5.5 10a5.5 5.5 0 0 0 11 0c0-3.1-2.5-6-5.5-10z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  bomba: (
    <>
      <path d="M4.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 14.5 5v15.5" />
      <path d="M3 20.5h13" />
      <path d="M7 7h5v4H7z" />
      <path d="M14.5 9.5H17a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V8.5l-3-3" />
    </>
  ),
  combustivel: (
    <>
      <path d="M6 4.5h12" />
      <path d="M6 19.5h12" />
      <path d="M7 4.5c-1 2.5-1 12.5 0 15" />
      <path d="M17 4.5c1 2.5 1 12.5 0 15" />
      <path d="M6.4 9.5h11.2" />
      <path d="M6.4 14.5h11.2" />
    </>
  ),
  editar: (
    <>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M14.5 7.5l2 2" />
    </>
  ),
  excluir: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.5h5v2" />
      <path d="M6.5 6.5l1 13h9l1-13" />
      <path d="M10.5 10.5v5.5" />
      <path d="M13.5 10.5v5.5" />
    </>
  ),
  fechar: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  alerta: (
    <>
      <path d="M12 4l9 15.5H3z" />
      <path d="M12 10v4" />
      <path d="M12 17v.01" />
    </>
  ),
  ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </>
  ),
  seta: (
    <>
      <path d="M4.5 12h15" />
      <path d="M14 6.5l5.5 5.5-5.5 5.5" />
    </>
  ),
  recarregar: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  registro: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 17.5h9" />
    </>
  ),
} as const

export type NomeIcone = keyof typeof TRACOS

export function Icone({ nome, tamanho = 20 }: { nome: NomeIcone; tamanho?: number }) {
  return (
    <svg
      className="icone"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {TRACOS[nome]}
    </svg>
  )
}
