
/**
 * ### Добавление (рисование) профилей
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_pen
 */

/**
 * ### Элементы управления рядом с указателем мыши инструмента `ToolPen`
 *
 * @class PenControls
 * @constructor
 */
class PenControls {

  constructor(tool) {

    const t = this;
    const _cont = this._cont = document.createElement('div');

    this._tool = tool;
    this.mousemove = this.mousemove.bind(this);
    this.create_click = this.create_click.bind(this);

    function input_change() {

      switch(this.name) {

        case 'x':
        case 'y':
          setTimeout(() => {
            tool.emit("mousemove", {
              point: t.point,
              modifiers: {}
            });
          });
          break;

        case 'l':
        case 'a':

          if(!tool.path){
            return false;
          }

          const p = new paper.Point();
          p.length = parseFloat(t._l.value || 0);
          p.angle = parseFloat(t._a.value || 0);
          p.y = -p.y;

          t.mousemove({point: tool.point1.add(p)}, true);

          input_change.call({name: "x"});
          break;
      }
    }

    tool._scope._wrapper.appendChild(_cont);
    _cont.className = "pen_cont";

    tool.project.view.on('mousemove', this.mousemove);

    _cont.innerHTML = "<table><tr><td>x:</td><td><input type='number' name='x' /></td><td>y:</td><td><input type='number' name='y' /></td></tr>" +
      "<tr><td>l:</td><td><input type='number' name='l' /></td><td>α:</td><td><input type='number' name='a' /></td></tr>" +
      "<tr><td colspan='4'><input type='button' name='click' value='Создать точку' /></td></tr></table>";

    this._x = _cont.querySelector("[name=x]");
    this._y = _cont.querySelector("[name=y]");
    this._l = _cont.querySelector("[name=l]");
    this._a = _cont.querySelector("[name=a]");

    this._x.onchange = input_change;
    this._y.onchange = input_change;
    this._l.onchange = input_change;
    this._a.onchange = input_change;

    _cont.querySelector("[name=click]").onclick = this.create_click;

  }

  get point(){
    const {bounds} = this._tool.project,
      x = parseFloat(this._x.value || 0) + (bounds ? bounds.x : 0),
      y = (bounds ? (bounds.height + bounds.y) : 0) - parseFloat(this._y.value || 0);
    return new paper.Point([x, y]);
  }

  blur() {
    const focused = document.activeElement;
    if(focused == this._x) {
      this._x.blur();
    }
    else if(focused == this._y) {
      this._y.blur();
    }
    else if(focused == this._l) {
      this._l.blur();
    }
    else if(focused == this._a) {
      this._a.blur();
    }
  }

  mousemove(event, ignore_pos) {

    const {project: {bounds, view}, profile} = this._tool;

    if(!profile){
      return;
    }

    const pos = ignore_pos || view.projectToView(event.point);

    const {elm_types} = $p.enm;
    //, elm_types.Примыкание
    if([elm_types.Добор, elm_types.Соединитель].includes(profile.elm_type)) {
      this._cont.style.display = 'none';
      return;
    }
    else{
      this._cont.style.display = "";
    }

    if (!ignore_pos) {
      this._cont.style.top = pos.y + 16 + "px";
      this._cont.style.left = pos.x - 20 + "px";

    }

    if (bounds) {
      this._x.value = (event.point.x - bounds.x).toFixed(0);
      this._y.value = (bounds.height + bounds.y - event.point.y).toFixed(0);

      if (!ignore_pos) {

        if (this._tool.path) {
          this._l.value = this._tool.point1.getDistance(this.point).round(1);
          const p = this.point.subtract(this._tool.point1);
          p.y = -p.y;
          let angle = p.angle;
          if (angle < 0){
            angle += 360;
          }
          this._a.value = angle.round(1);
        }
        else {
          this._l.value = 0;
          this._a.value = 0;
        }
      }
    }
  }

  create_click() {
    setTimeout(() => {
      this._tool.emit('mousedown', {
        modifiers: {}
      });
      setTimeout(() => {
        this._tool.emit('mouseup', {
          point: this.point,
          modifiers: {}
        });
      });
    });
  }

  unload() {
    const {_scope} = this._tool;
    _scope.project.view.off('mousemove', this.mousemove);
    _scope._wrapper.removeChild(this._cont);
    this._cont = null;
  }

}


/**
 * ### Добавление (рисование) профилей
 *
 * @class ToolPen
 * @extends ToolElement
 * @constructor
 * @menuorder 54
 * @tooltip Рисование
 */
class ToolPen extends ToolElement {

