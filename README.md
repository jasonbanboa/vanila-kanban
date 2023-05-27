# vanila-kanban

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
* `updateKanbanData()`: TODO

```javascript
function modifiesKanbanData() {
  const DATA = getKanbanData();
  // modify data...
  
  updateKanbanData();
}
```


