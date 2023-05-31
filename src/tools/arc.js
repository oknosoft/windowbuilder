
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
    super();
    Object.assign(this, {
      options: {name: 'arc'},
      mouseStartPos: new paper.Point(),
      mode: null,
      dl: false,
      hitItem: null,
      originalContent: null,
      changed: false,
    });

    this.on({

      activate() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate() {
        this.remove_path();
        this._scope.hide_selection_bounds();
      },

      mousedown: this.mousedown,

      mouseup: this.mouseup,

      mousedrag: this.mousedrag,

      mousemove: this.mousemove,

      keydown: this.keydown,

    });

  }

  reset_arc(r) {
    const e = r.lastSegment.point;
    this.mode = null;

    r.removeSegments(1);
    r.firstSegment.handleIn = null;
    r.firstSegment.handleOut = null;
    r.lineTo(e);
    r.parent.rays.clear();
    r.parent._row.r = 0;
    r.selected = true;
    r.layer.notify({profiles: [r.parent], points: []}, this._scope.consts.move_points);
  }

  mousedown({modifiers, point}) {

    let b, e, r;

    this.mode = null;
    this.changed = false;

    const {hitItem, hitPoint, dl, project} = this;
    if (dl) {
      if(hitPoint) {
        const {parent} = hitItem.item;

        if(parent.is_linear()) {
          $p.msg.show_msg({
            type: 'alert-info',
            text: `Выделен прямой элемент`,
            title: 'Размерная линия радиуса'
          });
        }
        else {
          // создаём размерную линию
          new Editor.DimensionRadius({
            elm1: parent,
            p1: hitItem.item.getOffsetOf(hitPoint).round(),
            parent: parent.layer.l_dimensions,
            by_curve: modifiers.control || modifiers.shift,
          });
          project.register_change(true);
        }
      }
    }
    else if (hitItem && hitItem.item.parent instanceof Editor.ProfileItem
      && (hitItem.type == 'fill' || hitItem.type == 'stroke')) {

      this.mode = hitItem.item.parent.generatrix;

      if (modifiers.control || modifiers.option){
        // при зажатом ctrl или alt строим правильную дугу

        b = this.mode.firstSegment.point;
        e = this.mode.lastSegment.point;
        r = (b.getDistance(e) / 2) + 0.00001;

        this.do_arc(this.mode, point.arc_point(b.x, b.y, e.x, e.y, r, modifiers.option, false));

        //undo.snapshot("Move Shapes");
        r = this.mode;
        this.mode = null;

      }
      // при зажатом space удаляем кривизну
      else if(modifiers.space) {
        this.reset_arc(r = this.mode);
      }
      else {
        project.deselectAll();
        r = this.mode;
        r.selected = true;
        project.deselect_all_points();
        this.mouseStartPos = point.clone();
        this.originalContent = this._scope.capture_selection_state();
      }

      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        //r.layer.redraw();
        r.parent.attache_wnd(this._scope._acc.elm);
        this.eve.emit("layer_activated", r.layer);
      }, 10);

    }
    else{
      //tool.detache_wnd();
      project.deselectAll();
    }
  }

  mouseup() {

    let item = this.hitItem ? this.hitItem.item : null;

    if(item instanceof Editor.Filling && item.visible) {
      item.attache_wnd(this._scope._acc.elm);
      item.selected = true;

      if(item.selected && item.layer) {
        this.eve.emit('layer_activated', item.layer);
      }
    }

    if(this.mode) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if(this.mode) {
          this.mode.parent.attache_wnd(this._scope._acc.elm);
          this.eve.emit('layer_activated', this.mode.layer);
        }
      }, 10);
    }

    this._scope.canvas_cursor('cursor-arc-arrow');

  }

  mousedrag({point}) {
    if (this.mode) {
      this.changed = true;
      this._scope.canvas_cursor('cursor-arrow-small');
      this.do_arc(this.mode, point);
    }
  }

  mousemove(event) {
    this.hitTest(event);
    if(this.dl && this.hitPoint) {
      if (!this.path) {
        this.path = new paper.Path.Circle({
          center: this.hitPoint,
          radius: 20,
          fillColor: new paper.Color(0, 0, 1, 0.5),
          guide: true,
        });
      }
      else {
        this.path.position = this.hitPoint;
      }
    }
  }

  keydown(event) {

    const {modifiers, event: {code}} = event;

    // нажатие `R` переключает режим: деформация или ввод размера
    if(code === 'KeyR') {
      event.stop();
      this.dl = !this.dl;
      this.remove_path();
      return;
    }

    const {project} = this._scope;
    if(['Delete', 'NumpadSubtract', 'Backspace'].includes(code)) {
      for(const {parent} of project.selectedItems) {
        if(parent instanceof Editor.DimensionLineCustom) {
          parent.remove();
        }
      }
    }
    else if(project.selectedItems.length === 1) {
      const step = modifiers.shift ? 1 : 10;
      const {parent} = project.selectedItems[0];

      if(parent instanceof Editor.Profile && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
        const {generatrix} = parent;

        if(modifiers.space){
          return this.reset_arc(generatrix);
        }

        const point = generatrix.getPointAt(generatrix.length / 2);
        if('ArrowLeft' === code) {
          this.do_arc(generatrix, point.add(-step, 0));
        }
        else if('ArrowRight' === code) {
          this.do_arc(generatrix, point.add(step, 0));
        }
        else if('ArrowUp' === code) {
          this.do_arc(generatrix, point.add(0, -step));
        }
        else if('ArrowDown' === code) {
          this.do_arc(generatrix, point.add(0, step));
        }

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          parent.attache_wnd(this._scope._acc.elm);
          this.eve.emit('layer_activated', parent.layer);
        }, 100);
      }
    }
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

    element.layer.notify({profiles: [element.parent], points: []}, this._scope.consts.move_points);
  }

  remove_path() {

    if (this.path) {
      this.path.removeSegments();
      this.path.remove();
      this.path = null;
    }
  }

  hitTest({point}) {

    const hitSize = 6;
    this.hitItem = null;

    if(point) {
      if (this.dl) {
        this.hitItem = this.project.hitTest(point, {stroke: true, tolerance: 24});
      }
      this.hitItem = this.project.hitTest(point, {fill: true, stroke: true, selected: true, tolerance: hitSize});
    }
    if(!this.hitItem) {
      this.hitItem = this.project.hitTest(point, {fill: true, stroke: true, tolerance: hitSize});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

      if (this.dl) {
        this.hitPoint = this.hitItem.item.getNearestPoint(point);
        this._scope.canvas_cursor('cursor-arrow-white-point');
      }
      else {
        this._scope.canvas_cursor('cursor-arc');
      }
    }
    else {
      this.remove_path();
      this.hitPoint = null;
      this._scope.canvas_cursor(this.dl ? 'cursor-autodesk' : 'cursor-arc-arrow');
    }

    return true;
  }

  get is_smart_size() {
    return true;
  }

}

Editor.ToolArc = ToolArc;
