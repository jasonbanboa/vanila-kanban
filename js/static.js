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
  generateUniqueID,
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
const $sectionPopup = $('.section-backdrop .actions-popup');
const $mainSectionPopup = $sectionPopup.querySelector('.main-section');
const $copyView = $sectionPopup.querySelector('.copy-section-view');1
const $addTodoActionButton = $('.section-backdrop .actions-popup .add-todo');
const $deleteSectionButton = $('.section-backdrop .actions-popup li.delete-section');
const $copySectionButton = $('.section-backdrop .actions-popup li.copy-section');
const $backButtons = $sectionPopup.querySelectorAll('.back');
const $sectionPopupTextarea = $sectionPopup.querySelector('textarea');
const $moveSectionButton = $sectionPopup.querySelector('.move-section');
const $moveSectionView = $sectionPopup.querySelector('.move-section-view');


export function addStaticEventListeners() {

  $backButtons.forEach($button => {
    $button.addEventListener('click', () => {
      const $subSection = $button.closest('.sub-section');
      $subSection.classList.add('none');
      $mainSectionPopup.classList.remove('none'); 
    });
  });

  $moveSectionButton.addEventListener('click', (e) => {
    $moveSectionView.classList.remove('none');
    $mainSectionPopup.classList.add('none');
    
    const { dataset : { sectionid } } = $sectionPopup;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();
    
    const sortedWorkspaces = kanbanData.workspaces.reduce((acc, ws) => {
      if (ws.workspaceID === workspace.workspaceID) {
        return [ws, ...acc];
      }
      return [...acc, ws];
    }, []);
    
    const workspaceOptions = sortedWorkspaces.reduce((acc, { workspaceID, workspaceName }, i) => {
      return acc += `<option value="${workspaceID}">${workspaceID === workspace.workspaceID ? `${workspaceName} (current)` : workspaceName}</option>`;
    }, '');

    const sectionOptions = workspace.sections.reduce((acc, { sectionID }, i) => {
      acc += `<option value="${i}">${sectionID === sectionid ? `${i + 1} (current)` : i + 1}</option>`;
      return acc;
    }, '');

    $moveSectionView.querySelector('.con').innerHTML = `
      <select name="workspace" class="flex-1">
        ${workspaceOptions}
      </select>

      <select name="section" class="flex-1">
        ${sectionOptions}
      </select>

      <input class="move-section-to" type="button" value="Move section">
    `;

    $moveSectionView.querySelector('.move-section-to').addEventListener('click', () => {

      
      const workspaceToID = $moveSectionView.querySelector('select[name="workspace"]').value;
      const sectionToArrIndex = $moveSectionView.querySelector('select[name="section"]').value;

      const workspaceToArrIndex = kanbanData.workspaces.findIndex(({ workspaceID }) => workspaceID === workspaceToID);

      // remove and copy section from kanbanData
      const movingSectionArrIndex = findSectionArrIndex(workspace, sectionid);

      const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
      const clonedMovingSection = structuredClone(workspace.sections[movingSectionArrIndex]);

      if (workspaceArrIndex === workspaceToArrIndex && +sectionToArrIndex === movingSectionArrIndex) {
        return closeSectionDialog();
      }

      // TODO same workspace diff section doesnt work
      if (workspaceArrIndex === workspaceToArrIndex) {
        const updatedSections = workspace.sections.reduce((acc, section, i) => {
          if (section.sectionID === sectionid) 
            return [...acc];
          if (+sectionToArrIndex === i) {

            const original = movingSectionArrIndex;
            const to = i;

            if (original < to) {
              return [...acc, section, clonedMovingSection]
            } 
            return [...acc, clonedMovingSection, section]
          }
          return [...acc, section];
        }, []); 
        workspace.sections = updatedSections;

        kanbanData.workspaces[workspaceArrIndex] = workspace;
        updateKanbanData(kanbanData);
        return closeSectionDialog();
      }

      // diff workspace to diff workspace
      kanbanData.workspaces[workspaceArrIndex].sections = workspace.sections.filter(({ sectionID }) => sectionID !== sectionid);

      if (kanbanData.workspaces[workspaceToArrIndex].sections.length === +sectionToArrIndex) {
        kanbanData.workspaces[workspaceToArrIndex].sections.push(clonedMovingSection);

      } else {
        const updatedSections = kanbanData.workspaces[workspaceToArrIndex].sections.reduce((acc, section, i) => {
          if (i === +sectionToArrIndex) {
            console.log('found destination')
            return [...acc, clonedMovingSection, section];
          }
          return [...acc, section];
        }, []);
        kanbanData.workspaces[workspaceToArrIndex].sections = updatedSections;
      }    
      
      updateKanbanData(kanbanData);
      closeSectionDialog();
    }); 

    $moveSectionView.querySelector('select[name="workspace"]').addEventListener('change', (e) => {
      const $sectionSelect = $moveSectionView.querySelector('select[name="section"]'); 
      const workspaceID = e.target.value;

      const workspaceArrIndex = kanbanData.workspaces.findIndex((workspace) => workspace.workspaceID === workspaceID);
      const currentWorkspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);
      
      if (kanbanData.workspaces[workspaceArrIndex].sections.length === 0) {
        $sectionSelect.innerHTML = `<option value="${0}">1</option>`;
      } else {
        $sectionSelect.innerHTML = kanbanData.workspaces[workspaceArrIndex].sections.reduce((acc, { sectionID }, i) => {
          acc += `<option value="${i}">${sectionID === sectionid ? `${i + 1} (current)` : i + 1}</option>`;
          if (i === kanbanData.workspaces[workspaceArrIndex].sections.length - 1 && workspaceArrIndex !== currentWorkspaceArrIndex) {
            acc += `<option value="${i + 1}">${kanbanData.workspaces[workspaceArrIndex].sections.length + 1}</option>`; 
          }
          return acc;
        }, '');
      }
    });
  });

  $copySectionButton.addEventListener('click', () => {
    if ($copyView.classList.contains('none')) {
      $mainSectionPopup.classList.add('none');
      $copyView.classList.remove('none');
      $copyView.querySelector('textarea').focus();
    }
  });

  $sectionPopup.querySelector('.create-section-copy').addEventListener('click', (e) => {
    const { dataset : { sectionid } } = $sectionPopup;
    const input = $sectionPopupTextarea.value.trim();

    if (!input) return;

    const kanbanData = getKanbanData();
    const workspace = getCurrentWorkspace();
    const workspaceArrIndex = findWorkspaceArrIndex(kanbanData, workspace);

    const updatedSections = workspace.sections.reduce((sectionsArr, section) => {
      if (section.sectionID === sectionid) {
        const clonedTodos = section.todos.reduce((todoArr, todo) => [...todoArr, { ...todo, todoID: generateUniqueID() }] ,[])

        const sectionClone = {
          sectionID: generateUniqueID(),
          sectionName: input,
          todos: clonedTodos,
        }
        
        return [...sectionsArr, section, sectionClone];
      }
      return [...sectionsArr, section];
    }, []);

    kanbanData.workspaces[workspaceArrIndex].sections = updatedSections;
    updateKanbanData(kanbanData);

    $sectionPopupTextarea.value = ''
    closeSectionDialog();

  });

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