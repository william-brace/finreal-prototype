// Public API for the auth feature
export { SignUpForm } from "./components/SignUpForm";
export { SignInForm } from "./components/SignInForm";
export { useSignUp } from "./hooks/useSignUp";
export { useSignIn } from "./hooks/useSignIn";
export {
  signUpSchema,
  signInSchema,
  type SignUpFormData,
  type SignInFormData,
} from "./model/schema";

// Re-export types, hooks, and server functions as they are created
// export type { User, AuthState } from './model/types'
// export { useAuthState } from './hooks/useAuthState'
// export { getSessionUser } from './server/getSessionUser'
