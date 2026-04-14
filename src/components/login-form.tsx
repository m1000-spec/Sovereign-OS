import * as React from "react"
import { useState } from "react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "./ui/field"
import { Input } from "./ui/input"
import { supabase } from "../lib/supabase"
import { AlertCircle, Loader2 } from "lucide-react"

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: React.ComponentProps<"div"> & { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Hardcoded credential check as requested
    setTimeout(() => {
      if (username === "m1000" && password === "8413") {
        onLoginSuccess();
      } else {
        setError("Invalid system credentials. Access denied.");
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-black tracking-tight uppercase">System Access</CardTitle>
          <CardDescription className="text-white/40">
            Enter terminal credentials to proceed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-xs font-medium text-red-500 border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username" className="text-[10px] uppercase tracking-widest text-white/40">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="System ID"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-white/10 bg-white/5 focus:border-accent-red focus:ring-accent-red/20"
                  disabled={loading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-[10px] uppercase tracking-widest text-white/40">Password</FieldLabel>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/5 focus:border-accent-red focus:ring-accent-red/20"
                  disabled={loading}
                />
              </Field>
              <Field>
                <Button 
                  type="submit" 
                  className="bg-accent-red hover:bg-accent-red/90 text-white font-black uppercase tracking-widest text-[10px] h-11"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-[10px] uppercase tracking-widest text-white/20">
        Unauthorized access is strictly prohibited.
      </FieldDescription>
    </div>
  )
}
