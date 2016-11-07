/** @flow */
import React, {Component, PropTypes} from "react";
import {InfiniteLoader, Grid} from "react-virtualized";
import styles from "./EventsList.scss";
import cn from "classnames";

const limit = 30,
  totalRows = 999999;

let timer = 0;

export default class EventsList extends Component {

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  static propTypes = {
    fetch_remote: PropTypes.bool,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  // rowIndex, columnIndex
  //cellContent

  constructor (props) {

    super(props);

    this.state = {
      totalRowCount: totalRows,
      filter: {id: 0, name: ''},
      selectedRowIndex: 0,
      fetch_remote: props.fetch_remote,
      popover_opened: false
    }

    this._list = {
      _data: [],
      get size(){ return this._data.length},
      get(index){ return this._data[index]},
      clear(){this._data.length = 0}
    }

    this._isRowLoaded = ::this._isRowLoaded
    this._loadMoreRows = ::this._loadMoreRows
    this._cellRenderer = ::this._cellRenderer

  }

  render () {

    const { totalRowCount } = this.state
    const { width, height, fetch_remote, columns, columnWidths } = this.props

    // если изменился статус синхронизации
    if(this.state.fetch_remote != fetch_remote){

      this.state.fetch_remote = fetch_remote;

      if(timer){
        clearTimeout(timer)
      }

      if(!this.state.fetch_remote){

        const new_state = {
          totalRowCount: totalRowCount <= 1 ? 2 : 1
        }
        timer = setTimeout(() =>{
          this._list.clear()
          this.setState(new_state)
        }, 200)

      }
    }

    return (
      <div>

        <InfiniteLoader
          isRowLoaded={this._isRowLoaded}
          loadMoreRows={this._loadMoreRows}
          rowCount={totalRowCount}
          minimumBatchSize={limit}
        >
          {({onRowsRendered, registerChild}) => {

            const onSectionRendered = ({rowOverscanStartIndex, rowOverscanStopIndex, rowStartIndex, rowStopIndex}) => {

              onRowsRendered({
                overscanStartIndex: rowOverscanStartIndex,
                overscanStopIndex: rowOverscanStopIndex,
                startIndex: rowStartIndex,
                stopIndex: rowStopIndex
              })
            }

            return (

              <Grid
                ref={registerChild}
                //className={styles.BodyGrid}
                //style={{top: 30}}
                onSectionRendered={onSectionRendered}
                cellRenderer={this._cellRenderer}
                columnCount={columns.length}
                columnWidth={({index}) => Math.floor(width*columnWidths[index]/100)}
                rowCount={totalRowCount}
                rowHeight={30}
                width={width}
                height={height}
              />

            )
          }

          }

        </InfiniteLoader>

      </div>
    )
  }

  handleAdd(e){

  }

  handleMarkDeleted(e){
    const row = this._list.get(this.state.selectedRowIndex)
    if(row)
      this.props.handleMarkDeleted(row)
  }

  handleRemove(e){

  }

  handleSelectionChange(e){

  }

  handlePrint(e){

  }

  handleAttachment(e){

  }

  _formatter (row, index){

    const v = row[this.props.columns[index]]
    const { $p } = this.context

    switch(index){
      case 0:
        return $p.utils.moment(v).format('DD.MM.YY HH:mm:ss');
      default:
        return v;
    }
  }

  _isRowLoaded ({ index }) {
    const res = !!this._list.get(index)
    return res
  }

  _getRowClassName (row) {
    return row % 2 === 0 ? styles.evenRow : styles.oddRow
  }

  _loadMoreRows ({ startIndex, stopIndex }) {

    const { filter, totalRowCount } = this.state
    const { $p } = this.context
    const increment = Math.max(limit, stopIndex - startIndex + 1)

    // готовим фильтры для запроса couchdb
    const select = {
      _view: 'doc/by_date',
      _raw: true,
      _top: increment,
      _skip: startIndex,
      _key: {
        startkey: ['draft', 2000],
        endkey: ['draft', 2020]
      }
    }

    // выполняем запрос
    return $p.doc.planning_event.find_rows_remote(select)

      .then((data) => {

        // обновляем массив результата
        for (var i = 0; i < data.length; i++) {
          if(!this._list._data[i+startIndex]){
            this._list._data[i+startIndex] = data[i];
          }
        }

        // обновляем состояние - изменилось количество записей
        if(totalRowCount != startIndex + data.length + (data.length < increment ? 0 : increment )){
          this.setState({
            totalRowCount: startIndex + data.length + (data.length < increment ? 0 : increment )
          })
        }else{
          this.forceUpdate()
        }

      })
  }

  /**
   *
   * @param columnIndex - Horizontal (column) index of cell
   * @param isScrolling - The Grid is currently being scrolled
   * @param key - Unique key within array of cells
   * @param rowIndex - Vertical (row) index of cell
   * @param style - Style object to be applied to cell
   * @return {XML}
   * @private
   */
  _cellRenderer ({columnIndex, isScrolling, key, rowIndex, style}) {

    const setState = ::this.setState
    // var grid = this.refs.AutoSizer.refs.Grid

    const classNames = cn(
      this._getRowClassName(rowIndex),
      styles.cell,
      {
        [styles.centeredCell]: columnIndex > 4, // выравнивание текста по центру
        [styles.hoveredItem]: rowIndex === this.state.hoveredRowIndex && rowIndex != this.state.selectedRowIndex, // || columnIndex === this.state.hoveredColumnIndex
        [styles.selectedItem]: rowIndex === this.state.selectedRowIndex
      }
    )

    const row = this._list.get(rowIndex)

    let content

    if (row) {
      content = this._formatter(row, columnIndex)

    } else {
      content = (
        <div
          className={styles.placeholder}
          style={{ width: 10 + Math.random() * 80 }}
        />
      )
    }

    // It is important to attach the style specified as it controls the cell's position.
    // You can add additional class names or style properties as you would like.
    // Key is also required by React to more efficiently manage the array of cells.
    return (
      <div
        className={classNames}
        key={key}
        style={style}
        onMouseOver={function () {
          setState({
            hoveredColumnIndex: columnIndex,
            hoveredRowIndex: rowIndex
          })
        }}
        onTouchTap={function () {
          setState({
            selectedRowIndex: rowIndex
          })
        }}
        onDoubleClick={::this.handleMarkDeleted}
      >
        {content}
      </div>
    )
  }

}
