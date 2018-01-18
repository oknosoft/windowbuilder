/**
 * ### Вписать в окно
 * Это не настоящий инструмент, а команда вписывания в окно
 *
 * @module fit
 *
 * Created by Evgeniy Malyarov on 18.01.2018.
 */

class ZoomFit extends paper.Tool {

  constructor() {
    super();
    this.options = {name: 'zoom_fit'};
    this.on({activate: this.on_activate});
  }

  on_activate() {
    const {project, tb_left} = this._scope;
    const previous = tb_left.get_selected();
    project.zoom_fit();
    if(previous) {
      return this._scope.select_tool(previous.replace('left_', ''));
    }
  }

}
