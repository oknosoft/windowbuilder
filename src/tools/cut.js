/**
 * ### Разрыв и слияние узла Т
 *
 * @module tools
 * @submodule tool_cut
 */

/**
 * ### Изменяет тип соединения
 *
 * @class ToolCut
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Разрыв
 */
class ToolCut extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'cut'},
      mouseStartPos: new paper.Point(),
      node: null,
      hitItem: null,
      cont: null,
      square: null,
    })

    this.on({

      activate() {
        this.on_activate('cursor-arrow-cut');
      },

      deactivate() {
        this.remove_cont();
      },

      keydown(event) {
        if (event.key == 'escape') {
          this.remove_cont();
        }
      },

      mouseup(event) {

        if(this.node) {

        }

        this.remove_cont();
        this._scope.canvas_cursor('cursor-arrow-cut');

      },

      mousemove: this.hitTest

    })

  }

  create_cont(point) {
    if(!this.cont) {
      const pt = this.project.view.projectToView(point);
      this.cont = new $p.iface.OTooolBar({
        wrapper: this._scope._wrapper,
        top: `${pt.y + 10}px`,
        left: `${pt.x - 20}px`,
        name: 'tb_cut',
        height: '28px',
        width: '60px',
        buttons: [
          {name: 'cut', float: 'left', css: 'tb_cursor-cut', tooltip: 'Тип соединения'},
          {name: 'text', float: 'left', css: 'tb_text', tooltip: 'Произвольный текст'},
        ],
        onclick: (name) => {

        },
      });

      this.square = new paper.Path.Rectangle({
        point: point.add([-50, -50]),
        size: [100, 100],
        strokeColor: 'blue',
        strokeWidth: 3,
        dashArray: [8, 8],
      });
    }
    this._scope.canvas_cursor('cursor-arrow-do-cut');
  }

  remove_cont() {
    this.cont && this.cont.unload();
    this.square && this.square.remove();
    this.node = null;
    this.cont = null;
    this.square = null;
  }

  do_cut(element, point){

  }

  do_uncut(element, point){

  }

  hitTest(event) {

    const hitSize = 30;
    this.hitItem = null;

    if (event.point) {
      this.hitItem = this.project.hitTest(event.point, { ends: true, tolerance: hitSize });
    }

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem) {
      const p1 = this.hitItem.item.parent;
      const {b, e} = p1;
      const name = b.getDistance(event.point) < e.getDistance(event.point) ? 'b' : 'e';
      const cnn = p1.rays[name];
      if(cnn.point) {
        this.node = {};
        this.create_cont(cnn.point);
      }
    }
    else {
      this._scope.canvas_cursor('cursor-arrow-cut');
    }

    return true;
  }

}

