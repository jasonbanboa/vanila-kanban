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
  openSectionDialog,
} from '../lib/util.js' 


const $main = $('.workspace main'); 
const $workspaceNameeContainer = $('.workspace-title-conditional-render');
const $workspaceName = $workspaceNameeContainer.querySelector('.workspace-name');
const $editTodoDialog = $('.edit-todo-dialog');
const $editTodoForm = $('.edit-todo-form');

// these eventListeners need to be updated when state is changed
function addDynamicEventListeners() {

  dragHandler();
  
  const $deleteSections = $$('li.delete-section');
  $deleteSections.forEach(($deleteSectionButton) => {
    $deleteSectionButton.addEventListener('click', (e) => {
      const { dataset : { sectionid: sectionID } } = e.target;
      console.log(sectionID);

      const kanbanData = getKanbanData();
      const workspace = getCurrentWorkspace();
      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

      const editedSections = workspace.sections.filter((section) => section.sectionID !== sectionID);
      workspace.sections = editedSections;
      kanbanData.workspaces[workspaceArrIndex] = workspace;
      updateKanbanData(kanbanData);

    });
  });

  const $sectionActions = $$('.section .actions');
  $sectionActions.forEach(($action) => {
    $action.addEventListener('click', (e) => {
      openSectionDialog(e.target);

    });
  });

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
    const $submit = $form.querySelector('input[type="button"]');
    const { dataset: { index: sectionID } } = $section;

    $button.addEventListener('click', () => {
      if ($form.classList.contains('none')) {
        $button.classList.add('none');
        $form.classList.remove('none');
        $form.createTodo.focus();
      }
    });

    $submit.addEventListener('mousedown', (e) => {
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
      $button.classList.remove('none');
      $form.classList.add('none');
    });
  });
}

