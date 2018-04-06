/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018<br />
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_arc
 */

/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 *
 * @class ToolArc
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Арка
 */
class ToolArc extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'arc'},
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate: function() {
        this._scope.hide_selection_bounds();
      },

      mousedown: function(event) {

        var b, e, r;

        this.mode = null;
        this.changed = false;

        if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
          && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

          this.mode = this.hitItem.item.parent.generatrix;

          if (event.modifiers.control || event.modifiers.option){
            // при зажатом ctrl или alt строим правильную дугу

            b = this.mode.firstSegment.point;
            e = this.mode.lastSegment.point;
            r = (b.getDistance(e) / 2) + 0.001;

            this.do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

            //undo.snapshot("Move Shapes");
            r = this.mode;
            this.mode = null;

          }
          // при зажатом space удаляем кривизну
          else if(event.modifiers.space){

            e = this.mode.lastSegment.point;
            r = this.mode;
            this.mode = null;

            r.removeSegments(1);
            r.firstSegment.handleIn = null;
            r.firstSegment.handleOut = null;
            r.lineTo(e);
            r.parent.rays.clear();
            r.parent._row.r = 0;
            r.selected = true;
            r.layer.notify({profiles: [r.parent], points: []}, consts.move_points);

          }
          else {
            this.project.deselectAll();

            r = this.mode;
            r.selected = true;
            this.project.deselect_all_points();
            this.mouseStartPos = event.point.clone();
            this.originalContent = this._scope.capture_selection_state();

          }

          setTimeout(() => {
            r.layer.redraw();
            r.parent.attache_wnd(this._scope._acc.elm);
            this.eve.emit("layer_activated", r.layer);
          }, 10);

        }else{
          //tool.detache_wnd();
          this.project.deselectAll();
        }
      },

      mouseup: function(event) {

        var item = this.hitItem ? this.hitItem.item : null;

        if(item instanceof Filling && item.visible){
          item.attache_wnd(this._scope._acc.elm);
          item.selected = true;

          if(item.selected && item.layer){
            this.eve.emit("layer_activated", item.layer);
          }
        }

        if (this.mode && this.changed) {
          //undo.snapshot("Move Shapes");
          //this.project.redraw();
        }

        this._scope.canvas_cursor('cursor-arc-arrow');

      },

      mousedrag: function(event) {
        if (this.mode) {

          this.changed = true;

          this._scope.canvas_cursor('cursor-arrow-small');

          this.do_arc(this.mode, event.point);

          //this.mode.layer.redraw();

        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      }

    })

  }

  do_arc(element, point){
    const end = element.lastSegment.point.clone();
    element.removeSegments(1);

    try {
      element.arcTo(point, end);
    }
    catch (e) {
    }

    if(!element.curves.length) {
      element.lineTo(end);
    }

    element.parent.rays.clear();
    element.selected = true;

    element.layer.notify({profiles: [element.parent], points: []}, consts.move_points);
  }

  hitTest(event) {

    const hitSize = 6;
    this.hitItem = null;

    if(event.point) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, stroke: true, selected: true, tolerance: hitSize});
    }
    if(!this.hitItem) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, tolerance: hitSize});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      this._scope.canvas_cursor('cursor-arc');
    }
    else {
      this._scope.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}

