# vanila-kanban
TODO 
1. delete todos
2. refactor so edit, delete are static events
3. create new todos
4. create new sections

 'kanban' is set in localstorage <br/>
`JSON.parse(localStorage.getItem('kanban'))` returns
```javascript
{
  workspaces: { 
    workspaceID: string,
    workspaceName: string,
    sections: {
      sectionID: string,
      sectionName: string,
      todos: {
        todoID: string,
        todoName: string,
        description: string,
      }[]
    }[]
  }[]
}
```

## util functions
* `generateUniqueID()` => returns unique id; used to set pk for workspace, section, and todos

### any function that modifies the kanban will call these function
* `getKanbanData()` => gets kaban data from localStorage then returns data parsed to an js object
* `updateKanbanData(updatedKanbanData)` => takes an object of workspaces, stringifies then updates to localstorage 

```javascript
function modifiesKanbanData() {
  const DATA = getKanbanData();
  // modify data...
  
  updateKanbanData();
}
```


