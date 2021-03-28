
export default function tool_element (Editor) {

  const {Tool} = Editor.prototype;

  /**
   * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
   *
   * @class ToolElement
   * @extends paper.Tool
   * @constructor
   */
  Editor.ToolElement = class ToolElement extends Tool {

    /* eslint-disable-next-line */
    resetHot(type, event, mode) {

    }

    /* eslint-disable-next-line */
    testHot(type, event, mode) {
      return this.hitTest(event);
    }

    /**
     * ### Отключает и выгружает из памяти окно свойств инструмента
     *
     * @method detache_wnd
     * @for ToolElement
     * @param tool
     */
    detache_wnd() {
      this.profile = null;
    }

    /**
     * ### Проверяет, есть ли в проекте слои, при необходимости добавляет
     * @method detache_wnd
     * @for ToolElement
     */
    check_layer() {
      const {project, eve} = this._scope;
      if (!project.contours.length) {
        // создаём пустой новый слой
        new Editor.Contour({parent: undefined});
        // оповещаем мир о новых слоях
        eve.emit_async('rows', project.ox, {constructions: true});
      }
      else if(!(project.activeLayer instanceof Editor.Contour)) {
        project.contours[0].activate();
      }
    }

    /**
     * ### Общие действия при активизации инструмента
     *
     * @method on_activate
     * @for ToolElement
     */
    on_activate(cursor) {

      this._scope.canvas_cursor(cursor);
      this.eve.emit_async('tool_activated', this);

      // для всех инструментов, кроме select_node...
      if(this.options.name != 'select_node') {
        this.check_layer();
        // проверяем заполненность системы
        if(this.project._dp.sys.empty()) {
          const {msg, ui} = $p;
          ui.dialogs.alert({text: msg.bld_not_sys, title: msg.bld_title});
        }
      }
    }

  };

}



