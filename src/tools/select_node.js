
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
      wheel: {
        end: this.wheelEnd.bind(this),
        listen: false,
        angle: 0,
      },
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

  mousedown({event, modifiers, point}) {

    const {_scope: {project, consts, eve}, hitItem} = this;

    this.mode = null;
    this.changed = false;
    this.mouseDown = true;

    this.sz_fin();

    if (hitItem && !modifiers.alt) {

      if(hitItem.item instanceof paper.PointText) {
        // && !(hitItem.item instanceof Editor.PathUnselectable)
        if(hitItem.item.parent instanceof Editor.DimensionLine && !hitItem.item.parent.is_disabled()) {
          this.sz_start(hitItem.item.parent);
        }
        return;
      }

      let item = hitItem.item._owner || hitItem.item.parent;
      if(!(item instanceof Editor.BuilderElement) && item.parent) {
        item = item.parent;
      }
      if (modifiers.space) {
        if(item instanceof Editor.Filling) {
          item = item.nearest(point);
          if(project.selected_elements.includes(item)) {
            const nearest = item?.nearest?.();
            if(nearest) {
              item = nearest;
            }
          }
        }
        else {
          const nearest = item?.nearest?.();
          if(nearest) {
            item = nearest;
          }
        }
      }

      if (item && (hitItem.type == 'fill' || hitItem.type == 'stroke')) {

        if(item instanceof Editor.Filling && project._attr.elm_fragment > 0) {
          item.selected = false;
        }
        else {
          if (modifiers.shift) {
            item.selected = !item.selected;
          }
          else {
            project.deselectAll();
            item.selected = true;
          }
          if (item.selected) {
            this.mode = consts.move_shapes;
            project.deselect_all_points();
            this.mouseStartPos = point.clone();
            this.originalContent = this._scope.capture_selection_state();

            if(item.layer){
              eve.emit("layer_activated", item.layer);
            }
          }
        }

      }
      else if (hitItem.type == 'segment') {
        if (modifiers.shift) {
          hitItem.segment.selected = !hitItem.segment.selected;
        }
        else {
          if (!hitItem.segment.selected){
            project.deselect_all_points();
            project.deselectAll();
          }
          hitItem.segment.selected = true;
        }
        if (hitItem.segment.selected) {
          this.mode = consts.move_points;
          this.mouseStartPos = point.clone();
          this.originalContent = this._scope.capture_selection_state();
        }
      }
      else if (hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        this.mode = consts.move_handle;
        this.mouseStartPos = point.clone();
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
      if(item instanceof Editor.ProfileItem || item instanceof Editor.Filling){
        item.attache_wnd(this._scope._acc.elm);
        eve.emit_async('elm_activated', item);
        this.profile = item;
      }

      this._scope.clear_selection_bounds();

    }
    else if (hitItem && modifiers.alt) {
      project.deselectAll();
      const {layer} = hitItem.item;
      layer.activate();
      eve.emit('elm_activated', layer);
    }
    else {
      // Clicked on and empty area, engage box select.
      this.mouseStartPos = point.clone();
      this.mode = 'box-select';

      if(!modifiers.shift && this.profile){
        this.profile.detache_wnd();
        eve.emit_async('elm_activated', null);
        delete this.profile;
      }

    }
  }

  mouseup({modifiers, point}) {

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

      const box = new paper.Rectangle(this.mouseStartPos, point);

      if (!modifiers.shift){
        project.deselectAll();
      }

      // при зажатом ctrl добавляем элемент иначе - узел
      if (modifiers.control) {

        const profiles = [];
        this._scope.paths_intersecting_rect(box).forEach((path) => {
          if(path.parent instanceof Editor.ProfileItem){
            if(!profiles.includes(path.parent) && !(path.parent instanceof Editor.ProfileParent)){
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
        if (selectedSegments.length) {
          for(const segm of selectedSegments) {
            if(segm.path.parent instanceof Editor.ProfileParent) {
              continue;
            }
            segm.selected = !segm.selected;
          }
        }
        else {
          const profiles = [];
          this._scope.paths_intersecting_rect(box).forEach((path) => {
            if(path.parent instanceof Editor.ProfileItem){
              if(!profiles.includes(path.parent) && !(path.parent instanceof Editor.ProfileParent)){
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

    this.mouseDown = false;
    this.changed && project.register_change(true);
  }

  mousedrag({modifiers, point}) {

    const {project, consts} = this._scope;

    this.changed = true;

    if (this.mode == consts.move_shapes) {
      // this._scope.canvas_cursor('cursor-arrow-small');
      //
      // let delta = point.subtract(this.mouseStartPos);
      // if (!modifiers.shift){
      //   delta = delta.snap_to_angle(Math.PI*2/4);
      // }
      // this._scope.restore_selection_state(this.originalContent);
      // project.move_points(delta, true);
      // this._scope.clear_selection_bounds();
    }
    else if (this.mode == consts.move_points) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = point.subtract(this.mouseStartPos);
      if(!modifiers.shift) {
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta);
      this._scope.purge_selection();
    }
    else if (this.mode == consts.move_handle) {

      const delta = point.subtract(this.mouseStartPos);
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
      this._scope.drag_rect(this.mouseStartPos, point);
    }
  }

  mousewheel(event) {
    const {wheel, wheelEnd, _scope: {project}} = this;
    if(project.rootLayer() instanceof Editor.ContourParent) {
      return;
    }
    const {wheelDelta, shiftKey} = event;
    const {center} = project.bounds;
    const angle = wheelDelta / (shiftKey ? 300 : 60);
    wheel.angle += angle;
    for(const root of project.contours) {
      root.rotate(angle, center);
    }
    project.l_dimensions.rotate(angle, center);
    event.preventDefault();
    if(!wheel.listen) {
      wheel.listen = true;
      this.on('keyup', wheel.end);
    }
  }

  wheelEnd({event}) {
    if(event.code !== 'KeyR') {
      return;
    }
    const {wheel, _scope: {project, _undo}} = this;
    this.off('keyup', wheel.end);
    const init_angle = wheel.angle;
    wheel.angle = 0;
    wheel.listen = false;
    const {center} = project.bounds;
    $p.ui.dialogs.input_value({
      title: 'Поворот изделия',
      text: 'Уточните угол поворота',
      type: 'number',
      initialValue: init_angle,
    })
      .then((angle) => {
        const delta = angle - init_angle;
        if(delta) {
          for (const root of project.contours) {
            root.rotate(delta, center);
          }
          //project.l_dimensions.rotate(delta, center);
        }
        project.save_coordinates({snapshot: true, clipboard: false})
          .then(() => {
            const obx = $p.utils._clone(project.ox._obj);
            project.load_stamp(obx, true);
          });
      })
      .catch(() => {
        for (const root of project.contours) {
          root.rotate(0, center);
        }
        _undo.back();
      });
  }

  keydown(event) {
    const {project} = this._scope;
    const {modifiers, event: {code, target}} = event;
    const step = modifiers.shift ? 1 : 10;
    let j, segment, index, point, handle;

    function move(point) {
      if(project.activeLayer?.kind === 4 && project.selectedItems.some((path) => path instanceof Editor.Filling)) {
        project.activeLayer.move(point);
      }
      else{
        project.move_points(point);
      }
    }

    if ('NumpadAdd,Insert'.includes(code)) {

      for(let path of project.selectedItems){
        // при зажатом space добавляем элемент иначе - узел
        if (modifiers.space) {
          if(path.parent instanceof Editor.Profile && !(path instanceof Editor.ProfileAddl ||
            path instanceof Editor.ProfileGlBead || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)) {

            const cnn_point = path.parent.cnn_point('e');
            cnn_point && cnn_point.profile && cnn_point.profile.rays.clear(true);
            path.parent.rays.clear(true);
            if(path.hasOwnProperty('insert')) {
              delete path.insert;
            }

            point = path.getPointAt(path.length * 0.5);
            const newpath = path.split(path.length * 0.5);
            path.lastSegment.point = path.lastSegment.point.add(newpath.getNormalAt(0).divide(10));
            newpath.firstSegment.point = path.lastSegment.point;
            new Editor.Profile({generatrix: newpath, proto: path.parent});
          }
        }
        else if (modifiers.shift || path.parent instanceof Editor.Sectional) {
          let do_select = false, j;
          if(path.parent instanceof Editor.GeneratrixElement && !(path instanceof Editor.ProfileAddl ||
            path instanceof Editor.ProfileGlBead || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)){
            for (j = 0; j < path.segments.length; j++) {
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
            if(path.parent instanceof Editor.Sectional){
              path.insert(index, new paper.Segment(point));
            }
            else{
              handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point, handle.negate(), handle));
            }
          }
        }
        else if(path.parent instanceof Editor.Profile && !path.parent.segms?.length && !(path instanceof Editor.ProfileAddl ||
          path instanceof Editor.ProfileGlBead || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)) {
          $p.ui.dialogs.input_value({
            title: 'Деление профиля (связка)',
            text: 'Укажите число сегментов',
            type: 'number',
            initialValue: 2,
          })
            .then((res) => {
              path.parent.split_by(res);
            })
            .catch(() => null);
        }
      }

      // Prevent the key event from bubbling
      event.stop();
      return false;


    }
    // удаление сегмента или элемента
    else if (['Delete','NumpadSubtract','Backspace'].includes(code)) {

      if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
        return;
      }

      if (modifiers.space) {
        const profiles = project.selected_profiles(true);
        if(profiles.length === 2) {
          const [p1, p2] = profiles;
          let pt, npp, save, remove, gen;
          if(p1.b.is_nearest(p2.e, 0)) {
            save = p2;
            remove = p1;
            gen = remove.generatrix.clone({insert: false});
            pt = remove.cnn_point('b');
            npp = 'b';
          }
          else if(p1.b.is_nearest(p2.b, 0)) {
            save = p2;
            remove = p1;
            gen = remove.generatrix.clone({insert: false}).reverse();
            pt = remove.cnn_point('e');
            npp = 'e';
          }
          else if(p1.e.is_nearest(p2.b, 0)) {
            save = p1;
            remove = p2;
            gen = remove.generatrix.clone({insert: false});
            pt = remove.cnn_point('e');
            npp = 'e';
          }
          else if(p1.e.is_nearest(p2.e, 0)) {
            save = p1;
            remove = p2;
            gen = remove.generatrix.clone({insert: false}).reverse();
            pt = remove.cnn_point('b');
            npp = 'b';
          }
          else {
            return;
          }
          remove.remove();
          save.generatrix.join(gen);
          const profile = pt.profile;
          const pp = pt.profile_point;
          if(profile && pp) {
            profile.rays.clear(true);
            const cnn = profile.cnn_point(pp);
            cnn.profile = save;
            cnn.profile_point = npp;
          }
          save.rays.clear(true);
          return;
        }
      }

      project.selectedItems.some((path) => {

        let do_select = false;

        if(path.parent instanceof Editor.DimensionLineCustom){
          path.parent.remove();
          return true;
        }
        else if(path.parent instanceof Editor.GeneratrixElement){
          if(path instanceof Editor.ProfileAddl || path instanceof Editor.ProfileGlBead || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment){
            path.remove();
          }
          else{
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              do_select = do_select || segment.selected;
              if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
                path.removeSegment(j);

                // пересчитываем
                  const x1 = path.parent.x1;
                  path.parent.x1 = x1;
                break;
              }
            }
            // если не было обработки узлов - удаляем элемент
            if(!do_select){
              path = path.parent;
              path.remove();
            }
          }
        }
        else if(path instanceof Editor.Filling){
          path.remove_onlays();
        }
      });

      // Prevent the key event from bubbling
      event.stop();
      return false;

    }
    else if (code === 'ArrowLeft') {
      move(new paper.Point(-step, 0));
    }
    else if (code === 'ArrowRight') {
      move(new paper.Point(step, 0));
    }
    else if (code === 'ArrowUp') {
      move(new paper.Point(0, -step));
    }
    else if (code === 'ArrowDown') {
      move(new paper.Point(0, step));
    }
    else if (code === 'KeyV') {
      project.zoom_fit();
      project.view.update();
    }
  }

  testHot(type, event, mode) {
    if (mode == 'tool-direct-select'){
      return this.hitTest(event);
    }
  }

  hitTest({point}) {

    const tolerance = 12;
    const {project} = this._scope;
    this.hitItem = null;

    if (point) {

      // отдаём предпочтение выделенным ранее элементам
      this.hitItem = project.hitTest(point, {selected: true, fill: true, stroke: true, tolerance});

      // во вторую очередь - тем элементам, которые не скрыты
      if (!this.hitItem){
        this.hitItem = project.hitTest(point, {visible: true, fill: true, stroke: true, tolerance});
      }

      // Hit test selected handles
      let hit = project.hitTest(point, {selected: true, handles: true, tolerance});
      if (hit){
        this.hitItem = hit;
      }

      // Hit test points
      hit = project.hitPoints(point, 18, true);

      if (hit) {
        if (hit.item.parent instanceof Editor.ProfileItem) {
          if (hit.item.parent.generatrix === hit.item){
            this.hitItem = hit;
          }
          else if(hit.item.parent instanceof Editor.ProfileCut) {
            this.hitItem = hit;
            hit.item = hit.item.parent.generatrix;
            hit.segment = hit.item.firstSegment.point.is_nearest(hit.point, true) ? hit.item.firstSegment : hit.item.lastSegment;
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

        if (hitItem.item.parent instanceof Editor.DimensionLine) {
          // размерные линии сами разберутся со своими курсорами
        }
        else if (hitItem.item instanceof Editor.TextUnselectable || hitItem.item.parent instanceof Editor.ProfileCut) {
          this._scope.canvas_cursor('cursor-profile-cut');     // сечение
        }
        else if (hitItem.item instanceof paper.PointText) {
          !(hitItem.item instanceof Editor.EditableText) && this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
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
      if (hit && hit.item.parent instanceof Editor.Sectional){
        this.hitItem = hit;
        this._scope.canvas_cursor('cursor-arrow-white-shape');
      }
      else{
        this._scope.canvas_cursor('cursor-arrow-white');
      }
    }

    return true;
  }

  div_by_pos() {
    const {profile: {children, size, pos}, project: {view}} = this;
    const point = view.projectToView(children.text.bounds.center);
    const tip = 'Установить размер сдвигом элементов ';
    const div = this.div = document.createElement('DIV');
    div.classList.add('sz_div');
    if(pos === 'left' || pos === 'right') {
      div.innerHTML = `<div id="sz_btn_top" class="sz_btn tb_align_vert" title="${tip}сверху"></div>
<input class="sz_input" type="number" step="10" value="${size.toFixed()}"/>
<div id="sz_btn_bottom" class="sz_btn tb_align_vert" title="${tip}снизу"></div>
<div id="sz_btn_rateably" class="sz_btn tb_align_vert2" title="${tip}пропорционально"></div>`;
      div.style.top = `${point.y - 37}px`;
      div.style.left = `${point.x - 29}px`;
    }
    else if(pos === 'top' || pos === 'bottom') {
      div.innerHTML = `<div class="sz_div2">
    <div id="sz_btn_left" class="sz_btn tb_align_hor" title="${tip}слева"></div>
    <input class="sz_input" type="number" step="10" value="${size.toFixed()}"/>
    <div id="sz_btn_right" class="sz_btn tb_align_hor" title="${tip}справа"></div>
</div>
<div id="sz_btn_rateably" class="sz_btn tb_align_hor2" title="${tip}пропорционально"></div>`;
      div.style.top = `${point.y - 12}px`;
      div.style.left = `${point.x - 59}px`;
    }
    else {
      div.innerHTML = `<div id="sz_btn_top" class="sz_btn tb_align_vert" title="${tip}сверху"></div>
<div class="sz_div2">
    <div id="sz_btn_left" class="sz_btn tb_align_hor" title="${tip}слева"></div>
    <input class="sz_input" type="number" step="10" value="${size.toFixed()}"/>
    <div id="sz_btn_right" class="sz_btn tb_align_hor" title="${tip}справа"></div>
</div>
<div id="sz_btn_bottom" class="sz_btn tb_align_vert" title="${tip}снизу"></div>`;
      div.style.top = `${point.y - 37}px`;
      div.style.left = `${point.x - 49}px`;
    }
    view.element.parentNode.appendChild(div);
    return div;
  }

  // создаёт поле ввода и кнопки уточнения размера
  sz_start(item) {
    this.sz_fin();
    this.mode = 'sz_start';
    this.profile = item;
    const div = this.div_by_pos();
    const input = this.input = div.querySelector('.sz_input');
    input.focus();
    input.select();
    input.onkeydown = this.sz_keydown.bind(this);
    div.onclick = this.sz_click.bind(this);
  }

  // обработчик клика кнопок размера
  sz_click(ev) {
    const {id} = ev.target;
    if(id?.startsWith('sz_btn')) {
      const {input, profile} = this;
      const attr = {
        wnd: profile,
        size: parseFloat(input.value),
        name: id.substring(7),
      };
      this.sz_fin();
      profile.sizes_wnd(attr);
      const {elm1, elm2} = profile._attr;
      if(!elm1 && !elm2) {
        //this._scope.deffered_zoom_fit();
      }
    }
  }

  // обработчик нажатия кнопок в поле ввода
  sz_keydown(event) {
    const {key, altKey} = event;
    if (key === 'Escape' || key === 'Tab') {
      this.sz_fin();
    }
    else if (key === 'Enter' || (altKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key))) {
      $p.ui.prevent(event);
      const {input, profile} = this;
      const attr = {
        wnd: profile,
        size: parseFloat(input.value),
      };
      switch (key) {
      case 'Enter':
        attr.name = altKey ? 'rateably' : 'auto';
        break;
      case 'ArrowUp':
        attr.name = 'top';
        break;
      case 'ArrowDown':
        attr.name = 'bottom';
        break;
      default:
        attr.name = key.substring(5).toLowerCase();
      }
      this.sz_fin();
      profile.sizes_wnd(attr);
      const {elm1, elm2} = profile._attr;
      if(!elm1 && !elm2) {
        //this._scope.deffered_zoom_fit();
      }
    }
  }

  // при окончании ввода размера, удаляем HTMLElement
  sz_fin() {
    const {div, profile, view, mode} = this;
    if (div) {
      view.element.parentNode.removeChild(div);
      this.div = null;
      this.input = null;
    }
    if (profile instanceof Editor.DimensionLine) {
      this.profile = null;
    }
    if (mode === 'sz_start') {
      this.mode = null;
    }
  }

}

Editor.ToolSelectNode = ToolSelectNode;
