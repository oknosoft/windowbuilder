import React from 'react';
import {Editors} from 'react-data-grid-addons';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import Layers from './Layers';
import {get_tree} from './data';

class CompoundEditor extends Editors.SimpleTextEditor {

  constructor(props) {
    super(props);
    const {column, rowData} = props;
    this.tree = get_tree(rowData._owner._owner.calc_order, rowData[column.key]);
  }

  commit = () => {
    const {props: {column, rowData, onCommit}, tree} = this;
    const keys = tree.keys.distinct();
    rowData[column.key] = {keys: Array.from(keys)};
    onCommit();
  };

  render() {
    const {rowData, onCommit, onCommitCancel} = this.props;
    const {calc_order} = rowData._owner._owner;
    const text = 'Editor';
    return <>
      <input readOnly value={text}></input>
      <Dialog
        open
        //initFullScreen
        large
        title={`Состав`}
        onClose={onCommitCancel}
        actions={[
          <Button key="ok" onClick={this.commit} color="primary">Ок</Button>,
          <Button key="cancel" onClick={onCommitCancel} color="primary">Отмена</Button>
        ]}
      >
        <Layers calc_order={calc_order} rowData={rowData} tree={this.tree}/>
      </Dialog>
    </>;
  }
}

export default CompoundEditor;

// {column, rowData, onBlur, onCommit, onCommitCancel}
