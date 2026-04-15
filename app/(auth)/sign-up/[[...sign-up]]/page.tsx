import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'#F5F3EF'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Cormorant Garamond, serif', fontSize:'13px', fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase', color:'#B89B5E', marginBottom:'32px'}}>Legacy Vault</div>
        <SignUp />
      </div>
    </div>
  )
}
