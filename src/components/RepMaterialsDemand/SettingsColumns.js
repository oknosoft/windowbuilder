import React, {Component, PropTypes} from "react";
import ReactDataGrid from "react-data-grid";
import {Draggable, Data} from "react-data-grid/addons";

const Selectors = Data.Selectors;
const { RowActionsCell, Container, DropTargetRowContainer } = Draggable;

import classes from './RepMaterialsDemand.scss'

const RowRenderer = DropTargetRowContainer(ReactDataGrid.Row);

const columns = [
  {
    key: 'name',
    name: 'Заголовок'
  },
  {
    key: 'id',
    name: 'Поле'
  },
]

export default class SettingsColumns extends Component{

  static propTypes = {
    _obj: PropTypes.object,
    rowKey: PropTypes.string
  }

  constructor (props, context) {

    super(props)

    const { _obj } = props
    const flds = _obj.column_flds.length && _obj.column_flds.length < 19 ?
      _obj.column_flds : ['nom','clr','characteristic','len','width','nom_kind','qty','totqty1']
    const rows = _obj.columns_avalable.map(clmn => ({id: clmn.key, name: clmn.name}))

    rows.sort(function (a, b) {
      const ia = flds.indexOf(a.id)
      const ib = flds.indexOf(b.id)

      if(ia < 0 && ib < 0)
        return 0;

      if(ia < 0)
        return 1;

      if(ib < 0)
        return -1;

      return ia - ib;

    })

    this.state = {
      rows: rows,
      selectedIds: flds
    }
  }

  rowGetter(rowIdx){
    return this.state.rows[rowIdx];
  }

  isDraggedRowSelected(selectedRows, rowDragSource) {
    if (selectedRows && selectedRows.length > 0) {
      let key = this.props.rowKey;
      return selectedRows.filter(function(r) {
          return r[key] === rowDragSource.data[key];
        }).length > 0;
    }
    return false;
  }

  reorderRows(e) {
    let selectedRows = Selectors.getSelectedRowsByKey({rowKey: this.props.rowKey, selectedKeys: this.state.selectedIds, rows: this.state.rows});
    let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
    let undraggedRows = this.state.rows.filter(function(r) {
      return draggedRows.indexOf(r) === -1;
    });
    var args = [e.rowTarget.idx, 0].concat(draggedRows);
    Array.prototype.splice.apply(undraggedRows, args);
    this.setState({rows: undraggedRows});
  }

  onRowsSelected(rows) {
    this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row[this.props.rowKey]))});
  }

  onRowsDeselected(rows) {
    let rowIds = rows.map(r =>  r.row[this.props.rowKey]);
    this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
  }

  render(){

    const { _obj } = this.props

    return (

      <Container>
        <ReactDataGrid
          enableCellSelection={true}
          rowActionsCell={RowActionsCell}
          columns={columns}
          rowGetter={::this.rowGetter}
          rowsCount={this.state.rows.length}
          rowRenderer={<RowRenderer onRowDrop={::this.reorderRows}/>}
          minHeight={300}

          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: true,
            onRowsSelected: ::this.onRowsSelected,
            onRowsDeselected: ::this.onRowsDeselected,
            selectBy: {
              keys: {
                rowKey: this.props.rowKey,
                values: this.state.selectedIds
              }
            }
          }}
        />
      </Container>
    )
  }
}
