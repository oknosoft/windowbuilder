/**
 * ### Разрыв и слияние узла Т
 *
 * @module tools
 * @submodule tool_cut
 */

/**
 * ### Манипуляции с арками (дуги правильных окружностей)
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
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arrow-cut');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
      },

      mouseup: function(event) {

        var item = this.hitItem ? this.hitItem.item : null;

        if(item instanceof Filling && item.visible){
          item.attache_wnd(paper._acc.elm.cells("a"));
          item.selected = true;

          if(item.selected && item.layer)
            $p.eve.callEvent("layer_activated", [item.layer]);
        }

        if (this.mode && this.changed) {
          //undo.snapshot("Move Shapes");
          //paper.project.redraw();
        }

        paper.canvas_cursor('cursor-arrow-cut');

      },

      mousemove: function(event) {
        this.hitTest(event);
      }

    })

  }

  do_cut(element, point){

  }

  do_uncut(element, point){

  }

  hitTest(event) {

    const hitSize = 6;
    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      paper.canvas_cursor('cursor-arrow-do-cut');
    }
    else {
      paper.canvas_cursor('cursor-arrow-cut');
    }

    return true;
  }

}

