import { 
  $, 
  $$,
  generateUniqueID,
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  setMockData,
  getDragAfterTodo,
  getLiveIDsArray,
  findWorkspaceArrIndex,
  findSectionArrIndex,
} from '../lib/util.js' 

// // incase of reset 
// setMockData()

const $main = $('.workspace main'); 
const $workspaceNameeContainer = $('.workspace-title-conditional-render');
const $workspaceName = $workspaceNameeContainer.querySelector('.workspace-name');
const $editForm = $workspaceNameeContainer.querySelector('.edit-workspace-name');


function addStaticEventListeners() {
  // changing workspace name 
  $workspaceNameeContainer.addEventListener('click', (e) => {
    
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
}

// NOTE !IMPORTANT
// these eventListeners need to be updated when new sections or todos are added
function addDynamicEventListeners() {

  // section eventListeners
  const $sectionContainers = $$('.section-container');
  const $sections = $$('.section');
  
  $sections.forEach(($section) => {

    $section.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $section.classList.add('is-dragging');
    });
  
    $section.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $section.classList.remove('is-dragging');

      const workspace = getCurrentWorkspace();

      // when drag event is ended order of the section is checked and reduced down to an array of sectionID
      const liveSectionIDOrderArr = getLiveIDsArray($$('.section'));
      console.log(liveSectionIDOrderArr);

      // sort the workspace to the correct order;
      const orderedSections = liveSectionIDOrderArr.reduce((sections, sectionIDFromArr) => {
        const section = workspace.sections.find(({ sectionID }) => sectionIDFromArr === sectionID);
        return [...sections, section];      
      }, []);
      
      // set the correctly ordered sections to temp workspace object
      const tempWorkspace = structuredClone(workspace);
      tempWorkspace.sections = orderedSections;
      
      const kanbanData = getKanbanData();
      const workspaceArrayIndex = findWorkspaceArrIndex(kanbanData, workspace);

      // update kanban data to have correctly ordered section 
      kanbanData.workspaces[workspaceArrayIndex] = tempWorkspace;

      // set updated data to localStorage
      updateKanbanData(kanbanData);
    });
  });
  
  $sectionContainers.forEach(($sectionContainer) => {
    $sectionContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
  
      const $currentSection = $('.is-dragging:not(.todo)');
      if (!$currentSection) return;
  
      const $currentSectionContainer = $currentSection.closest('.section-container');
      const $sectionToBeSwitched = $sectionContainer.querySelector('.section');
  
      $currentSectionContainer.append($sectionToBeSwitched);
      $sectionContainer.append($currentSection);
    });
  }); 
  
  // todo eventListeners
  const $todos = $$('.todo');
  const $sectionsBodies = $$('.section-body');
  
  $todos.forEach(($todo) => {

    const { dataset: { index: originalSectionID }} = $todo.closest('.section');
    console.log(originalSectionID);

    $todo.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      $todo.classList.add('is-dragging');
    });

    $todo.addEventListener('dragend', (e) => {
      e.stopPropagation();
      $todo.classList.remove('is-dragging');

      const workspace = getCurrentWorkspace();

      // 0. find the section that is being edited
      const currentSectionArrIndex = findSectionArrIndex(workspace, originalSectionID);

      // 1. find the todo that was dragged from kanban data then clone
      const draggedTodoID = $todo.dataset.index;
      const draggedTodoClone = structuredClone(workspace.sections[currentSectionArrIndex].todos.find(({ todoID }) => todoID === draggedTodoID));

      // 2. remove the todo from kanban data
      const removedDragginTodofromTodos = workspace.sections[currentSectionArrIndex].todos.filter(({ todoID }) => todoID !== draggedTodoID);
      workspace.sections[currentSectionArrIndex].todos = removedDragginTodofromTodos;

      // 3. find the live todo order using
      const $relocatedSection = $todo.closest('.section');
      const relocatedSectionID = $relocatedSection.dataset.index;

      const relocatedSectionArrIndex = findSectionArrIndex(workspace, relocatedSectionID);

      const liveTodosIDOrders = getLiveIDsArray([...$relocatedSection.querySelectorAll('.todo')]);
      
      console.log({ originalSectionID, relocatedSectionID });


      // 4. sort the kanban data
      const orderedTodos = liveTodosIDOrders.reduce((todos, currentTodoID) => {
        
        const todo = workspace.sections[relocatedSectionArrIndex].todos.find(({ todoID }) => currentTodoID === todoID);
        if (!todo) 
          return [...todos, draggedTodoClone];
        return [...todos, todo];
      }, []);

      console.log("ORDERED TODOS", orderedTodos);
      workspace.sections[relocatedSectionArrIndex].todos = orderedTodos;

      // 5. update localStorage
      const kanbanData = getKanbanData();
      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

      kanbanData.workspaces[workspaceArrIndex] = workspace;

      console.log('FINAL DATA', kanbanData);
      updateKanbanData(kanbanData);
    });
  });
  
  $sectionsBodies.forEach($section => {
    $section.addEventListener('dragover', (e) => {
      e.preventDefault(); 
      
      const $currentTodo = $('.is-dragging:not(.section)');
      
      if (!$currentTodo) return;
      
      const $bottomTodo = getDragAfterTodo($section, e.clientY);
      if ($bottomTodo) {
        $section.insertBefore($currentTodo, $bottomTodo);
      } else {
        $section.append($currentTodo);
      }
    });
  });

  const $sectionTitlesConditionalRenders = $$('.section-title-conditional-render');
  console.log($sectionTitlesConditionalRenders);

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
        console.log(thisSectionID);

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

}

// renders workspace
function renderWorkspace() {
  const { sections, workspaceName } = getCurrentWorkspace();

  sections.forEach(({ sectionName, sectionID, todos }) => {
    console.log(todos)
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
            return bodyHTML += `<div data-index="${todo.todoID}" class="todo flex" draggable="true">
              <p class="todo-title">${todo.todoName}</p>
              <span class="edit ml-auto none" role="button"></span>
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