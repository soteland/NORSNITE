import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase/client'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import OnboardingPage from '@/pages/OnboardingPage'
import HomePage from '@/pages/HomePage'
import GamePage from '@/pages/game/GamePage'
import ProfilePage from '@/pages/ProfilePage'
import FriendsPage from '@/pages/FriendsPage'
import FriendProfilePage from '@/pages/FriendProfilePage'
import AdminPage from '@/pages/AdminPage'
import PersonvernPage from '@/pages/PersonvernPage'
import LeaguesPage from '@/pages/LeaguesPage'
import DevPage from '@/pages/DevPage'

// ── Root layout ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: Outlet })

// ── Auth guard helper ─────────────────────────────────────────────────────────
async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw redirect({ to: '/logg-inn' })
}

async function redirectIfLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) throw redirect({ to: '/' })
}

// ── Public routes ─────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logg-inn',
  beforeLoad: redirectIfLoggedIn,
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/registrer',
  beforeLoad: redirectIfLoggedIn,
  component: SignupPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/glemt-passord',
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nytt-passord',
  component: ResetPasswordPage,
})

const personvernRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/personvern',
  component: PersonvernPage,
})

// ── Protected routes ──────────────────────────────────────────────────────────
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/velkommen',
  beforeLoad: requireAuth,
  component: OnboardingPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireAuth,
  component: HomePage,
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spill',
  beforeLoad: requireAuth,
  component: GamePage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profil',
  beforeLoad: requireAuth,
  component: ProfilePage,
})

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/venner',
  beforeLoad: requireAuth,
  component: FriendsPage,
})

const friendProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/venner/$userId',
  beforeLoad: requireAuth,
  component: FriendProfilePage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: requireAuth,
  component: AdminPage,
})

const leaguesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ligaer',
  beforeLoad: requireAuth,
  component: LeaguesPage,
})

const devRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dev',
  beforeLoad: () => { if (!import.meta.env.DEV) throw redirect({ to: '/spill' }) },
  component: DevPage,
})

// ── Route tree ────────────────────────────────────────────────────────────────
export const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  personvernRoute,
  onboardingRoute,
  homeRoute,
  gameRoute,
  profileRoute,
  friendsRoute,
  friendProfileRoute,
  adminRoute,
  leaguesRoute,
  devRoute,
])

export const router = createRouter({ routeTree })
