
/**
 * ### Вставка раскладок и импостов
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_lay_impost
 */

/**
 * ### Вставка раскладок и импостов
 *
 * @class ToolLayImpost
 * @extends ToolElement
 * @constructor
 * @menuorder 55
 * @tooltip Импосты и раскладки
 */
class ToolLayImpost extends ToolElement {

  constructor() {

    super();

    const tool = Object.assign(this, {
      options: {
        name: 'lay_impost',
        wnd: {
          caption: 'Импосты и раскладки',
          height: 420,
          width: 320,
          allow_close: true,
          region: 'r1',
        },
      },
      mode: null,
      hitItem: null,
      paths: [],
      changed: false,
      confirmed: true,
    });

    // подключает окно редактора
    function tool_wnd() {
      const {dp, wsql, enm} = $p;
      tool.sys = tool._scope.project._dp.sys;

      // создаём экземпляр обработки
      const profile = tool.profile = dp.builder_lay_impost.create();

      // восстанавливаем сохранённые параметры
      wsql.restore_options('editor', tool.options);
      Object.assign(tool.options.wnd, {
        on_close: tool.on_close,
        height: 420,
        width: 320,
      });

      for (let prop in profile._metadata().fields) {
        if (tool.options.wnd.hasOwnProperty(prop))
          profile[prop] = tool.options.wnd[prop];
      }

      // если в текущем слое есть профили, выбираем импост
      if (profile.elm_type.empty()) {
        profile.elm_type = enm.elm_types.impost;
      }

      // вставку по умолчанию получаем эмулируя событие изменения типа элемента
      dp.builder_lay_impost.emit('value_change', {field: 'elm_type'}, profile);

      // выравнивание по умолчанию
      if (profile.align_by_y.empty()) {
        profile.align_by_y = enm.positions.center;
      }
      if (profile.align_by_x.empty()) {
        profile.align_by_x = enm.positions.center;
      }

      // цвет по умолчанию
      if (profile.clr.empty()) {
        profile.clr = tool.project.clr;
      }

      // параметры отбора для выбора цвета
      //tool.choice_links_clr();

      // параметры отбора типа деления
      //tool.choice_params_split();

    }

    this.on({

      activate() {
        this.on_activate('cursor-arrow-lay');
        tool_wnd();
      },

      deactivate: this.deactivate,

      mouseup: this.mouseup,

      mousemove: this.mousemove,
    });

  }

  deactivate() {
    this._scope.clear_selection_bounds();
    this.paths.forEach((p) => p.remove());
    this.paths.length = 0;
    this.detache_wnd();
  }

  mouseup() {

    this._scope.canvas_cursor('cursor-arrow-lay');

    // проверяем существование раскладки
    if(this.profile.elm_type == $p.enm.elm_types.layout && this.hitItem instanceof Editor.Filling && this.hitItem.imposts.length) {
      // если существует, выводим подтверждающее сообщение на добавление
      this.confirmed = false;
      dhtmlx.confirm({
        type: 'confirm',
        text: 'Раскладка уже существует, добавить к имеющейся?',
        title: $p.msg.glass_spec,
        callback: result => {
          // добавляем раскладку, в случае положительного результата
          result && this.add_profiles();
          this.confirmed = true;
        }
      });
    }
    else {
      // в остальных случаях, добавляем профили
      this.add_profiles();
    }

  }

