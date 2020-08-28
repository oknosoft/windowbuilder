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
      mouseDown: false,
      mode: null,
      hitItem: null,
      originalContent: null,
      originalHandleIn: null,
      originalHandleOut: null,
      changed: false,
      minDistance: 10,
      dp: $p.dp.builder_pen.create({grid: 50}),
      input: null,
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
    if(this.profile) {
      this.profile.detache_wnd();
      delete this.profile;
    }
  }

  mousedown(event) {

    const {_scope: {PointText, consts, constructor}, hitItem} = this;
    const {shift, space, alt} = event.modifiers;
    const {ProfileItem, Filling, DimensionLine} = constructor;

    this.mode = null;
    this.changed = false;
    const select = [];
    const deselect = [];

    this.sz_fin();

    if(hitItem && !alt) {

      if(hitItem.item instanceof PointText) {
        if(hitItem.item.parent instanceof DimensionLine) {
          this.sz_start(hitItem.item.parent);
        }
        return;
      }

      let item = hitItem.item.parent;
      if(space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if(item && (hitItem.type == 'fill' || hitItem.type == 'stroke')) {
        if(shift) {
          if(item.selected) {
            deselect.push({elm: item.elm, node: null, shift});
          }
          else {
            select.push({elm: item.elm, node: null, shift});
          }
        }
        else {
          deselect.push({elm: null, shift});
          select.push({elm: item.elm, node: null, shift});
        }
        if(select.length) {
          this.mode = consts.move_shapes;
          this.mouseStartPos = event.point.clone();
        }

        if(item.layer) {
          this.eve.emit('layer_activated', item.layer);
        }

      }
      else if(hitItem.type == 'segment') {
        const node = item.generatrix.firstSegment.point.is_nearest(event.point, true) ? 'b' : 'e';
        if(shift) {
          if(hitItem.segment.selected) {
            deselect.push({elm: item.elm, node, shift});
          }
          else {
            select.push({elm: item.elm, node, shift});
          }
        }
        else {
          if(!hitItem.segment.selected) {
            deselect.push({elm: null, shift});
            select.push({elm: item.elm, node, shift});
          }
        }
        if(select.length) {
          this.mode = consts.move_points;
          this.mouseStartPos = event.point.clone();
        }
      }
      else if(hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        this.mode = consts.move_handle;
        this.mouseStartPos = event.point.clone();
        this.originalHandleIn = hitItem.segment.handleIn.clone();
        this.originalHandleOut = hitItem.segment.handleOut.clone();

        /* if (hitItem.type == 'handle-out') {
         this.originalHandlePos = hitItem.segment.handleOut.clone();
         this.originalOppHandleLength = hitItem.segment.handleIn.length;
         } else {
         this.originalHandlePos = hitItem.segment.handleIn.clone();
         this.originalOppHandleLength = hitItem.segment.handleOut.length;
         }
         this.originalContent = capture_selection_state(); // For some reason this does not work!
         */
      }

      // подключаем диадог свойств элемента
      if(item instanceof ProfileItem || item instanceof Filling) {
        item.attache_wnd(this._scope._acc.elm);
        this.profile = item;
      }

      this._scope.clear_selection_bounds();

    }
    else {
      // Clicked on and empty area, engage box select.
      this.mouseStartPos = event.point.clone();
      this.mode = 'box-select';

      if(!shift && this.profile) {
        this.profile.detache_wnd();
        delete this.profile;
      }

    }

    deselect.length && this._scope.cmd('deselect', deselect);
    select.length && this._scope.cmd('select', select);
    //this.originalContent = this._scope.capture_selection_state();
  }

  mouseup(event) {

    const {_scope, project, mover} = this;
    const {consts, Rectangle, constructor} = _scope;
    const {ProfileItem} = constructor;

    if(this.mode == consts.move_shapes) {
      if(this.changed) {
        const vertexes = mover.snap_to_edges({start: this.mouseStartPos, mode: this.mode, event});
        //_scope.restore_selection_state(this.originalContent);
        mover.move_shapes(vertexes);
        project.redraw();
        _scope.clear_selection_bounds();
        //undo.snapshot("Move Shapes");
      }
    }
    else if(this.mode == consts.move_points) {
      if(this.changed) {
        const delta = mover.snap_to_edges({start: this.mouseStartPos, mode: this.mode, event});
        //_scope.restore_selection_state(this.originalContent);
        project.move_points(delta);
        project.redraw();
        project.deselect_all_points();
        //_scope.purge_selection();
        //undo.snapshot("Move Points");
      }
    }
    else if(this.mode == consts.move_handle) {
      if(this.changed) {
        _scope.clear_selection_bounds();
        //undo.snapshot("Move Handle");
      }
    }
    else if(this.mode == 'box-select') {

      const box = new Rectangle(this.mouseStartPos, event.point);

      if(!event.modifiers.shift) {
        project.deselectAll();
      }

      // при зажатом ctrl добавляем элемент иначе - узел
      if(event.modifiers.control) {

        const profiles = [];
        _scope.paths_intersecting_rect(box).forEach((path) => {
          if(path.parent instanceof ProfileItem) {
            if(profiles.indexOf(path.parent) == -1) {
              profiles.push(path.parent);
              path.parent.selected = !path.parent.selected;
            }
          }
          else {
            path.selected = !path.selected;
          }
        });
      }
      else {

        const selectedSegments = _scope.segments_in_rect(box);
        if(selectedSegments.length > 0) {
          for (let i = 0; i < selectedSegments.length; i++) {
            selectedSegments[i].selected = !selectedSegments[i].selected;
          }
        }
        else {
          const profiles = [];
          _scope.paths_intersecting_rect(box).forEach((path) => {
            if(path.parent instanceof ProfileItem) {
              if(profiles.indexOf(path.parent) == -1) {
                profiles.push(path.parent);
                path.parent.selected = !path.parent.selected;
              }
            }
            else {
              path.selected = !path.selected;
            }
          });
        }
      }
    }

    _scope.clear_selection_bounds();

    if(this.hitItem) {
      if(this.hitItem.item.selected || (this.hitItem.item.parent && this.hitItem.item.parent.selected)) {
        _scope.canvas_cursor('cursor-arrow-small');
      }
      else {
        _scope.canvas_cursor('cursor-arrow-white-shape');
      }
    }
  }

  mousedrag(event) {

    const {_scope, project, mover} = this;
    const {consts} = _scope;

    this.changed = true;

    if(this.mode == consts.move_shapes) {
      _scope.canvas_cursor('cursor-arrow-small');
      mover.snap_to_edges({start: this.mouseStartPos, mode: this.mode, event});
    }
    else if(this.mode == consts.move_points) {
      _scope.canvas_cursor('cursor-arrow-small');
      //_scope.purge_selection();
      mover.snap_to_edges({start: this.mouseStartPos, mode: this.mode, event});
    }
    else if(this.mode == consts.move_handle) {

      const delta = event.point.subtract(this.mouseStartPos);
      const noti = {
        type: consts.move_handle,
        profiles: [this.hitItem.item.parent],
        points: []
      };

      if(this.hitItem.type == 'handle-out') {
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

      _scope.purge_selection();
    }
    else if(this.mode == 'box-select') {
      _scope.drag_rect(this.mouseStartPos, event.point);
    }
  }

  keydown(event) {

    const {project, mover, _scope} = this;
    const {Profile, Filling, GeneratrixElement, ProfileAddl, Sectional, DimensionLineCustom} = _scope.constructor;
    const {key, modifiers} = event;
    const step = modifiers.shift ? 1 : 10;
    let j, segment, index, point, handle;

    if(key == '+' || key == 'insert') {

      for (let path of project.selectedItems) {
        // при зажатом space добавляем элемент иначе - узел
        if(modifiers.space) {
          if(path.parent instanceof Profile) {

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
            new Profile({generatrix: newpath, proto: path.parent});
          }
        }
        else {
          let do_select = false;
          if(path.parent instanceof GeneratrixElement && !(path instanceof ProfileAddl)) {
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              if(segment.selected) {
                do_select = true;
                break;
              }
            }
            if(!do_select) {
              j = 0;
              segment = path.segments[j];
              do_select = true;
            }
          }
          if(do_select) {
            index = (j < (path.segments.length - 1) ? j + 1 : j);
            point = segment.curve.getPointAt(0.5, true);
            if(path.parent instanceof Sectional) {
              Path.prototype.insert.call(path, index, new Segment(point));
            }
            else {
              handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
              Path.prototype.insert.call(path, index, new Segment(point, handle.negate(), handle));
            }
          }
        }
      }

      // Prevent the key event from bubbling
      event.stop();
      return false;


    } // удаление сегмента или элемента
    else if(key == '-' || key == 'delete' || key == 'backspace') {

      if(event.event && event.event.target && ['textarea', 'input'].indexOf(event.event.target.tagName.toLowerCase()) != -1) {
        return;
      }

      project.selectedItems.some((path) => {

        let do_select = false;

        if(path.parent instanceof DimensionLineCustom) {
          path.parent.remove();
          return true;
        }
        else if(path.parent instanceof GeneratrixElement) {
          if(path instanceof ProfileAddl) {
            path.removeChildren();
            path.remove();
          }
          else {
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              do_select = do_select || segment.selected;
              if(segment.selected && segment != path.firstSegment && segment != path.lastSegment) {
                path.removeSegment(j);

                // пересчитываем
                const x1 = path.parent.x1;
                path.parent.x1 = x1;
                break;
              }
            }
            // если не было обработки узлов - удаляем элемент
            if(!do_select) {
              path = path.parent;
              path.removeChildren();
              path.remove();
            }
          }
        }
        else if(path instanceof Filling) {
          path.remove_onlays();
        }
      });

      // Prevent the key event from bubbling
      event.stop();
      return false;

    }
    else if(['left', 'right', 'up', 'down'].includes(key)) {
      const profiles = project.selected_profiles();

      if(profiles.length) {
        let delta;
        if(key == 'left') {
          delta = [-step, 0];
        }
        else if(key == 'right') {
          delta = [step, 0];
        }
        else if(key == 'up') {
          delta = [0, -step];
        }
        else if(key == 'down') {
          delta = [0, step];
        }
        this._scope.cmd('move', delta);
        if(event.event) {
          event.event.preventDefault();
          event.event.cancelBubble = true;
        }
      }
      else if(!event.event) {
        $p.ui.dialogs.snack({message: 'Для сдвига профиля, его сначала нужно выделить на эскизе', timeout: 10});
      }
    }
    else if(key == 'escape') {
      this.mode = null;
      mover.hide_move_ribs(true);
      project.deselect_all_points();
    }
  }

  testHot(type, event, mode) {
    if(mode == 'tool-direct-select') {
      return this.hitTest(event);
    }
  }

  hitTest({point}) {

    const hitSize = 6;
    const {project, _scope} = this;
    const canvas_cursor = _scope.canvas_cursor.bind(_scope);
    this.hitItem = null;

    const {ProfileItem, DimensionLine, Sectional, EditableText} = _scope.constructor;

    if(point) {

      // отдаём предпочтение выделенным ранее элементам
      this.hitItem = project.hitTest(point, {selected: true, fill: true, tolerance: hitSize});

      // во вторую очередь - тем элементам, которые не скрыты
      if(!this.hitItem) {
        this.hitItem = project.hitTest(point, {fill: true, visible: true, tolerance: hitSize});
      }

      // Hit test selected handles
      let hit = project.hitTest(point, {selected: true, handles: true, tolerance: hitSize});
      if(hit) {
        this.hitItem = hit;
      }

      // Hit test points
      hit = project.hitPoints(point, 16, true);

      if(hit) {
        if(hit.item.parent instanceof ProfileItem) {
          if(hit.item.parent.generatrix === hit.item) {
            this.hitItem = hit;
          }
        }
        else {
          this.hitItem = hit;
        }
      }
    }

    const {hitItem} = this;
    if(hitItem) {
      if(hitItem.type == 'fill' || hitItem.type == 'stroke') {
        if(hitItem.item.parent instanceof DimensionLine) {
          // размерные линии сами разберутся со своими курсорами
        }
        else if(hitItem.item instanceof _scope.PointText) {
          !(hitItem.item instanceof EditableText) && canvas_cursor('cursor-text');     // указатель с черным Т
        }
        else if(hitItem.item.selected) {
          canvas_cursor('cursor-arrow-small');
        }
        else {
          canvas_cursor('cursor-arrow-white-shape');
        }
      }
      else if(hitItem.type == 'segment' || hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        if(hitItem.segment.selected) {
          canvas_cursor('cursor-arrow-small-point');
        }
        else {
          canvas_cursor('cursor-arrow-white-point');
        }
      }
    }
    else {
      // возможно, выделен разрез
      const hit = project.hitTest(point, {stroke: true, visible: true, tolerance: 16});
      if(hit && hit.item.parent instanceof Sectional) {
        this.hitItem = hit;
        canvas_cursor('cursor-arrow-white-shape');
      }
      else {
        canvas_cursor('cursor-arrow-white');
      }
    }

    return true;
  }

  sz_start(item) {
    this.sz_fin();
    this.mode = 'sz_start';
    this.profile = item;
    const {view} = this.project;
    const point = view.projectToView(item.children.text.bounds.center);
    this.input = document.createElement('INPUT');
    this.input.classList.add('sz_input');
    this.input.style.top = `${point.y - 4}px`;
    this.input.style.left = `${point.x - 16}px`;
    this.input.type = 'number';
    this.input.step = '10';
    this.input.value = item.size;
    view.element.parentNode.appendChild(this.input);
    this.input.focus();
    this.input.select();
    this.input.onkeydown = this.sz_keydown.bind(this);
  }

  sz_keydown({key}) {
    if(key === 'Escape' || key === 'Tab') {
      this.sz_fin();
    }
    else if(key === 'Enter') {
      const {input, profile} = this;
      const attr = {
        wnd: profile,
        size: parseFloat(input.value),
        name: 'auto',
      };
      this.sz_fin();
      profile.sizes_wnd(attr);
    }
  }

  sz_fin() {
    const {input, profile, project, mode, _scope} = this;
    const {DimensionLine} = _scope.constructor;
    if(input) {
      project.view.element.parentNode.removeChild(input);
      this.input = null;
    }
    if(profile instanceof DimensionLine) {
      this.profile = null;
    }
    if(mode === 'sz_start') {
      this.mode = null;
    }
  }
}
