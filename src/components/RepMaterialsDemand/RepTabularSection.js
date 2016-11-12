import React, {Component, PropTypes} from "react";
import ReactDataGrid from "react-data-grid";
import {Menu, Data, Editors, ToolsPanel} from "react-data-grid/addons";

const Selectors = Data.Selectors;
const { AdvancedToolbar, GroupedColumnsPanel }   = ToolsPanel;
const DraggableContainer  = ReactDataGridPlugins.Draggable.Container;

  // // Import the necessary modules.
  // import { Menu } from "react-data-grid/addons";
  // // Create the context menu.
  // // Use this.props.rowIdx and this.props.idx to get the row/column where the menu is shown.
  // class MyContextMenu extends Component {
  //
  //   onRowDelete(e, data) {
  //     if (typeof(this.props.onRowDelete) === 'function') {
  //       this.props.onRowDelete(e, data);
  //     }
  //   }
  //
  //   onRowAdd(e, data) {
  //     if (typeof(this.props.onRowAdd) === 'function') {
  //       this.props.onRowAdd(e, data);
  //     }
  //   }
  //
  //   render() {
  //
  //     let { ContextMenu, MenuItem} = Menu;
  //
  //     return (
  //       <ContextMenu>
  //         <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={::this.onRowDelete}>Delete Row</MenuItem>
  //         <MenuItem data={{rowIdx: this.props.rowIdx, idx: this.props.idx}} onClick={::this.onRowAdd}>Add Row</MenuItem>
  //       </ContextMenu>
  //     );
  //   }
  //
  // }

class CustomToolbar extends Component {
  render() {
    return (
      <AdvancedToolbar>
        <GroupedColumnsPanel
          groupBy={this.props.groupBy}
          onColumnGroupAdded={this.props.onColumnGroupAdded}
          onColumnGroupDeleted={this.props.onColumnGroupDeleted}
        />
      </AdvancedToolbar>
    )
  }
}

export default class TabularSection extends Component {

  static propTypes = {

    _obj: PropTypes.object.isRequired,
    _tabular: PropTypes.string.isRequired,
    _meta: PropTypes.object,

    handleValueChange: PropTypes.func,
    handleRowChange: PropTypes.func,
  }

  constructor (props, context) {

    super(props);

    this.state = {

      _meta: props._meta || props._obj._metadata(props._tabular),
      _tabular: props._obj[props._tabular],

      get rows(){
        return this._tabular._rows || []
      },

      groupBy: [],
      expandedRows: {}
    }
  }

  getRows() {
    return Selectors.getRows(this.state);
  }

  getRowAt(index){
    var rows = this.getRows();
    return rows[index];
  }

  getSize() {
    return this.getRows().length;
  }

  onColumnGroupAdded(colName) {
    var columnGroups = this.state.groupBy.slice(0);
    if(columnGroups.indexOf(colName) === -1) {
      columnGroups.push(colName);
    }
    this.setState({groupBy: columnGroups});
  }

  onColumnGroupDeleted (name) {
    var columnGroups = this.state.groupBy.filter(function(g){return g !== name});
    this.setState({groupBy: columnGroups});
  }

  onRowExpandToggle(args){
    var expandedRows = Object.assign({}, this.state.expandedRows);
    expandedRows[args.columnGroupName] = Object.assign({}, expandedRows[args.columnGroupName]);
    expandedRows[args.columnGroupName][args.name] = {isExpanded: args.shouldExpand};
    this.setState({expandedRows: expandedRows});
  }

  render() {

    const { _obj } = this.props;

    return (

      <div>

        <DraggableContainer>

          <ReactDataGrid
            ref="grid"
            columns={_obj.columns}
            enableCellSelect={true}
            enableDragAndDrop={true}
            rowGetter={::this.getRowAt}
            rowsCount={this.getSize()}
            minHeight={this.props.minHeight || 200}

            onRowExpandToggle={this.onRowExpandToggle}

            toolbar={<CustomToolbar
              groupBy={this.state.groupBy}
              onColumnGroupAdded={::this.onColumnGroupAdded}
              onColumnGroupDeleted={::this.onColumnGroupDeleted}
            />}

          />

        </DraggableContainer>

      </div>

    )

  }
}
