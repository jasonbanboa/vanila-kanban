
const CHARACTERS = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

const randomNumber = (max) => Math.floor(Math.random() * max);

export const generateUniqueID = () => {
  const ID = [];

  for (let i = 0; i < 8; i++) {
    ID.push(CHARACTERS.charAt(randomNumber(CHARACTERS.length)));
  }

  ID.push('-');

  for (let i = 0; i < 4; i++) {
    ID.push(CHARACTERS.charAt(randomNumber(CHARACTERS.length)));
  }

  ID.push('-');

  for (let i = 0; i < 4; i++) {
    ID.push(CHARACTERS.charAt(randomNumber(CHARACTERS.length)));
  }

  ID.push('-');

  for (let i = 0; i < 4; i++) {
    ID.push(CHARACTERS.charAt(randomNumber(CHARACTERS.length)));
  }

  return ID.join('');
}

