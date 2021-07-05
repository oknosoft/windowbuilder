import React from 'react';
import DataGrid from 'react-data-grid';

console.log(DataGrid.editors);

function SzFormatter({value}) {
  // пустое значение или *, отображаем, как *
  if(!value) {
    value = '*';
  }
  return <div>{value}</div>;
}

class SzEditor extends DataGrid.editors.SimpleTextEditor {

  render() {
    return super.render();
  }
}

export {SzEditor, SzFormatter};
