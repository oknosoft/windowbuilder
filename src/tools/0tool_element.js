
/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 12.03.2016
 *
 * @module tools
 * @submodule tool_element
 */

/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * @class ToolElement
 * @extends paper.Tool
 * @constructor
 */
class ToolElement extends Editor.ToolElement {

  constructor() {
    super();
    this.on_close = this.on_close.bind(this);
  }

  on_activate(cursor) {
    super.on_activate(cursor);
    this._scope.tb_left.select(this.options.name);
  }

  /**
   * ### Отключает и выгружает из памяти окно свойств инструмента
   *
   * @method detache_wnd
   * @for ToolElement
   * @param tool
   */
  detache_wnd() {
    if (this.wnd) {

      if (this._grid && this._grid.destructor) {
        if (this.wnd.detachObject)
          this.wnd.detachObject(true);
        delete this._grid;
      }

      if (this.wnd.wnd_options) {
        if(!this.options.wnd){
          this.options.wnd = {};
        }
        this.wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options("editor", this.options);
        this.wnd.close();
      }

      delete this.wnd;
    }
    this.profile = null;
  }

  on_close(wnd) {
    wnd && wnd.cell && setTimeout(() => this._scope.tools[1].activate());
    return true;
  }

}