  constructor() {

    super();

    Object.assign(this, {
      options: {
        name: 'pen',
        wnd: {
          caption: 'Новый сегмент профиля',
          width: 320,
          height: 320,
          allow_close: true,
          bind_generatrix: true,
          bind_node: false,
          bind_sys: false,
          inset: '',
          clr: ''
        }
      },
      point1: new paper.Point(),
      last_profile: null,
      mode: null,
      hitItem: null,
      originalContent: null,
      start_binded: false,
      activeLayers: new Set(),
    });

    this.on({
      activate: this.on_activate,
      deactivate: this.on_deactivate,
      mousedown: this.on_mousedown,
      mouseup: this.on_mouseup,
      mousemove: this.on_mousemove,
      keydown: this.on_keydown,
    });

    this.scheme_changed = this.scheme_changed.bind(this);
    this.layer_activated = this.layer_activated.bind(this);

    this.activeLayers.expand = function (profiles, l_connective) {
      const {length} = profiles;
      const profile = profiles[0];
      const group = [...profiles];
      const {rays, b, e, layer} = profile;
      const {ProfileConnective} = $p.EditorInvisible;
      const sub_path = (profile instanceof ProfileConnective) ?
        profile.generatrix.clone({insert: false}) : rays.outer.get_subpath(b, e);
      let rb = rays.b, re = rays.e;

      for(const curr of profiles) {
        if(this.size > 1) {
          const {b, e, layer} = curr;
          for(const current of this) {
            if(current !== layer && current !== l_connective && current.isInserted()) {
              // ищем близкий профиль того же направления
              for(const profile of current.profiles) {
                if(profile.is_collinear(profile)) {
                  if(profile.b.is_nearest(e, true)) {
                    const pt = profile.rays.outer.getNearestPoint(profile.e);
                    const np = sub_path.getNearestPoint(pt);
                    if(np.is_nearest(sub_path.lastSegment.point)) {
                      sub_path.lastSegment.point = pt;
                      re = profile.rays.e;
                      if(!group.includes(profile)) {
                        group.push(profile);
                      }
                    }
                  }
                  else if(profile.e.is_nearest(b, true)) {
                    const pt = profile.rays.outer.getNearestPoint(profile.b);
                    const np = sub_path.getNearestPoint(pt);
                    if(np.is_nearest(sub_path.firstSegment.point)) {
                      sub_path.firstSegment.point = pt;
                      rb = profile.rays.b;
                      if(!group.includes(profile)) {
                        group.push(profile);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return group.length > profiles.length ? this.expand(group, l_connective) : {sub_path, rb, re};
    };

  }

  // подключает окно редактора
  tool_wnd() {
    const {dp, wsql, enm: {elm_types}, cat, utils} = $p;
    let {project, profile} = this;

    this.sys = project._dp.sys;

    // восстанавливаем сохранённые параметры
    wsql.restore_options('editor', this.options);
    this.options.wnd.on_close = this.on_close;

    // создаём экземпляр обработки
    if(!profile) {
      this.profile = profile = dp.builder_pen.create();
      ['elm_type', 'inset', 'bind_generatrix', 'bind_node', 'bind_sys'].forEach((prop) => {
        if(prop == 'bind_generatrix' || prop == 'bind_node' || this.options.wnd[prop]) {
          profile[prop] = this.options.wnd[prop];
        }
      });

      // если в текущем слое есть профили, выбираем импост
      if(project.activeLayer instanceof Editor.ContourRegion) {
        profile.elm_type = elm_types.Ряд;
      }
      else if((profile.elm_type.empty() || profile.elm_type == elm_types.Рама) &&
        project.activeLayer instanceof Editor.Contour && project.activeLayer.profiles.length) {
        profile.elm_type = elm_types.Импост;
      }
      else if((profile.elm_type.empty() || profile.elm_type == elm_types.Импост) &&
        project.activeLayer instanceof Editor.Contour && !project.activeLayer.profiles.length) {
        profile.elm_type = elm_types.Рама;
      }

      // вставку по умолчанию получаем эмулируя событие изменения типа элемента
      dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

      // параметры отбора для выбора вставок
      profile._metadata('inset').choice_links = [{
        name: ['selection', 'ref'],
        path: [(o, f) => {
          if(utils.is_data_obj(o)){
            return profile.rama_impost.indexOf(o) != -1;
          }
          else{
            let refs = '';
            profile.rama_impost.forEach((o) => {
              if(refs) {
                refs += ', ';
              }
              refs += `'${o.ref}'`;
            });
            return '_t_.ref in (' + refs + ')';
          }
        }]
      }];
    }


    // цвет по умолчанию
    profile.clr = project.clr;



    // дополняем свойства поля цвет отбором по служебным цветам
    cat.clrs.selection_exclude_service(profile._metadata('clr'), this, project);

    this.wnd = {
      wnd_options(opt){
        opt.bind_generatrix = profile.bind_generatrix;
        opt.bind_node = profile.bind_node;
        opt.bind_sys = profile.bind_sys;
      },
      close() {

      }
    };
  }

  on_activate() {

    super.on_activate('cursor-pen-freehand');

    this._controls = new PenControls(this);

    this.tool_wnd();

    // при активации слоя выделяем его в дереве
    this.eve.on("layer_activated", this.layer_activated);

    // при изменении системы, переоткрываем окно доступных вставок
    this.eve.on("scheme_changed", this.scheme_changed);

    this.activeLayers.clear();
    const {activeLayer, l_connective} = this.project;
    if(activeLayer && activeLayer !== l_connective) {
      this.activeLayers.add(activeLayer);
    }

    this.decorate_layers();
  }

  layer_activated(contour, virt) {
    const {_attr} = this.project;
    if(!virt && !_attr._loading && !_attr._snapshot){
      this.decorate_layers();
    }
  }

  scheme_changed(scheme) {
    if(this.sys != scheme._dp.sys){
      delete this.profile._metadata('inset').choice_links;
      this.detache_wnd();
      this.tool_wnd();
    }
  }

  on_deactivate() {
    this._scope.clear_selection_bounds();

    this.eve.off("scheme_changed", this.scheme_changed);
    this.eve.off("layer_activated", this.layer_activated);

    this.decorate_layers(true);

    this.detache_wnd(true);

    if(this.path){
      this.path.removeSegments();
      this.path.remove();
    }
    if(this.group){
      this.group.removeChildren();
      this.group.remove();
    }
    this.path = null;
    this.last_profile = null;
    this.mode = null;

    this._controls.unload();
  }

  on_keydown(event) {
    const {event: {code, target}} = event;
    // удаление сегмента или элемента
    if(['Delete', 'NumpadSubtract', 'Backspace'].includes(code)) {

      if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
        return;
      }

      this.project.selectedItems.forEach((path) => {
        if(path.parent instanceof Editor.ProfileItem){
          path = path.parent;
          if(path instanceof Editor.ProfileConnective) {
            path.move_linked(true);
          }
          path.remove();
        }
      });

      this.mode = null;
      this.path = null;

      event.stop();
      return false;

    }
    else if(code == 'Escape'){
      if(this.path){
        this.path.remove();
        this.path = null;
      }
      this.mode = null;
      this._controls.blur();
    }
  }

  on_mousedown({event}) {
    const {elm_types} = $p.enm;
    const {elm_type} = this.profile;

    if(![elm_types.linking, elm_types.addition_outer].includes(elm_type)) {
      this.project.deselectAll();
    }

    if(event && event.which && event.which > 1){
      return this.on_keydown({event: {code: 'Escape'}});
    }

    this.last_profile = null;

    if([elm_types.addition, elm_types.addition_outer, elm_types.glbead, elm_types.linking, elm_types.adjoining].includes(elm_type)) {
      // для доборов и соединителей, создаём элемент, если есть addl_hit
      if(this.addl_hit) {
      }
    }
    else {
      if(this.mode == 'continue') {
        // для профилей и раскладок, начинаем рисовать
        this.mode = 'create';
        this.start_binded = false;
      }
    }
  }

  on_mouseup({event, modifiers}) {

    const {_scope, addl_hit, profile, project, group, activeLayers} = this;
    const {
      enm: {elm_types},
      EditorInvisible: {Sectional, ProfileAddl, ProfileAddlOuter, ProfileGlBead, ProfileConnective, Onlay, BaseLine, ProfileCut,
        ProfileAdjoining, Profile, ProfileItem, Filling, Contour}} = $p;

    group?.removeChildren();

    _scope.canvas_cursor('cursor-pen-freehand');

    if(event && event.which && event.which > 1){
      return this.on_keydown({event: {code: 'Escape'}});
    }

    this.check_layer();

    let whas_select;

    if(addl_hit){

      // рисуем доборный профиль
      if(addl_hit.glass && profile.elm_type.is('addition') && !profile.inset.empty()){
        new ProfileAddl({
          generatrix: addl_hit.generatrix,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
      // рисуем штапик
      else if(addl_hit.glass && profile.elm_type.is('glbead') && !profile.inset.empty()){
        const {point, rib, ...other} = addl_hit;
        new ProfileGlBead({
          layer: addl_hit.profile.layer,
          parent: addl_hit.profile.layer.children.profiles,
          proto: profile,
          ...other
        });
      }
      // рисуем соединительный профиль
      else if(profile.elm_type.is('linking') && !profile.inset.empty()){
        const {generatrix} = addl_hit;
        const connective = new ProfileConnective({
          generatrix,
          proto: profile,
          parent: project.l_connective,
        });
        addl_hit.profile._attr._nearest = connective;
        if(addl_hit.profile instanceof ProfileConnective) {
          const normal = generatrix.getNormalAt(generatrix.length / 2).normalize(-connective.d2);
          generatrix.translate(normal);
        }
        connective.clear_joined();
        if(!modifiers.space) {
          project.register_change(true, () => {
            connective.move_linked();
            const nearests = connective.joined_nearests();
            if(nearests.length === 2) {
              const {utils, EditorInvisible: {GeneratrixElement}} = $p;
              utils.sleep(50)
                .then(() => project._ch.length ? utils.sleep(100) : null)
                .then(() => {
                  if(connective.cnn_side(nearests[0]) !== connective.cnn_side(nearests[1])) {
                    const rama =  nearests.find(profile => profile.is_collinear(connective, 1, false));
                    const db = generatrix.getNearestPoint(rama.corns(1)).subtract(rama.b);
                    const de = generatrix.getNearestPoint(rama.corns(2)).subtract(rama.e);
                    if(db.length > 1 || de.length > 1) {
                      db.length > 1 && GeneratrixElement.prototype.move_points.call(connective, db, false, null, [generatrix.firstSegment]);
                      de.length > 1 && GeneratrixElement.prototype.move_points.call(connective, de, false, null, [generatrix.lastSegment]);
                      connective.redraw();
                    }
                  }
                });
            }
          });
        }
      }
      // добор снаружи
      else if(profile.elm_type.is('addition_outer') && !profile.inset.empty()) {
        const adjoining = new ProfileAddlOuter({
          generatrix: addl_hit.generatrix,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
      // примыкание
      else if(profile.elm_type.is('adjoining')) {
        const adjoining = new ProfileAdjoining({
          b: addl_hit.b,
          e: addl_hit.e,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
    }
    else if(this.mode == 'create' && this.path) {

      if (this.path.length < _scope.consts.sticking){
        return;
      }

      switch (profile.elm_type) {
      case elm_types.Раскладка:
        // находим заполнение под линией
        const {length} = this.path;
        const pt1 = this.path.getPointAt(length * 0.1);
        const pt2 = this.path.getPointAt(length * 0.9);
        project.activeLayer.glasses(false, true).some((glass) => {
          if(glass.contains(pt1) && glass.contains(pt2)){
            new Onlay({
              generatrix: this.path,
              proto: profile,
              parent: glass
            });
            this.path = null;
            return true;
          }
        });
        if(this.path) {
          this.path.remove();
          this.path = null;
        }
        break;

      case elm_types.Водоотлив:
        // рисуем разрез
        this.last_profile = new Sectional({
          generatrix: this.path,
          layer: project.activeLayer,
          parent: project.activeLayer?.children?.sectionals,
          proto: profile
        });
        break;

      case elm_types.Линия:
        // рисуем линию
        this.last_profile = new BaseLine({
          generatrix: this.path,
          layer: project.l_connective,
          parent: project.l_connective,
          proto: profile});
        break;

      case elm_types.Сечение:
        // рисуем линию
        this.last_profile = new ProfileCut({
          generatrix: this.path,
          layer: project.l_connective,
          parent: project.l_connective,
          proto: profile
        });
        break;

      case elm_types.tearing:
        // рисуем разрыв заполнения
        const tearing = Contour.create({
          kind: 4,
          layer: this.hitItem.item.layer,
          parent: this.hitItem.item.parent.children?.tearings,
          project,
        });
        tearing.initialize({
          parent: this.hitItem.item.parent,
          inset: profile.inset,
          clr: profile.clr,
          path: this.path,
        });
        this.path.remove();
        break;

      default: {
        // рисуем профиль
        const {activeLayer} = project;
        this.last_profile = new activeLayer.ProfileConstructor({
          generatrix: this.path,
          layer: activeLayer,
          parent: activeLayer?.children?.profiles,
          proto: profile,
        });
      }
      }

      this.path = null;

      if(profile.elm_type == elm_types.Рама){
        setTimeout(() => {
          if(this.last_profile){
            this._controls.mousemove({point: this.last_profile.e}, true);
            this.last_profile = null;
            this._controls.create_click();
            this.project.activeLayer.on_sys_changed();
          }
        }, 40);
      }
    }
    else if (modifiers.shift || modifiers.control || modifiers.option) {

      if(!this.hitItem?.item) {
        this.hitItem = project.hitTest(this._downPoint, { fill:true, visible: true, tolerance: 20 });
      }

      if(this.hitItem?.item) {
        let item = this.hitItem.item.parent;
        if(modifiers.space && item.nearest && item.nearest()) {
          item = item.nearest();
        }

        if(modifiers.shift || modifiers.control) {
          item.selected = !item.selected;
        }
        else {
          project.deselectAll();
          this.activeLayers.clear();
          item.selected = true;
        }

        // TODO: Выделяем элемент, если он подходящего типа
        if(item instanceof ProfileItem && item.isInserted()) {
          item.attache_wnd(_scope._acc.elm);
          whas_select = true;
          this._controls.blur();
        }
        else if(item instanceof Filling && item.visible) {
          item.attache_wnd(_scope._acc.elm);
          whas_select = true;
          this._controls.blur();
        }

        if(item.layer){
          if(item.selected) {
            if(!profile.elm_type.is('linking') && !profile.elm_type.is('addition_outer')) {
              this.activeLayers.clear();
            }
            this.activeLayers.add(item.layer);
            item.layer.activate(true);
          }
          else {
            this.activeLayers.delete(item.layer);
          }
          this.decorate_layers();
        }
      }

    }

    if(!whas_select && !this.mode && !addl_hit) {

      this.mode = 'continue';
      this.point1 = this._controls.point;

      if (!this.path){
        this.path = new paper.Path({
          strokeColor: 'black',
          segments: [this.point1]
        });
        this.currentSegment = this.path.segments[0];
        this.originalHandleIn = this.currentSegment.handleIn.clone();
        this.originalHandleOut = this.currentSegment.handleOut.clone();
        this.currentSegment.selected = true;
      }
      this.start_binded = false;
      return;

    }

    if(this.path) {
      this.path.remove();
      this.path = null;
    }
    this.mode = null;
  }

  on_mousemove(event) {

    const {project, _scope, profile, activeLayers} = this;

    // если соединитель или добор снаружи, активируем корневой слой
    const {elm_type} = profile;
    if(project.activeLayer?.layer && (elm_type.is('linking') || elm_type.is('addition_outer'))) {
      while (project.activeLayer.layer) {
        project.activeLayer.layer.activate();
      }
      project.deselectAll();
      activeLayers.clear();
      activeLayers.add(project.activeLayer);
      this.decorate_layers();
    }

    this.hitTest(event);


    if(profile.elm_type.is('tearing')) {
      return;
    }

    const {addl_hit} = this;

    // елси есть addl_hit - рисуем прототип элемента
    if(addl_hit){

      if (!this.path){
        this.path = new paper.Path({
          strokeColor: 'black',
          fillColor: 'white',
          strokeScaling: false,
          guide: true
        });
        this.group = new paper.Group();
      }

      this.path.removeSegments();
      this.group?.removeChildren?.();

      if(addl_hit.glass){
        this.draw_addl();
      }
      else if(addl_hit.b && addl_hit.e){
        this.draw_adj();
      }
      else{
        this.draw_connective();
      }
    }
    else if(this.path){

      if(this.mode){

        let delta = event.point.subtract(this.point1),
          dragIn = false,
          dragOut = false,
          invert = false,
          handlePos;

        if (delta.length < _scope.consts.sticking){
          return;
        }

        if(this.mode == 'create') {
          dragOut = true;
          dragIn = this.currentSegment.index > 0;
        }
        else if(this.mode == 'close') {
          dragIn = true;
          invert = true;
        }
        else if(this.mode == 'continue') {
          dragOut = true;
        }
        else if(this.mode == 'adjust') {
          dragOut = true;
        }
        else if(this.mode == 'join') {
          dragIn = true;
          invert = true;
        }
        else if(this.mode == 'convert') {
          dragIn = true;
          dragOut = true;
        }

        if (dragIn || dragOut) {
          let res, bind = profile.bind_node ? "node_" : "";

          if(profile.bind_generatrix){
            bind += "generatrix";
          }

          if (invert){
            delta = delta.negate();
          }

          if (dragIn && dragOut) {
            handlePos = this.originalHandleOut.add(delta);
            if(!event.modifiers.shift) {
              handlePos = handlePos.snap_to_angle();
            }
            this.currentSegment.handleOut = handlePos;
            this.currentSegment.handleIn = handlePos.negate();

          }
          else if (dragOut) {

            const {elm_types} = $p.enm;

            // при отжатом shift пытаемся привязать точку к узлам или кратно 45
            let bpoint = this.point1.add(delta);
            if(!event.modifiers.shift) {
              if(!bpoint.bind_to_nodes(true, project)){
                bpoint = this.point1.add(delta.snap_to_angle());
              }
            }

            if(this.path.segments.length > 1){
              this.path.lastSegment.point = bpoint;
            }
            else{
              this.path.add(bpoint);
            }

            // попытаемся привязать начало пути к профилям (и или заполнениям - для раскладок) контура
            if(!this.start_binded){

              if(profile.elm_type == elm_types.Раскладка){
                for(const glass of project.activeLayer.glasses(false, true)) {
                  const np = glass.path.getNearestPoint(this.path.firstSegment.point);
                  if(np.getDistance(this.path.firstSegment.point) < _scope.consts.sticking0){
                    this.path.firstSegment.point = this.point1 = np;
                    break;
                  }
                }
              }
              // привязка к узлам для рамы уже случилась - вяжем для импоста
              else if([elm_types.Импост, elm_types.Примыкание].includes(profile.elm_type)){

                res = {distance: Infinity};
                project.activeLayer.profiles.some((element) => {

                  // сначала смотрим на доборы, затем - на сам профиль
                  if(element.children.some((addl) => {
                    if(addl instanceof Editor.ProfileAddl &&
                      project.check_distance(addl, null, res, this.path.firstSegment.point, bind) === false) {
                      this.path.firstSegment.point = this.point1 = res.point;
                      return true;
                    }
                  })) {
                    return true;
                  }
                  else if(project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false) {
                    this.path.firstSegment.point = this.point1 = res.point;
                    return true;
                  }
                });

                this.start_binded = true;
              }
              else {
                const {x, y} = this.path.firstSegment.point;
                this.path.firstSegment.point = this.point1 = new paper.Point((x / 10).round() * 10, (y / 10).round() * 10);
                this.start_binded = true;
              }
            }

            // попытаемся привязать конец пути к профилям (и или заполнениям - для раскладок) контура
            if(profile.elm_type == elm_types.Раскладка){
              for(const glass of project.activeLayer.glasses(false, true)) {
                const np = glass.path.getNearestPoint(this.path.lastSegment.point);
                if(np.getDistance(this.path.lastSegment.point) < _scope.consts.sticking0){
                  this.path.lastSegment.point = this.point1 = np;
                  break;
                }
              }
            }
            else if(profile.elm_type == elm_types.Импост){

              res = {distance: Infinity};
              project.activeLayer.profiles.some((element) => {

                // сначала смотрим на доборы, затем - на сам профиль
                if(element.children.some((addl) => {
                    if(addl instanceof Editor.ProfileAddl &&
                      project.check_distance(addl, null, res, this.path.lastSegment.point, bind) === false){
                      this.path.lastSegment.point = res.point;
                      return true;
                    }
                  })){
                  return true;

                }else if (project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
                  this.path.lastSegment.point = res.point;
                  return true;
                }

              });
            }

            //this.currentSegment.handleOut = handlePos;
            //this.currentSegment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
          }
          else {
            handlePos = this.originalHandleIn.add(delta);
            if(!event.modifiers.shift) {
              handlePos = handlePos.snap_to_angle();
            }
            this.currentSegment.handleIn = handlePos;
            this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
          }
          this.path.selected = true;
        }

      }
      else{
        this.path && this.path.removeSegments();
        this.path && this.path.remove();
        this.path = null;
        this.group && this.group.removeChildren();
        this.group && this.group.remove();
        this.group = null;
      }

      if(event.className != 'ToolEvent') {
        project.register_update();
      }
    }
  }

  draw_adj() {
    const {path, group, addl_hit: {b, e, profile, side}} = this;

    // рисуем внутреннюю часть прототипа пути доборного профиля
    const generatrix = profile.rays[side].get_subpath(e.elm[e.point], b.elm[b.point]);
    path.addSegments(generatrix.segments);
    // const sub_path = generatrix.equidistant(-8);
    // sub_path.reverse();
    // path.addSegments(sub_path.segments);
    // sub_path.removeSegments();
    // sub_path.remove();
    path.closePath();

    group.generatrix = generatrix;
    Editor.ProfileAdjoining.prototype.redraw.call(group, 'compact');
  }

  draw_addl() {

    // находим 2 точки на примыкающем профиле и 2 точки на предыдущем и последующем сегментах
    const {profiles} = this.addl_hit.glass;
    const prev = this.addl_hit.rib==0 ? profiles[profiles.length-1] : profiles[this.addl_hit.rib-1];
    const curr = profiles[this.addl_hit.rib];
    const next = this.addl_hit.rib==profiles.length-1 ? profiles[0] : profiles[this.addl_hit.rib+1];

    const path_prev = prev.outer ? prev.profile.rays.outer : prev.profile.rays.inner;
    const path_curr = curr.outer ? curr.profile.rays.outer : curr.profile.rays.inner;
    const path_next = next.outer ? next.profile.rays.outer : next.profile.rays.inner;

    let p1 = path_curr.intersect_point(path_prev, curr.b),
      p2 = path_curr.intersect_point(path_next, curr.e),
      sub_path = path_curr.get_subpath(p1, p2);

    // рисуем внешнюю часть прототипа пути доборного профиля
    this.path.addSegments(sub_path.segments);

    // завершим рисование прототипа пути доборного профиля
    sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 20));
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();

    // получаем generatrix
    if(!this.addl_hit.generatrix){
      this.addl_hit.generatrix = new paper.Path({insert: false});
    }
    if(!this.profile.elm_type.is('glbead')) {
      p1 = prev.profile.generatrix.getNearestPoint(p1);
      p2 = next.profile.generatrix.getNearestPoint(p2);
    }
    this.addl_hit.generatrix.removeSegments();
    this.addl_hit.generatrix.addSegments(path_curr.get_subpath(p1, p2).segments);

  }

  draw_connective() {

    const {addl_hit, activeLayers, project: {l_connective}} = this;
    if(!addl_hit?.profile) {
      return;
    }

    const {ProfileAddlOuter} = $p.EditorInvisible;

    let {sub_path, rb, re} = activeLayers.expand([addl_hit.profile], l_connective);

    let addls = rb.profile?.addls?.filter(p => p instanceof ProfileAddlOuter);
    if(addls?.length) {
      const {generatrix, width} = addls[0];
      const pt = sub_path.intersect_point(generatrix, sub_path.firstSegment.point, width * 2, null, true);
      if(pt) {
        sub_path.firstSegment.point = pt;
      }
    }
    addls = re.profile?.addls?.filter(p => p instanceof ProfileAddlOuter);
    if(addls?.length) {
      const {generatrix, width} = addls[0];
      const pt = sub_path.intersect_point(generatrix, sub_path.lastSegment.point, width * 2, null, true);
      if(pt) {
        sub_path.lastSegment.point = pt;
      }
    }


    // получаем generatrix
    if(!addl_hit.generatrix){
      addl_hit.generatrix = new paper.Path({insert: false});
    }
    addl_hit.generatrix.removeSegments();
    addl_hit.generatrix.addSegments(sub_path.segments);

    // рисуем внутреннюю часть прототипа пути доборного профиля
    const nom = this.profile.inset.nom();
    let {sizeb} = this.profile.inset;
    if(sizeb === -1100) {
      sizeb = nom.sizeb;
    }
    else if (sizeb === -1200) {
      sizeb = nom.width / 2;
    }
    const width = nom.width < 10 ? 10 : nom.width;
    this.path.addSegments(sub_path.equidistant(width - sizeb).segments);

    // завершим рисование прототипа пути доборного профиля
    if(sizeb) {
      sub_path = sub_path.equidistant(-sizeb);
    }
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();
    this.path.bringToFront();

  }

  hitTest_addl({point}) {

    const hitSize = 16;
    const {project, _scope} = this;

    if (point){
      this.hitItem = project.hitTest(point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.layer == project.activeLayer &&
        this.hitItem.item.parent instanceof Editor.ProfileItem && !(this.hitItem.item.parent instanceof Editor.Onlay)){
        // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        // выясним, с какой стороны примыкает профиль
        if(hit.profile.rays.inner.getNearestPoint(point).getDistance(point, true) <
          hit.profile.rays.outer.getNearestPoint(point).getDistance(point, true)){
          hit.side = 'inner';
        }
        else{
          hit.side = 'outer';
        }

        // бежим по всем заполнениям и находим ребро
        hit.profile.layer.glasses(false, true).some((glass) => {
          return glass.profiles.some((rib, index) => {
            if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)){
              if(hit.side == 'outer' && rib.outer || hit.side == 'inner' && !rib.outer){
                hit.rib = index;
                hit.glass = glass;
                return true;
              }
            }
          });
        });

        if(hit.glass){
          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }

      }
      else if(this.hitItem.item.parent instanceof Editor.Filling){
        // для заполнения, ищем ребро и примыкающий профиль

        // this.addl_hit = this.hitItem;
        // _scope.canvas_cursor('cursor-pen-adjust');

      }else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    } else {

      this.hitItem = project.hitTest(point, { fill:true, visible: true, tolerance: hitSize  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }

  }

  hitTest_addl_outer({point}) {

    const hitSize = 20;
    const {project, _scope} = this;

    if (point){
      const {activeLayer} = project;
      this.hitItem = activeLayer.hitTest(point, ToolPen.root_match(activeLayer));
    }

    if (this.hitItem) {

      let {parent} = this.hitItem.item;
      if(parent instanceof Editor.ProfileItem && !(parent instanceof Editor.Onlay)){
        // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

        while (!(parent instanceof Editor.ProfileAddlOuter) && parent.nearest(true)) {
          parent = parent.nearest(true);
        }
        const hit = {
          point: this.hitItem.point,
          profile: parent
        };

        // выясним, с какой стороны примыкает профиль
        if(hit.profile.rays.inner.getNearestPoint(point).getDistance(point, true) <
          hit.profile.rays.outer.getNearestPoint(point).getDistance(point, true)){
          hit.side = 'inner';
        }
        else{
          hit.side = 'outer';
        }

        // бежим по всем заполнениям и находим ребро
        hit.profile.layer.glasses(false, false).some((glass) => {
          return glass.profiles.some((rib, index) => {
            if(rib instanceof Editor.ProfileItem && rib.nearest(true) === hit.profile) {
              if(hit.side == 'outer' && !hit.profile.is_collinear(rib) || hit.side == 'inner' && hit.profile.is_collinear(rib)){
                hit.rib = index;
                hit.glass = glass;
                return true;
              }
            }
            else if(rib.profile === hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)){
              if(hit.side == 'outer' && rib.outer || hit.side == 'inner' && !rib.outer){
                hit.rib = index;
                hit.glass = glass;
                return true;
              }
            }
          });
        });

        if(hit.glass){
          _scope.canvas_cursor('cursor-pen-freehand');
        }
        else {
          // бежим по соседним слоям - не должно быть примыканий
          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }
      }
      else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    }

  }

  // /builder/e1a5c4d0-1162-11f0-bd8b-6d87a0cb1c56?order=061af830-d7e8-11ef-8735-45ec7a768305
  hitTest_connective({point}) {

    const {project, _scope} = this;

    if (point){
      let rootLayer = project.l_connective;
      this.hitItem = rootLayer.hitTest(point, ToolPen.root_match(rootLayer));
      if(!this.hitItem) {
        for(const layer of this.activeLayers) {
          this.hitItem = layer.hitTest(point, ToolPen.root_match(layer));
          if(this.hitItem) {
            break;
          }
        }
      }
      if(!this.hitItem) {
        rootLayer = project.rootLayer();
        this.hitItem = rootLayer.hitTest(point, ToolPen.root_match(rootLayer));
      }
    }

    if(this.hitItem){
      // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

      const hit = {
        point: this.hitItem.point,
        profile: this.hitItem.item.parent
      };

      // выясним, с какой стороны примыкает профиль
      if(hit.profile.rays.inner.getNearestPoint(point).getDistance(point, true) <
        hit.profile.rays.outer.getNearestPoint(point).getDistance(point, true)){
        hit.side = 'inner';
      }
      else{
        hit.side = 'outer';
      }

      // для соединителей, нас интересуют только внешние рёбра
      if(hit.side == 'outer') {
        this.addl_hit = hit;
        _scope.canvas_cursor('cursor-pen-adjust');
      }

    }
    else{
      _scope.canvas_cursor('cursor-pen-freehand');
    }
  }

  hitTest_adj({point}) {

    const tolerance = 30;
    const {project, _scope} = this;
    const rootLayer = project.rootLayer();

    if(point) {
      this.hitItem = rootLayer.hitTest(point, {stroke: true, curves: true, tolerance});
    }

    if (this.hitItem) {

      if(this.hitItem.item.parent instanceof Editor.Profile){
        // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        // выясним, с какой стороны примыкает профиль
        const {inner, outer} = hit.profile.rays;
        if(inner.getNearestPoint(point).getDistance(point, true) < outer.getNearestPoint(point).getDistance(point, true)) {
          hit.side = 'inner';
        }
        else {
          hit.side = 'outer';
        }

        // бежим по всем заполнениям и находим ребро
        hit.profile.layer.glasses(false, true).some((glass) => {
          return glass.profiles.some((rib, index) => {
            if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)) {
              if(hit.side == 'outer' && rib.outer || hit.side == 'inner' && !rib.outer) {
                hit.glass = glass;
                return true;
              }
            }
          });
        });

        if(!hit.glass){
          const imposts = hit.profile.joined_imposts()[hit.side];
          const {generatrix} = hit.profile;
          const offset = generatrix.getOffsetOf(generatrix.getNearestPoint(hit.point));
          const fin = imposts.length - 1;
          if(fin < 0) {
            hit.b = {elm: hit.profile, point: hit.side === 'inner' ? 'b' : 'e'};
            hit.e = {elm: hit.profile, point: hit.side === 'inner' ? 'e' : 'b'};
          }
          else if(fin === 0) {
            const impost = imposts[0];
            const ioffset = generatrix.getOffsetOf(impost.point);
            if(hit.side === 'inner' && ioffset > offset) {
              hit.b = {elm: hit.profile, point: 'b'};
              hit.e = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
            }
            else if(hit.side === 'outer' && ioffset > offset) {
              hit.b = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'b'};
            }
            else if(hit.side === 'inner' && ioffset < offset) {
              hit.b = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'e'};
            }
            else if(hit.side === 'outer' && ioffset < offset) {
              hit.b = {elm: hit.profile, point: 'e'};
              hit.e = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
            }
          }
          else {
            let i0 = imposts[0];
            let ifin = imposts[fin];
            let offset0 = generatrix.getOffsetOf(i0.point);
            let offsetfin = generatrix.getOffsetOf(ifin.point);
            if(offset0 > offsetfin) {
              [i0, ifin] = [ifin, i0];
              [offset0, offsetfin] = [offset0, offsetfin];
            }
            if(hit.side === 'inner' && offset0 > offset) {
              hit.b = {elm: hit.profile, point: 'b'};
              hit.e = {elm: i0.profile, point: i0.profile.b.is_nearest(i0.point) ? 'b' : 'e'};
            }
            else if(hit.side === 'outer' && offset0 > offset) {
              hit.b = {elm: i0.profile, point: i0.profile.b.is_nearest(i0.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'b'};
            }
            else if(hit.side === 'inner' && offsetfin < offset) {
              hit.b = {elm: ifin.profile, point: ifin.profile.b.is_nearest(ifin.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'e'};
            }
            else if(hit.side === 'outer' && offsetfin < offset) {
              hit.b = {elm: hit.profile, point: 'e'};
              hit.e = {elm: ifin.profile, point: ifin.profile.b.is_nearest(ifin.point) ? 'b' : 'e'};
            }
          }

          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }

      }
      else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    }
    else {
      this.hitItem = project.hitTest(point, { fill:true, visible: true, tolerance  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }
  }

  hitTest_tearing({point}) {
    const tolerance = 16;
    const {project, _scope} = this;

    this.hitItem = point && project.hitTest(point, {fill:true, stroke:false, curves:false, tolerance });
    if (this.hitItem?.item?.parent instanceof Editor.Filling) {
      const rect = new paper.Path.Rectangle({
        center: point,
        size: [240, 240],
        insert: false,
      });
      const intersections = this.hitItem.item?.getIntersections?.(rect);
      if(intersections?.length) {
        this._scope.canvas_cursor('cursor-pen-freehand');
        this.mode = null;
        this.path && this.path.remove();
      }
      else {
        this._scope.canvas_cursor('cursor-pen-adjust');
        this.mode = 'create';
        this.path && this.path.remove();
        this.path = new paper.Path.Rectangle({
          center: point,
          size: [200, 200],
          strokeColor: 'grey',
          strokeWidth: 2,
          strokeScaling: false,
        });
      }
    }
    else {
      this._scope.canvas_cursor('cursor-pen-freehand');
      this.mode = null;
      this.path && this.path.remove();
    }
  }

  hitTest(event) {

    this.addl_hit = null;
    this.hitItem = null;

    const {elm_types} = $p.enm;

    switch (this.profile.elm_type) {
    case elm_types.addition:
    case elm_types.glbead:
      this.hitTest_addl(event);
      break;
    case elm_types.addition_outer:
        this.hitTest_addl_outer(event);
        break;
    case elm_types.linking:
      this.hitTest_connective(event);
      break;
    case elm_types.adjoining:
      this.hitTest_adj(event);
      break;
    case elm_types.tearing:
        this.hitTest_tearing(event);
        break;
    default:
      const hitSize = 6;

      if (event.point){
        this.hitItem = this.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
      }

      if(!this.hitItem){
        this.hitItem = this.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      }

      if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
        && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
        this._scope.canvas_cursor('cursor-pen-adjust');
      }
      else {
        this._scope.canvas_cursor('cursor-pen-freehand');
      }
    }

    return true;
  }

  /**
   * ### Добавление типовой формы
   *
   * @param [name] {String} - имя типовой формы
   */
  standard_form(name) {
    if(this['add_' + name]) {
      this['add_' + name](this.project.bounds);
      this.project.zoom_fit();
    }
    else {
      name !== 'standard_form' && $p.msg.show_not_implemented();
    }
  }

  /**
   * ### Добавляет последовательность профилей
   * @param {Array} points
   */
  add_sequence(points) {
    const profiles = [];
    const {profile, project} = this;
    const {activeLayer: layer} = project;
    points.forEach((segments) => {
      profiles.push(new Editor.Profile({
        generatrix: new paper.Path({
          strokeColor: 'black',
          segments: segments
        }),
        layer,
        parent: layer?.children?.profiles,
        proto: profile
      }));
    });
    profile.bind_sys && layer?.on_sys_changed(true);
    project.register_change(true, () => {
      layer?.on_sys_changed();
    });
    return profiles;
  }

  /**
   * Рисует квадрат
   * @param bounds
   */
  add_square(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle1
   * @param bounds
   */
  add_triangle1(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle2
   * @param bounds
   */
  add_triangle2(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle3
   * @param bounds
   */
  add_triangle3(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -500])],
      [point.add([500, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует semicircle1
   * @param bounds
   */
  add_semicircle1(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Полугкуг сверху',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[0].arc_h = r;
      });
  }

  /**
   * Рисует semicircle2
   * @param bounds
   */
  add_semicircle2(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Полугкуг снизу',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[1].arc_h = r;
      });
  }

  /**
   * Рисует circle
   * @param bounds
   */
  add_circle(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Круг из двух сегментов',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[0].arc_h = r;
        profiles[1].arc_h = r;
      });
  }

  /**
   * Рисует circle1
   * @param bounds
   */
  add_circle1(bounds, sign = 1) {
    const {ui, enm, dp} = $p;
    ui.dialogs.input_value({
      title: 'Круг из двух сегментов',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        const d = 2 * r;
        const delta = 10 * sign;
        // находим укорочение
        const vertor = new paper.Point([r, delta]);
        vertor.length = r;

        // находим правую нижнюю точку
        const base = bounds.bottomRight;
        const h = r - vertor.x;
        const point = base.add([0, h]);
        const profiles = this.add_sequence(sign > 0 ?
          [[point, point.add([d, 0])], [point.add([d, 0]), point]] :
          [[point.add([d, 0]), point], [point, point.add([d, 0])]]);
        const segments = sign > 0 ?
          [base.add([d, -delta]), base.add([0, -delta])] :
          [base.add([0, -delta]), base.add([d, -delta])];
        profiles[0].arc_h = r + sign * delta;
        profiles[1].arc_h = r - sign * delta;

        const {profile, project, _scope} = this;
        profile.elm_type = enm.elm_types.impost;
        dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

        const {activeLayer: layer} = project;
        project.register_change(true, () => {
          const impost = new Editor.Profile({
            generatrix: new paper.Path({
              strokeColor: 'black',
              segments,
            }),
            proto: profile,
            layer,
            parent: layer?.children?.profiles,
          });
          project.deselectAll();
          project.zoom_fit();
          impost.insertBelow(profiles[0]);
          impost.insertBelow(profiles[1]);
          _scope.select_tool('select_node');
          setTimeout(() => {
            project.register_change(true, () => {
              impost.selected = true;
              project.move_points(new paper.Point([0, sign]).negate());
              project.move_points(new paper.Point([0, sign]));
            });
          }, 50);
        });
      });
  }

  add_circle2(bounds) {
    this.add_circle1(bounds, -1);
  }

  add_circle4(bounds, sign = 1) {
    const {ui, enm, dp} = $p;
    ui.dialogs.input_value({
      title: 'Круг из двух сегментов',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        const d = -2 * r;
        const delta = 10 * sign;
        // находим укорочение
        const vertor = new paper.Point([delta, r]);
        vertor.length = r;

        // находим правую нижнюю точку
        const base = bounds.topLeft;
        const h = r + vertor.y;
        const point = base.add([-h, 0]);
        const profiles = this.add_sequence(sign > 0 ?
          [[point, point.add([0, d])], [point.add([0, d]), point]] :
          [[point.add([0, d]), point], [point, point.add([0, d])]]);
        profiles[0].arc_h = r - sign * delta;
        profiles[1].arc_h = r + sign * delta;

        const {profile, project, _scope} = this;
        profile.elm_type = enm.elm_types.impost;
        dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

        const {activeLayer: layer} = project;
        project.register_change(true, () => {
          const segments = sign > 0 ?
            [profiles[0].e.add([delta, 0]), profiles[0].b.add([delta, 0])] :
            [profiles[1].e.add([delta, 0]), profiles[1].b.add([delta, 0])];
          const impost = new Editor.Profile({
            generatrix: new paper.Path({
              strokeColor: 'black',
              segments,
            }),
            proto: profile,
            layer,
            parent: layer?.children?.profiles,
          });
          project.deselectAll();
          project.zoom_fit();
          impost.insertBelow(profiles[0]);
          impost.insertBelow(profiles[1]);
          _scope.select_tool('select_node');
          setTimeout(() => {
            project.register_change(true, () => {
              impost.selected = true;
              project.move_points(new paper.Point([sign, 0]).negate());
              project.move_points(new paper.Point([sign, 0]));
            });
          }, 50);
        });
      });
  }

  add_circle3(bounds) {
    this.add_circle4(bounds, -1);
  }

  /**
   * Рисует arc1
   * @param bounds
   */
  add_arc1(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Квадрат и полугкуг сверху',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([0, -r])],
          [point.add([0, -r]), point.add([d, -r])],
          [point.add([d, -r]), point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[1].arc_h = r;
      });
  }

  /**
   * Рисует trapeze1
   * @param bounds
   */
  add_trapeze1(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze2
   * @param bounds
   */
  add_trapeze2(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -750])],
      [point.add([0, -750]), point.add([250, -1000])],
      [point.add([250, -1000]), point.add([750, -1000])],
      [point.add([750, -1000]), point.add([1000, -750])],
      [point.add([1000, -750]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze3
   * @param bounds
   */
  add_trapeze3(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze4
   * @param bounds
   */
  add_trapeze4(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze5
   * @param bounds
   */
  add_trapeze5(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze6
   * @param bounds
   */
  add_trapeze6(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze7
   * @param bounds
   */
  add_trapeze7(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze8
   * @param bounds
   */
  add_trapeze8(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze9
   * @param bounds
   */
  add_trapeze9(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point.add([0, -500]), point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point.add([500, 0])],
      [point.add([500, 0]), point.add([0, -500])]
    ]);
  }

  /**
   * Рисует trapeze10
   * @param bounds
   */
  add_trapeze10(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([500, 0])],
      [point.add([500, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze11
   * @param bounds
   */
  add_trapeze11(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point.add([1600, 0]), point.add([0, 0])],
      [point.add([0, 0]), point.add([420, -890])],
      [point.add([420, -890]), point.add([1180, -890])],
      [point.add([1180, -890]), point.add([1600, 0])]
    ]);
  }

  /**
   * Рисует polygon
   * @param {Object} bounds - Объект, содержащий координаты центра
   */
  add_polygon(bounds) {
    const min_side_length = this.profile.inset?.lmin;// Минимальная допустимая длина стороны
    // Функция для вычисления длины стороны
    const calculatePolygonSide = (radius, numberOfSides) => {
      const centralAngle = Math.PI / numberOfSides;
      return 2 * radius * Math.sin(centralAngle);
    };
    const checkingParameters = (radius, numberOfSides) => {
      const sideLength = calculatePolygonSide(radius, numberOfSides);
      // Проверка, что длина стороны не меньше минимальной
      if (sideLength < min_side_length) {
        $p.ui.dialogs.alert({
          text: `Длина стороны (${sideLength.toFixed(0)} мм) меньше ${min_side_length} мм. Пожалуйста, введите другие значения.`,
        });
        return;
      }
      this.drawRegularPolygon(bounds, numberOfSides, sideLength);
    };
    // Запрос радиуса у пользователя
    $p.ui.dialogs.input_value({
      title: '',
      text: 'Уточните радиус описанной окружности',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        const radius = parseFloat(r); // Используем радиус, введенный пользователем
        if (isNaN(radius) || radius <= 0 || radius >= 3000) {
          $p.ui.dialogs.alert({
            text: 'Некорректный радиус. Пожалуйста, введите положительное число меньше 3000.',
          });
          return;
        }
        // Запрос количества сторон у пользователя
        $p.ui.dialogs.input_value({
          title: '',
          text: 'Уточните количество сторон',
          type: 'number',
          initialValue: 5,
        })
          .then((side) => {
            const numberOfSides = parseInt(side); // Количество сторон многоугольника (целое число)
            if (isNaN(numberOfSides) || numberOfSides < 3) {
              $p.ui.dialogs.alert({
                text: 'Некорректное количество сторон. Пожалуйста, введите число больше или равное 3.',
              });
              return;
            }
            checkingParameters(radius, numberOfSides);
          })
          .catch((error) => {
            $p.ui.dialogs.alert({
              text: 'Ввод количества сторон отменен или произошла ошибка.',
            });
          });
      })
      .catch((error) => {
        $p.ui.dialogs.alert({
          text: 'Ввод радиуса отменен или произошла ошибка.',
        });
      });
  }
  /**
   * Отрисовывает правильный многоугольник
   * @param {Object} bounds - Объект, содержащий координаты центра
   * @param {number} numberOfSides - Количество сторон
   * @param {number} sideLength - Длина стороны
   */
  drawRegularPolygon(bounds, numberOfSides, sideLength) {
    const centerX = bounds.center.x; // Центр по X
    const centerY = bounds.center.y; // Центр по Y
    // Вычисляем радиус описанной окружности по длине стороны
    const radius = sideLength / (2 * Math.sin(Math.PI / numberOfSides));
    // Создаём массив точек для многоугольника
    const points = [];
    for (let i = 0; i < numberOfSides; i++) {
      const angle = (2 * Math.PI * i) / numberOfSides; // Угол в радианах
      const x = centerX + radius * Math.cos(angle); // Координата X
      const y = centerY + radius * Math.sin(angle); // Координата Y
      points.push([x, y]); // Добавляем точку в массив
    }
    // Отрисовываем многоугольник
    this.add_sequence(points.map((point, index) => {
      const nextPoint = points[(index + 1) % numberOfSides]; // Следующая точка
      return [point, nextPoint]; // Линия между текущей и следующей точкой
    }));
  }

  /**
   * Делает полупрозрачными элементы неактивных контуров
   * @param reset
   */
  decorate_layers(reset) {
    const {project: {activeLayer}, profile: {elm_type}, activeLayers} = this;
    const isLinking = elm_type.is('linking') || elm_type.is('addition_outer');
    this.project.getItems({class: Editor.Contour}).forEach((layer) => {
      layer.opacity = (reset || (isLinking ? activeLayers.has(layer) : layer === activeLayer)) ? 1 : 0.4;
    });
  }

  static root_match(layer) {
    return {
      stroke:true,
      curves:true,
      tolerance: 20,
      match(hit) {
        const {parent} = hit.item;
        if(parent instanceof Editor.ProfileItem && !(parent instanceof Editor.Onlay)){
          return parent.layer === layer;
        }
      },
    };
  }

}

Editor.ToolPen = ToolPen;
