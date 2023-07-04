import React from 'react';
import {Editors} from 'react-data-grid-addons';

class CompoundEditor extends Editors.SimpleTextEditor {

  render() {
    const {totqty, totqty1, nom} = this.props.rowData;
    const text = 'Editor';
    return <input readOnly value={text}></input>;
  }
}

export default CompoundEditor;

// {column, rowData, onBlur, onCommit, onCommitCancel}
