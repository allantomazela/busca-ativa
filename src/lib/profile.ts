export function getUserInitials(fullName?: string, email?: string) {
  const source = fullName?.trim() || email?.split('@')[0] || 'US'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
