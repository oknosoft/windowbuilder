import React from 'react';
import DataGrid from 'react-data-grid';
import ListItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListAltIcon from '@material-ui/icons/ListAlt';
import {Command} from '../../Cmdk/index.tsx';
import {CachedSearch} from '../../CatPartners/Search';
import DataList from 'metadata-react/DynList/DynList';
import Dialog from 'metadata-react/App/Dialog';

const {EditorBase} = DataGrid.editors;


export function componentWrapper(predefined, all) {

  const {cat, dp, wsql, utils, job_prm} = $p;
  const search = new CachedSearch({mgr: cat.nom, wsql, key: 'montage_bag', limit: 10, predefined});
  const _owner =  {
    _meta: utils._clone(dp.buyers_order.metadata('nom'))
  };
  const exclude = job_prm.nom.glass._children()
    .concat(job_prm.nom.products._children())
    .concat(job_prm.nom.deleted._children())
    .concat(job_prm.nom.servise._children())
    .concat(job_prm.nom.operations._children())
    .map(v => v.ref);
  _owner._meta.choice_params = [{
    name: 'custom',
    path(o) {
      return !exclude.includes(o.ref);
    }
  }];

  class RecentCell extends EditorBase {

    constructor(props, context) {
      super(props, context);
      this.state = {dynListOpen: false, filter: ''};
    }

    getValue() {
      const {rowData, column} = this.props;
      return {[column.key]: rowData[column.key]};
    }

    commandItem = (item, index) => {
      return <Command.Item
        key={index}
        value={item.ref}
        onSelect={(value) => {
          this.handleSelect(this.props.rowData, value);
        }}
      >
        {item.name}
      </Command.Item>;
    };

    handleOpen = (event) => {
      // This prevents ghost click.
      event.preventDefault();

      this.setState({dynListOpen: true});
    };

    handleRequestClose = () => {
      if(this.state.dynListOpen) {
        this.setState({dynListOpen: false});
      }
    };

    handleSelect = (row, value) => {
      const {rowData, onCommit} = this.props;
      rowData.nom = value === cat.nom ? row.ref : value;
      this.handleRequestClose();
      onCommit();
      search.handleSelect(rowData.nom);
    };

    setFilter = (filter) => this.setState({filter});

    render() {
      const {commandItem, props: {rowData, column, onCommitCancel}, state: {dynListOpen, filter}, handleSelect, handleRequestClose, handleOpen, setFilter} = this;
      const value = rowData[column.key];
      const top = search.top();
      return <div className="linear">
        <Command
          value={filter}
          onValueChange={setFilter}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onCommitCancel();
            }
          }}
          filter={(ref, search) => {
            const item = cat.nom.get(ref);
            return utils._like(item.name, search) || utils._like(item.article, search) ? 1 : 0;
          }}
        >
          <Command.Input placeholder="Введите строку поиска..."/>
          <Command.List>
            <Command.Empty>Нет подходящих материалов</Command.Empty>
            <Command.Group heading="Недавние">
              {top.map(commandItem)}
            </Command.Group>
            <Command.Separator alwaysRender />
            <Command.Group heading="Все">
              {all.filter(v => !top.includes(v)).map(commandItem)}
            </Command.Group>
            <Command.Separator alwaysRender />
          </Command.List>
          <ListItem onClick={handleOpen}>
            <ListItemIcon><ListAltIcon/></ListItemIcon>
            <ListItemText>Выбрать из списка</ListItemText>
          </ListItem>
        </Command>
        {dynListOpen && <Dialog
          open
          noSpace
          large
          title="Укажите номенклатуру"
          onClose={handleRequestClose}
        >
          <DataList
            height={480}
            _mgr={cat.nom}
            _acl="r"
            _owner={_owner}
            handlers={{handleSelect}}
            //find_rows={this.find_rows}
            selectionMode
            denyAddDel
            //show_variants
            show_search
          />
        </Dialog>}
      </div>;
    }
  }

  return RecentCell;
}
