import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp forceRedirectUrl="/post-auth" fallbackRedirectUrl="/post-auth" />
}
