import React from 'react';
import PropTypes from 'prop-types';
import DataGrid from 'react-data-grid';

function SzFormatter({value}) {
  // пустое значение или *, отображаем, как *
  if(!value) {
    value = '*';
  }
  return <div>{value}</div>;
}

SzFormatter.propTypes = {
  value: PropTypes.any,
};

class SzEditor extends DataGrid.editors.SimpleTextEditor {

  render() {
    return super.render();
  }
}

export {SzEditor, SzFormatter};
