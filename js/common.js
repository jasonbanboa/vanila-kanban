import { dragHandler } from './drag.js';
import { addStaticEventListeners } from './static.js';
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
const $editTodoDialog = $('.edit-todo-dialog');
const $editTodoForm = $('.edit-todo-form');

// these eventListeners need to be updated when state is changed
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

  const $addTodoButtons = $$('.create-todo');
  $addTodoButtons.forEach(($button) => {
    const $section = $button.closest('.section');
    const $form = $section.querySelector('.create-todo-form');
    const { dataset: { index: sectionID } } = $section;

    $button.addEventListener('click', () => {
      if ($form.classList.contains('none')) {
        $button.classList.add('none');
        $form.classList.remove('none');
        $form.createTodo.focus();
      }
    });

    $form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $form.createTodo.value.trim();
      
      if (!input) return;

      const createdTodo = {
        todoID: generateUniqueID(),
        todoName: input,
        description: null,
      }   

      const kanbanData = getKanbanData();
      const workspace = getCurrentWorkspace();

      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
      const sectionArrIndex = findSectionArrIndex(workspace, sectionID);

      kanbanData.workspaces[workspaceArrIndex].sections[sectionArrIndex].todos.push(createdTodo);

      updateKanbanData(kanbanData);
    });
   
    $form.createTodo.addEventListener('focusout', () => {
      setTimeout(() => {
        $button.classList.remove('none');
        $form.classList.add('none');
      }, 100);
    });
  });
}

// renders workspace
function renderWorkspace() {
  const { sections } = getCurrentWorkspace();
  const $createNewSecton = $('.create-new-section'); 

  sections.forEach(({ sectionName, sectionID, todos }, i) => {
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
        <div class="conditional-render create-todo-conditional-render">
          <div role="button" class="create-todo">
            <span>+</span> Add a Todo
          </div> 
          <form class="create-todo-form none">
            <textarea name="createTodo" placeholder="Describe yourself here..."></textarea>
            <input type="submit" name="submitForm" value="Add Todo"> 
            <button type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#808080" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
            </button>
          </form>
        </div>
      </div>
    `;
    $main.append($section)

    if (sections.length - 1 === i) {
      const $createNewSection = document.createElement('div') 
      Object.assign($createNewSection, {
        innerHTML: `
          <span>+</span> Add a new section
          <form class="new-section-form none abs">
            <input name="sectionName" placeholder="Enter the section name" />
            <input type="submit" value="Add section"/>
          </form>
        `,
        className: 'flex create-new-section rel',        
      });

      const $newSectionform = $createNewSection.querySelector('.new-section-form');

      $createNewSection.addEventListener('click', () => {  
        if ($newSectionform.classList.contains('none')) {
          $newSectionform.classList.remove('none');
          $createNewSection.classList.add('grow');
          $newSectionform.sectionName.focus();
        }
      });

      $newSectionform.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('submitted');
      });

      $newSectionform.sectionName.addEventListener('focusout', () => {
        setTimeout(() => {
          $createNewSection.classList.remove('grow');
          $newSectionform.classList.add('none');
        }, 50);
      });  

      $main.append($createNewSection);
    }
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