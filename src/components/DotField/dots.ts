// Dot helpers shared by the dot pattern beside the titles and the drawings of the services

export type Point = [number, number]

const SPACING = 9 // minimum distance between two dots

export const between = (min: number, max: number) => min + Math.random() * (max - min)

export const smoothstep = (from: number, to: number, x: number) => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1)
  return t * t * (3 - 2 * t)
}

export const randomWave = (amplitude: number) => {
  const waves = [
    { amplitude, frequency: between(5, 9), phase: between(0, 2 * Math.PI) },
    { amplitude: amplitude / 3, frequency: between(13, 19), phase: between(0, 2 * Math.PI) },
  ]
  return (t: number) =>
    waves.reduce((sum, wave) => sum + wave.amplitude * Math.sin(t * wave.frequency + wave.phase), 0)
}

// Random points, each kept with the chance given for its position, and only when no other point is
// too close
export const scatterDots = (
  chance: (x: number, y: number) => number,
  width: number,
  height: number,
) => {
  const cell = SPACING / Math.SQRT2 // small enough to hold one dot at most
  const columns = Math.ceil(width / cell)
  const grid: Point[] = []
  const points: Point[] = []

  for (let attempt = Math.round(width * height * 0.22); attempt > 0; attempt--) {
    const x = Math.random() * width
    const y = Math.random() * height
    const share = chance(x, y)
    if (!share || Math.random() > share) continue

    const column = Math.floor(x / cell)
    const row = Math.floor(y / cell)
    let tooClose = false
    for (let j = row - 2; j <= row + 2 && !tooClose; j++) {
      for (let i = column - 2; i <= column + 2 && !tooClose; i++) {
        const other = grid[j * columns + i]
        tooClose = Boolean(other && (other[0] - x) ** 2 + (other[1] - y) ** 2 < SPACING ** 2)
      }
    }
    if (tooClose) continue

    grid[row * columns + column] = [x, y]
    points.push([x, y])
  }

  return points
}

// The points dealt at random into groups, which appear one after the other
export const randomGroups = (points: Point[], count: number) => {
  const groups = Array.from({ length: count }, (): Point[] => [])
  for (const point of points) groups[Math.floor(Math.random() * count)].push(point)
  return groups
}

// One path of zero-length segments, which round line caps draw as dots
export const dotPath = (points: Point[]) =>
  points.map(([x, y]) => `M${Math.round(x)} ${Math.round(y)}h0`).join('')
