import { dragHandler } from './drag.js';
import { 
  $, 
  $$,
  generateUniqueID,
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  setMockData,
  findWorkspaceArrIndex,
  findSectionArrIndex,
  openEditDialog,
  closeEditDialog,
} from '../lib/util.js' 


// // incase of reset 
// setMockData()

const $main = $('.workspace main'); 
const $workspaceNameeContainer = $('.workspace-title-conditional-render');
const $workspaceName = $workspaceNameeContainer.querySelector('.workspace-name');
const $editForm = $workspaceNameeContainer.querySelector('.edit-workspace-name');

const $editTodoDialog = $('.edit-todo-dialog');
const $editTodoForm = $('.edit-todo-form');
const $deleteTodo = $('.delete-todo');
const $cancleEditTodo = $('.cancel-edit-todo'); 
const $backdrop = $('.backdrop');

function addStaticEventListeners() {
  // changing workspace name 
  $workspaceNameeContainer.addEventListener('click', () => {
    
    if ($editForm.classList.contains('none')) {
      $workspaceName.classList.add('none');
      $editForm.classList.remove('none');
      $editForm.workspaceName.value = $workspaceName.textContent; 
      $editForm.workspaceName.focus();
    }

    $editForm.workspaceName.addEventListener('focusout', () => {
      $workspaceName.classList.remove('none');
      $editForm.classList.add('none');
    });

    $editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = e.target.workspaceName.value;
      
      if (!input.trim()) return;

      const kanbanData = getKanbanData();
      const workspace = getCurrentWorkspace();

      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

      kanbanData.workspaces[workspaceArrIndex].workspaceName = input;

      updateKanbanData(kanbanData);
      $workspaceName.textContent = input;
      $editForm.workspaceName.blur();
    });
  });

  $backdrop.addEventListener('click', (e) => {
    if (e.target === $backdrop) closeEditDialog();
  });

  $cancleEditTodo.onclick = closeEditDialog;

  $editTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { dataset: { todoid: todoID } } = $editTodoForm;
    const { dataset: { sectionid: sectionID } } = $editTodoForm;

    const input = $editTodoForm.editTodo.value;
    if (!input.trim()) return;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
    const sectionArrIndex = findSectionArrIndex(workspace, sectionID);

    const section = kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex];

    const editedTodos = section.todos.reduce((todos, todo) => {
      if (todo.todoID === todoID)
        return [...todos , { ...todo, todoName: input }];
      return [...todos, todo];
    }, []);

    kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex].todos = editedTodos;

    updateKanbanData(kanbanData);
    closeEditDialog();
  });

  $deleteTodo.addEventListener('click', (e) => {
    const { dataset: { todoid: todoID } } = $editTodoForm;
    const { dataset: { sectionid: sectionID } } = $editTodoForm;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();

    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
    const sectionArrIndex = findSectionArrIndex(workspace, sectionID);

    const section = kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex];
    const filteredTodos = section.todos.filter((todo) => todo.todoID !== todoID);

    kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex].todos = filteredTodos;

    updateKanbanData(kanbanData);
    closeEditDialog();
  });

}

// NOTE !IMPORTANT
// these eventListeners need to be updated when new sections or todos are added
function addDynamicEventListeners() {

  dragHandler();

  const $sectionTitlesConditionalRenders = $$('.section-title-conditional-render');

  $sectionTitlesConditionalRenders.forEach(($conditionalRenders) => {
    $conditionalRenders.addEventListener('click', () => {
      const $sectionTitle = $conditionalRenders.querySelector('.section-title');
      const $editSectionTitleForm = $conditionalRenders.querySelector('.edit-section-title-form');

      if ($editSectionTitleForm.classList.contains('none')) {
        $sectionTitle.classList.add('none');
        $editSectionTitleForm.classList.remove('none');
        $editSectionTitleForm.sectionTitle.value = $sectionTitle.textContent; 
        $editSectionTitleForm.sectionTitle.focus();
      }

      $editSectionTitleForm.sectionTitle.addEventListener('focusout', (e) => {
        $sectionTitle.classList.remove('none');
        $editSectionTitleForm.classList.add('none');
      });

      $editSectionTitleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.sectionTitle.value;

        if (!input.trim()) return;

        const { dataset: { index: thisSectionID } } = e.target.closest('.section');

        const kanbanData = getKanbanData();
        const workspace = getCurrentWorkspace();

        const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace); 
        const sectionArrIndex = findSectionArrIndex(workspace, thisSectionID);

        workspace.sections[sectionArrIndex] = {
          ...workspace.sections[sectionArrIndex],
          sectionName: input
        }

        kanbanData.workspaces[workspaceArrIndex] = workspace;

        updateKanbanData(kanbanData);
      });
    });
  });
  
  const $editTodoButtons = $$('.edit-todo-button');
  $editTodoButtons.forEach(($editTodoButton) => {
    $editTodoButton.addEventListener('click', (e) => {

      openEditDialog();
      const $todo = e.target.closest('.todo');
      const { dataset: { index: todoID } } = $todo;
      const { dataset: { index: sectionID } } = e.target.closest('.section');

      console.log($todo, sectionID);
      const { top, left, width, height } = $todo.getBoundingClientRect();
      
      Object.assign($editTodoDialog, {
        style: `top: ${top}px; left: ${left}px; width: ${width}px; height: ${height * 2}px;`
      });     

      $editTodoForm.editTodo.value = $todo.textContent.trim();
      $editTodoForm.dataset.todoid = todoID;
      $editTodoForm.dataset.sectionid = sectionID; 
    });
  });  
}

// renders workspace
function renderWorkspace() {
  const { sections } = getCurrentWorkspace();

  sections.forEach(({ sectionName, sectionID, todos }) => {
    const $section = document.createElement('div');
    $section.className = 'section-container';
    $section.innerHTML = `
      <div data-index="${sectionID}" class="section" draggable="true">
        <div class="section-head flex">
          <div class="conditional-render section-title-conditional-render">
            <h4 class="section-title ">${sectionName}</h4>
            <form class="edit-section-title-form none">
              <input type="text" name="sectionTitle">
            </form>
          </div>
          <span class="ml-auto actions pointer" role="button">...</span>
        </div>
        <div class="section-body">
          ${todos.reduce((bodyHTML, todo) => {
            return bodyHTML += `<div data-index="${todo.todoID}" class="todo rel flex" draggable="true">
              <p class="todo-title">${todo.todoName}</p>
              
              <span role="button" class="icon edit-todo-button">
                <svg fill="#808080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
              </span>

            </div>`;
          }, '')}
        </div>
      </div>
    `;
    $main.append($section);
  });
}


function main() {

  const kanbanData = getKanbanData();

  // TODO render view that tells user to create new section; 
  if (!kanbanData) {
    throw new Error('TODO SHOW USER THAT THEY HAVE NO WORKSPACE ');
  }

  const workspace = getCurrentWorkspace();
  if (!workspace) {
    throw new Error('TODO SHOW USER INVALID ID');
  }

  $workspaceName.textContent = workspace.workspaceName;

  renderWorkspace();
  addDynamicEventListeners();
  addStaticEventListeners();
}

export function reRender() {
  $main.innerHTML = '';
  
  renderWorkspace();
  addDynamicEventListeners();
}

window.onload = () => {
  main();
} 