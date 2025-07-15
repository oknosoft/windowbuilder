
function select(gridRef, pos) {
  setTimeout(() => {
    gridRef?.grid?.focus();
    gridRef?.scrollToColumn?.(pos);
    gridRef?.selectCell?.(pos);
  }, 66);
}

export function handlers({tabular, selection, rows, setRows, setSelectedRows, gridRef}) {
  const add = (ev, proto) => {
    if(!proto) {
      proto = {sz: 0};
    }
    for(const name in tabular._owner._metadata(tabular._name).fields) {
      if(selection.hasOwnProperty(name)) {
        proto[name] = selection[name];
      }
    }
    const newRow = tabular.add(proto);
    newRow._obj.uid = $p.utils.generate_guid();
    if(!newRow.quantity) {
      newRow.quantity = 1;
    }
    const newRows = [...rows, newRow];
    setRows(newRows);
    setSelectedRows(new Set([newRow.uid]));
    const pos = {idx: 0, rowIdx: newRows.length - 1};
    select(gridRef, pos);
  };

  const delRow = (row) => {
    const index = rows.indexOf(row);
    if(index > -1) {
      tabular.del(row);
      rows.splice(index, 1);
      const newRows = [...rows];
      let newRow;
      if(newRows[index]) {
        newRow = newRows[index];
        gridRef.current?.selectCell?.({idx: 0, rowIdx: -1});
      }
      else {
        newRow = newRows[newRows.length - 1];
      }
      setSelectedRows(new Set(newRow ? [newRow.uid] : undefined));
      setRows(newRows);
      if(newRow) {
        const pos = {idx: 0, rowIdx: newRows.indexOf(newRow)};
        select(gridRef, pos);
      }
    }
  };

  const clear = () => {
    tabular.clear(selection);
    setRows([]);
    setSelectedRows(new Set());
  };

  return {add, delRow, clear};
}
