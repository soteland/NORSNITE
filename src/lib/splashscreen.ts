// Maps each calendar month (0=January) to its splash screen image
// Images live in public/splashscreen/ and are served as static assets

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const

type MonthName = typeof MONTH_NAMES[number]

const NORWEGIAN_MONTH_NAMES: Record<MonthName, string> = {
  january: 'Januar',
  february: 'Februar',
  march: 'Mars',
  april: 'April',
  may: 'Mai',
  june: 'Juni',
  july: 'Juli',
  august: 'August',
  september: 'September',
  october: 'Oktober',
  november: 'November',
  december: 'Desember',
}

export function getCurrentMonthSplash(): { src: string; month: string } {
  const monthIndex = new Date().getMonth() // 0-based
  const name = MONTH_NAMES[monthIndex]
  return {
    src: `/splashscreen/${name}.webp`,
    month: NORWEGIAN_MONTH_NAMES[name],
  }
}

export function getSplashForMonth(monthIndex: number): { src: string; month: string } {
  const name = MONTH_NAMES[monthIndex % 12]
  return {
    src: `/splashscreen/${name}.webp`,
    month: NORWEGIAN_MONTH_NAMES[name],
  }
}
