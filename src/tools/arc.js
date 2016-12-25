/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
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
      duplicates: null
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
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


          }else if(event.modifiers.space){
            // при зажатом space удаляем кривизну

            e = this.mode.lastSegment.point;
            r = this.mode;
            this.mode = null;

            r.removeSegments(1);
            r.firstSegment.handleIn = null;
            r.firstSegment.handleOut = null;
            r.lineTo(e);
            r.parent.rays.clear();
            r.selected = true;
            r.layer.notify({type: consts.move_points, profiles: [r.parent], points: []});

          } else {
            paper.project.deselectAll();

            r = this.mode;
            r.selected = true;
            paper.project.deselect_all_points();
            this.mouseStartPos = event.point.clone();
            this.originalContent = paper.capture_selection_state();

          }

          setTimeout(function () {
            r.layer.redraw();
            r.parent.attache_wnd(paper._acc.elm.cells("a"));
            $p.eve.callEvent("layer_activated", [r.layer]);
          }, 10);

        }else{
          //tool.detache_wnd();
          paper.project.deselectAll();
        }
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

        paper.canvas_cursor('cursor-arc-arrow');

      },

      mousedrag: function(event) {
        if (this.mode) {

          this.changed = true;

          paper.canvas_cursor('cursor-arrow-small');

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
    var end = element.lastSegment.point.clone();
    element.removeSegments(1);

    try{
      element.arcTo(point, end);
    }catch (e){	}

    if(!element.curves.length)
      element.lineTo(end);

    element.parent.rays.clear();
    element.selected = true;

    element.layer.notify({type: consts.move_points, profiles: [element.parent], points: []});
  }

  hitTest(event) {

    var hitSize = 6;
    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      paper.canvas_cursor('cursor-arc');
    } else {
      paper.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}

