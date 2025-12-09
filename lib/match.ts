// lib/match.ts

export function dot(a: number[], b: number[]): number {
  const minLen = Math.min(a.length, b.length)
  let sum = 0
  for (let i = 0; i < minLen; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

export function magnitude(a: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const v = a[i]
    sum += v * v
  }
  return Math.sqrt(sum)
}

export function computeCosinePercent(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0

  const badA = a.some((x) => !Number.isFinite(x))
  const badB = b.some((x) => !Number.isFinite(x))
  if (badA || badB) return 0

  const dotProduct = dot(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)

  if (!Number.isFinite(dotProduct) || !Number.isFinite(magA) || !Number.isFinite(magB)) {
    return 0
  }

  if (magA === 0 || magB === 0) return 0

  const cosine = dotProduct / (magA * magB)
  const clamped = Math.max(0, Math.min(1, cosine))
  return Math.round(clamped * 100)
}