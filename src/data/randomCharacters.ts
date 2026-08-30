import men1 from '../assets/characters/men-1.png'
import men2 from '../assets/characters/men-2.png'
import men3 from '../assets/characters/men-3.png'
import men4 from '../assets/characters/men-4.png'
import men5 from '../assets/characters/men-5.png'
import women1 from '../assets/characters/women-1.png'
import women2 from '../assets/characters/women-2.png'
import women3 from '../assets/characters/women-3.png'
import women4 from '../assets/characters/women-4.png'
import women5 from '../assets/characters/women-5.png'

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