  mousemove(event) {

    if(!this.confirmed) {
      return;
    }

    const {_scope: {consts}, project, profile, hitItem}  = this;
    const {inset_by_y, inset_by_x} = profile;

    this.hitTest(event);

    this.paths.forEach((p) => p.removeSegments());


    if (inset_by_y.empty() && inset_by_x.empty()) {
      return;
    }

    let bounds, gen, hit = !!hitItem;

    if(hit) {
      bounds = (event.modifiers.control || event.modifiers.option || !hitItem.bounds_light) ?
        hitItem.bounds :
        hitItem.bounds_light().expand((inset_by_x || inset_by_y).width(), (inset_by_y || inset_by_x).width());
      gen = hitItem.path;
    }
    else if(profile.w && profile.h) {
      gen = new paper.Path({
        insert: false,
        segments: [[0, 0], [0, -profile.h], [profile.w, -profile.h], [profile.w, 0]],
        closed: true,
      });
      bounds = gen.bounds;
      project.zoom_fit(project.strokeBounds.unite(bounds));

    }
    else {
      return;
    }

    let stepy = profile.step_by_y || (profile.elm_by_y && bounds.height / (profile.elm_by_y + ((hit || profile.elm_by_y < 2) ? 1 : -1))),
      county = profile.elm_by_y > 0 ? profile.elm_by_y.round() : Math.round(bounds.height / stepy) - 1,
      stepx = profile.step_by_x || (profile.elm_by_x && bounds.width / (profile.elm_by_x + ((hit || profile.elm_by_x < 2) ? 1 : -1))),
      countx = profile.elm_by_x > 0 ? profile.elm_by_x.round() : Math.round(bounds.width / stepx) - 1,
      w2x = profile.inset_by_x.nom().width / 2,
      w2y = profile.inset_by_y.nom().width / 2,
      clr = Editor.BuilderElement.clr_by_clr.call(this, profile.clr),
      by_x = [], by_y = [], base, pos, path, i, j;

    const get_path = (segments, b, e) => {
      base++;
      if (base < this.paths.length) {
        path = this.paths[base];
        path.fillColor = clr;
        if(!path.isInserted()) {
          path.parent = hitItem ? hitItem.layer : project.activeLayer;
        }
      }
      else {
        path = new paper.Path({
          strokeColor: 'black',
          fillColor: clr,
          strokeScaling: false,
          guide: true,
          closed: true,
        });
        this.paths.push(path);
      }
      path.addSegments(segments);
      path.b = b.clone();
      path.e = e.clone();
      return path;
    };

    const {positions} = $p.enm;

    function get_points(p1, p2, bind) {

      let res = {
          p1: new paper.Point(p1),
          p2: new paper.Point(p2),
        },
        c1 = gen.contains(res.p1),
        c2 = gen.contains(res.p2);

      if (c1 && c2 && !bind) {
        return res;
      }

      const intersect = gen.getIntersections(new paper.Path({insert: false, segments: [res.p1, res.p2]}));

      if(!intersect.length && bind) {
        const p1 = gen.getNearestPoint(res.p1);
        const p2 = gen.getNearestPoint(res.p2);
        if(p1.getDistance(res.p1) < (consts.sticking0 / 2)) {
          res.p1 = p1;
        }
        if(p2.getDistance(res.p2) < (consts.sticking0 / 2)) {
          res.p2 = p2;
        }
      }

      if (c1 && c2) {
        for(const curr of intersect) {
          const d1 = res.p1.getDistance(curr.point);
          const d2 = res.p2.getDistance(curr.point);
          if(d1 < (consts.sticking0 / 2)) {
            res.p1 = curr.point;
          }
          else if(d2 < (consts.sticking0 / 2)) {
            res.p2 = curr.point;
          }
        }
      }
      else if (c1) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p2 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p2});
      }
      else if (c2) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p1 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p1});
      }
      else if (intersect.length > 1) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p2 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p2});
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p1 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p1});
      }
      else {
        return null;
      }

      return res;
    }

    function do_x() {
      for (i = 0; i < by_x.length; i++) {

        // в зависимости от типа деления, рисуем прямые или разорванные отрезки
        if (!by_y.length || profile.split.empty() || profile.split.is('hor') || profile.split.is('crossing')) {
          const pts = get_points(
            [by_x[i], bounds.bottom],
            [by_x[i], bounds.top],
            i === 0 || (i === by_x.length - 1) || !by_y.length);
          if (pts) {
            get_path([
              [pts.p1.x - w2x, pts.p1.y],
              [pts.p2.x - w2x, pts.p2.y],
              [pts.p2.x + w2x, pts.p2.y],
              [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
          }
        }
        else {
          by_y.sort((a, b) => b - a);
          for (j = 0; j < by_y.length; j++) {
            if (j === 0) {
              const pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]], true);
              if (hit && pts) {
                get_path([
                  [pts.p1.x - w2x, pts.p1.y],
                  [pts.p2.x - w2x, pts.p2.y + w2x],
                  [pts.p2.x + w2x, pts.p2.y + w2x],
                  [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
              }
            }
            else {
              const pts = get_points(
                [by_x[i], by_y[j - 1]],
                [by_x[i], by_y[j]],
                i === 0 || (i === by_x.length - 1) || j === 0 || (j === by_y.length - 1));
              if (pts) {
                get_path([
                  [pts.p1.x - w2x, pts.p1.y - w2x],
                  [pts.p2.x - w2x, pts.p2.y + w2x],
                  [pts.p2.x + w2x, pts.p2.y + w2x],
                  [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
              }
            }
            if (j === by_y.length - 1) {
              const pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top], true);
              if (hit && pts) {
                get_path([
                  [pts.p1.x - w2x, pts.p1.y - w2x],
                  [pts.p2.x - w2x, pts.p2.y],
                  [pts.p2.x + w2x, pts.p2.y],
                  [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
              }
            }
          }
        }
      }
    }

    function do_y() {
      for (i = 0; i < by_y.length; i++) {

        // в зависимости от типа деления, рисуем прямые или разорванные отрезки
        if (!by_x.length || profile.split.empty() || profile.split.is('vert') || profile.split.is('crossing')) {
          const pts = get_points(
            [bounds.left, by_y[i]],
            [bounds.right, by_y[i]],
            i === 0 || (i === by_y.length - 1) || !by_x.length);
          if (pts) {
            get_path([
              [pts.p1.x, pts.p1.y - w2y],
              [pts.p2.x, pts.p2.y - w2y],
              [pts.p2.x, pts.p2.y + w2y],
              [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
          }
        }
        else {
          by_x.sort((a, b) => a - b);
          for (j = 0; j < by_x.length; j++) {
            if (j === 0) {
              const pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]], true);
              if (hit && pts) {
                get_path([
                  [pts.p1.x, pts.p1.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y + w2y],
                  [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
              }
            }
            else {
              const pts = get_points(
                [by_x[j - 1], by_y[i]],
                [by_x[j], by_y[i]],
                i === 0 || (i === by_y.length - 1) || j === 0 || (j === by_x.length - 1));
              if (pts) {
                get_path([
                  [pts.p1.x + w2y, pts.p1.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y + w2y],
                  [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
              }
            }
            if (j === by_x.length - 1) {
              const pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]], true);
              if (hit && pts) {
                get_path([
                  [pts.p1.x + w2y, pts.p1.y - w2y],
                  [pts.p2.x, pts.p2.y - w2y],
                  [pts.p2.x, pts.p2.y + w2y],
                  [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
              }
            }
          }
        }
      }
    }

    if (stepy) {
      if (profile.align_by_y == positions.center) {

        base = bounds.top + bounds.height / 2;
        if (county % 2) {
          by_y.push(base);
        }
        for (i = 1; i < county; i++) {

          if (county % 2)
            pos = base + stepy * i;
          else
            pos = base + stepy / 2 + (i > 1 ? stepy * (i - 1) : 0);

          if (pos + w2y + consts.sticking_l < bounds.bottom)
            by_y.push(pos);

          if (county % 2)
            pos = base - stepy * i;
          else
            pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

          if (pos - w2y - consts.sticking_l > bounds.top)
            by_y.push(pos);
        }

      }
      else if (profile.align_by_y == positions.top) {

        if (hit) {
          for (i = 1; i <= county; i++) {
            pos = bounds.top + stepy * i;
            if (pos + w2y + consts.sticking_l < bounds.bottom)
              by_y.push(pos);
          }
        } else {
          for (i = 0; i < county; i++) {
            pos = bounds.top + stepy * i;
            if (pos - w2y - consts.sticking_l < bounds.bottom)
              by_y.push(pos);
          }
        }

      }
      else if (profile.align_by_y == positions.bottom) {

        if (hit) {
          for (i = 1; i <= county; i++) {
            pos = bounds.bottom - stepy * i;
            if (pos - w2y - consts.sticking_l > bounds.top)
              by_y.push(bounds.bottom - stepy * i);
          }
        } else {
          for (i = 0; i < county; i++) {
            pos = bounds.bottom - stepy * i;
            if (pos + w2y + consts.sticking_l > bounds.top)
              by_y.push(bounds.bottom - stepy * i);
          }
        }
      }
    }

    if (stepx) {
      if (profile.align_by_x == positions.center) {

        base = bounds.left + bounds.width / 2;
        if (countx % 2) {
          by_x.push(base);
        }
        for (i = 1; i < countx; i++) {

          if (countx % 2)
            pos = base + stepx * i;
          else
            pos = base + stepx / 2 + (i > 1 ? stepx * (i - 1) : 0);

          if (pos + w2x + consts.sticking_l < bounds.right)
            by_x.push(pos);

          if (countx % 2)
            pos = base - stepx * i;
          else
            pos = base - stepx / 2 - (i > 1 ? stepx * (i - 1) : 0);

          if (pos - w2x - consts.sticking_l > bounds.left)
            by_x.push(pos);
        }

      }
      else if (profile.align_by_x == positions.left) {

        if (hit) {
          for (i = 1; i <= countx; i++) {
            pos = bounds.left + stepx * i;
            if (pos + w2x + consts.sticking_l < bounds.right)
              by_x.push(pos);
          }
        } else {
          for (i = 0; i < countx; i++) {
            pos = bounds.left + stepx * i;
            if (pos - w2x - consts.sticking_l < bounds.right)
              by_x.push(pos);
          }
        }


      }
      else if (profile.align_by_x == positions.right) {

        if (hit) {
          for (i = 1; i <= countx; i++) {
            pos = bounds.right - stepx * i;
            if (pos - w2x - consts.sticking_l > bounds.left)
              by_x.push(pos);
          }
        } else {
          for (i = 0; i < countx; i++) {
            pos = bounds.right - stepx * i;
            if (pos + w2x + consts.sticking_l > bounds.left)
              by_x.push(pos);
          }
        }
      }
    }

    base = 0;
    if (profile.split.is('vert')) {
      do_y();
      do_x();
    } else {
      do_x();
      do_y();
    }

  }

  hitTest(event) {

    this.hitItem = null;

    // Hit test items.
    if(event.point) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, class: paper.Path});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof Editor.Filling) {
      this._scope.canvas_cursor('cursor-lay-impost');
      this.hitItem = this.hitItem.item.parent;
    }
    else {
      this._scope.canvas_cursor('cursor-arrow-lay');
      this.hitItem = null;
    }

    return true;
  }

  detache_wnd() {
    const {profile, options: {wnd}} = this;
    const {utils, wsql} = $p;
    for (const prop in profile._metadata().fields) {
      if (!prop.includes('step') && !prop.includes('inset') && prop != 'clr' && prop != 'w' && prop != 'h') {
        const val = profile[prop];
        wnd[prop] = utils.is_data_obj(val) ? val.ref : val;
      }
    }
    wsql.save_options('editor', this.options);
    this.profile = null;
  }


  add_profiles() {
    const {profile, project, _scope: {consts}} = this;

    if (profile.inset_by_y.empty() && profile.inset_by_x.empty()) {
      return;
    }

    if (!this.hitItem && (profile.elm_type.is('layout') || !profile.w || !profile.h)) {
      return;
    }

    this.check_layer();

    const layer = this.hitItem ? this.hitItem.layer : this.project.activeLayer;
    const lgeneratics = layer.profiles.map((p) => {
      const {generatrix, elm_type, rays, addls} = p;
      const res = {
        inner: elm_type === $p.enm.elm_types.impost ? generatrix : rays.inner,
        gen: p.nearest() ? rays.outer : generatrix,
      };
      if(addls.length) {
        if(elm_type === $p.enm.elm_types.impost) {

        }
        else {
          res.inner = addls[0].rays.inner;
          res.gen = addls[0].rays.outer;
        }
      }
      return res;
    });
    const nprofiles = [];

    function n1(p) {
      return p.segments[0].point.add(p.segments[3].point).divide(2);
    }

    function n2(p) {
      return p.segments[1].point.add(p.segments[2].point).divide(2);
    }

    function check_inset(inset, pos) {

      const nom = inset.nom();
      const rows = [];

      project._dp.sys.elmnts.each((row) => {
        if (row.nom.nom() == nom) {
          rows.push(row);
        }
      });

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].pos == pos) {
          return rows[i].nom;
        }
      }

      return inset;
    }

    function rectification() {
      // получаем таблицу расстояний профилей от рёбер габаритов
      const ares = [];
      const group = new paper.Group({insert: false});

      function reverce(p) {
        const s = p.segments.map(function (s) {
          return s.point.clone();
        });
        p.removeSegments();
        p.addSegments([s[1], s[0], s[3], s[2]]);
      }

      function by_side(name) {

        ares.sort((a, b) => a[name] - b[name]);

        ares.forEach((p) => {
          if (ares[0][name] == p[name]) {

            let angle = n2(p.profile).subtract(n1(p.profile)).angle.round();

            if (angle < 0) {
              angle += 360;
            }

            if (name == 'left' && angle != 270) {
              reverce(p.profile);
            } else if (name == 'top' && angle != 0) {
              reverce(p.profile);
            } else if (name == 'right' && angle != 90) {
              reverce(p.profile);
            } else if (name == 'bottom' && angle != 180) {
              reverce(p.profile);
            }

            if (name == 'left' || name == 'right') {
              p.profile._inset = check_inset(profile.inset_by_x, $p.enm.positions[name]);
            }
            else {
              p.profile._inset = check_inset(profile.inset_by_y, $p.enm.positions[name]);
            }
          }
        });

      }

      this.paths.forEach((p) => {
        if (p.segments.length) {
          p.parent = group;
        }
      });

      const bounds = group.bounds;

      group.children.forEach((p) => {
        ares.push({
          profile: p,
          left: Math.abs(n1(p).x + n2(p).x - bounds.left * 2),
          top: Math.abs(n1(p).y + n2(p).y - bounds.top * 2),
          bottom: Math.abs(n1(p).y + n2(p).y - bounds.bottom * 2),
          right: Math.abs(n1(p).x + n2(p).x - bounds.right * 2),
        });
      });

      ['left', 'top', 'bottom', 'right'].forEach(by_side);
    }

    // уточним направления путей для витража
    if (!this.hitItem) {
      rectification.call(this);
    }

    this.paths.forEach((p) => {

      let iter = 0, angle, proto = {clr: profile.clr, elm_type: profile.elm_type};

      function do_bind() {

        let correctedp1 = false,
          correctedp2 = false;

        // пытаемся вязать к профилям контура
        for (let {gen, inner} of lgeneratics) {
          if (!correctedp1) {
            const np = inner.getNearestPoint(p.b);
            if(np.getDistance(p.b) < consts.sticking) {
              correctedp1 = true;
              p.b = inner === gen ? np : gen.getNearestPoint(p.b);
            }
          }
          if (!correctedp2) {
            const np = inner.getNearestPoint(p.e);
            if (np.getDistance(p.e) < consts.sticking) {
              correctedp2 = true;
              p.e = inner === gen ? np : gen.getNearestPoint(p.e);
            }
          }
        }

        // если не привязалось - ищем точки на вновь добавленных профилях
        if (!profile.split.is('cross_butt') && (!correctedp1 || !correctedp2)) {
          for (let profile of nprofiles) {
            let np = profile.generatrix.getNearestPoint(p.b);
            if (!correctedp1 && np.getDistance(p.b) < consts.sticking) {
              correctedp1 = true;
              p.b = np;
            }
            np = profile.generatrix.getNearestPoint(p.e);
            if (!correctedp2 && np.getDistance(p.e) < consts.sticking) {
              correctedp2 = true;
              p.e = np;
            }
          }
        }
      }

      p.remove();
      if (p.segments.length) {

        // в зависимости от наклона разные вставки
        angle = p.e.subtract(p.b).angle;
        if ((angle > -40 && angle < 40) || (angle > 180 - 40 && angle < 180 + 40)) {
          proto.inset = p._inset || profile.inset_by_y;
        } else {
          proto.inset = p._inset || profile.inset_by_x;
        }

        if (profile.elm_type == $p.enm.elm_types.layout) {
          nprofiles.push(new Editor.Onlay({
            generatrix: new paper.Path({
              segments: [p.b, p.e],
            }),
            parent: this.hitItem,
            region: profile.region,
            proto: proto,
          }));
        }
        else {

          while (iter < 10) {

            iter++;
            do_bind();
            angle = p.e.subtract(p.b).angle;
            let delta = Math.abs(angle % 90);

            if (delta > 45) {
              delta -= 90;
            }
            if (delta < 0.02) {
              break;
            }
            if (angle > 180) {
              angle -= 180;
            }
            else if (angle < 0) {
              angle += 180;
            }

            if ((angle > -40 && angle < 40) || (angle > 180 - 40 && angle < 180 + 40)) {
              p.b.y = p.e.y = (p.b.y + p.e.y) / 2;
            }
            else if ((angle > 90 - 40 && angle < 90 + 40) || (angle > 270 - 40 && angle < 270 + 40)) {
              p.b.x = p.e.x = (p.b.x + p.e.x) / 2;
            }
            else {
              break;
            }
          }

          // создаём новые профили
          if (p.e.getDistance(p.b) > proto.inset.nom().width) {
            nprofiles.push(new Editor.Profile({
              generatrix: new paper.Path({
                segments: [p.b, p.e],
              }),
              layer,
              parent: layer?.children?.profiles,
              proto: proto,
            }));
          }
        }
      }
    });
    this.paths.length = 0;

    // пытаемся выполнить привязку
    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });
    // и еще раз пересчитываем соединения, т.к. на предыдущем шаге могла измениться геометрия соседей
    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });

    if (!this.hitItem)
      setTimeout(() => this._scope && this._scope.tools[1].activate(), 100);
  }
}

Editor.ToolLayImpost = ToolLayImpost;

