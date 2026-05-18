import React from 'react';
import DataGrid from 'react-data-grid';
import {Command} from '../../Cmdk/index.tsx';
import {CachedSearch} from '../../CatPartners/Search';
const {EditorBase} = DataGrid.editors;


export function componentWrapper(predefined, all) {

  const {cat, wsql} = $p;
  const search = new CachedSearch({mgr: cat.nom, wsql, key: 'montage_bag', limit: 10, predefined});

  class RecentCell extends EditorBase {

    getValue() {
      const {rowData, column} = this.props;
      return {[column.key]: rowData[column.key]};
    }

    commandItem = (item, index) => {
      return <Command.Item
        key={index}
        value={item.ref}
        keywords={[item.name, item.article]}
        onSelect={(value) => {
          const {rowData, column, onCommit} = this.props;
          rowData[column.key] = value;
          onCommit();
          search.handleSelect(rowData[column.key]);
        }}
      >
        {item.name}
      </Command.Item>;
    };

    render() {
      const {commandItem, props: {rowData, column, onCommitCancel}} = this;
      const value = rowData[column.key];
      const top = search.top();
      return <div className="linear">
        <Command
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              onCommitCancel();
            }
          }}>
          <Command.Input placeholder="Введите строку поиска..."/>
          <Command.List>
            <Command.Empty>Нет подходящих материалов</Command.Empty>
            <Command.Group heading="Недавние">
              {top.map(commandItem)}
            </Command.Group>
            <Command.Separator />
            <Command.Group heading="Все">
              {all.filter(v => !top.includes(v)).map(commandItem)}
            </Command.Group>
          </Command.List>
        </Command>
      </div>;
    }
  }

  return RecentCell;
}
