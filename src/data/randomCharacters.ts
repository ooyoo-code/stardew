import men1 from '../assets/characters/men-1.webp'
import men2 from '../assets/characters/men-2.webp'
import men3 from '../assets/characters/men-3.webp'
import men4 from '../assets/characters/men-4.webp'
import men5 from '../assets/characters/men-5.webp'
import women1 from '../assets/characters/women-1.webp'
import women2 from '../assets/characters/women-2.webp'
import women3 from '../assets/characters/women-3.webp'
import women4 from '../assets/characters/women-4.webp'
import women5 from '../assets/characters/women-5.webp'

export const randomCharacters = [
  men1,
  men2,
  men3,
  men4,
  men5,
  women1,
  women2,
  women3,
  women4,
  women5,
]

export function pickRandomCharacter(excluding?: string) {
  const pool =
    randomCharacters.length > 1
      ? randomCharacters.filter((src) => src !== excluding)
      : randomCharacters
  return pool[Math.floor(Math.random() * pool.length)]
}
