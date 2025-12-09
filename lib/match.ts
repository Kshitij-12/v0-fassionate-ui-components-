/**
 * Vector math utilities for taste matching
 * Computes cosine similarity between two taste vectors
 */

/**
 * Computes the dot product of two vectors
 * @param a First vector
 * @param b Second vector
 * @returns Dot product
 */
export function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    // Handle mismatched lengths by using the minimum length
    const minLen = Math.min(a.length, b.length)
    let sum = 0
    for (let i = 0; i < minLen; i++) {
      sum += a[i] * b[i]
    }
    return sum
  }
  
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

/**
 * Computes the magnitude (Euclidean norm) of a vector
 * @param a Vector
 * @returns Magnitude
 */
export function magnitude(a: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i]
  }
  return Math.sqrt(sum)
}

/**
 * Computes cosine similarity as a percentage (0-100)
 * @param a First taste vector
 * @param b Second taste vector
 * @returns Percentage match (0-100, integer)
 */
export function computeCosinePercent(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) {
    return 0
  }

  const dotProduct = dot(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)

  // Prevent divide-by-zero
  if (magA === 0 || magB === 0) {
    return 0
  }

  // Compute cosine similarity
  // For non-negative taste vectors, this ranges from 0 to 1
  const cosine = dotProduct / (magA * magB)

  // Convert to percentage (0-100)
  // Clamp cosine to [0, 1] range (in case of any negative values from mismatched vectors)
  const clampedCosine = Math.max(0, Math.min(1, cosine))
  const percent = clampedCosine * 100

  // Round to integer (0-100)
  return Math.round(percent)
}