function renderAside() {
  const $aside = $('aside');
  const { workspaces } = getKanbanData();
  const currentWorkspace = getCurrentWorkspace();
  
  const workspaceTabs = workspaces && workspaces.reduce((innerHTML, { workspaceID, workspaceName }) => {
    return innerHTML += `
      <li class="${ workspaceID === currentWorkspace.workspaceID ? 'active' : '' }">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z" fill="#828FA3"/></svg>
        <a href="?workspaceID=${workspaceID}">${workspaceName}</a>
      </li>
    `;
  }, '');

  $aside.innerHTML = `
    <div class="wrapper">
    <p class="total-workspaces">TOTAL WORKSPACES (${workspaces.length})</p>
    <ul class="nav">
      ${workspaceTabs || ''}     
    </ul>
    <div class="create-new-workspace">
      <div class="create-new-workspace-container">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.889A2.889 2.889 0 0 1 2.889 0H13.11A2.889 2.889 0 0 1 16 2.889V13.11A2.888 2.888 0 0 1 13.111 16H2.89A2.889 2.889 0 0 1 0 13.111V2.89Zm1.333 5.555v4.667c0 .859.697 1.556 1.556 1.556h6.889V8.444H1.333Zm8.445-1.333V1.333h-6.89A1.556 1.556 0 0 0 1.334 2.89V7.11h8.445Zm4.889-1.333H11.11v4.444h3.556V5.778Zm0 5.778H11.11v3.11h2a1.556 1.556 0 0 0 1.556-1.555v-1.555Zm0-7.112V2.89a1.555 1.555 0 0 0-1.556-1.556h-2v3.111h3.556Z" fill="#828FA3"/></svg>
        + Create New Workspace
      </div>
      <div class="abs conditional-render none">
        <input type="text" class="workspace-name" placeholder="Enter workspace name" />
        <input type="button" value="Create workspace" class="create-workspace">
      </div>
    </div>
  </div>

  <div class="mt-auto controls-wrapper">
    <div class="theme-toggle flex i-center j-center gap-1">
      <svg width="19" height="19" xmlns="http://www.w3.org/2000/svg"><path d="M9.167 15.833a.833.833 0 0 1 .833.834v.833a.833.833 0 0 1-1.667 0v-.833a.833.833 0 0 1 .834-.834ZM3.75 13.75a.833.833 0 0 1 .59 1.422l-1.25 1.25a.833.833 0 0 1-1.18-1.178l1.25-1.25a.833.833 0 0 1 .59-.244Zm10.833 0c.221 0 .433.088.59.244l1.25 1.25a.833.833 0 0 1-1.179 1.178l-1.25-1.25a.833.833 0 0 1 .59-1.422ZM9.167 5a4.167 4.167 0 1 1 0 8.334 4.167 4.167 0 0 1 0-8.334Zm-7.5 3.333a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.834Zm15.833 0a.833.833 0 0 1 0 1.667h-.833a.833.833 0 0 1 0-1.667h.833Zm-1.667-6.666a.833.833 0 0 1 .59 1.422l-1.25 1.25a.833.833 0 1 1-1.179-1.178l1.25-1.25a.833.833 0 0 1 .59-.244Zm-13.333 0c.221 0 .433.088.59.244l1.25 1.25a.833.833 0 0 1-1.18 1.178L1.91 3.09a.833.833 0 0 1 .59-1.422ZM9.167 0A.833.833 0 0 1 10 .833v.834a.833.833 0 1 1-1.667 0V.833A.833.833 0 0 1 9.167 0Z" fill="#828FA3"/></svg>
      <div class="toggle rel">
        <div class="slider abs"></div>
      </div>
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M6.474.682c.434-.11.718.406.481.78A6.067 6.067 0 0 0 6.01 4.72c0 3.418 2.827 6.187 6.314 6.187.89.002 1.77-.182 2.584-.54.408-.18.894.165.724.57-1.16 2.775-3.944 4.73-7.194 4.73-4.292 0-7.771-3.41-7.771-7.615 0-3.541 2.466-6.518 5.807-7.37Zm8.433.07c.442-.294.969.232.674.674l-.525.787a1.943 1.943 0 0 0 0 2.157l.525.788c.295.441-.232.968-.674.673l-.787-.525a1.943 1.943 0 0 0-2.157 0l-.786.525c-.442.295-.97-.232-.675-.673l.525-.788a1.943 1.943 0 0 0 0-2.157l-.525-.787c-.295-.442.232-.968.674-.673l.787.525a1.943 1.943 0 0 0 2.157 0Z" fill="#828FA3"/></svg>
    </div>
  </div>

  <ul class="nav">
    <li class="hide-aside">
      <button class="hide-sidebar">
        <svg width="18" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M8.522 11.223a4.252 4.252 0 0 1-3.654-5.22l3.654 5.22ZM9 12.25A8.685 8.685 0 0 1 1.5 8a8.612 8.612 0 0 1 2.76-2.864l-.86-1.23A10.112 10.112 0 0 0 .208 7.238a1.5 1.5 0 0 0 0 1.524A10.187 10.187 0 0 0 9 13.75c.414 0 .828-.025 1.239-.074l-1-1.43A8.88 8.88 0 0 1 9 12.25Zm8.792-3.488a10.14 10.14 0 0 1-4.486 4.046l1.504 2.148a.375.375 0 0 1-.092.523l-.648.453a.375.375 0 0 1-.523-.092L3.19 1.044A.375.375 0 0 1 3.282.52L3.93.068a.375.375 0 0 1 .523.092l1.735 2.479A10.308 10.308 0 0 1 9 2.25c3.746 0 7.031 2 8.792 4.988a1.5 1.5 0 0 1 0 1.524ZM16.5 8a8.674 8.674 0 0 0-6.755-4.219A1.75 1.75 0 1 0 12.75 5v-.001a4.25 4.25 0 0 1-1.154 5.366l.834 1.192A8.641 8.641 0 0 0 16.5 8Z" fill="#828FA3"/></svg>
        Hide Sidebar
      </button>
    </li>
  </ul>
  `;

  const $createNewWorkspace = $aside.querySelector('.create-new-workspace-container');
  const $conditionalRenderCreateWorkspace = $aside.querySelector('.conditional-render');
  const $workspaceNameInput = $aside.querySelector('input.workspace-name');
  const $createWorkspaceButton = $aside.querySelector('input.create-workspace');

  const $hideAside = $('.hide-aside');
  const $showAside = $('.show-aside');

  $hideAside.addEventListener('click', () => {
    $aside.classList.add('none');
    $showAside.classList.remove('none');
  });

  $showAside.addEventListener('click', () => {
    $aside.classList.remove('none');
    $showAside.classList.add('none');
  });


  const $toggle = $('.toggle');
  $toggle.addEventListener('click', () => {
    document.body.classList.contains('dark') ? document.body.classList.remove('dark') : document.body.classList.add('dark'); 
  });

  $createNewWorkspace.addEventListener('click', () => {

    // dispay none block here
    if ($conditionalRenderCreateWorkspace.classList.contains('none')) {
      $conditionalRenderCreateWorkspace.classList.remove('none');
      $createNewWorkspace.classList.add('none');
      $workspaceNameInput.focus();
    }
    
  });

  $createWorkspaceButton.addEventListener('mousedown', () => {
    const input = $workspaceNameInput.value.trim();
    if (!input) return;

    const kanbanData = getKanbanData();
    const createdWorkspace = {
      workspaceID: generateUniqueID(),
      workspaceName: input,
      sections: [],
    } 

    kanbanData.workspaces.push(createdWorkspace);
    history.replaceState({ }, '', `/index.html?workspaceID=${createdWorkspace.workspaceID}`);
    updateKanbanData(kanbanData);
  });

  $workspaceNameInput.addEventListener('focusout', () => {
    if ($createNewWorkspace.classList.contains('none')) {
      $conditionalRenderCreateWorkspace.classList.add('none');
      $createNewWorkspace.classList.remove('none');
    }
  });

}

