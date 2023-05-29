# vanila-kanban
TODO 
1. sections can also be dragged and dropped
2. rendering sections and todos with temporarry mock data
3. when sections or todos positions are changed must update using localstorage


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


