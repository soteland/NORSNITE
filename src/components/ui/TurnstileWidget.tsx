import { useEffect } from 'react'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onExpire?: () => void
}

// Turnstile is disabled. This stub auto-succeeds so auth forms work without CAPTCHA.
// To re-enable, replace this file with the real implementation and set VITE_TURNSTILE_SITE_KEY.
export function TurnstileWidget({ onSuccess }: TurnstileWidgetProps) {
  useEffect(() => {
    onSuccess('disabled')
  }, [onSuccess])

  return null
}
