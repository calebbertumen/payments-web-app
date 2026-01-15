import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginPageClient from "./login-client"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string }
}) {
  const session = await auth()
  
  // If already logged in, redirect immediately (server-side)
  // Note: redirect() throws a NEXT_REDIRECT error which is expected behavior
  if (session) {
    const callbackUrl = searchParams?.callbackUrl || "/home"
    redirect(callbackUrl)
  }

  return <LoginPageClient callbackUrl={searchParams?.callbackUrl} />
}
