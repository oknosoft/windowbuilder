import React, {Component, PropTypes} from "react";
import ReactDataGrid from "react-data-grid";
import { Menu } from "react-data-grid/addons";

// Import the necessary modules.

// Create the context menu.
// Use this.props.rowIdx and this.props.idx to get the row/column where the menu is shown.
class MyContextMenu extends Component {

  onRowDelete(e, data) {
    if (typeof(this.props.onRowDelete) === 'function') {
      this.props.onRowDelete(e, data);
    }
  }

  onRowAdd(e, data) {
    if (typeof(this.props.onRowAdd) === 'function') {
      this.props.onRowAdd(e, data);
    }
  }

  render() {

    let { ContextMenu, MenuItem} = Menu;

    return (
      <ContextMenu>
        <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={::this.onRowDelete}>Delete Row</MenuItem>
        <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={::this.onRowAdd}>Add Row</MenuItem>
      </ContextMenu>
    );
  }

}


export default class TabularSection extends Component {

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  static propTypes = {

    _obj: PropTypes.object.isRequired,
    _tabular: PropTypes.string.isRequired,
    _meta: PropTypes.object,
    _columns: PropTypes.object,

    handleValueChange: PropTypes.func,
    handleRowChange: PropTypes.func,
  }

  constructor (props, context) {

    super(props);

    const users_mgr = context.$p.cat.users

    this.state = {
      _meta: props._meta || props._obj._metadata(props._tabular),
      _tabular: props._obj[props._tabular],
      _columns: props._columns || []
    }

    if(!this.state._columns.length){
      this.state._columns = [
        {
          key: 'row',
          name: '№',
          resizable : true,
          width : 80
        },
        {
          key: 'individual_person',
          name: 'ФИО',
          resizable : true,
          formatter: v => {
            v = users_mgr.get(v.value)
            return (<div>{v instanceof Promise ? 'loading...' : v.presentation}</div>)
          }
        }]
    }
  }

  rowGetter(i){
    return this.state._tabular.get(i)._obj;
  }

  deleteRow(e, data) {
    this.state._tabular.del(data.rowIdx)
    this.refs.grid.forceUpdate()
  }

  addRow(e, data) {
    this.state._tabular.add()
    this.refs.grid.forceUpdate()
  }

  handleRowUpdated(e){
    //merge updated row with current row and rerender by setting state
    var row = this.rowGetter(e.rowIdx);
    Object.assign(row._row || row, e.updated);
  }

  render() {

    const { $p } = this.context;
    const { _meta, _tabular, _columns } = this.state;
    const _val = this.props._obj[this.props._fld];
    const subProps = {
      _meta: this.state._meta,
      _obj: this.props._obj,
      _fld: this.props._fld,
      _val: _val
    }

    return <ReactDataGrid
      ref="grid"
      columns={_columns}
      enableCellSelect={true}
      rowGetter={::this.rowGetter}
      rowsCount={_tabular.count()}
      onRowUpdated={this.handleRowUpdated}
      minHeight={200}

      contextMenu={<MyContextMenu
        onRowDelete={::this.deleteRow}
        onRowAdd={::this.addRow}
      />}

    />
  }
}
