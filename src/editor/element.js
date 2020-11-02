
/**
 *
 *
 * @module element
 *
 * Created by Evgeniy Malyarov on 20.04.2020.
 */

/**
 * Подключает окно редактор свойств текущего элемента, выбранного инструментом
 */
Editor.BuilderElement.prototype.attache_wnd = function attache_wnd(cell) {
  if(!this._attr._grid || !this._attr._grid.cell){

    this._attr._grid = cell.attachHeadFields({
      obj: this,
      oxml: this.oxml
    });
    this._attr._grid.attachEvent('onRowSelect', function (id) {
      if(['x1', 'y1', 'a1', 'cnn1'].indexOf(id) != -1) {
        this._obj.select_node('b');
      }
      else if(['x2', 'y2', 'a2', 'cnn2'].indexOf(id) != -1) {
        this._obj.select_node('e');
      }
    });
  }
  else if(this._attr._grid._obj != this){
    this._attr._grid.attach({
      obj: this,
      oxml: this.oxml
    });
  }
}

/**
 * Отключает и выгружает из памяти окно свойств элемента
 */
Editor.BuilderElement.prototype.detache_wnd = function detache_wnd() {
  const {_grid} = this._attr;
  if(_grid && _grid.destructor && _grid._owner_cell){
    _grid._owner_cell.detachObject(true);
    delete this._attr._grid;
  }
}
