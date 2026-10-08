import type { ReactNode } from 'react'

type AuthShellProps = {
  background: string
  children: ReactNode
}

export function AuthShell({ background, children }: AuthShellProps) {
  return (
    <div
      className="relative h-dvh overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex min-h-full flex-col items-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="my-auto w-full max-w-[520px]">{children}</div>
      </div>
    </div>
  )
}
