import { 
  $, 
  $$,
  getKanbanData,
  updateKanbanData,
  getCurrentWorkspace,
  findWorkspaceArrIndex,
  findSectionArrIndex,
  closeEditDialog,
  createSection,
  openWorkspaceDialog,
  closeWorkspaceDialog,
  closeSectionDialog,
} from '../lib/util.js' 

const $workspaceNameeContainer = $('.workspace-title-conditional-render');
const $workspaceName = $workspaceNameeContainer.querySelector('.workspace-name');
const $editForm = $workspaceNameeContainer.querySelector('.edit-workspace-name');

const $editTodoForm = $('.edit-todo-form');
const $deleteTodo = $('.delete-todo');
const $cancleEditTodo = $('.cancel-edit-todo'); 
const $backdrop = $('.backdrop');
const $workspaceBackdrop = $('.workspace-backdrop');
const $workspaceOptions = $('.workspace-options');
const $deletWorspace = $('.delete-worspace');
const $sectionBackdrop = $('.section-backdrop');
const $addTodoActionButton = $('.section-backdrop .actions-popup .add-todo');
const $deleteSectionButton = $('.section-backdrop .actions-popup li.delete-section');

console.log($deleteSectionButton);

export function addStaticEventListeners() {

  $addTodoActionButton.addEventListener('click', () => {
    const { dataset : { sectionid } } = $addTodoActionButton.closest('.actions-popup');
    const $addTodoButton = $(`.section[data-index="${sectionid}"]`).querySelector('.create-todo');
    closeSectionDialog();
    $addTodoButton.click();
  });

  $deleteSectionButton.addEventListener('click', (e) => {
    const { dataset : { sectionid: sectionID } } = $addTodoActionButton.closest('.actions-popup');

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();
    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

    const editedSections = workspace.sections.filter((section) => section.sectionID !== sectionID);
    workspace.sections = editedSections;
    kanbanData.workspaces[workspaceArrIndex] = workspace;
    updateKanbanData(kanbanData);
    closeSectionDialog();
  });

  $sectionBackdrop.addEventListener('click', (e) => {
    if (e.target === $sectionBackdrop) closeSectionDialog();
  })

  $deletWorspace.addEventListener('click', () => {
    const kanbanData = getKanbanData();
    const { workspaceID } = getCurrentWorkspace();
    const editedWorkspaces = kanbanData.workspaces.filter((workspace) => workspace.workspaceID !== workspaceID);
    console.log(editedWorkspaces);
    kanbanData.workspaces = editedWorkspaces;
    history.replaceState({ }, '', `/index.html?workspaceID=${kanbanData.workspaces[0].workspaceID}`);
    updateKanbanData(kanbanData);
    closeWorkspaceDialog();
    
  });

  $workspaceBackdrop.addEventListener('click', (e) => {
    if (e.target === $workspaceBackdrop) closeWorkspaceDialog();
  });

  $workspaceOptions.addEventListener('click', () => {
    openWorkspaceDialog();
  });

  const $createNewSection = $('.create-new-section');

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
    const input = $newSectionform.sectionName.value.trim();
    if (!input) return;
    
    createSection(input);
    $newSectionform.reset();
    $newSectionform.sectionName.blur() 
  });

  $newSectionform.querySelector('input[type="button"]').addEventListener('mousedown', (e) => {
    const input = $newSectionform.sectionName.value.trim();
    if (!input) return;
    
    createSection(input);
    $newSectionform.reset();
    $newSectionform.sectionName.blur() 
  });

  $newSectionform.sectionName.addEventListener('focusout', () => {
      $createNewSection.classList.remove('grow');
      $newSectionform.classList.add('none');
  });  
  

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