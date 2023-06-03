import { reRender } from "../js/common.js";

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
  reRender();
}

export const getLiveIDsArray = (elementsArr) => elementsArr.reduce((IDArr, { dataset: { index } }) => [...IDArr, index], []);

export const getCurrentWorkspace = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const WORKSPACE_ID = urlParams.get('workspaceID');

  const kanbanData = getKanbanData();
  
  if (!kanbanData) 
    return null;

  
  const data = kanbanData.workspaces.find(({ workspaceID }) => workspaceID === WORKSPACE_ID);
  return data;
} 

export const findWorkspaceArrIndex = (kanbanData, workspace) => kanbanData.workspaces.findIndex(({ workspaceID }) => workspaceID === workspace.workspaceID);
export const findSectionArrIndex = (workspace, findingSectionID) => workspace.sections.findIndex(({ sectionID }) => sectionID === findingSectionID);

export const openEditDialog = () => {
  $('.backdrop').classList.remove('none');
}
export const closeEditDialog = () => {
  $('.backdrop').classList.add('none');
  $('.backdrop .edit-todo-form').reset();
}

export const openWorkspaceDialog = () => {
  $('.workspace-backdrop').classList.remove('none');
}
export const closeWorkspaceDialog = () => {
  $('.workspace-backdrop').classList.add('none');
}

const $sectionBackdrop = $('.section-backdrop');

export const openSectionDialog = ($el) => {
  const { top, left } = $el.getBoundingClientRect();
  const { dataset : { index } } = $el.closest('.section');
  $sectionBackdrop.querySelector('.actions-popup').style = `top: ${top}px; left: ${left}px`;
  $sectionBackdrop.querySelector('.actions-popup').dataset.sectionid = index;
  $sectionBackdrop.classList.remove('none');
}

export const closeSectionDialog = () => {
  $sectionBackdrop.classList.add('none');
  $sectionBackdrop.querySelector('.main-section').classList.remove('none');
  $sectionBackdrop.querySelectorAll('.sub-section').forEach($el => {
    $el.classList.add('none');
  });
}

const mockData = {
  workspaces: [{ 
    workspaceID: '5nabaxci-XwKg-g1Kq-LNlq',
    workspaceName: 'Example Workspace',
    sections: [
      {
        sectionID: generateUniqueID(),
        sectionName: '📃 Example Todo',
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
      }
    ]
  },
]
}

export const setMockData = () => {
  localStorage.setItem('kanban', JSON.stringify(mockData));
  const data = getKanbanData().workspaces[0].workspaceID;
}

export const createSection = (input) => {
  const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

    const createdSection = {
      sectionID: generateUniqueID(),
      sectionName: input,
      todos: []
    }

    workspace.sections.push(createdSection);
    kanbanData.workspaces[workspaceArrIndex] = workspace;
    updateKanbanData(kanbanData);
}