import { useEffect, useRef } from 'react'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onExpire?: () => void
}

const SITE_KEY: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: object) => string
      reset: (widgetId: string) => void
    }
  }
}

export function TurnstileWidget({ onSuccess, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  // No site key configured — bypass silently (e.g. local dev)
  useEffect(() => {
    if (!SITE_KEY) { onSuccess('no-sitekey-bypass'); return }
  }, [])

  useEffect(() => {
    if (!SITE_KEY) return
    // Load Turnstile script if not already loaded
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const render = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: onSuccess,
          'expired-callback': onExpire,
        })
      }
    }

    // Wait for script to load
    const interval = setInterval(() => {
      if (window.turnstile) {
        render()
        clearInterval(interval)
      }
    }, 100)

    return () => {
      clearInterval(interval)
      widgetIdRef.current = null
    }
  }, [onSuccess, onExpire])

  if (!SITE_KEY) return null

  return <div ref={containerRef} className="flex justify-center" />
}
