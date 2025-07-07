'use server';

import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

const AuthSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

type AuthState = {
  error?: string;
  message?: string;
};

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = AuthSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  
  if (!validatedFields.success) {
      const firstError = validatedFields.error.errors[0].message;
      return { error: firstError };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        ecoPoints: 0,
    });

    return { message: 'Account created successfully! Redirecting...' };
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
        return { error: 'This email is already registered.' };
    }
    return { error: 'An unknown error occurred. Please try again.' };
  }
}

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = AuthSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return { error: firstError };
  }

  const { email, password } = validatedFields.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { message: 'Logged in successfully! Redirecting...' };
  } catch (e: any) {
    return { error: 'Invalid email or password. Please try again.' };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (e: any) {
     console.error('Logout failed', e);
  }
}
