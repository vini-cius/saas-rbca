'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithPassword } from '@/http/sign-in-with-password'

const signInFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Please enter a password.' }),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const result = signInFormSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors

    return {
      success: false,
      message: null,
      errors,
    }
  }

  const { email, password } = result.data

  try {
    const { token } = await signInWithPassword({
      email,
      password,
    })

    const cookieStore = await cookies()

    cookieStore.set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const inviteId = cookieStore.get('invite')?.value

    if (inviteId) {
      try {
        await acceptInvite(inviteId)

        cookieStore.delete('invite')
      } catch {}
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()

      return {
        success: false,
        message,
        errors: null,
      }
    }

    return {
      success: false,
      message: 'Sorry, something went wrong. Please try again later.',
      errors: null,
    }
  }

  return {
    success: true,
    message: null,
    errors: null,
  }
}
