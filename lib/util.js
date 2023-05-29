
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

export const getDragAfterTodo = ($section, mouseY) => {
  const $todos = [...$section.querySelectorAll('.todo:not(.is-dragging)')];

  return $todos.reduce((closest, $todo) => {
    const box = $todo.getBoundingClientRect();
    const offset = mouseY - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: $todo };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}


export const getKanbanData = () => {
  const data = localStorage.getItem('kanban');
  return data ? JSON.parse(data) : null;
}

export const updateKanbanData = (updatedKanbanData) => {
  const stringifiedKanbanData = JSON.stringify(updatedKanbanData);
  localStorage.setItem('kanban', stringifiedKanbanData);
  
}

export const getLiveIDsArray = (elementsArr) => elementsArr.reduce((IDArr, { dataset: { index } }) => [...IDArr, index], []);

export const getCurrentWorkspace = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const WORKSPACE_ID = urlParams.get('workspaceID');
  
  console.log(WORKSPACE_ID)
  const kanbanData = getKanbanData();
  console.log(kanbanData)
  
  if (!kanbanData) 
    return null;

  const { workspaces } = kanbanData;
  console.log(workspaces)
  return workspaces.find(({ workspaceID }) => workspaceID === WORKSPACE_ID);
}

const mockData = {
  workspaces: [{ 
    workspaceID: '5nabaxci-XwKg-g1Kq-LNlq',
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

export const setMockData = () => {
  localStorage.setItem('kanban', JSON.stringify(mockData));
  const data = getKanbanData().workspaces[0].workspaceID;
  console.log(data);
}

