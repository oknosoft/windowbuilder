import React from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';
import AutoSizer from 'react-virtualized-auto-sizer';

const minHeight = 220;

export default function List({list, onDoubleClick, setCurrent, columns, value}) {

  let _grid;
  const handleRef = (el) => {
    if(_grid !== el) {
      _grid = el;
      if(el) {
        let rowIdx = list.indexOf(value);
        if(list.length) {
          if(rowIdx < 0) {
            rowIdx = 0;
          }
          const selected = {rowIdx, idx: 0};
          el.selectCell(selected);
          onCellSelected(selected);
        }
      }
    }
  };

  const rowGetter = (i) => {
    return list[i];
  };

  const onCellSelected = (selected) => {
    setCurrent(rowGetter(selected?.rowIdx));
  };

  return <AutoSizer>
    {({width, height}) => {
      return <ReactDataGrid
        minWidth={width}
        minHeight={Math.max(minHeight, height) - 1}
        rowHeight={33}
        ref={handleRef}
        columns={columns}
        enableCellSelect={true}
        rowGetter={rowGetter}
        rowsCount={list.length}
        //rowSelection={rowSelection}
        //rowRenderer={rowRenderer}
        //onCellDeSelected={this.onCellDeSelected}
        onCellSelected={onCellSelected}
        //onGridRowsUpdated={this.handleRowsUpdated}
        onRowDoubleClick={onDoubleClick}
        //onGridSort={this.handleSort}
        hideHeader
      />;
    }}
  </AutoSizer>;
}
