import React from 'react';
import DataGrid from 'react-data-grid';
import {Command} from '../../Cmdk/index.tsx';
const {EditorBase} = DataGrid.editors;

function commandItem() {

}

export function componentWrapper(predefined, all) {
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
        }}
      >
        {item.name}
      </Command.Item>;
    };

    render() {
      const {commandItem, props: {rowData, column, onCommitCancel}} = this;
      const value = rowData[column.key];
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
              {predefined.map(commandItem)}
            </Command.Group>
            <Command.Separator />
            <Command.Group heading="Все">
              {all.map(commandItem)}
            </Command.Group>
          </Command.List>
        </Command>
      </div>;
    }
  }

  return RecentCell;
}
