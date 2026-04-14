import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "./login-form"

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 md:p-10 selection:bg-accent-red selection:text-white">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-3 self-center font-black uppercase tracking-tighter text-xl">
          <div className="flex size-8 items-center justify-center rounded-sm bg-accent-red text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]">
            <GalleryVerticalEnd className="size-5" />
          </div>
          Sovereign.OS
        </a>
        <LoginForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  )
}
