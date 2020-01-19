/**
 * ### Свойства и перемещение узлов элемента
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_select_node
 */

/**
 * ### Свойства и перемещение узлов элемента
 *
 * @class ToolSelectNode
 * @extends ToolElement
 * @constructor
 * @menuorder 51
 * @tooltip Узлы и элементы
 */
class ToolSelectNode extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {
        name: 'select_node',
        wnd: {
          caption: "Свойства элемента",
          height: 380
        }
      },
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      originalHandleIn: null,
      originalHandleOut: null,
      changed: false,
      minDistance: 10
    });

    this.on({

      activate() {
        this.on_activate('cursor-arrow-white');
      },

      deactivate: this.deactivate,

      mousedown: this.mousedown,

      mouseup: this.mouseup,

      mousedrag: this.mousedrag,

      mousemove: this.hitTest,

      keydown: this.keydown,
    });

  }

  deactivate() {
    this._scope.clear_selection_bounds();
    if(this.profile){
      this.profile.detache_wnd();
      delete this.profile;
    }
  }

  mousedown(event) {

    const {project, consts} = this._scope;

    this.mode = null;
    this.changed = false;

    if(event.event && event.event.which && event.event.which > 1){
      //
    }

    if (this.hitItem && !event.modifiers.alt) {

      if(this.hitItem.item instanceof paper.PointText) {
        return;
      }


      let item = this.hitItem.item.parent;
      if (event.modifiers.space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if (item && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

        if (event.modifiers.shift) {
          item.selected = !item.selected;
        } else {
          project.deselectAll();
          item.selected = true;
        }
        if (item.selected) {
          this.mode = consts.move_shapes;
          project.deselect_all_points();
          this.mouseStartPos = event.point.clone();
          this.originalContent = this._scope.capture_selection_state();

          if(item.layer){
            this.eve.emit("layer_activated", item.layer);
          }
        }

      }
      else if (this.hitItem.type == 'segment') {
        if (event.modifiers.shift) {
          this.hitItem.segment.selected = !this.hitItem.segment.selected;
        } else {
          if (!this.hitItem.segment.selected){
            project.deselect_all_points();
            project.deselectAll();
          }
          this.hitItem.segment.selected = true;
        }
        if (this.hitItem.segment.selected) {
          this.mode = consts.move_points;
          this.mouseStartPos = event.point.clone();
          this.originalContent = this._scope.capture_selection_state();
        }
      }
      else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
        this.mode = consts.move_handle;
        this.mouseStartPos = event.point.clone();
        this.originalHandleIn = this.hitItem.segment.handleIn.clone();
        this.originalHandleOut = this.hitItem.segment.handleOut.clone();

        /* if (this.hitItem.type == 'handle-out') {
         this.originalHandlePos = this.hitItem.segment.handleOut.clone();
         this.originalOppHandleLength = this.hitItem.segment.handleIn.length;
         } else {
         this.originalHandlePos = this.hitItem.segment.handleIn.clone();
         this.originalOppHandleLength = this.hitItem.segment.handleOut.length;
         }
         this.originalContent = capture_selection_state(); // For some reason this does not work!
         */
      }

      // подключаем диадог свойств элемента
      if(item instanceof $p.EditorInvisible.ProfileItem || item instanceof $p.EditorInvisible.Filling){
        item.attache_wnd(this._scope._acc.elm);
        this.profile = item;
      }

      this._scope.clear_selection_bounds();

    } else {
      // Clicked on and empty area, engage box select.
      this.mouseStartPos = event.point.clone();
      this.mode = 'box-select';

      if(!event.modifiers.shift && this.profile){
        this.profile.detache_wnd();
        delete this.profile;
      }

    }
  }

  mouseup(event) {

    const {project, consts} = this._scope;

    if (this.mode == consts.move_shapes) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Shapes");
      }
    }
    else if (this.mode == consts.move_points) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Points");
      }
    }
    else if (this.mode == consts.move_handle) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Handle");
      }
    }
    else if (this.mode == 'box-select') {

      const box = new paper.Rectangle(this.mouseStartPos, event.point);

      if (!event.modifiers.shift){
        project.deselectAll();
      }

      // при зажатом ctrl добавляем элемент иначе - узел
      if (event.modifiers.control) {

        const profiles = [];
        this._scope.paths_intersecting_rect(box).forEach((path) => {
          if(path.parent instanceof $p.EditorInvisible.ProfileItem){
            if(profiles.indexOf(path.parent) == -1){
              profiles.push(path.parent);
              path.parent.selected = !path.parent.selected;
            }
          }
          else{
            path.selected = !path.selected;
          }
        });
      }
      else {

        const selectedSegments = this._scope.segments_in_rect(box);
        if (selectedSegments.length > 0) {
          for (let i = 0; i < selectedSegments.length; i++) {
            selectedSegments[i].selected = !selectedSegments[i].selected;
          }
        }
        else {
          const profiles = [];
          this._scope.paths_intersecting_rect(box).forEach((path) => {
            if(path.parent instanceof $p.EditorInvisible.ProfileItem){
              if(profiles.indexOf(path.parent) == -1){
                profiles.push(path.parent);
                path.parent.selected = !path.parent.selected;
              }
            }
            else{
              path.selected = !path.selected;
            }
          });
        }
      }
    }

    this._scope.clear_selection_bounds();

    if (this.hitItem) {
      if (this.hitItem.item.selected || (this.hitItem.item.parent && this.hitItem.item.parent.selected)) {
        this._scope.canvas_cursor('cursor-arrow-small');
      }
      else {
        this._scope.canvas_cursor('cursor-arrow-white-shape');
      }
    }
  }

  mousedrag(event) {

    const {project, consts} = this._scope;

    this.changed = true;

    if (this.mode == consts.move_shapes) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = event.point.subtract(this.mouseStartPos);
      if (!event.modifiers.shift){
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta, true);
      this._scope.clear_selection_bounds();
    }
    else if (this.mode == consts.move_points) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = event.point.subtract(this.mouseStartPos);
      if(!event.modifiers.shift) {
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta);
      this._scope.purge_selection();
    }
    else if (this.mode == consts.move_handle) {

      const delta = event.point.subtract(this.mouseStartPos);
      const noti = {
        type: consts.move_handle,
        profiles: [this.hitItem.item.parent],
        points: []
      };

      if (this.hitItem.type == 'handle-out') {
        let handlePos = this.originalHandleOut.add(delta);

        this.hitItem.segment.handleOut = handlePos;
        this.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
      }
      else {
        let handlePos = this.originalHandleIn.add(delta);

        this.hitItem.segment.handleIn = handlePos;
        this.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
      }

      noti.profiles[0].rays.clear();
      noti.profiles[0].layer.notify(noti);

      this._scope.purge_selection();
    }
    else if (this.mode == 'box-select') {
      this._scope.drag_rect(this.mouseStartPos, event.point);
    }
  }

  keydown(event) {

    const {project} = this._scope;
    const {key, modifiers} = event;
    const step = modifiers.shift ? 1 : 10;
    let j, segment, index, point, handle;

    if (key == '+' || key == 'insert') {

      for(let path of project.selectedItems){
        // при зажатом space добавляем элемент иначе - узел
        if (modifiers.space) {
          if(path.parent instanceof $p.EditorInvisible.Profile){

            const cnn_point = path.parent.cnn_point('e');
            cnn_point && cnn_point.profile && cnn_point.profile.rays.clear(true);
            path.parent.rays.clear(true);
            if(path.hasOwnProperty('insert')) {
              delete path.insert;
            }

            point = path.getPointAt(path.length * 0.5);
            const newpath = path.split(path.length * 0.5);
            path.lastSegment.point = path.lastSegment.point.add(newpath.getNormalAt(0));
            newpath.firstSegment.point = path.lastSegment.point;
            new $p.EditorInvisible.Profile({generatrix: newpath, proto: path.parent});
          }
        }
        else{
          let do_select = false;
          if(path.parent instanceof $p.EditorInvisible.GeneratrixElement && !(path instanceof $p.EditorInvisible.ProfileAddl)){
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              if (segment.selected){
                do_select = true;
                break;
              }
            }
            if(!do_select){
              j = 0;
              segment = path.segments[j];
              do_select = true;
            }
          }
          if(do_select){
            index = (j < (path.segments.length - 1) ? j + 1 : j);
            point = segment.curve.getPointAt(0.5, true);
            if(path.parent instanceof $p.EditorInvisible.Sectional){
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point));
            }
            else{
              handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point, handle.negate(), handle));
            }
          }
        }
      }

      // Prevent the key event from bubbling
      event.stop();
      return false;


    } // удаление сегмента или элемента
    else if (key == '-' || key == 'delete' || key == 'backspace') {

      if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
        return;

      project.selectedItems.some((path) => {

        let do_select = false;

        if(path.parent instanceof $p.EditorInvisible.DimensionLineCustom){
          path.parent.remove();
          return true;
        }
        else if(path.parent instanceof $p.EditorInvisible.GeneratrixElement){
          if(path instanceof $p.EditorInvisible.ProfileAddl){
            path.removeChildren();
            path.remove();
          }
          else{
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              do_select = do_select || segment.selected;
              if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
                path.removeSegment(j);

                // пересчитываем
                path.parent.x1 = path.parent.x1;
                break;
              }
            }
            // если не было обработки узлов - удаляем элемент
            if(!do_select){
              path = path.parent;
              path.removeChildren();
              path.remove();
            }
          }
        }
        else if(path instanceof $p.EditorInvisible.Filling){
          path.remove_onlays();
        }
      });

      // Prevent the key event from bubbling
      event.stop();
      return false;

    }
    else if (key == 'left') {
      project.move_points(new paper.Point(-step, 0));
    }
    else if (key == 'right') {
      project.move_points(new paper.Point(step, 0));
    }
    else if (key == 'up') {
      project.move_points(new paper.Point(0, -step));
    }
    else if (key == 'down') {
      project.move_points(new paper.Point(0, step));
    }
  }

  testHot(type, event, mode) {
    if (mode == 'tool-direct-select'){
      return this.hitTest(event);
    }
  }

  hitTest({point}) {

    const hitSize = 6;
    const {project} = this._scope;
    this.hitItem = null;

    if (point) {

      // отдаём предпочтение выделенным ранее элементам
      this.hitItem = project.hitTest(point, {selected: true, fill: true, tolerance: hitSize});

      // во вторую очередь - тем элементам, которые не скрыты
      if (!this.hitItem){
        this.hitItem = project.hitTest(point, {fill: true, visible: true, tolerance: hitSize});
      }

      // Hit test selected handles
      let hit = project.hitTest(point, {selected: true, handles: true, tolerance: hitSize});
      if (hit){
        this.hitItem = hit;
      }

      // Hit test points
      hit = project.hitPoints(point, 16, true);

      if (hit) {
        if (hit.item.parent instanceof $p.EditorInvisible.ProfileItem) {
          if (hit.item.parent.generatrix === hit.item){
            this.hitItem = hit;
          }
        }
        else{
          this.hitItem = hit;
        }
      }
    }

    const {hitItem} = this;
    if (hitItem) {
      if (hitItem.type == 'fill' || hitItem.type == 'stroke') {

        if (hitItem.item.parent instanceof $p.EditorInvisible.DimensionLine) {
          // размерные линии сами разберутся со своими курсорами
        }
        else if (hitItem.item instanceof paper.PointText) {
          !(hitItem.item instanceof $p.EditorInvisible.EditableText) && this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
        }
        else if (hitItem.item.selected) {
          this._scope.canvas_cursor('cursor-arrow-small');
        }
        else {
          this._scope.canvas_cursor('cursor-arrow-white-shape');
        }
      }
      else if (hitItem.type == 'segment' || hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        if (hitItem.segment.selected) {
          this._scope.canvas_cursor('cursor-arrow-small-point');
        }
        else {
          this._scope.canvas_cursor('cursor-arrow-white-point');
        }
      }
    }
    else {
      // возможно, выделен разрез
      const hit = project.hitTest(point, {stroke: true, visible: true, tolerance: 16});
      if (hit && hit.item.parent instanceof $p.EditorInvisible.Sectional){
        this.hitItem = hit;
        this._scope.canvas_cursor('cursor-arrow-white-shape');
      }
      else{
        this._scope.canvas_cursor('cursor-arrow-white');
      }
    }

    return true;
  }

}
