
const CHARACTERS = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
const randomNumber = (max) => Math.floor(Math.random() * max);

export const $ = (e) => document.querySelector(e);

export const $$ = (e) => [...document.querySelectorAll(e)];

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

export const getKanbanData = () => {
  const data = localStorage.getItem('kanban');
  return data ? JSON.parse(data) : null;
}

export const mockData = {
  workspaces: [{ 
    workspaceID: generateUniqueID(),
    workspaceName: 'Example Workspace',
    sections: [
      {
        sectionID: generateUniqueID(),
        sectionName: '📃 Todo',
        todos: [
          {
            todoID: generateUniqueID(),
            todoName: 'todo 1',
            description: 'todo 1 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 2',
            description: 'todo 2 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 3',
            description: 'todo 3 description',
          },
        ]
      }, 
      {
        sectionID: generateUniqueID(),
        sectionName: '🧨 test 2',
        todos: [
          {
            todoID: generateUniqueID(),
            todoName: 'todo 4',
            description: 'todo 4 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 5',
            description: 'todo 5 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 6',
            description: 'todo 6 description',
          },
        ]
      },
      {
        sectionID: generateUniqueID(),
        sectionName: '🎨 test 3',
        todos: [
          {
            todoID: generateUniqueID(),
            todoName: 'todo 7',
            description: 'todo 7 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 8',
            description: 'todo 8 description',
          },
          {
            todoID: generateUniqueID(),
            todoName: 'todo 9',
            description: 'todo 9 description',
          },
        ]
      }
    ]
  },
]
}