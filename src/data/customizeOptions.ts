export function cycle(index: number, length: number, delta: 1 | -1) {
  return (index + delta + length) % length
}