function renderWorkspace() {
  const { sections, workspaceName } = getCurrentWorkspace();
  $workspaceName.textContent = workspaceName;


  sections.forEach(({ sectionName, sectionID, todos }) => {

    const todoHTML = todos && todos.reduce((bodyHTML, todo) => {
      return bodyHTML += `<div data-index="${todo.todoID}" class="todo rel flex" draggable="true">
        <p class="todo-title">${todo.todoName}</p>
        
        <span role="button" class="icon edit-todo-button">
          <svg fill="#808080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/></svg>
        </span>

      </div>`;
    }, '')
    
    const $section = document.createElement('div');
    $section.className = 'section-container';
    $section.innerHTML = `
      <div data-index="${sectionID}" class="section" draggable="true">
        <div class="section-head flex rel">
          <div class="conditional-render section-title-conditional-render">
            <h4 class="section-title ">${sectionName}</h4>
            <form class="edit-section-title-form none">
              <input type="text" name="sectionTitle">
            </form>
          </div>
          <span class="ml-auto actions pointer" role="button">
            <svg class="actions" xmlns="http://www.w3.org/2000/svg" fill="#808080" viewBox="0 0 448 512"><path class="actions" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"/></svg>
          </span>
          
        </div>
        <div class="section-body">
          ${todoHTML || ''}
        </div>
        <div class="conditional-render create-todo-conditional-render">
          <div role="button" class="create-todo">
            <span>+</span> Add a Todo
          </div> 
          <form class="create-todo-form none">
            <textarea name="createTodo" placeholder="Describe yourself here..."></textarea>
            <input type="button" name="submitForm" value="Add Todo"> 
            <button type="button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#808080" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>
            </button>
          </form>
        </div>
      </div>
    `;
    const $createNewSection = $('.create-new-section');

    $main.insertBefore($section, $createNewSection);
  });
}


function main() {
  const kanbanData = getKanbanData();

  if (!kanbanData) {
    setMockData();
  }

  const workspace = getCurrentWorkspace();

  if (!workspace) {
    const { workspaces } = getKanbanData();
    history.replaceState({ }, '', `/index.html?workspaceID=${workspaces[0].workspaceID}`);
  }
  
  renderAside();
  renderWorkspace();
  addDynamicEventListeners();
  addStaticEventListeners();
}

export function reRender() {
  $$('.section-container').forEach(($section) => $section.remove());
  renderAside();
  renderWorkspace();
  addDynamicEventListeners();
}

window.onload = () => {
  // window.addEventListener('click', (e) => {
  //   if (e.target.classList.contains('actions')) return;
    
  //   $$('.section .actions-popup').forEach(($popup) => {
  //     if (!$popup.classList.contains('none') && !$popup.contains(e.target)) {
  //       $popup.classList.add('none');
  //     }  
  //   })
  // })
  main();
} 