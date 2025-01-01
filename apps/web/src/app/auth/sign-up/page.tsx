import Image from 'next/image'
import Link from 'next/link'

import githubIcon from '@/assets/github-icon.svg'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function SignUpPage() {
  return (
    <form action="" className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password_confirmation">Confirm your password</Label>
        <Input type="password" id="password_confirmation" />
      </div>

      <Button className="w-full" type="submit">
        Create account
      </Button>

      <Button className="w-full" type="button" variant={'link'} asChild>
        <Link href="/auth/sign-in">Already registered ? Sign in</Link>
      </Button>

      <Separator />

      <Button className="w-full" type="submit" variant={'outline'}>
        <Image src={githubIcon} alt="" className="mr-2 size-4 dark:invert" />
        Sign up with Github
      </Button>
    </form>
  )
}