;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Drawer = factory();
  }
}(this, function() {

class EditorInvisible extends paper.PaperScope {

  constructor() {

    super();

    this._undo = {
      clear() {},
      save_snapshot() {},
    };

    this.eve = new (Object.getPrototypeOf($p.md.constructor))();

    consts.tune_paper(this.settings);
  }

  elm(num) {
    return this.project.getItem({class: BuilderElement, elm: num});
  }

  set_text() {
  }

  create_scheme() {
    if(!this._canvas) {
      this._canvas = document.createElement('CANVAS');
      this._canvas.height = 480;
      this._canvas.width = 480;
      this.setup(this._canvas);
    }
    if(this.projects.lengrh && !(this.projects[0] instanceof Scheme)) {
      this.projects[0].remove();
    }
    return new Scheme(this._canvas, this, true);
  }

  unload() {
    this.eve.removeAllListeners();
    const arr = this.projects.concat(this.tools);
    while (arr.length) {
      const elm = arr[0];
      if(elm.unload) {
        elm.unload();
      }
      else if(elm.remove) {
        elm.remove();
      }
      arr.splice(0, 1);
    }
    for(let i in EditorInvisible._scopes) {
      if(EditorInvisible._scopes[i] === this) {
        delete EditorInvisible._scopes[i];
      }
    }
  }

}

$p.EditorInvisible = EditorInvisible;


const AbstractFilling = (superclass) => class extends superclass {

  is_pos(pos) {
    if(this.project.contours.count == 1 || this.parent){
      return true;
    }

    let res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

    if(!res){
      let rect;
      if(pos == "top"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
      }
      else if(pos == "left"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
      }
      else if(pos == "right"){
        rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
      }
      else if(pos == "bottom"){
        rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
      }

      res = !this.project.contours.some((l) => {
        return l != this && rect.intersects(l.bounds);
      });
    }

    return res;
  }

  profiles_by_side(side, profiles) {
    if(!profiles){
      profiles = this.profiles;
    }
    const bounds = {
      left: Infinity,
      top: Infinity,
      bottom: -Infinity,
      right: -Infinity
    };
    const res = {};
    const ares = [];

    function by_side(name) {
      ares.some((elm) => {
        if(elm[name] == bounds[name]){
          res[name] = elm.profile;
          return true;
        }
      })
    }

    if (profiles.length) {
      profiles.forEach((profile) => {
        const {b, e} = profile;
        const x = b.x + e.x;
        const y = b.y + e.y;
        if(x < bounds.left){
          bounds.left = x;
        }
        if(x > bounds.right){
          bounds.right = x;
        }
        if(y < bounds.top){
          bounds.top = y;
        }
        if(y > bounds.bottom){
          bounds.bottom = y;
        }
        ares.push({
          profile: profile,
          left: x,
          top: y,
          bottom: y,
          right: x
        });
      });
      if (side) {
        by_side(side);
        return res[side];
      }

      Object.keys(bounds).forEach(by_side);
    }

    return res;
  }

  get contours() {
    return this.children.filter((elm) => elm instanceof Contour);
  }

  get l_dimensions() {
    const {_attr} = this;
    return _attr._dimlns || (_attr._dimlns = new DimensionDrawer({parent: this}));
  }

  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLineCustom}).forEach((dl) => {
      bounds = bounds.unite(dl.bounds);
    });
    return bounds;
  }

}



class GlassSegment {

  constructor(profile, b, e, outer) {
    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = outer;
    this.segment();
  }

  segment() {

    let gen;

    if (this.profile.children.some((addl) => {

        if (addl instanceof ProfileAddl && this.outer == addl.outer) {

          if (!gen) {
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;


          if (b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)) {
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })) {

      this.segment();
    }

  }

  break_by_angle(nodes, segments, point, offset, curr_profile, segm_profile) {

    const node = nodes.byPoint(point);
    if(!node) {
      return false;
    }

    let tangent = curr_profile.generatrix.getTangentAt(offset);
    if(this.outer) {
      tangent = tangent.negate();
    }

    const angles = [];
    for(const elm of node) {
      if(elm.profile === curr_profile) {
        continue;
      }
      const {generatrix} = elm.profile;
      const ppoint = generatrix.getNearestPoint(point);
      const poffset = generatrix.getOffsetOf(ppoint);
      const ptangent = generatrix.getTangentAt(poffset);
      for(const segm of segments) {
        if(segm.profile === elm.profile && segm.b.is_nearest(ppoint, true)) {
          angles.push({profile: elm.profile, angle: tangent.getDirectedAngle(segm.outer ? ptangent.negate() : ptangent)});
        }
      }
    }
    let angle;
    for(const elm of angles) {
      if(elm.profile === segm_profile && (!angle || elm.angle > angle)) {
        angle = elm.angle;
      }
    }
    if(angle < 0) {
      return true;
    }
    for(const elm of angles) {
      if(elm.profile !== segm_profile && elm.angle > angle) {
        return true;
      }
    }
  }

  has_cnn(segm, nodes, segments) {

    const point = segm.b;
    if(!this.e.is_nearest(point)) {
      return false;
    }

    let curr_profile = this.profile;
    let segm_profile = segm.profile;
    while (curr_profile.parent instanceof ProfileItem) {
      curr_profile = curr_profile.parent;
    }
    while (segm_profile.parent instanceof ProfileItem) {
      segm_profile = segm_profile.parent;
    }

    if(curr_profile.b.is_nearest(point, true)) {
      const by_angle = this.break_by_angle(nodes, segments, point, 0, curr_profile, segm_profile);
      if(by_angle) {
        return false;
      }
      else if(by_angle === undefined || curr_profile.cnn_point('b').profile === segm_profile) {
        return true;
      }
    }

    if(curr_profile.e.is_nearest(point, true)) {
      const by_angle = this.break_by_angle(nodes, segments, point, curr_profile.generatrix.length, curr_profile, segm_profile);
      if(by_angle) {
        return false;
      }
      else if(by_angle === undefined || curr_profile.cnn_point('e').profile === segm_profile) {
        return true;
      }
    }

    if(segm_profile.b.is_nearest(point, true)) {
      const by_angle = segm.break_by_angle(nodes, segments, point, 0, segm_profile, curr_profile)
      if(by_angle) {
        return false;
      }
      else if(by_angle === undefined || segm_profile.cnn_point('b').profile == curr_profile) {
        return true;
      }
    }

    if(segm_profile.e.is_nearest(point, true)) {
      const by_angle = segm.break_by_angle(nodes, segments, point, segm_profile.generatrix.length, segm_profile, curr_profile);
      if(by_angle) {
        return false;
      }
      else if(by_angle === undefined || segm_profile.cnn_point('e').profile == curr_profile) {
        return true;
      }
    }

    return false;

  }

  get _sub() {
    const {sub_path} = this;
    return {
      get b() {
        return sub_path ? sub_path.firstSegment.point : new paper.Point();
      },
      set b(v) {
        sub_path && (sub_path.firstSegment.point = v);
      },
      get e() {
        return sub_path ? sub_path.lastSegment.point : new paper.Point();
      },
      set e(v) {
        sub_path && (sub_path.lastSegment.point = v);
      },
    };
  }
}

class PointMap extends Map {

  byPoint(point) {
    for(const [key, value] of this) {
      if(point.is_nearest(key)) {
        return value.length > 2 && value;
      }
    }
  }
}

class Contour extends AbstractFilling(paper.Layer) {

  constructor(attr) {

    super({parent: attr.parent});

    this._attr = {};

    const {ox, l_connective} = this.project;

    if (attr.row) {
      this._row = attr.row;
    }
    else {
      const {constructions} = ox;
      this._row = constructions.add({parent: attr.parent ? attr.parent.cnstr : 0});
      this._row.cnstr = constructions.aggregate([], ['cnstr'], 'MAX') + 1;
    }

    const {cnstr} = this;
    if (cnstr) {

      const {coordinates} = ox;

      coordinates.find_rows({cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => new Profile({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => new Filling({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: $p.enm.elm_types.Водоотлив}, (row) => new Sectional({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => new FreeText({row, parent: this.l_text}));
    }

    l_connective.bringToFront();

  }

  activate(custom) {
    this.project._activeLayer = this;
    if (this._row) {
      this.notify(this, 'layer_activated', !custom);
      this.project.register_update();
    }
  }

  get area() {
    return (this.bounds.area/1e6).round(3);
  }

  get form_area() {
    let upath;
    this.glasses(false, true).concat(this.profiles).forEach(({path}) => {
      if(upath) {
        upath = upath.unite(path, {insert: false});
      }
      else {
        upath = path.clone({insert: false});
      }
    });
    return (upath.area/1e6).round(3);
  }

  get furn() {
    return this._row.furn;
  }

  set furn(v) {
    if (this._row.furn == v) {
      return;
    }

    this._row.furn = v;

    if (this.direction.empty()) {
      this.project._dp.sys.furn_params.find_rows({
        param: $p.job_prm.properties.direction,
      }, function (row) {
        this.direction = row.value;
        return false;
      }.bind(this._row));
    }

    this._row.furn.refill_prm(this);

    this.project.register_change(true);

    this.notify(this, 'furn_changed');
  }

  glasses(hide, glass_only) {
    return this.children.filter((elm) => {
      if ((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
        if (hide) {
          elm.visible = false;
        }
        return true;
      }
    });
  }

  get fillings() {
    const fillings = [];
    for(const glass of this.glasses()){
      if(glass instanceof Contour){
        fillings.push.apply(fillings, glass.fillings);
      }
      else{
        fillings.push(glass);
      }
    }
    return fillings;
  }

  get glass_contours() {
    const segments = this.glass_segments;
    const nodes = this.count_nodes();
    const res = [];
    let curr, acurr;

    function find_next(curr) {
      if (!curr.anext) {
        curr.anext = [];
        segments.forEach((segm) => {
          if (segm == curr || segm.profile == curr.profile)
            return;
          if (curr.has_cnn(segm, nodes, segments)) {

            if (segments.length < 3 || curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
              curr.anext.push(segm);
          }

        });
      }
      return curr.anext;
    }

    function go_go(segm) {
      const anext = find_next(segm);
      for (const next of anext) {
        if (next === curr) {
          return anext;
        }
        else if (acurr.every((el) => el !== next)) {
          acurr.push(next);
          return go_go(next);
        }
      }
    }

    while (segments.length) {

      curr = segments[0];
      acurr = [curr];
      if (go_go(curr) && acurr.length > 1) {
        res.push(acurr);
      }

      acurr.forEach((el) => {
        const ind = segments.indexOf(el);
        if (ind != -1) {
          segments.splice(ind, 1);
        }
      });
    }

    return res;
  }

  glass_nodes(path, nodes, bind) {
    const curve_nodes = [];
    const path_nodes = [];
    const ipoint = path.interiorPoint.negate();
    let curve, findedb, findede, d, node1, node2;

    if (!nodes) {
      nodes = this.nodes;
    }

    for (let i in path.curves) {
      curve = path.curves[i];

      let d1 = Infinity;
      let d2 = Infinity;
      nodes.forEach((n) => {
        if ((d = n.getDistance(curve.point1, true)) < d1) {
          d1 = d;
          node1 = n;
        }
        if ((d = n.getDistance(curve.point2, true)) < d2) {
          d2 = d;
          node2 = n;
        }
      });

      if (path_nodes.indexOf(node1) == -1)
        path_nodes.push(node1);
      if (path_nodes.indexOf(node2) == -1)
        path_nodes.push(node2);

      if (!bind)
        continue;

      if (node1 == node2)
        continue;
      findedb = false;
      for (let n in curve_nodes) {
        if (curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2) {
          findedb = true;
          break;
        }
      }
      if (!findedb) {
        findedb = this.profile_by_nodes(node1, node2);
        const loc1 = findedb.generatrix.getNearestLocation(node1);
        const loc2 = findedb.generatrix.getNearestLocation(node2);
        if (node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
          curve_nodes.push({
            node1: node2,
            node2: node1,
            profile: findedb,
            out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index,
          });
        else
          curve_nodes.push({
            node1: node1,
            node2: node2,
            profile: findedb,
            out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index,
          });
      }
    }

    this.sort_nodes(curve_nodes);

    return path_nodes;
  }

  glass_recalc() {
    const {glass_contours} = this;      
    const glasses = this.glasses(true); 
    const binded = new Set();

    function calck_rating(glcontour, glass) {

      const {outer_profiles} = glass;

      let crating = 0;

      if (outer_profiles.length) {
        glcontour.some((cnt) => {
          outer_profiles.some((curr) => {
            if (cnt.profile == curr.profile &&
              cnt.b.is_nearest(curr.b) &&
              cnt.e.is_nearest(curr.e)) {
              crating++;
              return true;
            }
          });
          if (crating > 2) {
            return true;
          }
        });
      }
      else {
        const {nodes} = glass;
        glcontour.some((cnt) => {
          nodes.some((node) => {
            if (cnt.b.is_nearest(node)) {
              crating++;
              return true;
            }
          });
          if (crating > 2) {
            return true;
          }
        });
      }

      return crating;

    }

    glasses.forEach((glass) => {
      if (glass.visible) {
        return;
      }
      glass_contours.some((glcontour) => {
        if (binded.has(glcontour)) {
          return;
        }
        if (calck_rating(glcontour, glass) > 2) {
          glass.path = glcontour;
          glass.visible = true;
          if (glass instanceof Filling) {
            glass.redraw();
          }
          binded.add(glcontour);
          return true;
        }
      });
    });

    glass_contours.forEach((glcontour) => {

      if (binded.has(glcontour)) {
        return;
      }

      let rating = 0, glass, crating, cglass, glass_center;

      for (let g in glasses) {

        glass = glasses[g];
        if (glass.visible) {
          continue;
        }

        crating = calck_rating(glcontour, glass);

        if (crating > rating || !cglass) {
          rating = crating;
          cglass = glass;
        }
        if (crating == rating && cglass != glass) {
          if (!glass_center) {
            glass_center = glcontour.reduce((sum, val) => sum.add(val.b), new paper.Point).divide(glcontour.length);
          }
          if (glass_center.getDistance(glass.bounds.center, true) < glass_center.getDistance(cglass.bounds.center, true)) {
            cglass = glass;
          }
        }
      }

      if (cglass || (cglass = this.getItem({class: Filling, visible: false}))) {
        cglass.path = glcontour;
        cglass.visible = true;
        if (cglass instanceof Filling) {
          cglass.redraw();
        }
      }
      else {
        if (glass = this.getItem({class: Filling})) {

        }
        else if (glass = this.project.getItem({class: Filling})) {

        }
        else {

        }
        cglass = new Filling({proto: glass, parent: this, path: glcontour});
        cglass.redraw();
      }
    });
  }

  get glass_segments() {
    const nodes = [];

    function fn_sort(a, b) {
      const da = this.getOffsetOf(a.point);
      const db = this.getOffsetOf(b.point);
      if (da < db) {
        return -1;
      }
      else if (da > db) {
        return 1;
      }
      return 0;
    }

    function push_new(profile, b, e, outer = false) {
      if(b.is_nearest(e, 0)){
        return;
      }
      for(const segm of nodes) {
        if(segm.profile === profile && segm.b.equals(b) && segm.e.equals(e) && segm.outer == outer){
          return;
        }
      }
      nodes.push(new GlassSegment(profile, b, e, outer));
    }

    this.profiles.forEach((p) => {

      const sort = fn_sort.bind(p.generatrix);

      const ip = p.joined_imposts();
      const pb = p.cnn_point('b');
      const pe = p.cnn_point('e');

      const pbg = pb.is_t && pb.profile.d0 ? pb.profile.generatrix.getNearestPoint(p.b) : p.b;
      const peg = pe.is_t && pe.profile.d0 ? pe.profile.generatrix.getNearestPoint(p.e) : p.e;

      if (ip.inner.length) {

        ip.inner.sort(sort);

        if (!pb.is_i && !pbg.is_nearest(ip.inner[0].point)) {
          push_new(p, pbg, ip.inner[0].point);
        }

        for (let i = 1; i < ip.inner.length; i++) {
          push_new(p, ip.inner[i - 1].point, ip.inner[i].point);
        }

        if (!pe.is_i && !ip.inner[ip.inner.length - 1].point.is_nearest(peg)) {
          push_new(p, ip.inner[ip.inner.length - 1].point, peg);
        }

      }
      if (ip.outer.length) {

        ip.outer.sort(sort);

        if (!pb.is_i && !ip.outer[0].point.is_nearest(pbg)) {
          push_new(p, ip.outer[0].point, pbg, true);
        }

        for (let i = 1; i < ip.outer.length; i++) {
          push_new(p, ip.outer[i].point, ip.outer[i - 1].point, true);
        }

        if (!pe.is_i && !peg.is_nearest(ip.outer[ip.outer.length - 1].point)) {
          push_new(p, peg, ip.outer[ip.outer.length - 1].point, true);
        }
      }

      if (!ip.inner.length) {
        if (!pb.is_i && !pe.is_i) {
          push_new(p, pbg, peg);
        }
      }

      if (!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)) {
        if (!pb.is_i && !pe.is_i) {
          push_new(p, peg, pbg, true);
        }
      }
      else if(pb.is_x || pe.is_x) {
        push_new(p, peg, pbg, true);
      }

    });

    return nodes;
  }

  get is_rectangular() {
    return (this.side_count != 4) || !this.profiles.some((profile) => {
      return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 0.2);
    });
  }

  move(delta) {
    const {contours, profiles, project} = this;
    const crays = (p) => p.rays.clear();
    this.translate(delta);
    contours.forEach((elm) => elm.profiles.forEach(crays));
    profiles.forEach(crays);
    project.register_change();
  }

  get nodes() {
    const nodes = [];
    this.profiles.forEach((p) => {
      let findedb;
      let findede;
      nodes.forEach((n) => {
        if (p.b.is_nearest(n)) {
          findedb = true;
        }
        if (p.e.is_nearest(n)) {
          findede = true;
        }
      });
      if (!findedb) {
        nodes.push(p.b.clone());
      }
      if (!findede) {
        nodes.push(p.e.clone());
      }
    });
    return nodes;
  }

  count_nodes() {
    const nodes = new PointMap();
    this.profiles.forEach((profile) => {
      const {b, e} = profile;
      let findedb;
      let findede;
      for(const [key, value] of nodes) {
        if (b.is_nearest(key)) {
          value.push({profile, point: 'b'})
          findedb = true;
        }
        if (e.is_nearest(key)) {
          value.push({profile, point: 'e'})
          findede = true;
        }
      }
      if (!findedb) {
        nodes.set(b.clone(), [{profile, point: 'b'}]);
      }
      if (!findede) {
        nodes.set(e.clone(), [{profile, point: 'e'}]);
      }
    });
    return nodes;
  }


  notify(obj, type = 'update') {
    if (obj.type) {
      type = obj.type;
    }
    this.project._scope.eve.emit_async(type, obj);
    type === consts.move_points && this.project.register_change();
  }

  get outer_nodes() {
    return this.outer_profiles.map((v) => v.elm);
  }

  get outer_profiles() {
    const {profiles} = this;
    const to_remove = [];
    const res = [];

    let findedb, findede;

    for (let i = 0; i < profiles.length; i++) {
      const elm = profiles[i];
      if (elm._attr.simulated)
        continue;
      findedb = false;
      findede = false;
      for (let j = 0; j < profiles.length; j++) {
        if (profiles[j] == elm)
          continue;
        if (!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
          findedb = true;
        if (!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
          findede = true;
      }
      if (!findedb || !findede){
        to_remove.push(elm);
      }
    }
    for (let i = 0; i < profiles.length; i++) {
      const elm = profiles[i];
      if (to_remove.indexOf(elm) != -1)
        continue;
      elm._attr.binded = false;
      res.push({
        elm: elm,
        profile: elm.nearest(),
        b: elm.b,
        e: elm.e,
      });
    }
    return res;
  }

  profile_by_furn_side(side, cache) {

    if (!cache || !cache.profiles) {
      cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side('bottom'),
      };
    }

    const profile_node = this.direction == $p.enm.open_directions.Правое ? 'b' : 'e';
    const other_node = profile_node == 'b' ? 'e' : 'b';

    let profile = cache.bottom;

    const next = () => {
      side--;
      if (side <= 0) {
        return profile;
      }

      cache.profiles.some((curr) => {
        if (curr[other_node].is_nearest(profile[profile_node])) {
          profile = curr;
          return true;
        }
      });

      return next();
    };

    return next();

  }


  profile_by_nodes(n1, n2, point) {
    const profiles = this.profiles;
    for (let i = 0; i < profiles.length; i++) {
      const {generatrix} = profiles[i];
      if (generatrix.getNearestPoint(n1).is_nearest(n1) && generatrix.getNearestPoint(n2).is_nearest(n2)) {
        if (!point || generatrix.getNearestPoint(point).is_nearest(point))
          return profiles[i];
      }
    }
  }

  remove() {
    const {children, _row, cnstr} = this;
    while (children.length) {
      children[0].remove();
    }

    if (_row) {
      const {ox} = this.project;
      ox.coordinates.clear({cnstr});
      ox.params.clear({cnstr});

      if (ox === _row._owner._owner) {
        _row._owner.del(_row);
      }
      this._row = null;
    }

    super.remove();
  }

  get _manager() {
    return this.project._dp._manager;
  }

  _metadata(fld) {

    const {tabular_sections} = this.project.ox._metadata();
    const _xfields = tabular_sections.constructions.fields;

    return fld ? (_xfields[fld] || tabular_sections[fld]) : {
      fields: {
        furn: _xfields.furn,
        direction: _xfields.direction,
        h_ruch: _xfields.h_ruch,
      },
      tabular_sections: {
        params: tabular_sections.params,
      },
    };

  }

  get bounds() {
    const {_attr, parent} = this;
    if (!_attr._bounds || !_attr._bounds.width || !_attr._bounds.height) {

      this.profiles.forEach((profile) => {
        const path = profile.path && profile.path.segments.length ? profile.path : profile.generatrix;
        if (path) {
          _attr._bounds = _attr._bounds ? _attr._bounds.unite(path.bounds) : path.bounds;
          if (!parent) {
            const {d0} = profile;
            if (d0) {
              _attr._bounds = _attr._bounds.unite(profile.generatrix.bounds);
            }
          }
        }
      });
      this.sectionals.forEach((sectional) => {
        _attr._bounds = _attr._bounds ? _attr._bounds.unite(sectional.bounds) : sectional.bounds;
      });

      if (!_attr._bounds) {
        _attr._bounds = new paper.Rectangle();
      }
    }
    return _attr._bounds;
  }

  get cnstr() {
    return this._row ? this._row.cnstr : 0;
  }

  set cnstr(v) {
    this._row && (this._row.cnstr = v);
  }

  get dimension_bounds() {
    let bounds = super.dimension_bounds;
    const ib = this.l_visualization._by_insets.bounds;
    if (ib.height && ib.bottom > bounds.bottom) {
      const delta = ib.bottom - bounds.bottom + 10;
      bounds = bounds.unite(
        new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
      );
    }
    return bounds;
  }

  get direction() {
    return this._row.direction;
  }

  set direction(v) {
    this._row.direction = v;
    this.project.register_change(true);
  }

  zoom_fit() {
    this.project.zoom_fit.call(this, null, true);
  }

  draw_cnn_errors() {

    const {l_visualization} = this;

    if (l_visualization._cnn) {
      l_visualization._cnn.removeChildren();
    }
    else {
      l_visualization._cnn = new paper.Group({parent: l_visualization});
    }

    const err_attrs = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeCap: 'round',
      strokeScaling: false,
      dashOffset: 4,
      dashArray: [4, 4],
      guide: true,
      parent: l_visualization._cnn,
    };

    this.glasses(false, true).forEach((elm) => {
      let err;
      elm.profiles.forEach(({cnn, sub_path}) => {
        if (!cnn) {
          Object.assign(sub_path, err_attrs);
          err = true;
        }
      });
      if (err) {
        elm.fill_error();
      }
      else if(elm.path.is_self_intersected()) {
        elm.fill_error();
      }
      else {
        const {form_area, inset: {smin, smax}} = elm;
        if((smin && smin > form_area) || (smax && smax < form_area)) {
          elm.fill_error();
        }
        else {
          elm.path.fillColor = BuilderElement.clr_by_clr.call(elm, elm._row.clr, false);
        }
      }
    });

    this.profiles.forEach((elm) => {
      const {_corns, _rays} = elm._attr;
      _rays.b.check_err(err_attrs);
      _rays.e.check_err(err_attrs);
      if (elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())) {
        Object.assign(elm.path.get_subpath(_corns[1], _corns[2]), err_attrs);
      }
      elm.addls.forEach((elm) => {
        if (elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())) {
          Object.assign(elm.path.get_subpath(_corns[1], _corns[2]), err_attrs);
        }
      });
    });
  }

  draw_mosquito() {
    const {l_visualization} = this;
    this.project.ox.inserts.find_rows({cnstr: this.cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.МоскитнаяСетка) {
        const props = {
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          strokeWidth: 3,
          dashArray: [6, 4],
          strokeScaling: false,
        };
        let sz, imposts;
        row.inset.specification.forEach((rspec) => {
          if (!sz && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру && rspec.nom.elm_type == $p.enm.elm_types.Рама) {
            sz = rspec.sz;
          }
          if (!imposts && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам && rspec.nom.elm_type == $p.enm.elm_types.Импост) {
            imposts = rspec;
          }
        });

        const perimetr = [];
        if (typeof sz != 'number') {
          sz = 20;
        }
        this.outer_profiles.forEach((curr) => {
          const profile = curr.profile || curr.elm;
          const is_outer = Math.abs(profile.angle_hor - curr.elm.angle_hor) > 60;
          const ray = is_outer ? profile.rays.outer : profile.rays.inner;
          const segm = ray.get_subpath(curr.b, curr.e).equidistant(sz);
          perimetr.push(Object.assign(segm, props));
        });

        const count = perimetr.length - 1;
        perimetr.forEach((curr, index) => {
          const prev = index == 0 ? perimetr[count] : perimetr[index - 1];
          const next = index == count ? perimetr[0] : perimetr[index + 1];
          const b = curr.getIntersections(prev);
          const e = curr.getIntersections(next);
          if (b.length) {
            curr.firstSegment.point = b[0].point;
          }
          if (e.length) {
            curr.lastSegment.point = e[0].point;
          }
        });

        const {elm_font_size} = consts;
        const {bounds} = props.parent;
        new paper.PointText({
          parent: props.parent,
          fillColor: 'black',
          fontFamily: 'Mipgost',
          fontSize: consts.elm_font_size,
          guide: true,
          content: row.inset.presentation,
          point: bounds.bottomLeft.add([elm_font_size * 1.2, -elm_font_size * 0.4]),
        });

        if (imposts) {
          const {offsets, do_center, step} = imposts;
          const add_impost = function (y) {
            const impost = Object.assign(new paper.Path({
              insert: false,
              segments: [[bounds.left, y], [bounds.right, y]],
            }), props);
            const {length} = impost;
            perimetr.forEach((curr) => {
              const aloc = curr.getIntersections(impost);
              if (aloc.length) {
                const l1 = impost.firstSegment.point.getDistance(aloc[0].point);
                const l2 = impost.lastSegment.point.getDistance(aloc[0].point);
                if (l1 < length / 2) {
                  impost.firstSegment.point = aloc[0].point;
                }
                if (l2 < length / 2) {
                  impost.lastSegment.point = aloc[0].point;
                }
              }
            });
          }

          if (step) {
            const height = bounds.height - offsets;
            if (height >= step) {
              if (do_center) {
                add_impost(bounds.centerY);
              }
              else {
                for (let y = step; y < height; y += step) {
                  add_impost(y);
                }
              }
            }
          }
        }

        return false;
      }
    });
  }

  draw_sill() {
    const {l_visualization, project, cnstr} = this;
    const {ox} = project;
    const {properties} = $p.job_prm;
    if (!properties) {
      return;
    }
    const {length, width} = properties;

    ox.inserts.find_rows({cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.Подоконник) {

        const bottom = this.profiles_by_side('bottom');
        let vlen, vwidth;
        ox.params.find_rows({cnstr: cnstr, inset: row.inset}, (prow) => {
          if (prow.param == length) {
            vlen = prow.value;
          }
          if (prow.param == width) {
            vwidth = prow.value;
          }
        });
        if (!vlen) {
          vlen = bottom.length + 160;
        }
        if (vwidth) {
          vwidth = vwidth * 0.7;
        }
        else {
          vwidth = 200;
        }
        const delta = (vlen - bottom.length) / 2;

        new paper.Path({
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          fillColor: BuilderElement.clr_by_clr(row.clr),
          shadowColor: 'grey',
          shadowBlur: 20,
          shadowOffset: [10, 20],
          opacity: 0.7,
          strokeWidth: 1,
          strokeScaling: false,
          closed: true,
          segments: [
            bottom.b.add([delta, 0]),
            bottom.e.add([-delta, 0]),
            bottom.e.add([-delta - vwidth, vwidth]),
            bottom.b.add([delta - vwidth, vwidth]),
          ],
        });

        return false;
      }
    });
  }

  draw_opening() {

    const _contour = this;
    const {l_visualization, furn} = this;

    if (!this.parent || !$p.enm.open_types.is_opening(furn.open_type)) {
      if (l_visualization._opening && l_visualization._opening.visible)
        l_visualization._opening.visible = false;
      return;
    }

    const cache = {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side('bottom'),
    };

    function rotary_folding() {

      const {_opening} = l_visualization;
      const {side_count} = _contour;

      furn.open_tunes.forEach((row) => {

        if (row.rotation_axis) {
          const axis = _contour.profile_by_furn_side(row.side, cache);
          const other = _contour.profile_by_furn_side(
            row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

          _opening.moveTo(axis.corns(3));
          _opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
          _opening.lineTo(axis.corns(4));

        }
      });
    }

    function sliding() {
      const {center} = _contour.bounds;
      const {_opening} = l_visualization;

      if (_contour.direction == $p.enm.open_directions.Правое) {
        _opening.moveTo(center.add([-100, 0]));
        _opening.lineTo(center.add([100, 0]));
        _opening.moveTo(center.add([30, 30]));
        _opening.lineTo(center.add([100, 0]));
        _opening.lineTo(center.add([30, -30]));
      }
      else {
        _opening.moveTo(center.add([100, 0]));
        _opening.lineTo(center.add([-100, 0]));
        _opening.moveTo(center.add([-30, 30]));
        _opening.lineTo(center.add([-100, 0]));
        _opening.lineTo(center.add([-30, -30]));
      }
    }

    if (!l_visualization._opening) {
      l_visualization._opening = new paper.CompoundPath({
        parent: _contour.l_visualization,
        strokeColor: 'black',
      });
    }
    else {
      l_visualization._opening.removeChildren();
    }

    return furn.is_sliding ? sliding() : rotary_folding();

  }

  draw_visualization(rows) {

    const {profiles, l_visualization, contours} = this;
    const glasses = this.glasses(false, true);
    l_visualization._by_spec.removeChildren();

    if(!rows){
      rows = [];
      this.project.ox.specification.find_rows({dop: -1}, (row) => rows.push(row));
    }

    for(const row of rows){
      if(!profiles.some((elm) => {
          if (row.elm == elm.elm) {
            row.nom.visualization.draw(elm, l_visualization, row.len * 1000);
            return true;
          }
        })){
        glasses.some((elm) => {
          if (row.elm == elm.elm) {
            row.nom.visualization.draw(elm, l_visualization, row.len * 1000, row.width * 1000);
            return true;
          }
        })
      }
    }

    for(const contour of contours){
      contour.draw_visualization(rows);
    }

  }

  get hidden() {
    return !!this._hidden;
  }

  set hidden(v) {
    if (this.hidden != v) {
      this._hidden = v;
      const visible = !this._hidden;
      this.children.forEach((elm) => {
        if (elm instanceof BuilderElement) {
          elm.visible = visible;
        }
      });
      this.l_visualization.visible = visible;
      this.l_dimensions.visible = visible;
    }

  }

  hide_generatrix() {
    this.profiles.forEach((elm) => {
      elm.generatrix.visible = false;
    });
  }

  get imposts() {
    return this.getItems({class: Profile}).filter((elm) => {
      const {b, e} = elm.rays;
      return b.is_tt || e.is_tt || b.is_i || e.is_i;
    });
  }

  get params() {
    return this.project.ox.params;
  }

  get path() {
    return this.bounds;
  }

  set path(attr) {
    if (!Array.isArray(attr)) {
      return;
    }

    const noti = {type: consts.move_points, profiles: [], points: []};
    const {outer_nodes} = this;

    let need_bind = attr.length,
      available_bind = outer_nodes.length,
      elm, curr;

    function set_node(n) {
      if (!curr[n].is_nearest(elm[n], 0)) {
        elm.rays.clear(true);
        elm[n] = curr[n];
        if (noti.profiles.indexOf(elm) == -1) {
          noti.profiles.push(elm);
        }
        if (!noti.points.some((point) => point.is_nearest(elm[n], 0))) {
          noti.points.push(elm[n]);
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];             
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];   
          if (elm._attr.binded) {
            continue;
          }
          if (curr.profile.is_nearest(elm)) {
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded)
          continue;
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];
          if (elm._attr.binded)
            continue;
          if (curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)) {
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    if (need_bind && available_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded)
          continue;
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];
          if (elm._attr.binded)
            continue;
          elm._attr.binded = true;
          curr.binded = true;
          need_bind--;
          available_bind--;

          set_node('b');
          set_node('e');

          break;
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded) {
          continue;
        }
        elm = new Profile({
          generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
          proto: outer_nodes.length ? outer_nodes[0] : {parent: this, clr: curr.profile.clr},
        });
        elm._attr._nearest = curr.profile;
        elm._attr.binded = true;
        elm._attr.simulated = true;

        curr.profile = elm;
        delete curr.outer;
        curr.binded = true;

        noti.profiles.push(elm);
        noti.points.push(elm.b);
        noti.points.push(elm.e);

        need_bind--;
      }
    }

    if (available_bind) {
      outer_nodes.forEach((elm) => {
        if (!elm._attr.binded) {
          elm.rays.clear(true);
          elm.remove();
          available_bind--;
        }
      });
    }

    this.profiles.forEach((p) => p.default_inset());

    if (noti.points.length) {
      this.profiles.forEach((p) => p._attr._rays && p._attr._rays.clear());
      this.notify(noti);
    }

    this._attr._bounds = null;
  }

  get perimeter() {
    const res = [];
    this.outer_profiles.forEach((curr) => {
      const tmp = curr.sub_path ? {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle,
      } : {
        len: curr.elm.length,
        angle: curr.elm.angle_hor,
      };
      res.push(tmp);
      if (tmp.angle < 0) {
        tmp.angle += 360;
      }
      tmp.angle_hor = tmp.angle;
      tmp.profile = curr.profile || curr.elm;
    });
    return res;
  }

  perimeter_inner(size) {
    const {center} = this.bounds;
    const res = this.outer_profiles.map((curr) => {
      const profile = curr.profile || curr.elm;
      const {inner, outer} = profile.rays;
      const sub_path = inner.getNearestPoint(center).getDistance(center, true) < outer.getNearestPoint(center).getDistance(center, true) ?
        inner.get_subpath(inner.getNearestPoint(curr.b), inner.getNearestPoint(curr.e)) : outer.get_subpath(outer.getNearestPoint(curr.b), outer.getNearestPoint(curr.e));
      const tmp = {
        profile,
        sub_path,
        angle: curr.e.subtract(curr.b).angle,
        b: curr.b,
        e: curr.e,
      };
      if (tmp.angle < 0) {
        tmp.angle += 360;
      }
      ;
      return tmp;
    });
    const ubound = res.length - 1;
    return res.map((curr, index) => {
      let sub_path = curr.sub_path.equidistant(size);
      const prev = !index ? res[ubound] : res[index - 1];
      const next = (index == ubound) ? res[0] : res[index + 1];
      const b = sub_path.intersect_point(prev.sub_path.equidistant(size), curr.b, true);
      const e = sub_path.intersect_point(next.sub_path.equidistant(size), curr.e, true);
      if (b && e) {
        sub_path = sub_path.get_subpath(b, e);
      }
      return {
        profile: curr.profile,
        angle: curr.angle,
        len: sub_path.length,
        sub_path,
      };
    });
  }

  bounds_inner(size) {
    const path = new paper.Path({insert: false});
    for (let curr of this.perimeter_inner(size)) {
      path.addSegments(curr.sub_path.segments);
    }
    if (path.segments.length && !path.closed) {
      path.closePath(true);
    }
    path.reduce();
    return path.bounds;
  }

  get pos() {

  }

  get profiles() {
    return this.children.filter((elm) => elm instanceof Profile);
  }

  get sectionals() {
    return this.children.filter((elm) => elm instanceof Sectional);
  }

  redraw(on_redrawed) {

    if (!this.visible) {
      return;
    }

    this._attr._bounds = null;

    const {l_visualization} = this;

    l_visualization._by_insets.removeChildren();
    !this.project._attr._saving && l_visualization._by_spec.removeChildren();

    this.profiles.forEach((elm) => elm.redraw());

    this.glass_recalc();

    this.draw_opening();

    this.contours.forEach((elm) => elm.redraw());

    this.draw_cnn_errors();

    this.draw_mosquito();

    this.draw_sill();

    this.sectionals.forEach((elm) => elm.redraw());

    this.notify(this, 'contour_redrawed', this._attr._bounds);

  }

  refresh_prm_links(root) {

    const cnstr = root ? 0 : this.cnstr || -9999;
    let notify;

    this.params.find_rows({
      cnstr,
      inset: $p.utils.blank.guid,
      hide: {not: true},
    }, (prow) => {
      const {param} = prow;
      const links = param.params_links({grid: {selection: {cnstr}}, obj: prow});
      const hide = links.some((link) => link.hide);

      if (links.length && param.linked_values(links, prow)) {
        notify = true;
      }
      if (!notify) {
        notify = hide;
      }
    });

    if(notify) {
      this.notify(this, 'refresh_prm_links');
      if(root) {
        const {_dp} = this.project;
        _dp._manager.emit_async('rows', _dp, {extra_fields: true});
      }
    };

  }

  save_coordinates(short) {

    if (!short) {
      this.glasses(false, true).forEach((glass) => !glass.visible && glass.remove());

      const {l_text, l_dimensions} = this;
      for (let elm of this.children) {
        if (elm.save_coordinates) {
          elm.save_coordinates();
        }
        else if (elm == l_text || elm == l_dimensions) {
          elm.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
        }
      }
    }

    const {bounds} = this;
    this._row.x = bounds ? bounds.width.round(4) : 0;
    this._row.y = bounds ? bounds.height.round(4) : 0;
    this._row.is_rectangular = this.is_rectangular;
    if (this.parent) {
      this._row.w = this.w.round(4);
      this._row.h = this.h.round(4);
    }
    else {
      this._row.w = 0;
      this._row.h = 0;
    }
  }

  sort_nodes(nodes) {
    if (!nodes.length) {
      return nodes;
    }
    let prev = nodes[0];
    const res = [prev];
    let couner = nodes.length + 1;

    while (res.length < nodes.length && couner) {
      couner--;
      for (let i = 0; i < nodes.length; i++) {
        const curr = nodes[i];
        if (res.indexOf(curr) != -1)
          continue;
        if (prev.node2 == curr.node1) {
          res.push(curr);
          prev = curr;
          break;
        }
      }
    }
    if (couner) {
      nodes.length = 0;
      for (let i = 0; i < res.length; i++) {
        nodes.push(res[i]);
      }
      res.length = 0;
    }
  }


  get furn_cache() {
    return {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side('bottom'),
      ox: this.project.ox,
      w: this.w,
      h: this.h,
    };
  }

  handle_line(elm) {

    const {bounds, h_ruch} = this;
    const by_side = this.profiles_by_side();
    return (elm == by_side.top || elm == by_side.bottom) ?
      new paper.Path({
        insert: false,
        segments: [[bounds.left + h_ruch, bounds.top - 200], [bounds.left + h_ruch, bounds.bottom + 200]],
      }) :
      new paper.Path({
        insert: false,
        segments: [[bounds.left - 200, bounds.bottom - h_ruch], [bounds.right + 200, bounds.bottom - h_ruch]],
      });

  }

  update_handle_height(cache, from_setter) {

    const {furn, _row, project} = this;
    const {furn_set, handle_side} = furn;
    if (!handle_side || furn_set.empty()) {
      return;
    }

    if (!cache) {
      cache = this.furn_cache;
      cache.ignore_formulas = true;
    }

    const elm = this.profile_by_furn_side(handle_side, cache);
    if (!elm) {
      return;
    }

    const {len} = elm._row;
    let handle_height;

    function set_handle_height(row) {
      const {handle_height_base, fix_ruch} = row;
      if (handle_height_base < 0) {
        if (fix_ruch || _row.fix_ruch != -3) {
          _row.fix_ruch = fix_ruch ? -2 : -1;
          return handle_height = (len / 2).round();
        }
      }
      else if (handle_height_base > 0) {
        if (fix_ruch || _row.fix_ruch != -3) {
          _row.fix_ruch = fix_ruch ? -2 : -1
          return handle_height = handle_height_base;
        }
      }
    }

    furn.furn_set.specification.find_rows({dop: 0}, (row) => {

      if (!row.quantity || !row.check_restrictions(this, cache)) {
        return;
      }
      if (set_handle_height(row)) {
        return false;
      }
      const {nom} = row;
      if (nom && row.is_set_row) {
        let ok = false;
        nom.get_spec(this, cache, true).each((sub_row) => {
          if (set_handle_height(sub_row)) {
            return !(ok = true);
          }
        });
        if (ok) {
          return false;
        }
      }
    });

    if(handle_height && !from_setter && _row.h_ruch != handle_height){
      _row.h_ruch = handle_height;
      project._dp._manager.emit('update', this, {h_ruch: true});
    }
    return handle_height;
  }

  get h_ruch() {
    const {layer, _row} = this;
    return layer ? _row.h_ruch : 0;
  }

  set h_ruch(v) {
    const {layer, _row, project} = this;

    if (layer) {
      const old_fix_ruch = _row.fix_ruch;
      if (old_fix_ruch == -3) {
        _row.fix_ruch = -1;
      }
      const h_ruch = this.update_handle_height(null, true);
      if(h_ruch && (old_fix_ruch != -3 || v == 0)){
        _row.h_ruch = h_ruch;
      }

      if (v != 0 && [0, -1, -3].indexOf(_row.fix_ruch) != -1) {
        _row.h_ruch = v;
        if (_row.fix_ruch == -1 && v != h_ruch) {
          _row.fix_ruch = -3;
        }
      }
      project.register_change();
    }
    else {
      _row.h_ruch = 0;
    }
    project._dp._manager.emit('update', this, {h_ruch: true});
  }

  get side_count() {
    return this.profiles.length;
  }

  get w() {
    const {is_rectangular, bounds} = this;
    const {left, right} = this.profiles_by_side();
    return bounds ? bounds.width - left.nom.sizefurn - right.nom.sizefurn : 0;
  }

  get h() {
    const {is_rectangular, bounds} = this;
    const {top, bottom} = this.profiles_by_side();
    return bounds ? bounds.height - top.nom.sizefurn - bottom.nom.sizefurn : 0;
  }

  get l_text() {
    const {_attr} = this;
    return _attr._txt || (_attr._txt = new paper.Group({parent: this}));
  }

  get l_visualization() {
    const {_attr} = this;
    if (!_attr._visl) {
      _attr._visl = new paper.Group({parent: this, guide: true});
      _attr._visl._by_insets = new paper.Group({parent: _attr._visl});
      _attr._visl._by_spec = new paper.Group({parent: _attr._visl});
    }
    return _attr._visl;
  }

  get opacity() {
    return this.children.length ? this.children[0].opacity : 1;
  }

  set opacity(v) {
    this.children.forEach((elm) => {
      if (elm instanceof BuilderElement)
        elm.opacity = v;
    });
  }

  on_remove_elm(elm) {
    if (this.parent) {
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading) {
      this.l_dimensions.clear();
    }
  }

  on_insert_elm(elm) {
    if (this.parent) {
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading) {
      this.l_dimensions.clear();
    }
  }

  on_sys_changed() {
    this.profiles.forEach((elm) => elm.default_inset(true));

    this.glasses().forEach((elm) => {
      if (elm instanceof Contour) {
        elm.on_sys_changed();
      }
      else {
        if (elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
          elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
        elm.profiles.forEach((curr) => {
          if (!curr.cnn || !curr.cnn.check_nom2(curr.profile))
            curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
        });
      }
    });
  }

}

EditorInvisible.Contour = Contour;



class DimensionGroup {

  clear() {
    for (let key in this) {
      this[key].removeChildren();
      this[key].remove();
      delete this[key];
    }
  }

  has_size(size) {
    for (let key in this) {
      const {path} = this[key];
      if(path && Math.abs(path.length - size) < 1) {
        return true;
      }
    }
  }

}

class DimensionLayer extends paper.Layer {

  get bounds() {
    return this.project.bounds;
  }

  get owner_bounds() {
    return this.bounds;
  }

  get dimension_bounds() {
    return this.project.dimension_bounds;
  }

}

class DimensionDrawer extends paper.Group {

  constructor(attr) {
    super(attr);
    this.bringToFront();
  }

  clear() {

    this.ihor && this.ihor.clear();
    this.ivert && this.ivert.clear();

    for (let pos of ['bottom', 'top', 'right', 'left']) {
      if(this[pos]) {
        this[pos].removeChildren();
        this[pos].remove();
        this[pos] = null;
      }
    }

    this.layer && this.layer.parent && this.layer.parent.l_dimensions.clear();
  }

  redraw(forse) {

    const {parent, project: {builder_props}} = this;
    const {contours, bounds} = parent;

    if(forse || !builder_props.auto_lines) {
      this.clear();
    }

    for (let chld of parent.contours) {
      chld.l_dimensions.redraw();
    }

    if(builder_props.auto_lines && (!parent.parent || forse)) {

      const by_side = parent.profiles_by_side();
      if(!Object.keys(by_side).length) {
        return this.clear();
      }


      const ihor = [
        {
          point: bounds.top.round(),
          elm: by_side.top,
          p: by_side.top.b.y < by_side.top.e.y ? 'b' : 'e'
        },
        {
          point: bounds.bottom.round(),
          elm: by_side.bottom,
          p: by_side.bottom.b.y < by_side.bottom.e.y ? 'b' : 'e'
        }];
      const ivert = [
        {
          point: bounds.left.round(),
          elm: by_side.left,
          p: by_side.left.b.x > by_side.left.e.x ? 'b' : 'e'
        },
        {
          point: bounds.right.round(),
          elm: by_side.right,
          p: by_side.right.b.x > by_side.right.e.x ? 'b' : 'e'
        }];

      const profiles = new Set(parent.profiles);
      parent.imposts.forEach((elm) => elm.visible && profiles.add(elm));

      for (let elm of profiles) {

        const our = !elm.parent || elm.parent === parent;
        const eb = our ? (elm instanceof GlassSegment ? elm._sub.b : elm.b) : elm.rays.b.npoint;
        const ee = our ? (elm instanceof GlassSegment ? elm._sub.e : elm.e) : elm.rays.e.npoint;

        if(ihor.every((v) => v.point != eb.y.round())) {
          ihor.push({
            point: eb.y.round(),
            elm: elm,
            p: 'b'
          });
        }
        if(ihor.every((v) => v.point != ee.y.round())) {
          ihor.push({
            point: ee.y.round(),
            elm: elm,
            p: 'e'
          });
        }
        if(ivert.every((v) => v.point != eb.x.round())) {
          ivert.push({
            point: eb.x.round(),
            elm: elm,
            p: 'b'
          });
        }
        if(ivert.every((v) => v.point != ee.x.round())) {
          ivert.push({
            point: ee.x.round(),
            elm: elm,
            p: 'e'
          });
        }
      }

      if(ihor.length > 2) {
        ihor.sort((a, b) => b.point - a.point);
        if(parent.is_pos('right')) {
          this.by_imposts(ihor, this.ihor, 'right');
        }
        else if(parent.is_pos('left')) {
          this.by_imposts(ihor, this.ihor, 'left');
        }
      }
      else {
        ihor.length = 0;
      }

      if(ivert.length > 2) {
        ivert.sort((a, b) => a.point - b.point);
        if(parent.is_pos('bottom')) {
          this.by_imposts(ivert, this.ivert, 'bottom');
        }
        else if(parent.is_pos('top')) {
          this.by_imposts(ivert, this.ivert, 'top');
        }
      }
      else {
        ivert.length = 0;
      }

      this.by_contour(ihor, ivert, forse);

    }

    for (let dl of this.children) {
      dl.redraw && dl.redraw();
    }

  }

  by_imposts(arr, collection, pos) {
    const offset = (pos == 'right' || pos == 'bottom') ? -130 : 90;
    for (let i = 0; i < arr.length - 1; i++) {
      if(!collection[i]) {
        collection[i] = new DimensionLine({
          pos: pos,
          elm1: arr[i].elm instanceof GlassSegment ? arr[i].elm._sub : arr[i].elm,
          p1: arr[i].p,
          elm2: arr[i + 1].elm instanceof GlassSegment ? arr[i + 1].elm._sub : arr[i + 1].elm,
          p2: arr[i + 1].p,
          parent: this,
          offset: offset,
          impost: true
        });
      }
    }
  }

  by_contour(ihor, ivert, forse) {

    const {project, parent} = this;
    const {bounds} = parent;


    if(project.contours.length > 1 || forse) {

      if(parent.is_pos('left') && !parent.is_pos('right') && project.bounds.height != bounds.height) {
        if(!this.ihor.has_size(bounds.height)) {
          if(!this.left) {
            this.left = new DimensionLine({
              pos: 'left',
              parent: this,
              offset: ihor.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else {
            this.left.offset = ihor.length > 2 ? 220 : 90;
          }
        }
      }
      else {
        if(this.left) {
          this.left.remove();
          this.left = null;
        }
      }

      if(parent.is_pos('right') && (project.bounds.height != bounds.height || forse)) {
        if(!this.ihor.has_size(bounds.height)) {
          if(!this.right) {
            this.right = new DimensionLine({
              pos: 'right',
              parent: this,
              offset: ihor.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else {
            this.right.offset = ihor.length > 2 ? -260 : -130;
          }
        }
      }
      else {
        if(this.right) {
          this.right.remove();
          this.right = null;
        }
      }

      if(parent.is_pos('top') && !parent.is_pos('bottom') && project.bounds.width != bounds.width) {
        if(!this.ivert.has_size(bounds.width)) {
          if(!this.top) {
            this.top = new DimensionLine({
              pos: 'top',
              parent: this,
              offset: ivert.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else {
            this.top.offset = ivert.length > 2 ? 220 : 90;
          }
        }
      }
      else {
        if(this.top) {
          this.top.remove();
          this.top = null;
        }
      }

      if(parent.is_pos('bottom') && (project.bounds.width != bounds.width || forse)) {
        if(!this.ivert.has_size(bounds.width)) {
          if(!this.bottom) {
            this.bottom = new DimensionLine({
              pos: 'bottom',
              parent: this,
              offset: ivert.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else {
            this.bottom.offset = ivert.length > 2 ? -260 : -130;
          }
        }
      }
      else {
        if(this.bottom) {
          this.bottom.remove();
          this.bottom = null;
        }
      }

    }
  }

  get owner_bounds() {
    return this.parent.bounds;
  }

  get dimension_bounds() {
    return this.parent.dimension_bounds;
  }

  get ihor() {
    return this._ihor || (this._ihor = new DimensionGroup());
  }

  get ivert() {
    return this._ivert || (this._ivert = new DimensionGroup());
  }
}



class DimensionLine extends paper.Group {

  constructor(attr) {

    super({parent: attr.parent});

    const _attr = this._attr = {};

    this._row = attr.row;

    if(this._row && this._row.path_data){
      attr._mixin(JSON.parse(this._row.path_data));
      if(attr.elm1){
        attr.elm1 = this.project.getItem({elm: attr.elm1});
      }
      if(attr.elm2){
        attr.elm2 = this.project.getItem({elm: attr.elm2});
      }
    }
    if(!attr.elm2) {
      attr.elm2 = attr.elm1;
    }
    if(!attr.p1) {
      attr.p1 = 'b';
    }
    if(!attr.p2) {
      attr.p2 = 'e';
    }
    Object.assign(_attr, attr);

    if(attr.impost){
      _attr.impost = true;
    }

    if(attr.contour){
      _attr.contour = true;
    }

    if(!_attr.pos && (!_attr.elm1 || !_attr.elm2)){
      this.remove();
      return null;
    }

    new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
    new paper.PointText({
      parent: this,
      name: 'text',
      justification: 'center',
      fontFamily: 'Mipgost',
      fillColor: 'black',
      fontSize: consts.font_size});

    this.on({
      mouseenter: this._mouseenter,
      click: this._click
    });

  }

  _metadata() {
    return $p.dp.builder_size.metadata();
  }

  get _manager() {
    return $p.dp.builder_size;
  }

  _mouseenter() {
    this.project._scope.canvas_cursor('cursor-arrow-ruler');
  }

  _click(event) {
    event.stop();
    this.wnd = new RulerWnd(null, this);
    this.wnd.size = this.size;
  }

  _move_points(event, xy) {

    let _bounds, delta;

    const {_attr} = this;

    if(_attr.elm1){

      _bounds = {};

      const p1 = (_attr.elm1._sub || _attr.elm1)[_attr.p1];
      const p2 = (_attr.elm2._sub || _attr.elm2)[_attr.p2];

      if(this.pos == "top" || this.pos == "bottom"){
        const size = Math.abs(p1.x - p2.x);
        if(event.name == "right"){
          delta = new paper.Point(event.size - size, 0);
          _bounds[event.name] = Math.max(p1.x, p2.x);
        }
        else{
          delta = new paper.Point(size - event.size, 0);
          _bounds[event.name] = Math.min(p1.x, p2.x);
        }
      }
      else{
        const size = Math.abs(p1.y - p2.y);
        if(event.name == "bottom"){
          delta = new paper.Point(0, event.size - size);
          _bounds[event.name] = Math.max(p1.y, p2.y);
        }
        else{
          delta = new paper.Point(0, size - event.size);
          _bounds[event.name] = Math.min(p1.y, p2.y);
        }
      }
    }
    else {
      _bounds = this.layer.bounds;
      if(this.pos == "top" || this.pos == "bottom")
        if(event.name == "right")
          delta = new paper.Point(event.size - _bounds.width, 0);
        else
          delta = new paper.Point(_bounds.width - event.size, 0);
      else{
        if(event.name == "bottom")
          delta = new paper.Point(0, event.size - _bounds.height);
        else
          delta = new paper.Point(0, _bounds.height - event.size);
      }
    }

    if(delta.length){
      const {project} = this;
      project.deselect_all_points();
      project.getItems({class: ProfileItem})
        .forEach(({b, e, generatrix, width}) => {
          width /= 2;
          if(Math.abs(b[xy] - _bounds[event.name]) < width && Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.segments.forEach((segm) => segm.selected = true)
          }
          else if(Math.abs(b[xy] - _bounds[event.name]) < width){
            generatrix.firstSegment.selected = true;
          }
          else if(Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.lastSegment.selected = true;
          }
      });
      project.move_points(delta, false);
      setTimeout(function () {
        this.deselect_all_points(true);
        this.register_update();
      }.bind(project), 200);
    }

  }

  sizes_wnd(event) {

    if(this.wnd && event.wnd == this.wnd.wnd){

      switch(event.name) {
        case 'close':
          if(this.children.text){
            this.children.text.selected = false;
          }
          this.wnd = null;
          break;

        case 'left':
        case 'right':
          if(this.pos == "top" || this.pos == "bottom"){
            this._move_points(event, "x");
          }
          break;

        case 'top':
        case 'bottom':
          if(this.pos == "left" || this.pos == "right"){
            this._move_points(event, "y");
          }
          break;
      }
    }

  }

  redraw() {

    const {children, path, align} = this;
    if(!children.length){
      return;
    }
    if(!path){
      this.visible = false;
      return;
    }

    const length = path.length;
    if(length < consts.sticking_l){
      this.visible = false;
      return;
    }
    this.visible = true;

    const b = path.firstSegment.point;
    const e = path.lastSegment.point;
    const normal = path.getNormalAt(0).multiply(this.offset + path.offset);
    const nl = normal.length;
    const ns = nl > 30 ? normal.normalize(nl - 20) : normal;
    const bs = b.add(ns);
    const es = e.add(ns);

    if(children.callout1.segments.length){
      children.callout1.firstSegment.point = b;
      children.callout1.lastSegment.point = b.add(normal);
    }
    else{
      children.callout1.addSegments([b, b.add(normal)]);
    }

    if(children.callout2.segments.length){
      children.callout2.firstSegment.point = e;
      children.callout2.lastSegment.point = e.add(normal);
    }
    else{
      children.callout2.addSegments([e, e.add(normal)]);
    }

    if(children.scale.segments.length){
      children.scale.firstSegment.point = bs;
      children.scale.lastSegment.point = es;
    }
    else{
      children.scale.addSegments([bs, es]);
    }

    children.callout1.visible = !this.hide_c1;
    children.callout2.visible = !this.hide_c2;
    children.scale.visible = !this.hide_line;

    children.text.content = length.toFixed(0);
    children.text.rotation = e.subtract(b).angle;
    children.text.justification = align.ref;
    if(align == $p.enm.text_aligns.left) {
      children.text.position = bs
        .add(path.getTangentAt(0).multiply(consts.font_size))
        .add(path.getNormalAt(0).multiply(consts.font_size / ($p.wsql.alasql.utils.isNode ? 1.3 : 2)));
    }
    else if(align == $p.enm.text_aligns.right) {
      children.text.position = es
        .add(path.getTangentAt(0).multiply(-consts.font_size))
        .add(path.getNormalAt(0).multiply(consts.font_size / ($p.wsql.alasql.utils.isNode ? 1.3 : 2)));
    }
    else {
      children.text.position = bs.add(es).divide(2).add(path.getNormalAt(0).multiply(consts.font_size / ($p.wsql.alasql.utils.isNode ? 1.3 : 2)));
    }
  }

  get path() {

    const {parent, project, children, _attr, pos} = this;
    if(!children.length){
      return;
    }
    const {owner_bounds, dimension_bounds} = parent;
    let offset = 0, b, e;

    if(!pos){
      b = typeof _attr.p1 == "number" ? _attr.elm1.corns(_attr.p1) : _attr.elm1[_attr.p1];
      e = typeof _attr.p2 == "number" ? _attr.elm2.corns(_attr.p2) : _attr.elm2[_attr.p2];
    }
    else if(pos == "top"){
      b = owner_bounds.topLeft;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "left"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.topLeft;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "bottom"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.bottomRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "right"){
      b = owner_bounds.bottomRight;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }

    if(!b || !e){
      return;
    }

    const path = new paper.Path({ insert: false, segments: [b, e] });

    if(_attr.elm1 && pos){
      b = path.getNearestPoint(_attr.elm1[_attr.p1]);
      e = path.getNearestPoint(_attr.elm2[_attr.p2]);
      if(path.getOffsetOf(b) > path.getOffsetOf(e)){
        [b, e] = [e, b]
      }
      path.firstSegment.point = b;
      path.lastSegment.point = e;
    }
    path.offset = offset;

    return path;
  }

  get eve() {
    return this.project._scope.eve;
  }

  get size() {
    return parseFloat(this.children.text.content) || 0;
  }
  set size(v) {
    this.children.text.content = parseFloat(v).round(1);
  }

  get pos() {
    return this._attr.pos || "";
  }
  set pos(v) {
    this._attr.pos = v;
    this.redraw();
  }

  get offset() {
    return this._attr.offset || 90;
  }
  set offset(v) {
    const offset = (parseInt(v) || 90).round();
    if(this._attr.offset != offset){
      this._attr.offset = offset;
      this.project.register_change(true);
    }
  }

  get align() {
    return (!this._attr.align || this._attr.align == '_') ? $p.enm.text_aligns.center : this._attr.align;
  }
  set align(v) {
    this._attr.align = v;
    this.redraw();
  }

  get hide_c1() {
    return !!this._attr.hide_c1;
  }
  set hide_c1(v) {
    const {children, hide_c1, _attr} = this
    _attr.hide_c1 = v;
    v && children.callout1.setSelection(false);
    this.redraw();
  }

  get hide_c2() {
    return !!this._attr.hide_c2;
  }
  set hide_c2(v) {
    const {children, hide_c2, _attr} = this
    _attr.hide_c2 = v;
    v && children.callout2.setSelection(false);
    this.redraw();
  }

  get hide_line() {
    return !!this._attr.hide_line;
  }
  set hide_line(v) {
    const {children, hide_line, _attr} = this
    _attr.hide_line = v;
    v && children.scale.setSelection(false);
    this.redraw();
  }

  remove() {
    if(this._row){
      this._row._owner.del(this._row);
      this._row = null;
      this.project.register_change();
    }
    super.remove();
  }
}


class DimensionLineCustom extends DimensionLine {

  constructor(attr) {

    if(!attr.row){
      attr.row = attr.parent.project.ox.coordinates.add();
    }

    if(!attr.row.cnstr){
      attr.row.cnstr = attr.parent.layer.cnstr;
    }

    if(!attr.row.elm){
      attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    super(attr);

  }

  get elm_type() {
    return $p.enm.elm_types.Размер;
  }

  save_coordinates() {
    const {_row, _attr, elm_type, pos, offset, size, align} = this;

    _row.len = size;

    _row.elm_type = elm_type;

    const path_data = {
      pos: pos,
      elm1: _attr.elm1.elm,
      elm2: _attr.elm2.elm,
      p1: _attr.p1,
      p2: _attr.p2,
      offset: offset
    };
    if(_attr.fix_angle) {
      path_data.fix_angle = true;
      path_data.angle = _attr.angle;
    }
    if(align == $p.enm.text_aligns.left || align == $p.enm.text_aligns.right) {
      path_data.align = align.ref || align;
    }
    if(_attr.hide_c1) {
      path_data.hide_c1 = true;
    }
    if(_attr.hide_c2) {
      path_data.hide_c2 = true;
    }
    if(_attr.hide_line) {
      path_data.hide_line = true;
    }
    _row.path_data = JSON.stringify(path_data);
  }

  setSelection(selection) {
    super.setSelection(selection);
    const {project, children, hide_c1, hide_c2, hide_line} = this
    const {tool} = project._scope;
    if(selection) {
      hide_c1 && children.callout1.setSelection(false);
      hide_c2 && children.callout2.setSelection(false);
      hide_line && children.scale.setSelection(false);
    }
    tool instanceof ToolRuler && tool.wnd.attach(this);
  }

  _click(event) {
    event.stop();
    const {tool} = this.project._scope;
    if(tool instanceof ToolRuler){
      this.selected = true;
    }
  }

  _mouseenter() {
    const {_scope} = this.project;
    if(_scope.tool instanceof ToolRuler){
      _scope.canvas_cursor('cursor-arrow-ruler');
    }
    else{
      _scope.canvas_cursor('cursor-arrow-ruler-dis');
    }
  }

  get angle() {
    if(this.fix_angle) {
      return this._attr.angle || 0;
    }
    const {firstSegment, lastSegment} = this.path;
    return lastSegment.point.subtract(firstSegment.point).angle.round(1);
  }
  set angle(v) {
    this._attr.angle = parseFloat(v).round(1);
    this.project.register_change(true);
  }


  get fix_angle() {
    return !!this._attr.fix_angle;
  }
  set fix_angle(v) {
    this._attr.fix_angle = v;
    this.project.register_change(true);
  }

  get path() {
    if(this.fix_angle) {

      const {children, _attr} = this;
      if(!children.length){
        return;
      }
      let b = typeof _attr.p1 == "number" ? _attr.elm1.corns(_attr.p1) : _attr.elm1[_attr.p1];
      let e = typeof _attr.p2 == "number" ? _attr.elm2.corns(_attr.p2) : _attr.elm2[_attr.p2];
      if(!b || !e){
        return;
      }

      const d = e.subtract(b);
      const t = d.clone();
      t.angle = this.angle;
      const path = new paper.Path({insert: false, segments: [b, b.add(t)]});
      path.lastSegment.point.add(t.multiply(10000));
      path.lastSegment.point = path.getNearestPoint(e);
      path.offset = 0;
      return path;
    }
    else {
      return super.path;
    }
  }
}



class DimensionRadius extends DimensionLineCustom {

  get elm_type() {
    return $p.enm.elm_types.Радиус;
  }

  get path() {

    const {children, _attr} = this;
    if(!children.length){
      return;
    }
    const {path} = _attr.elm1;
    if(!path){
      return;
    }

    let b = path.getPointAt(_attr.p1);
    const n = path.getNormalAt(_attr.p1).normalize(100);
    const res = new paper.Path({insert: false, segments: [b, b.add(n)]});
    res.offset = 0;
    return res;
  }

  redraw() {
    const {children, _attr, path, align} = this;
    if(!path){
      this.visible = false;
      return;
    }
    this.visible = true;

    const b = path.firstSegment.point;
    const e = path.lastSegment.point;
    const c = path.getPointAt(50);
    const n = path.getNormalAt(0).multiply(10);
    const c1 = c.add(n);
    const c2 = c.subtract(n);

    if(children.callout1.segments.length){
      children.callout1.firstSegment.point = b;
      children.callout1.lastSegment.point = c1;
    }
    else{
      children.callout1.addSegments([b, c1]);
    }

    if(children.callout2.segments.length){
      children.callout2.firstSegment.point = b;
      children.callout2.lastSegment.point = c2;
    }
    else{
      children.callout2.addSegments([b, c2]);
    }

    if(children.scale.segments.length){
      children.scale.firstSegment.point = b;
      children.scale.lastSegment.point = e;
    }
    else{
      children.scale.addSegments([b, e]);
    }

    const curv = Math.abs(_attr.elm1.path.getCurvatureAt(_attr.p1));
    if(curv) {
      children.text.content = `R${(1 / curv).round(-1)}`;
      children.text.rotation = e.subtract(b).angle;
      children.text.justification = 'left';
    }
    children.text.position = e.add(path.getTangentAt(0).multiply(consts.font_size * 1.4));
  }

}



class BuilderElement extends paper.Group {

  constructor(attr) {

    super(attr);

    if(!attr.row){
      attr.row = this.project.ox.coordinates.add();
    }

    this._row = attr.row;

    this._attr = {};

    if(attr.proto){

      if(attr.proto.inset){
        this.inset = attr.proto.inset;
      }

      if(attr.parent){
        this.parent = attr.parent;
      }
      else if(attr.proto.parent){
        this.parent = attr.proto.parent;
      }

      if(attr.proto instanceof Profile){
        this.insertBelow(attr.proto);
      }

      this.clr = attr.proto.clr;

    }
    else if(attr.parent){
      this.parent = attr.parent;
    }

    if(!this._row.cnstr && this.layer.cnstr){
      this._row.cnstr = this.layer.cnstr;
    }

    if(!this._row.elm){
      this._row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(this._row.elm_type.empty() && !this.inset.empty()){
      this._row.elm_type = this.nom.elm_type;
    }

    this.project.register_change();

  }

  get owner() {
    return this._attr.owner;
  }
  set owner(v) {
    this._attr.owner = v;
  }

  get generatrix() {
    return this._attr.generatrix;
  }
  set generatrix(attr) {

    const {_attr} = this;
    _attr.generatrix.removeSegments();

    if(this.hasOwnProperty('rays')){
      this.rays.clear();
    }

    if(Array.isArray(attr)){
      _attr.generatrix.addSegments(attr);
    }
    else if(attr.proto &&  attr.p1 &&  attr.p2){

      let tpath = attr.proto;
      if(tpath.getDirectedAngle(attr.ipoint) < 0){
        tpath.reverse();
      }

      let d1 = tpath.getOffsetOf(attr.p1);
      let d2 = tpath.getOffsetOf(attr.p2), d3;
      if(d1 > d2){
        d3 = d2;
        d2 = d1;
        d1 = d3;
      }
      if(d1 > 0){
        tpath = tpath.split(d1);
        d2 = tpath.getOffsetOf(attr.p2);
      }
      if(d2 < tpath.length){
        tpath.split(d2);
      }

      _attr.generatrix.remove();
      _attr.generatrix = tpath;
      _attr.generatrix.parent = this;

      if(this.layer.parent){
        _attr.generatrix.guide = true;
      }
    }
  }

  get path() {
    return this._attr.path;
  }
  set path(attr) {
    if(attr instanceof paper.Path){
      const {_attr} = this;
      _attr.path.removeSegments();
      _attr.path.addSegments(attr.segments);
      if(!_attr.path.closed){
        _attr.path.closePath(true);
      }
    }
  }

  get _metadata() {
    const {fields, tabular_sections} = this.project.ox._metadata();
    const t = this,
      _xfields = tabular_sections.coordinates.fields, 
      inset = Object.assign({}, _xfields.inset),
      arc_h = Object.assign({}, _xfields.r, {synonym: "Высота дуги"}),
      info = Object.assign({}, fields.note, {synonym: "Элемент"}),
      cnn1 = Object.assign({}, tabular_sections.cnn_elmnts.fields.cnn),
      cnn2 = Object.assign({}, cnn1),
      cnn3 = Object.assign({}, cnn1);

    function cnn_choice_links(o, cnn_point){

      const nom_cnns = $p.cat.cnns.nom_cnn(t, cnn_point.profile, cnn_point.cnn_types);

      if($p.utils.is_data_obj(o)){
        return nom_cnns.some((cnn) => o == cnn);
      }
      else{
        let refs = "";
        nom_cnns.forEach((cnn) => {
          if(refs){
            refs += ", ";
          }
          refs += "'" + cnn.ref + "'";
        });
        return "_t_.ref in (" + refs + ")";
      }
    }


    const {_inserts_types_filling} = $p.cat.inserts;
    inset.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => {
        const {sys} = this.project._dp;

          let selection;

          if(this instanceof Filling){
            if($p.utils.is_data_obj(o)){
              const {thickness, insert_type, insert_glass_type} = o;
              return _inserts_types_filling.indexOf(insert_type) != -1 &&
                thickness >= sys.tmin && thickness <= sys.tmax &&
                (insert_glass_type.empty() || insert_glass_type == $p.enm.inserts_glass_types.Заполнение);
            }
            else{
              let refs = "";
              $p.cat.inserts.by_thickness(sys.tmin, sys.tmax).forEach((o) => {
                if(o.insert_glass_type.empty() || o.insert_glass_type == $p.enm.inserts_glass_types.Заполнение){
                  if(refs){
                    refs += ", ";
                  }
                  refs += "'" + o.ref + "'";
                }
              });
              return "_t_.ref in (" + refs + ")";
            }
          }
          else if(this instanceof Profile){
            if(this.nearest()){
              selection = {elm_type: {in: [$p.enm.elm_types.Створка, $p.enm.elm_types.Добор]}};
            }
            else{
              selection = {elm_type: {in: [$p.enm.elm_types.Рама, $p.enm.elm_types.Импост, $p.enm.elm_types.Добор]}};
            }
          }
          else{
            selection = {elm_type: this.nom.elm_type};
          }

          if($p.utils.is_data_obj(o)){
            let ok = false;
            selection.nom = o;
            sys.elmnts.find_rows(selection, (row) => {
              ok = true;
              return false;
            });
            return ok;
          }
          else{
            let refs = "";
            sys.elmnts.find_rows(selection, (row) => {
              if(refs){
                refs += ", ";
              }
              refs += "'" + row.nom.ref + "'";
            });
            return "_t_.ref in (" + refs + ")";
          }
        }]}
    ];

    cnn1.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.b)]
    }];

    cnn2.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.e)]
    }];

    cnn3.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o) => {
        const cnn_ii = this.selected_cnn_ii();
        let nom_cnns = [$p.utils.blank.guid];

        if(cnn_ii){
          if (cnn_ii.elm instanceof Filling) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else if (cnn_ii.elm.elm_type == $p.enm.elm_types.Створка && this.elm_type != $p.enm.elm_types.Створка) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else {
            nom_cnns = $p.cat.cnns.nom_cnn(this, cnn_ii.elm, $p.enm.cnn_types.acn.ii);
          }
        }

        if ($p.utils.is_data_obj(o)) {
          return nom_cnns.some((cnn) => o == cnn);
        }
        else {
          var refs = "";
          nom_cnns.forEach((cnn) => {
            if (refs) {
              refs += ", ";
            }
            refs += "'" + cnn.ref + "'";
          });
          return "_t_.ref in (" + refs + ")";
        }
      }]
    }];

    $p.cat.clrs.selection_exclude_service(_xfields.clr, this);

    return {
      fields: {
        info: info,
        inset: inset,
        clr: _xfields.clr,
        x1: _xfields.x1,
        x2: _xfields.x2,
        y1: _xfields.y1,
        y2: _xfields.y2,
        cnn1: cnn1,
        cnn2: cnn2,
        cnn3: cnn3,
        arc_h: arc_h,
        r: _xfields.r,
        arc_ccw: _xfields.arc_ccw,
        a1: Object.assign({}, _xfields.x1, {synonym: "Угол1"}),
        a2: Object.assign({}, _xfields.x1, {synonym: "Угол2"}),
      }
    };
  }

  get _manager() {
    return this.project._dp._manager;
  }

  get nom() {
    return this.inset.nom(this);
  }

  get elm() {
    return this._row ? this._row.elm : 0;
  }

  get info() {
    return "№" + this.elm;
  }

  get ref() {
    const {nom} = this;
    return nom && !nom.empty() ? nom.ref : this.inset.ref;
  }

  get width() {
    return this.nom.width || 80;
  }

  get thickness() {
    return this.inset.thickness;
  }

  get sizeb() {
    return this.inset.sizeb || 0;
  }

  get sizefurn() {
    return this.nom.sizefurn || 20;
  }

  get cnn3(){
    const cnn_ii = this.selected_cnn_ii();
    return cnn_ii ? cnn_ii.row.cnn : $p.cat.cnns.get();
  }
  set cnn3(v) {
    const cnn_ii = this.selected_cnn_ii();
    if(cnn_ii && cnn_ii.row.cnn != v){
      cnn_ii.row.cnn = v;
      if(this._attr._nearest_cnn){
        this._attr._nearest_cnn = cnn_ii.row.cnn;
      }
      if(this.rays){
        this.rays.clear();
      }
      this.project.register_change();
    }
  }

  get inset() {
    return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
  }
  set inset(v) {
    this.set_inset(v);
  }

  get clr() {
    return this._row.clr;
  }
  set clr(v) {
    this.set_clr(v);
  }

  set_inset(v, ignore_select) {
    const {_row, _attr, project} = this;
    if(_row.inset != v){
      _row.inset = v;
      if(_attr && _attr._rays){
        _attr._rays.clear(true);
      }
      project.register_change();
    }
  }

  set_clr(v, ignore_select) {
    if(this._row.clr != v) {
      this._row.clr = v;
      this.project.register_change();
    }
    if(this.path instanceof paper.Path){
      this.path.fillColor = BuilderElement.clr_by_clr.call(this, this._row.clr, false);
    }
  }

  t_parent(be) {
    return this;
  }

  attache_wnd(cell) {
    if(!this._attr._grid || !this._attr._grid.cell){

      this._attr._grid = cell.attachHeadFields({
        obj: this,
        oxml: this.oxml
      });
      this._attr._grid.attachEvent('onRowSelect', function (id) {
        if(['x1', 'y1', 'a1', 'cnn1'].indexOf(id) != -1) {
          this._obj.select_node('b');
        }
        else if(['x2', 'y2', 'a2', 'cnn2'].indexOf(id) != -1) {
          this._obj.select_node('e');
        }
      });
    }
    else if(this._attr._grid._obj != this){
      this._attr._grid.attach({
        obj: this,
        oxml: this.oxml
      });
    }
  }

  detache_wnd() {
    const {_grid} = this._attr;
    if(_grid && _grid.destructor && _grid._owner_cell){
      _grid._owner_cell.detachObject(true);
      delete this._attr._grid;
    }
  }

  selected_cnn_ii() {
    const {project, elm} = this;
    const sel = project.getSelectedItems();
    const {cnns} = project;
    const items = [];
    let res;

    sel.forEach((item) => {
      if(item.parent instanceof ProfileItem || item.parent instanceof Filling)
        items.push(item.parent);
      else if(item instanceof Filling)
        items.push(item);
    });

    if(items.length > 1 &&
      items.some((item) => item == this) &&
      items.some((item) => {
        if(item != this){
          cnns.forEach((row) => {
            if(!row.node1 && !row.node2 &&
              ((row.elm1 == elm && row.elm2 == item.elm) || (row.elm1 == item.elm && row.elm2 == elm))){
              res = {elm: item, row: row};
              return false;
            }
          });
          if(res){
            return true;
          }
        }
      })){
      return res;
    }
  }

  remove() {
    this.detache_wnd();
    const {parent, project, observer, _row} = this;

    parent && parent.on_remove_elm && parent.on_remove_elm(this);

    if (observer){
      project._scope.eve.off(consts.move_points, observer);
      delete this.observer;
    }

    if(_row && _row._owner && project.ox === _row._owner._owner){
      _row._owner.del(_row);
    }

    project.register_change();

    super.remove();
  }

  err_spec_row(nom, text) {
    if(!nom){
      nom = $p.job_prm.nom.info_error;
    }
    const {ox} = this.project;
    if(!ox.specification.find_rows({elm: this.elm, nom}).length){
      $p.ProductsBuilding.new_spec_row({
        elm: this,
        row_base: {clr: $p.cat.clrs.get(), nom},
        spec: ox.specification,
        ox,
      });
    };
    if(text){

    }
  }


  static clr_by_clr(clr, view_out) {
    let {clr_str, clr_in, clr_out} = clr;

    if(!view_out){
      if(!clr_in.empty() && clr_in.clr_str)
        clr_str = clr_in.clr_str;
    }else{
      if(!clr_out.empty() && clr_out.clr_str)
        clr_str = clr_out.clr_str;
    }

    if(!clr_str){
      clr_str = this.default_clr_str ? this.default_clr_str : "fff";
    }

    if(clr_str){
      clr = clr_str.split(",");
      if(clr.length == 1){
        if(clr_str[0] != "#")
          clr_str = "#" + clr_str;
        clr = new paper.Color(clr_str);
        clr.alpha = 0.96;
      }
      else if(clr.length == 4){
        clr = new paper.Color(clr[0], clr[1], clr[2], clr[3]);
      }
      else if(clr.length == 3){
        if(this.path && this.path.bounds)
          clr = new paper.Color({
            stops: [clr[0], clr[1], clr[2]],
            origin: this.path.bounds.bottomLeft,
            destination: this.path.bounds.topRight
          });
        else
          clr = new paper.Color(clr[0]);
      }
      return clr;
    }
  }
}


EditorInvisible.BuilderElement = BuilderElement;





class Filling extends AbstractFilling(BuilderElement) {

  constructor(attr) {

    const {path} = attr;
    if(path){
      delete attr.path;
    }

    super(attr);

    if(path){
      attr.path = path;
    }

    this.initialize(attr);

  }

  initialize(attr) {

    const _row = attr.row;
    const {_attr, project} = this;
    const h = project.bounds.height + project.bounds.y;

    if(_row.path_data){
      _attr.path = new paper.Path(_row.path_data);
    }

    else if(attr.path){
      _attr.path = new paper.Path();
      this.path = attr.path;
    }
    else{
      _attr.path = new paper.Path([
        [_row.x1, h - _row.y1],
        [_row.x1, h - _row.y2],
        [_row.x2, h - _row.y2],
        [_row.x2, h - _row.y1]
      ]);
    }

    _attr.path.closePath(true);
    _attr.path.reduce();
    _attr.path.strokeWidth = 0;

    if(_row.inset.empty()){
      _row.inset = project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
    }

    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({nom: _row.inset}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    this.clr = _row.clr;

    if(_row.elm_type.empty()){
      _row.elm_type = $p.enm.elm_types.Стекло;
    }

    _attr.path.visible = false;

    this.addChild(_attr.path);

    project.ox.coordinates.find_rows({
      cnstr: this.layer.cnstr,
      parent: this.elm,
      elm_type: $p.enm.elm_types.Раскладка
    }, (row) => new Onlay({row: row, parent: this}));

  }

  save_coordinates() {

    const {_row, project, profiles, bounds, imposts, nom} = this;
    const h = project.bounds.height + project.bounds.y;
    const {cnns} = project;
    const length = profiles.length;

    project.ox.glasses.add({
      elm: _row.elm,
      nom: nom,
      formula: this.formula(),
      width: bounds.width,
      height: bounds.height,
      s: this.area,
      is_rectangular: this.is_rectangular,
      is_sandwich: nom.elm_type == $p.enm.elm_types.Заполнение,
      thickness: this.thickness,
    });

    let curr, prev,	next

    _row.x1 = (bounds.bottomLeft.x - project.bounds.x).round(3);
    _row.y1 = (h - bounds.bottomLeft.y).round(3);
    _row.x2 = (bounds.topRight.x - project.bounds.x).round(3);
    _row.y2 = (h - bounds.topRight.y).round(3);
    _row.path_data = this.path.pathData;

    for(let i=0; i<length; i++ ){

      curr = profiles[i];

      if(!curr.profile || !curr.profile._row || !curr.cnn){
        if($p.job_prm.debug)
          throw new ReferenceError("Не найдено ребро заполнения");
        else
          return;
      }

      curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e)._reversed ?
        curr.profile.rays.outer : curr.profile.rays.inner;
    }

    for(let i=0; i<length; i++ ){

      prev = i === 0 ? profiles[length-1] : profiles[i-1];
      curr = profiles[i];
      next = i === length-1 ? profiles[0] : profiles[i+1];

      const pb = curr.aperture_path.intersect_point(prev.aperture_path, curr.b, true);
      const pe = curr.aperture_path.intersect_point(next.aperture_path, curr.e, true);

      if(!pb || !pe){
        if($p.job_prm.debug)
          throw "Filling:path";
        else
          return;
      }

      cnns.add({
        elm1: _row.elm,
        elm2: curr.profile._row.elm,
        node1: "",
        node2: "",
        cnn: curr.cnn.ref,
        aperture_len: curr.aperture_path.get_subpath(pb, pe).length.round(1)
      });

    }

    for(let i=0; i<length; i++ ){
      delete profiles[i].aperture_path;
    }

    imposts.forEach((curr) => curr.save_coordinates());
  }

  create_leaf() {

    const {project} = this;

    project.cnns.clear({elm1: this.elm});

    const contour = new Contour( {parent: this.parent});

    contour.path = this.profiles;

    this.parent = contour;
    this._row.cnstr = contour.cnstr;

    contour.furn = project.default_furn;

    project.notify(contour, 'rows', {constructions: true});

    contour.activate();
  }

  cnn_side() {
    return $p.enm.cnn_sides.Изнутри;
  }

  nearest() {
    return null;
  }

  select_node(v) {
    let point, segm, delta = Infinity;
    if(v === "b"){
      point = this.bounds.bottomLeft;
    }else{
      point = this.bounds.topRight;
    }
    this._attr.path.segments.forEach((curr) => {
      curr.selected = false;
      if(point.getDistance(curr.point) < delta){
        delta = point.getDistance(curr.point);
        segm = curr;
      }
    });
    if(segm){
      segm.selected = true;
      this.view.update();
    }
  }

  setSelection(selection) {
    super.setSelection(selection);
    if(selection){
      const {path} = this;
      for(let elm of this.children){
        if(elm != path){
          elm.selected = false;
        }
      }
    }
  }

  redraw() {

    this.sendToBack();

    const {path, imposts, _attr, is_rectangular} = this;
    const {elm_font_size} = consts;

    path.visible = true;
    imposts.forEach((elm) => elm.redraw());

    this.purge_paths();

    if(!_attr._text){
      _attr._text = new paper.PointText({
        parent: this,
        fillColor: 'black',
        fontFamily: 'Mipgost',
        fontSize: elm_font_size,
        guide: true,
      });
    }
    _attr._text.visible = is_rectangular;

    if(is_rectangular){
      const {bounds} = path;
      _attr._text.content = this.formula();
      _attr._text.point = bounds.bottomLeft.add([elm_font_size * 0.6, -elm_font_size]);
      if(_attr._text.bounds.width > (bounds.width - 2 * elm_font_size)){
        const atext = _attr._text.content.split(' ');
        if(atext.length > 1){
          _attr._text.content = '';
          atext.forEach((text, index) => {
            if(!_attr._text.content){
              _attr._text.content = text;
            }
            else{
              _attr._text.content += ((index === atext.length - 1) ? '\n' : ' ') + text;
            }
          })
          _attr._text.point.y -= elm_font_size;
        }
      }
    }
    else{

    }
  }

  draw_fragment() {
    const {l_dimensions, layer, path} = this;
    this.visible = true;
    path.set({
      strokeColor: 'black',
      strokeWidth: 1,
      strokeScaling: false,
      opacity: 0.6,
    });
    l_dimensions.redraw(true);
    layer.zoom_fit();
  }

  set_inset(v, ignore_select) {

    const inset = $p.cat.inserts.get(v);

    if(!ignore_select){
      const {project, elm, clr} = this;
      const {glass_specification} = project.ox;
      const proto = glass_specification.find_rows({elm});

      if(!inset.clr_group.empty() && inset.clr_group.clr_conformity.count() &&
          !inset.clr_group.clr_conformity._obj.some((row) => row.clr1 == clr || row.clr1 == clr.parent)) {
        const {clr1} = inset.clr_group.clr_conformity.get(0);
        if(clr1.is_folder) {
          $p.cat.clrs.find_rows({parent: clr1}, (v) => {
            this.clr = v;
            return false;
          });
        }
        else {
          this.clr = clr1;
        }
      }

      if(proto.length) {
        glass_specification.clear({elm});
        proto.length = 0;
        inset.specification.forEach((row) => {
          if(row.nom instanceof $p.CatInserts){
            proto.push(glass_specification.add({
              elm,
              inset: row.nom,
              clr: row.clr,
            }))
          }
        });
      }

      project.selected_glasses().forEach((selm) => {
        if(selm !== this){
          selm.set_inset(inset, true);
          glass_specification.clear({elm: selm.elm});
          proto.forEach((row) => glass_specification.add({
            elm: selm.elm,
            inset: row.inset,
            clr: row.clr,
          }));
        }
      });
    }
    super.set_inset(inset);
  }

  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){
      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          elm.set_clr(v, true);
        }
      });
    }
    super.set_clr(v);
  }

  purge_paths() {
    const paths = this.children.filter((child) => child instanceof paper.Path);
    const {path} = this;
    paths.forEach((p) => p !== path && p.remove());
  }

  fill_error() {
    const {path} = this;
    path.fillColor = new paper.Color({
      stops: ["#fee", "#fcc", "#fdd"],
      origin: path.bounds.bottomLeft,
      destination: path.bounds.topRight
    });
  }

  get profiles() {
    return this._attr._profiles || [];
  }

  get imposts() {
    return this.getItems({class: Onlay});
  }

  remove_onlays() {
    for(let onlay of this.imposts){
      onlay.remove();
    }
  }


  get area() {
    return (this.bounds.area / 1e6).round(5);
  }

  get form_area() {
    return (this.path.area/1e6).round(5);
  }

  interiorPoint() {
    return this.path.interiorPoint;
  }

  get is_rectangular() {
    const {profiles, path} = this;
    return profiles.length === 4 && !path.hasHandles() && !profiles.some(({profile}) => !(Math.abs(profile.angle_hor % 90) < 0.2));
  }

  get generatrix() {
    return this.path;
  }

  get path() {
    return this._attr.path;
  }
  set path(attr) {
    let {_attr, path} = this;

    if(path){
      path.removeSegments();
    }
    else{
      path = _attr.path = new paper.Path({parent: this});
    }

    if(Array.isArray(_attr._profiles)){
      _attr._profiles.length = 0;
    }
    else{
      _attr._profiles = [];
    }

    if(attr instanceof paper.Path){
      path.addSegments(attr.segments);
    }
    else if(Array.isArray(attr)){
      let {length} = attr;
      let prev, curr, next, sub_path;
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

        curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile, $p.enm.cnn_types.acn.ii,
          curr.cnn || this.project.elm_cnn(this, curr.profile), false, curr.outer);

        curr.sub_path = sub_path.equidistant(
          (sub_path._reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

      }
      for (let i = 0; i < length; i++) {
        prev = i === 0 ? attr[length-1] : attr[i-1];
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        if(!curr.pb)
          curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
        if(!curr.pe)
          curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
        if(!curr.pb || !curr.pe){
          if($p.job_prm.debug)
            throw "Filling:path";
          else
            continue;
        }
        curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
      }

      const remove = [];
      for (let i = 0; i < length; i++) {
        prev = i === 0 ? attr[length-1] : attr[i-1];
        next = i === length-1 ? attr[0] : attr[i+1];
        const crossings =  prev.sub_path.getCrossings(next.sub_path);
        if(crossings.length){
          if((prev.e.getDistance(crossings[0].point) < prev.profile.width * 2) ||  (next.b.getDistance(crossings[0].point) < next.profile.width * 2)) {
            remove.push(attr[i]);
            prev.sub_path.splitAt(crossings[0]);
            const nloc = next.sub_path.getLocationOf(crossings[0].point);
            next.sub_path = next.sub_path.splitAt(nloc);
          }
        }
      }
      for(const segm of remove) {
        attr.splice(attr.indexOf(segm), 1);
        length--;
      }

      for (let i = 0; i < length; i++) {
        curr = attr[i];
        path.addSegments(curr.sub_path.segments);
        ["anext","pb","pe"].forEach((prop) => { delete curr[prop] });
        _attr._profiles.push(curr);
      }
    }

    if(path.segments.length && !path.closed){
      path.closePath(true);
    }

    const intersections = path.self_intersections();
    if(intersections.length) {
      const {curves, segments} = path;
      for(const {crv1, crv2, point} of intersections) {

        const loc1 = crv1.getLocationOf(point);
        const loc2 = crv2.getLocationOf(point);
        const offset1 = loc2.offset - loc1.offset;
        const offset2 = loc1.offset + path.length - loc2.offset;

        crv1.divideAt(loc1);
        crv2.divideAt(loc2);

        if(offset2 < offset1) {
          const ind = segments.indexOf(crv2.segment2) + 1;
          while (ind < segments.length) {
            path.removeSegment(ind);
          }
          while (path.firstSegment !== crv1.segment2) {
            path.removeSegment(0);
          }
        }
        else {
          const ind = segments.indexOf(crv1.segment2);
          while (segments[ind] !== crv2.segment1) {
            path.removeSegment(ind);
          }
        }
      }
    }
    path.reduce();

  }

  get nodes() {
    let res = this.profiles.map((curr) => curr.b);
    if(!res.length){
      const {path, parent} = this;
      if(path){
        res = parent.glass_nodes(path);
      }
    }
    return res;
  }

  get outer_profiles() {
    return this.profiles;
  }

  get perimeter() {
    const res = [];
    this.profiles.forEach((curr) => {
      const tmp = {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle,
        profile: curr.profile
      }
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
    });
    return res;
  }

  get bounds() {
    const {path} = this;
    return path ? path.bounds : new paper.Rectangle();
  }

  get x1() {
    return (this.bounds.left - this.project.bounds.x).round(1);
  }

  get x2() {
    return (this.bounds.right - this.project.bounds.x).round(1);
  }

  get y1() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
  }

  get y2() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
  }

  get info() {
    const {elm, bounds, thickness} = this;
    return "№" + elm + " w:" + bounds.width.toFixed(0) + " h:" + bounds.height.toFixed(0) + " z:" + thickness.toFixed(0);
  }

  get oxml() {
    const oxml = {
      " ": [
        {id: "info", path: "o.info", type: "ro"},
        "inset",
        "clr"
      ],
      "Начало": [
        {id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
        {id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
      ],
      "Конец": [
        {id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
        {id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
      ]
    };
    if(this.selected_cnn_ii()){
      oxml["Примыкание"] = ["cnn3"];
    }
    return oxml;
  }

  get default_clr_str() {
    return "#def,#d0ddff,#eff";
  }

  formula(by_art) {
    let res;
    this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
      let {name, article} = row.inset;
      const aname = row.inset.name.split(' ');
      if(by_art && article){
        name = article;
      }
      else if(aname.length){
        name = aname[0];
      }
      if(!res){
        res = name;
      }
      else{
        res += (by_art ? '*' : 'x') + name;
      }
    });
    return res || (by_art ? this.inset.article || this.inset.name : this.inset.name);
  }

  get ref() {
    return this.thickness.toFixed();
  }

  get inset() {
    const {_attr, _row} = this;
    if(!_attr._ins_proxy || _attr._ins_proxy.ref != _row.inset){
      _attr._ins_proxy = new Proxy(_row.inset, {
        get: (target, prop) => {
          switch (prop){
            case 'presentation':
              return this.formula();

            case 'thickness':
              let res = 0;
              this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
                res += row.inset.thickness;
              });
              return res || _row.inset.thickness;

            default:
              return target[prop];
          }
        }
      });
    }
    return _attr._ins_proxy;
  }
  set inset(v) {
    this.set_inset(v);
  }

}

EditorInvisible.Filling = Filling;


class FreeText extends paper.PointText {

  constructor(attr) {

    if(!attr.fontSize){
      attr.fontSize = consts.font_size;
    }
    attr.fontFamily = 'Mipgost';

    super(attr);

    if(attr.row){
      this._row = attr.row;
    }
    else{
      this._row = attr.row = this.project.ox.coordinates.add();
    }

    const {_row} = this;

    if(!_row.cnstr){
      _row.cnstr = attr.parent.layer.cnstr;
    }

    if(!_row.elm){
      _row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(attr.point){
      if(attr.point instanceof paper.Point)
        this.point = attr.point;
      else
        this.point = new paper.Point(attr.point);
    }
    else{

      this.clr = _row.clr;
      this.angle = _row.angle_hor;

      if(_row.path_data){
        var path_data = JSON.parse(_row.path_data);
        this.x = _row.x1 + path_data.bounds_x || 0;
        this.y = _row.y1 - path_data.bounds_y || 0;
        this._mixin(path_data, null, ["bounds_x","bounds_y"]);
      }else{
        this.x = _row.x1;
        this.y = _row.y1;
      }
    }

    this.bringToFront();

  }

  remove() {
    this._row._owner.del(this._row);
    this._row = null;
    paper.PointText.prototype.remove.call(this);
  }

  save_coordinates() {
    const {_row} = this;

    _row.x1 = this.x;
    _row.y1 = this.y;
    _row.angle_hor = this.angle;

    _row.elm_type = this.elm_type;

    _row.path_data = JSON.stringify({
      text: this.text,
      font_family: this.font_family,
      font_size: this.font_size,
      bold: this.bold,
      align: this.align.ref,
      bounds_x: this.project.bounds.x,
      bounds_y: this.project.bounds.y
    });
  }

  move_points(point) {
    this.point = point;
    this.project.notify(this, 'update', {x: true, y: true});
  }

  get elm_type() {
    return $p.enm.elm_types.Текст;
  }

  _metadata() {
    return $p.dp.builder_text.metadata();
  }

  get _manager() {
    return $p.dp.builder_text;
  }

  get clr() {
    return this._row ? this._row.clr : $p.cat.clrs.get();
  }
  set clr(v) {
    this._row.clr = v;
    if(this._row.clr.clr_str.length == 6)
      this.fillColor = "#" + this._row.clr.clr_str;
    this.project.register_update();
  }

  get font_family() {
    return this.fontFamily || "";
  }
  set font_family(v) {
    this.fontFamily = v;
    this.project.register_update();
  }

  get font_size() {
    return this.fontSize || consts.font_size;
  }
  set font_size(v) {
    this.fontSize = v;
    this.project.register_update();
  }

  get bold() {
    return this.fontWeight != 'normal';
  }
  set bold(v) {
    this.fontWeight = v ? 'bold' : 'normal';
  }

  get x() {
    return (this.point.x - this.project.bounds.x).round(1);
  }
  set x(v) {
    this.point.x = parseFloat(v) + this.project.bounds.x;
    this.project.register_update();
  }

  get y() {
    const {bounds} = this.project;
    return (bounds.height + bounds.y - this.point.y).round(1);
  }
  set y(v) {
    const {bounds} = this.project;
    this.point.y = bounds.height + bounds.y - parseFloat(v);
  }

  get text() {
    return this.content;
  }
  set text(v) {
    const {project} = this;
    if(v){
      this.content = v;
      project.register_update();
    }
    else{
      project.notify(this, 'unload');
      setTimeout(this.remove.bind(this), 50);
    }
  }

  get angle() {
    return Math.round(this.rotation);
  }
  set angle(v) {
    this.rotation = v;
    this.project.register_update();
  }

  get align() {
    return $p.enm.text_aligns.get(this.justification);
  }
  set align(v) {
    this.justification = $p.utils.is_data_obj(v) ? v.ref : v;
    this.project.register_update();
  }

}


class GeneratrixElement extends BuilderElement {

  constructor(attr = {}) {
    const {generatrix} = attr;
    if (generatrix) {
      delete attr.generatrix;
    }
    super(attr);
    if (generatrix) {
      attr.generatrix = generatrix;
    }
    this.initialize(attr);
  }

  get b() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.firstSegment.point;
  }
  set b(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.firstSegment.point = v;
  }

  get e() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.lastSegment.point;
  }
  set e(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.lastSegment.point = v;
  }

  get x1() {
    const {bounds} = this.project;
    return bounds ? (this.b.x - bounds.x).round(1) : 0;
  }
  set x1(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.b.x)){
      this.select_node("b");
      this.move_points(new paper.Point(v, 0));
    }
  }

  get y1() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.b.y).round(1) : 0;
  }
  set y1(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.b.y)){
      this.select_node("b");
      this.move_points(new paper.Point(0, v));
    }
  }

  get x2() {
    const {bounds} = this.project;
    return bounds ? (this.e.x - bounds.x).round(1) : 0;
  }
  set x2(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.e.x)){
      this.select_node("e");
      this.move_points(new paper.Point(v, 0));
    }
  }

  get y2() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.e.y).round(1) : 0;
  }
  set y2(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.e.y)){
      this.select_node("e");
      this.move_points(new paper.Point(0, v));
    }
  }

  select_node(node) {
    const {generatrix, project, _attr, view} = this;
    project.deselect_all_points();
    if(_attr.path){
      _attr.path.selected = false;
    }
    if(node == "b"){
      generatrix.firstSegment.selected = true;
    }
    else{
      generatrix.lastSegment.selected = true;
    }
    view.update();
  }

  move_points(delta, all_points, start_point) {

    if(!delta.length){
      return;
    }

    const	other = [];
    const noti = {type: consts.move_points, profiles: [this], points: []};

    let changed;

    if(!all_points){
      all_points = !this.generatrix.segments.some((segm) => {
        if (segm.selected)
          return true;
      });
    }

    this.generatrix.segments.forEach((segm) => {

      let cnn_point;

      if (segm.selected || all_points){

        const noti_points = {old: segm.point.clone(), delta: delta};

        const free_point = segm.point.add(delta);

        if(segm.point == this.b){
          cnn_point = this.rays.b;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("b", free_point);
          }
        }
        else if(segm.point == this.e){
          cnn_point = this.rays.e;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("e", free_point);
          }
        }

        if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
          if(cnn_point.point.is_nearest(free_point, 0)){
            segm.point = cnn_point.point;
          }
          else{
            const ppath = (cnn_point.profile.nearest(true) ? cnn_point.profile.rays.outer : cnn_point.profile.generatrix).clone({insert: false});
            const {bounds} = ppath;
            if(Math.abs(delta.y) < consts.epsilon){
              const ray = new paper.Path({
                insert: false,
                segments: [[free_point.x, bounds.top], [free_point.x, bounds.bottom]]
              });
              segm.point = ppath.intersect_point(ray, free_point, true) || free_point;
            }
            else if(Math.abs(delta.x) < consts.epsilon){
              const ray = new paper.Path({
                insert: false,
                segments: [[bounds.left, free_point.y], [bounds.right, free_point.y]]
              });
              segm.point = ppath.intersect_point(ray, free_point, true) || free_point;
            }
            else {
              segm.point = free_point;
            }
          }
        }
        else{
          segm.point = free_point;
          if(cnn_point && !paper.Key.isDown('control')){
            if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
              if(this instanceof Onlay){
                this.move_nodes(noti_points.old, free_point);
              }
              else{
                other.push(cnn_point.profile_point == "b" ? cnn_point.profile._attr.generatrix.firstSegment : cnn_point.profile._attr.generatrix.lastSegment );
                cnn_point.profile[cnn_point.profile_point] = free_point;
                noti.profiles.push(cnn_point.profile);
              }
            }
          }
        }

        noti_points.new = segm.point;
        if(start_point){
          noti_points.start = start_point;
        }
        noti.points.push(noti_points);

        changed = true;
      }

    });


    if(changed){
      const {_attr, layer, project} = this;
      _attr._rays.clear();
      layer && layer.notify && layer.notify(noti);
      project.notify(this, 'update', {x1: true, x2: true, y1: true, y2: true});
    }

    return other;
  }

  do_sub_bind(profile, node) {
    const ppath = (profile.nearest(true) ? profile.rays.outer : profile.generatrix).clone({insert: false});
    let mpoint = ppath.getNearestPoint(this[node]);
    if(!mpoint.is_nearest(this[node], 0)) {
      const gen = this.generatrix.clone({insert: false}).elongation(1000);
      mpoint = ppath.intersect_point(gen, mpoint, true);
      this[node] = mpoint;
      return true;
    }
  }

}


class Magnetism {

  constructor(scheme) {
    this.scheme = scheme;
  }

  get selected() {
    const {profiles} = this.scheme.activeLayer;
    const selected = {profiles};
    for(const {generatrix} of profiles) {
      if(generatrix.firstSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'b';
      };
      if(generatrix.lastSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'e';
      };
    }
    return selected;
  }

  filter(selected) {
    const point = selected.profile[selected.point];
    const nodes = [selected];

    for(const profile of selected.profiles) {
      if(profile !== selected.profile) {
        if(profile.b.is_nearest(point, true)) {
          nodes.push({profile, point: 'b'});
        }
        if(profile.e.is_nearest(point, true)) {
          nodes.push({profile, point: 'e'});
        }
        const px = (profile.nearest(true) ? profile.rays.outer : profile.generatrix).getNearestPoint(point);
        if(px.is_nearest(point, true)) {
          nodes.push({profile, point: 't'});
        }
      }
    }
    return nodes;
  }

  short_glass(point) {
    for(const glass of this.scheme.activeLayer.glasses(false, true)){
      const len = glass.outer_profiles.length - 1;
      for(let i = 0; i <= len; i++) {
        const segm = glass.outer_profiles[i];
        if((segm.b.is_nearest(point) || segm.e.is_nearest(point)) &&
          segm.sub_path && segm.sub_path.length < consts.sticking) {
          const prev = i === 0 ? glass.outer_profiles[len] : glass.outer_profiles[i - 1];
          const next = i === len ? glass.outer_profiles[0] : glass.outer_profiles[i + 1];
          return {segm, prev, next, glass};
        }
      }
    };
  }

  m1() {

    const {tb_left} = this.scheme._scope;
    const previous = tb_left && tb_left.get_selected();

    Promise.resolve().then(() => {

      const {selected} = this;

      if(selected.break) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Выделено более одного узла`,
          title: 'Магнит 0-штапик'
        });
      }
      else if(!selected.profile) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Не выделено ни одного узла профиля`,
          title: 'Магнит 0-штапик'
        });
      }
      else {
        const spoint = selected.profile[selected.point];
        const res = this.short_glass(spoint);
        if(res) {
          const {segm, prev, next, glass} = res;

          let cl, negate;
          this.scheme.cnns.find_rows({elm1: glass.elm, elm2: segm.profile.elm}, (row) => {
            cl = row.aperture_len;
          });

          if(!cl) {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Не найдена строка соединения короткого ребра заполнения с профилем`,
              title: 'Магнит 0-штапик'
            });
          }

          let pNext, pOur;
          if(prev.profile === selected.profile){
            pNext = next;
            pOur = prev;
          }
          else if(next.profile === selected.profile) {
            pNext = prev;
            pOur = next;
          }
          else {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Выделен неподходящий сегмент профиля`,
              title: 'Магнит 0-штапик'
            });
          }

          if(!pNext.profile.nom.sizefaltz || !segm.profile.nom.sizefaltz || !pOur.profile.nom.sizefaltz) {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Не задан размер фальца примыкающих профилей`,
              title: 'Магнит 0-штапик'
            });
          }

          const rSegm = (segm.outer ? segm.profile.rays.outer : segm.profile.rays.inner).equidistant(-segm.profile.nom.sizefaltz);
          const rNext = (pNext.outer ? pNext.profile.rays.outer : pNext.profile.rays.inner).equidistant(-pNext.profile.nom.sizefaltz);
          const rOur = (pOur.outer ? pOur.profile.rays.outer : pOur.profile.rays.inner).equidistant(-pOur.profile.nom.sizefaltz);

          const ps = rSegm.intersect_point(rOur, spoint);
          const be = ps.getDistance(segm.profile.b) > ps.getDistance(segm.profile.e) ? 'e' : 'b';
          const da = rSegm.angle_to(rNext, segm.profile[be]);

          let p0 = rSegm.intersect_point(rNext, ps);
          if(!p0 || da < 4) {
            p0 = rNext.getNearestPoint(segm.profile[be]);
          }
          const delta = p0.subtract(ps);
          selected.profile.move_points(delta, true);

        }
        else {
          $p.msg.show_msg({
            type: 'alert-info',
            text: `Не найдено коротких сегментов заполнений<br />в окрестности выделенной точки`,
            title: 'Магнит 0-штапик'
          });
        }
      }
    });

    if(previous) {
      return this.scheme._scope.select_tool(previous.replace('left_', ''));
    }
  }

}


Object.defineProperties(paper.Path.prototype, {

  getDirectedAngle: {
    value(point) {
      const np = this.getNearestPoint(point),
        offset = this.getOffsetOf(np);
      return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
    }
  },

  self_intersections: {
    value(first) {
      const {curves} = this;
      const res = [];
      curves.some((crv1, i1) => {
        return curves.some((crv2, i2) => {
          if(i2 <= i1) {
            return;
          }
          const intersections = crv1.getIntersections(crv2);
          if(intersections.length) {
            const {point} = intersections[0];
            if(intersections.length > 1) {
              res.push({crv1, crv2, point});
              if(first) {
                return true;
              }
            }
            if(crv2.point1.is_nearest(crv1.point2, 0) && point.is_nearest(crv1.point2, 0)) {
              return;
            }
            if(crv1.point1.is_nearest(crv2.point2, 0) && point.is_nearest(crv1.point1, 0)) {
              return;
            }
            res.push({crv1, crv2, point});
            if(first) {
              return true;
            }
          }
        });
      });
      return res;
    }
  },

  is_self_intersected: {
    value() {
      return this.self_intersections(true).length > 0;
    }
  },

  angle_to: {
      value : function(other, point, interior, round){
        const p1 = this.getNearestPoint(point),
          p2 = other.getNearestPoint(point),
          t1 = this.getTangentAt(this.getOffsetOf(p1)),
          t2 = other.getTangentAt(other.getOffsetOf(p2));
        let res = t2.angle - t1.angle;
        if(res < 0){
          res += 360;
        }
        if(interior && res > 180){
          res = 180 - (res - 180);
        }
        return round ? res.round(round) : res.round(1);
      },
      enumerable : false
    },

  is_linear: {
    value() {
      const {curves, firstCurve} = this;
      if(curves.length == 1 && firstCurve.isLinear()) {
        return true;
      }
      else if(this.hasHandles()) {
        return false;
      }
      else {
        const da = firstCurve.point1.getDirectedAngle(firstCurve.point2);
        for (let i = 1; i < curves.length; i++) {
          const dc = curves[i].point1.getDirectedAngle(curves[i].point2);
          if(Math.abs(dc - da) > consts.epsilon) {
            return false;
          }
        }
      }
      return true;
    }
  },

  is_nearest: {
    value(point, sticking) {
      return point.is_nearest(this.getNearestPoint(point), sticking);
    }
  },

  get_subpath: {
      value(point1, point2) {
        let tmp;

        if(!this.length || (point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point))){
          tmp = this.clone(false);
        }
        else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
          tmp = this.clone(false);
          tmp.reverse();
          tmp._reversed = true;
        }
        else{
          const loc1 = this.getLocationOf(point1) || this.getNearestLocation(point1);
          const loc2 = this.getLocationOf(point2) || this.getNearestLocation(point2);
          const offset1 = loc1.offset;
          const offset2 = loc2.offset;

          if(this.is_linear()){
            tmp = new paper.Path({
              segments: [loc1.point, loc2.point],
              insert: false
            });
          }
          else{
            const step = (offset2 - offset1) * 0.02;

            tmp = new paper.Path({
              segments: [loc1.point],
              insert: false
            });

            if(step < 0){
              tmp._reversed = true;
              for(let i = offset1 + step; i > offset2; i+= step){
                tmp.add(this.getPointAt(i));
              }
            }
            else if(step > 0){
              for(let i = offset1 + step; i < offset2; i+= step){
                tmp.add(this.getPointAt(i));
              }
            }
            tmp.add(loc2.point);
            tmp.simplify(0.8);
          }

          if(offset1 > offset2){
            tmp._reversed = true;
          }
        }

        return tmp;
      }
    },

  equidistant: {
      value(delta, elong) {

        let normal = this.getNormalAt(0);
        const res = new paper.Path({
            segments: [this.firstSegment.point.add(normal.multiply(delta))],
            insert: false
          });

        if(this.is_linear()) {
          res.add(this.lastSegment.point.add(normal.multiply(delta)));
        }
        else{

          if(this.firstSegment.handleIn.length){
            res.firstSegment.handleIn = this.firstSegment.handleIn.clone();
          }
          if(this.firstSegment.handleOut.length){
            res.firstSegment.handleOut = this.firstSegment.handleOut.clone();
          }

          let len = this.length, step = len * 0.02, point;

          for(let i = step; i < len; i += step) {
            point = this.getPointAt(i);
            if(!point)
              continue;
            normal = this.getNormalAt(i);
            res.add(point.add(normal.multiply(delta)));
          }

          normal = this.getNormalAt(len);
          res.add(this.lastSegment.point.add(normal.multiply(delta)));

          if(this.lastSegment.handleIn.length){
            res.lastSegment.handleIn = this.lastSegment.handleIn.clone();
          }
          if(this.lastSegment.handleOut.length){
            res.lastSegment.handleOut = this.lastSegment.handleOut.clone();
          }

          res.simplify(0.8);
        }

        return res.elongation(elong);
      }
    },

  elongation: {
      value(delta) {

        if(delta){
          if(this.is_linear()) {
            let tangent = this.getTangentAt(0);
            this.firstSegment.point = this.firstSegment.point.add(tangent.multiply(-delta));
            this.lastSegment.point = this.lastSegment.point.add(tangent.multiply(delta));
          }else{
            const {length} = this;
            let tangent = this.getTangentAt(length * 0.01);
            this.insert(0, this.firstSegment.point.add(tangent.multiply(-delta)));
            tangent = this.getTangentAt(length * 0.99);
            this.add(this.lastSegment.point.add(tangent.multiply(delta)));
          }
        }
        return this;
      }
    },

  intersect_point: {
      value(path, point, elongate) {
        const intersections = this.getIntersections(path);
        let delta = Infinity, tdelta, tpoint;

        if(intersections.length == 1){
          return intersections[0].point;
        }
        else if(intersections.length > 1){

          if(!point){
            point = this.getPointAt(this.length /2);
          }

          intersections.forEach((o) => {
            tdelta = o.point.getDistance(point, true);
            if(tdelta < delta){
              delta = tdelta;
              tpoint = o.point;
            }
          });
          return tpoint;
        }
        else if(elongate == "nearest"){

          return this.getNearestPoint(path.getNearestPoint(point));

        }
        else if(elongate){

          let p1 = this.getNearestPoint(point),
            p2 = path.getNearestPoint(point),
            p1last = this.firstSegment.point.getDistance(p1, true) > this.lastSegment.point.getDistance(p1, true),
            p2last = path.firstSegment.point.getDistance(p2, true) > path.lastSegment.point.getDistance(p2, true),
            tg;

          tg = (p1last ? this.getTangentAt(this.length) : this.getTangentAt(0).negate()).multiply(100);
          if(this.is_linear){
            if(p1last)
              this.lastSegment.point = this.lastSegment.point.add(tg);
            else
              this.firstSegment.point = this.firstSegment.point.add(tg);
          }

          tg = (p2last ? path.getTangentAt(path.length) : path.getTangentAt(0).negate()).multiply(100);
          if(path.is_linear){
            if(p2last)
              path.lastSegment.point = path.lastSegment.point.add(tg);
            else
              path.firstSegment.point = path.firstSegment.point.add(tg);
          }

          return this.intersect_point(path, point);

        }
      }
    },

  point_pos: {
    value(point, interior) {
      const np = this.getNearestPoint(interior);
      const offset = this.getOffsetOf(np);
      const line = new paper.Line(np, np.add(this.getTangentAt(offset)));
      return line.getSide(point, true);
    }
  },

  rmin: {
    value() {
      if(!this.hasHandles()){
        return 0;
      }
      const {length} = this;
      const step = length / 9;
      let max = 0;
      for(let pos = 0; pos < length; pos += step){
        const curv = Math.abs(this.getCurvatureAt(pos));
        if(curv > max){
          max = curv;
        }
      }
      return max === 0 ? 0 : 1 / max;
    }
  },

  rmax: {
    value() {
      if(!this.hasHandles()){
        return 0;
      }
      const {length} = this;
      const step = length / 9;
      let min = Infinity;
      for(let pos = 0; pos < length; pos += step){
        const curv = Math.abs(this.getCurvatureAt(pos));
        if(curv < min){
          min = curv;
        }
      }
      return min === 0 ? 0 : 1 / min;
    }
  },

});


Object.defineProperties(paper.Point.prototype, {

	is_nearest: {
		value(point, sticking) {
		  if(sticking === 0){
        return Math.abs(this.x - point.x) < consts.epsilon && Math.abs(this.y - point.y) < consts.epsilon;
      }
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 16);
		}
	},

	point_pos: {
		value(x1,y1, x2,y2){
			if (Math.abs(x1-x2) < 0.2){
				return (this.x-x1)*(y1-y2);
			}
			if (Math.abs(y1-y2) < 0.2){
				return (this.y-y1)*(x2-x1);
			}
			return (this.y-y1)*(x2-x1)-(y2-y1)*(this.x-x1);
		}
	},

	arc_cntr: {
    value(x1, y1, x2, y2, r0, ccw) {
      let a, b, p, r, q, yy1, xx1, yy2, xx2;
      if(ccw) {
        const tmpx = x1, tmpy = y1;
        x1 = x2;
        y1 = y2;
        x2 = tmpx;
        y2 = tmpy;
      }
      if(x1 != x2) {
        a = (x1 * x1 - x2 * x2 - y2 * y2 + y1 * y1) / (2 * (x1 - x2));
        b = ((y2 - y1) / (x1 - x2));
        p = b * b + 1;
        r = -2 * ((x1 - a) * b + y1);
        q = (x1 - a) * (x1 - a) - r0 * r0 + y1 * y1;
        yy1 = (-r + Math.sqrt(r * r - 4 * p * q)) / (2 * p);
        xx1 = a + b * yy1;
        yy2 = (-r - Math.sqrt(r * r - 4 * p * q)) / (2 * p);
        xx2 = a + b * yy2;
      }
      else {
        a = (y1 * y1 - y2 * y2 - x2 * x2 + x1 * x1) / (2 * (y1 - y2));
        b = ((x2 - x1) / (y1 - y2));
        p = b * b + 1;
        r = -2 * ((y1 - a) * b + x1);
        q = (y1 - a) * (y1 - a) - r0 * r0 + x1 * x1;
        xx1 = (-r - Math.sqrt(r * r - 4 * p * q)) / (2 * p);
        yy1 = a + b * xx1;
        xx2 = (-r + Math.sqrt(r * r - 4 * p * q)) / (2 * p);
        yy2 = a + b * xx2;
      }

      if(new paper.Point(xx1, yy1).point_pos(x1, y1, x2, y2) > 0) {
        return {x: xx1, y: yy1};
      }
      else {
        return {x: xx2, y: yy2}
      }
    }
  },

	arc_point: {
		value(x1,y1, x2,y2, r, arc_ccw, more_180){
			const point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				let dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
				if(dr >= 0){
					centr = this.arc_cntr(x1,y1, x2,y2, r, arc_ccw);
					dx = centr.x - point.x;
					dy = point.y - centr.y;	
					l = Math.sqrt(dx*dx + dy*dy);

					if(more_180)
						h = r+Math.sqrt(dr);
					else
						h = r-Math.sqrt(dr);

					point.x += dx*h/l;
					point.y += dy*h/l;
				}
			}
			return point;
		}
	},

  arc_r: {
	  value(x1,y1,x2,y2,h) {
      if (!h){
        return 0;
      }
	    const [dx, dy] = [(x1-x2), (y1-y2)];
      return (h/2 + (dx * dx + dy * dy) / (8 * h)).round(3);
    }
  },

	snap_to_angle: {
		value(snapAngle) {

			if(!snapAngle){
        snapAngle = Math.PI*2/8;
      }

			let angle = Math.atan2(this.y, this.x);
			angle = Math.round(angle/snapAngle) * snapAngle;

			const dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*this.x + diry*this.y;

			return new paper.Point(dirx*d, diry*d);
		}
	},

  bind_to_nodes: {
	  value(sticking, {activeLayer}) {
      return activeLayer && activeLayer.nodes.some((point) => {
        if(point.is_nearest(this, sticking)){
          this.x = point.x;
          this.y = point.y;
          return true;
        }
      });
    }
  },

});







class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  get is_t() {
    const {cnn} = this;
    if(!cnn || cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное) {
      return false;
    }

    if(cnn.cnn_type == $p.enm.cnn_types.ТОбразное) {
      return true;
    }

    if(cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.vert) {
      return true;
    }

    if(cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.hor) {
      return true;
    }

    return false;
  }

  get is_tt() {
    return !(this.is_i || this.profile_point == 'b' || this.profile_point == 'e' || this.profile == this.parent);
  }

  get is_l() {
    const {cnn} = this;
    const {УгловоеКВертикальной, УгловоеКГоризонтальной} = $p.enm.cnn_types;
    return this.is_t || !!(cnn && (cnn.cnn_type === УгловоеКВертикальной || cnn.cnn_type === УгловоеКГоризонтальной));
  }

  get is_i() {
    return !this.profile && !this.is_cut;
  }

  get is_x() {
    const {cnn} = this;
    return cnn && cnn.cnn_type === $p.enm.cnn_types.КрестВСтык;
  }

  get parent() {
    return this._parent;
  }

  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point) {
      this.profile_point = '';
    }
    if(this.is_cut) {
      this.is_cut = false;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.i) {
      this.cnn = null;
    }
    const {_corns} = this._parent._attr;
    if(_corns.length > 5) {
      _corns.length = 5;
    };
  }

  get err() {
    return this._err;
  }

  set err(v) {
    if(!v) {
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1) {
      this._err.push(v);
    }
  }

  check_err(style) {
    const {_node, _parent, cnn} = this;
    const {_corns, _rays} = _parent._attr;
    const len = _node == 'b' ? _corns[1].getDistance(_corns[4]) : _corns[2].getDistance(_corns[3]);
    const angle = _parent.angle_at(_node);
    if(!cnn ||
      (cnn.lmin && cnn.lmin > len) ||
      (cnn.lmax && cnn.lmax < len) ||
      (cnn.amin && cnn.amin > angle) ||
      (cnn.amax && cnn.amax < angle)
    ) {
      if(style) {
        Object.assign(new paper.Path.Circle({
          center: _node == 'b' ? _corns[4].add(_corns[1]).divide(2) : _corns[2].add(_corns[3]).divide(2),
          radius: 80,
        }), style);
      }
      else {
        _parent.err_spec_row($p.job_prm.nom.critical_error, cnn ? $p.msg.err_seam_len : $p.msg.err_no_cnn);
      }
    }
  }

  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2) {
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }

  set profile(v) {
    this._profile = v;
  }

  get npoint() {
    const point = this.point || this.parent[this.node];
    if(!this.is_tt) {
      return point;
    }
    const {profile} = this;
    if(!profile || !profile.nearest(true)) {
      return point;
    }
    return profile.nearest(true).generatrix.getNearestPoint(point) || point;
  }

  initialize() {

    const {_parent, _node} = this;

    this._err = [];

    this._row = _parent.project.cnns.find({elm1: _parent.elm, node1: _node});

    this._profile;

    if(this._row) {

      this.cnn = this._row.cnn;

      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else {
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else {
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    this.distance = Infinity;

    this.point = null;

    this.profile_point = '';

  }
}

class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, 'b');
    this.e = new CnnPoint(this.parent, 'e');
    this.inner = new paper.Path({insert: false});
    this.outer = new paper.Path({insert: false});
  }

  clear_segments() {
    if(this.inner.segments.length) {
      this.inner.removeSegments();
    }
    if(this.outer.segments.length) {
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn) {
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const gen = parent.generatrix;
    const len = gen.length;

    this.clear();

    if(!len) {
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    let point_b = gen.firstSegment.point,
      tangent_b = gen.getTangentAt(0),
      normal_b = gen.getNormalAt(0),
      point_e = gen.lastSegment.point,
      tangent_e, normal_e;

    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    if(gen.is_linear()) {
      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));
    }
    else {

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for (let i = step; i < len; i += step) {
        point_b = gen.getPointAt(i);
        normal_b = gen.getNormalAt(i);
        this.outer.add(point_b.add(normal_b.normalize(d1)));
        this.inner.add(point_b.add(normal_b.normalize(d2)));
      }

      normal_e = gen.getNormalAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)));
      this.inner.add(point_e.add(normal_e.multiply(d2)));

      tangent_e = gen.getTangentAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
      this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

    }

    this.inner.reverse();
  }

}


class ProfileItem extends GeneratrixElement {

  get d1() {
    return -(this.d0 - this.sizeb);
  }

  get d2() {
    return this.d1 - this.width;
  }

  hhpoint(side) {
    const {layer, rays} = this;
    const {h_ruch, furn} = layer;
    const {furn_set, handle_side} = furn;
    if(!h_ruch || !handle_side || furn_set.empty()) {
      return;
    }
    if(layer.profile_by_furn_side(handle_side) == this) {
      return rays[side].intersect_point(layer.handle_line(this));
    }
  }

  get hhi() {
    return this.hhpoint('inner');
  }

  get hho() {
    return this.hhpoint('outer');
  }

  get cnn1() {
    return this.cnn_point('b').cnn || $p.cat.cnns.get();
  }

  set cnn1(v) {
    const {rays} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.b.cnn != cnn) {
      rays.b.cnn = cnn;
      this.project.register_change();
    }
  }

  get cnn2() {
    return this.cnn_point('e').cnn || $p.cat.cnns.get();
  }

  set cnn2(v) {
    const {rays} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.e.cnn != cnn) {
      rays.e.cnn = cnn;
      this.project.register_change();
    }
  }

  angle_at(p) {
    const {profile, point} = this.cnn_point(p);
    if(!profile || !point) {
      return 90;
    }
    const g1 = this.generatrix;
    const g2 = profile.generatrix;
    let offset1 = g1.getOffsetOf(g1.getNearestPoint(point)),
      offset2 = g2.getOffsetOf(g2.getNearestPoint(point));
    if(offset1 < 10){
      offset1 = 10;
    }
    else if(Math.abs(offset1 - g1.length) < 10){
      offset1 = g1.length - 10;
    }
    if(offset2 < 10){
      offset2 = 10;
    }
    else if(Math.abs(offset2 - g2.length) < 10){
      offset2 = g2.length - 10;
    }
    const t1 = g1.getTangentAt(offset1);
    const t2 = g2.getTangentAt(offset2);
    const a = t2.negate().getDirectedAngle(t1).round(1);
    return a > 180 ? a - 180 : (a < 0 ? -a : a);
  }

  get a1() {
    return this.angle_at('b');
  }

  get a2() {
    return this.angle_at('e');
  }

  get info() {
    return '№' + this.elm + ' α:' + this.angle_hor.toFixed(0) + '° l:' + this.length.toFixed(0);
  }

  get r() {
    return this._row.r;
  }

  set r(v) {
    const {_row, _attr} = this;
    if(_row.r != v) {
      _attr._rays.clear();
      _row.r = v;
      this.set_generatrix_radius();
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get rmin() {
    return this.generatrix.rmin();
  }

  get rmax() {
    return this.generatrix.rmax();
  }

  get arc_ccw() {
    return this._row.arc_ccw;
  }

  set arc_ccw(v) {
    const {_row, _attr} = this;
    if(_row.arc_ccw != v) {
      _attr._rays.clear();
      _row.arc_ccw = v;
      this.set_generatrix_radius();
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get arc_h() {
    const {_row, b, e, generatrix} = this;
    if(_row.r) {
      const p = generatrix.getPointAt(generatrix.length / 2);
      return paper.Line.getSignedDistance(b.x, b.y, e.x, e.y, p.x, p.y).round(1);
    }
    return 0;
  }

  set arc_h(v) {
    const {_row, _attr, b, e, arc_h} = this;
    v = parseFloat(v);
    if(arc_h != v) {
      _attr._rays.clear();
      if(v < 0) {
        v = -v;
        _row.arc_ccw = true;
      }
      else {
        _row.arc_ccw = false;
      }
      _row.r = b.arc_r(b.x, b.y, e.x, e.y, v);
      this.set_generatrix_radius(v);
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get angle_hor() {
    const {b, e} = this;
    const res = (new paper.Point(e.x - b.x, b.y - e.y)).angle.round(2);
    return res < 0 ? res + 360 : res;
  }

  get length() {
    const {b, e, outer} = this.rays;
    const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
    const ppoints = {};

    for (let i = 1; i <= 4; i++) {
      ppoints[i] = gen.getNearestPoint(this.corns(i));
    }

    ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
    ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

    const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
    const res = sub_gen.length + (b.cnn ? b.cnn.sz : 0) + (e.cnn ? e.cnn.sz : 0);
    sub_gen.remove();

    return res;
  }

  get orientation() {
    let {angle_hor} = this;
    if(angle_hor > 180) {
      angle_hor -= 180;
    }
    if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
      (angle_hor > 180 - consts.orientation_delta && angle_hor < 180 + consts.orientation_delta)) {
      return $p.enm.orientations.hor;
    }
    if((angle_hor > 90 - consts.orientation_delta && angle_hor < 90 + consts.orientation_delta) ||
      (angle_hor > 270 - consts.orientation_delta && angle_hor < 270 + consts.orientation_delta)) {
      return $p.enm.orientations.vert;
    }
    return $p.enm.orientations.incline;
  }

  get rays() {
    const {_rays} = this._attr;
    if(!_rays.inner.segments.length || !_rays.outer.segments.length) {
      _rays.recalc();
    }
    return _rays;
  }

  get addls() {
    return this.children.filter((elm) => elm instanceof ProfileAddl);
  }

  get oxml() {
    const oxml = {
      ' ': [
        {id: 'info', path: 'o.info', type: 'ro'},
        'inset',
        'clr'
      ],
      'Начало': ['x1','y1','a1','cnn1'],
      'Конец': ['x2','y2','a2','cnn2']
    };
    if(this.selected_cnn_ii()) {
      oxml['Примыкание'] = ['cnn3'];
    }
    return oxml;
  }

  get default_clr_str() {
    return 'FEFEFE';
  }

  get opacity() {
    return this.path ? this.path.opacity : 1;
  }

  set opacity(v) {
    this.path && (this.path.opacity = v);
  }

  get dx0() {
    const {cnn} = this.rays.b;
    const main_row = cnn && cnn.main_row(this);
    return main_row && main_row.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? -main_row.sz : 0;
  }

  setSelection(selection) {
    super.setSelection(selection);

    const {generatrix, path} = this._attr;

    generatrix.setSelection(selection);
    this.ruler_line_select(false);

    if(selection) {

      const {inner, outer} = this.rays;

      if(this._hatching) {
        this._hatching.removeChildren();
      }
      else {
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        });
      }

      path.setSelection(0);

      for (let t = 0; t < inner.length; t += 50) {
        const ip = inner.getPointAt(t);
        const np = inner.getNormalAt(t).multiply(400).rotate(-35).negate();
        const fp = new paper.Path({
          insert: false,
          segments: [ip, ip.add(np)]
        });
        const op = fp.intersect_point(outer, ip);

        if(ip && op) {
          const cip = path.getNearestPoint(ip);
          const cop = path.getNearestPoint(op);
          const nip = cip.is_nearest(ip);
          const nop = cop.is_nearest(op);
          if(nip && nop) {
            this._hatching.moveTo(cip);
            this._hatching.lineTo(cop);
          }
          else if(nip && !nop) {
            const pp = fp.intersect_point(path, op);
            if(pp) {
              this._hatching.moveTo(cip);
              this._hatching.lineTo(pp);
            }
          }
          else if(!nip && nop) {
            const pp = fp.intersect_point(path, ip);
            if(pp) {
              this._hatching.moveTo(pp);
              this._hatching.lineTo(cop);
            }
          }
        }
      }

    }
    else {
      if(this._hatching) {
        this._hatching.remove();
        this._hatching = null;
      }
    }
  }

  ruler_line_select(mode) {

    const {_attr} = this;

    if(_attr.ruler_line_path) {
      _attr.ruler_line_path.remove();
      delete _attr.ruler_line_path;
    }

    if(mode) {
      switch (_attr.ruler_line = mode) {

      case 'inner':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(3), this.corns(4));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      case 'outer':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(1), this.corns(2));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      default:
        this.generatrix.selected = true;
        break;
      }
    }
    else if(_attr.ruler_line) {
      delete _attr.ruler_line;
    }
  }

  ruler_line_coordin(xy) {
    switch (this._attr.ruler_line) {
    case 'inner':
      return (this.corns(3)[xy] + this.corns(4)[xy]) / 2;
    case 'outer':
      return (this.corns(1)[xy] + this.corns(2)[xy]) / 2;
    default:
      return (this.b[xy] + this.e[xy]) / 2;
    }
  }

  save_coordinates() {

    const {_attr, _row, rays, generatrix, project: {cnns}} = this;

    if(!generatrix) {
      return;
    }

    const b = rays.b;
    const e = rays.e;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: 'b',
      cnn: b.cnn,
      aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: 'e',
      cnn: e.cnn,
      aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;

    const rmin = generatrix.rmin();
    if(rmin) {
      _row.r = ((rmin + generatrix.rmax()) / 2).round();
    }
    else {
      _row.r = 0;
    }

    _row.len = this.length.round(1);

    if(b.profile) {
      row_b.elm2 = b.profile.elm;
      if(b.profile.e.is_nearest(b.point)) {
        row_b.node2 = 'e';
      }
      else if(b.profile.b.is_nearest(b.point)) {
        row_b.node2 = 'b';
      }
      else {
        row_b.node2 = 't';
      }
    }
    if(e.profile) {
      row_e.elm2 = e.profile.elm;
      if(e.profile.b.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else if(e.profile.e.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else {
        row_e.node2 = 't';
      }
    }

    const nrst = this.nearest();
    if(nrst) {
      cnns.add({
        elm1: _row.elm,
        elm2: nrst.elm,
        cnn: _attr._nearest_cnn,
        aperture_len: _row.len
      });
    }

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0) {
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0) {
      _row.alp2 = _row.alp2 + 360;
    }

    _row.elm_type = this.elm_type;

    _row.orientation = this.orientation;
    _row.pos = this.pos;

    this.addls.forEach((addl) => addl.save_coordinates());
  }

  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    if(attr.r) {
      _row.r = attr.r;
    }

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
      if(_attr.generatrix._reversed) {
        delete _attr.generatrix._reversed;
      }
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else {
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r) {
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2, _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else {
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    _attr._corns = [];

    _attr._rays = new ProfileRays(this);

    _attr.generatrix.strokeColor = 'gray';

    _attr.path = new paper.Path();
    _attr.path.strokeColor = 'black';
    _attr.path.strokeWidth = 1;
    _attr.path.strokeScaling = false;
    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

    this.addChild(_attr.path);
    this.addChild(_attr.generatrix);

  }

  observer(an) {
    const {profiles} = an;
    if(profiles) {
      if(profiles.indexOf(this) == -1) {
        profiles.forEach((p) => {
          this.do_bind(p, this.cnn_point('b'), this.cnn_point('e'), an);
        });
        profiles.push(this);
      }
    }
    else if(an instanceof Profile || an instanceof ProfileConnective) {
      this.do_bind(an, this.cnn_point('b'), this.cnn_point('e'));
    }
  }

  cnn_side(profile, interior, rays) {
    if(!interior) {
      interior = profile.interiorPoint();
    }
    if(!rays) {
      rays = this.rays;
    }
    if(!rays || !interior || !rays.inner.length || ! rays.outer.length) {
      return $p.enm.cnn_sides.Изнутри;
    }
    return rays.inner.getNearestPoint(interior).getDistance(interior, true) <
    rays.outer.getNearestPoint(interior).getDistance(interior, true) ? $p.enm.cnn_sides.Изнутри : $p.enm.cnn_sides.Снаружи;
  }

  set_generatrix_radius(height) {
    const {generatrix, _row, layer, selected} = this;
    const b = generatrix.firstSegment.point.clone();
    const e = generatrix.lastSegment.point.clone();
    const min_radius = b.getDistance(e) / 2;

    generatrix.removeSegments(1);
    generatrix.firstSegment.handleIn = null;
    generatrix.firstSegment.handleOut = null;

    let full;
    if(_row.r && _row.r <= min_radius) {
      _row.r = min_radius + 0.0001;
      full = true;
    }
    if(height && height > min_radius) {
      height = min_radius;
    }

    if(selected) {
      this.selected = false;
    }

    if(_row.r) {
      let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
      if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw) {
        p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
      }
      if(full || height) {
        const start = b.add(e).divide(2);
        const vector = p.subtract(start);
        vector.normalize(height || min_radius);
        p = start.add(vector);
      }
      generatrix.arcTo(p, e);
    }
    else {
      generatrix.lineTo(e);
    }

    layer.notify({
      type: consts.move_points,
      profiles: [this],
      points: []
    });

    if(selected) {
      setTimeout(() => this.selected = selected, 100);
    }
  }

  set_inset(v, ignore_select) {

    const {_row, _attr, project} = this;

    if(!ignore_select && project.selectedItems.length > 1) {
      project.selected_profiles(true).forEach((elm) => {
        if(elm != this && elm.elm_type == this.elm_type) {
          elm.set_inset(v, true);
        }
      });
    }

    if(_row.inset != v) {

      _row.inset = v;

      if(_attr && _attr._rays) {

        _attr._rays.clear(true);

        const b = this.cnn_point('b');
        const e = this.cnn_point('e');
        const {cnns} = project;

        if(b.profile && b.profile_point == 'e') {
          const {_rays} = b.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.e.cnn = null;
          }
        }
        if(e.profile && e.profile_point == 'b') {
          const {_rays} = e.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.b.cnn = null;
          }
        }

        const {inner, outer} = this.joined_imposts();
        const elm2 = this.elm;
        for (const {profile} of inner.concat(outer)) {
          const {b, e} = profile.rays;
          b.profile == this && b.clear(true);
          e.profile == this && e.clear(true);
        }

        for (const {_attr, elm} of this.joined_nearests()) {
          _attr._rays && _attr._rays.clear(true);
          _attr._nearest_cnn = null;
          cnns.clear({elm1: elm, elm2});
        }

        this.layer.glasses(false, true).forEach((glass) => {
          cnns.clear({elm1: glass.elm, elm2});
        });
      }

      project.register_change();
    }
  }

  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1) {
      this.project.selected_profiles(true).forEach((elm) => {
        if(elm != this) {
          elm.set_clr(v, true);
        }
      });
    }
    BuilderElement.prototype.set_clr.call(this, v);
  }

  postcalc_cnn(node) {
    const cnn_point = this.cnn_point(node);

    cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

    if(!cnn_point.point) {
      cnn_point.point = this[node];
    }

    return cnn_point;
  }

  postcalc_inset() {
    this.set_inset(this.project.check_inset({elm: this}), true);
    return this;
  }

  default_inset(all) {
    const {orientation, project, _attr, elm_type} = this;
    const nearest = this.nearest(true);

    if(nearest || all) {
      let pos = nearest && project._dp.sys.flap_pos_by_impost && elm_type == $p.enm.elm_types.Створка ? nearest.pos : this.pos;
      if(pos == $p.enm.positions.Центр) {
        if(orientation == $p.enm.orientations.vert) {
          pos = [pos, $p.enm.positions.ЦентрВертикаль];
        }
        if(orientation == $p.enm.orientations.hor) {
          pos = [pos, $p.enm.positions.ЦентрГоризонталь];
        }
      }
      this.set_inset(this.project.default_inset({
        elm_type: elm_type,
        pos: pos,
        inset: this.inset
      }), true);
    }
    if(nearest) {
      _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, _attr._nearest, $p.enm.cnn_types.acn.ii, _attr._nearest_cnn);
    }
  }

  path_points(cnn_point, profile_point) {

    const {_attr, rays, generatrix} = this;
    if(!generatrix.curves.length) {
      return cnn_point;
    }
    const _profile = this;
    const {_corns} = _attr;


    function intersect_point(path1, path2, index, ipoint = cnn_point.point) {
      const intersections = path1.getIntersections(path2);
      let delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1) {
        if(index) {
          _corns[index] = intersections[0].point;
        }
        else {
          return intersections[0].point.getDistance(ipoint, true);
        }
      }
      else if(intersections.length > 1) {
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(ipoint, true);
          if(tdelta < delta) {
            delta = tdelta;
            point = o.point;
          }
        });
        if(index) {
          _corns[index] = point;
        }
        else {
          return delta;
        }
      }
    }

    const prays = cnn_point.profile instanceof ProfileItem ?
      cnn_point.profile.rays :
      (cnn_point.profile instanceof Filling ? {inner: cnn_point.profile.path, outer: cnn_point.profile.path} : undefined);

    const {cnn_type} = cnn_point.cnn || {};
    const {cnn_types} = $p.enm;
    if(cnn_point.is_t || (cnn_type == cnn_types.xx && !cnn_point.profile_point)) {

      if(!cnn_point.profile.path.segments.length) {
        const {_attr, row} = cnn_point.profile;
        if(_attr.force_redraw) {
          if(cnn_point.profile.generatrix && cnn_point.profile.generatrix.segments.length) {
            cnn_point.profile.path.addSegments(cnn_point.profile.generatrix.segments);
            _attr.force_redraw = false;
          }
          else if(cnn_point.profile.row && cnn_point.profile.row.path_data) {
            cnn_point.profile.path.pathData = cnn_point.profile.row.path_data;
            _attr.force_redraw = false;
          }
          else {
            throw new Error('cycle redraw');
          }
        }
        else {
          _attr.force_redraw = true;
          cnn_point.profile.redraw();
          _attr.force_redraw = false;
        }
      }

      const nodes = new Set();
      let profile2;
      cnn_point.point && !(this instanceof Onlay) && this.layer.profiles.forEach((profile) => {
        if(profile !== this){
          if(cnn_point.point.is_nearest(profile.b, true)) {
            const cp = profile.cnn_point('b').profile;
            if(cp !== this) {
              if(cp !== cnn_point.profile || cnn_point.profile.cnn_side(this) === cnn_point.profile.cnn_side(profile)) {
                nodes.add(profile);
              }
            }
          }
          else if(cnn_point.point.is_nearest(profile.e, true)) {
            const cp = profile.cnn_point('e').profile;
            if(cp !== this) {
              if(cp !== cnn_point.profile || cnn_point.profile.cnn_side(this) === cnn_point.profile.cnn_side(profile)) {
                nodes.add(profile);
              }
            }
          }
          else if(profile.generatrix.is_nearest(cnn_point.point, true)) {
            nodes.add(profile);
          }
        }
      });
      nodes.forEach((p2) => {
        if(p2 !== cnn_point.profile) {
          profile2 = p2;
        }
      });

      const side = cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи ? 'outer' : 'inner';

      if(profile2) {
        const interior = generatrix.getPointAt(generatrix.length/2)
        const prays2 = profile2 && profile2.rays;
        const side2 = profile2.cnn_side(this, null, prays2) === $p.enm.cnn_sides.Снаружи ? 'outer' : 'inner';
        const pt1 = intersect_point(prays[side], rays.outer, 0, interior);
        const pt2 = intersect_point(prays[side], rays.inner, 0, interior);
        const pt3 = intersect_point(prays2[side2], rays.outer, 0, interior);
        const pt4 = intersect_point(prays2[side2], rays.inner, 0, interior);

        if(profile_point == 'b') {
          pt1 < pt3 ? intersect_point(prays[side], rays.outer, 1) : intersect_point(prays2[side2], rays.outer, 1);
          pt2 < pt4 ? intersect_point(prays[side], rays.inner, 4) : intersect_point(prays2[side2], rays.inner, 4);
          intersect_point(prays2[side2], prays[side], 5);
          if(rays.inner.point_pos(_corns[5]) >= 0 || rays.outer.point_pos(_corns[5]) >= 0) {
            delete _corns[5];
          }
        }
        else if(profile_point == 'e') {
          pt1 < pt3 ? intersect_point(prays[side], rays.outer, 2) : intersect_point(prays2[side2], rays.outer, 2);
          pt2 < pt4 ? intersect_point(prays[side], rays.inner, 3) : intersect_point(prays2[side2], rays.inner, 3);
          intersect_point(prays2[side2], prays[side], 6);
          if(rays.inner.point_pos(_corns[6]) >= 0 || rays.outer.point_pos(_corns[6]) >= 0) {
            delete _corns[6];
          }
        }
      }
      else {
        if(profile_point == 'b') {
          intersect_point(prays[side], rays.outer, 1);
          intersect_point(prays[side], rays.inner, 4);
          delete _corns[5];
        }
        else if(profile_point == 'e') {
          intersect_point(prays[side], rays.outer, 2);
          intersect_point(prays[side], rays.inner, 3);
          delete _corns[6];
        }
      }

    }
    else if(cnn_type == cnn_types.xx) {

      if(cnn_point.profile instanceof Onlay) {
        const width = this.width * 0.7;
        const l = profile_point == 'b' ? width : generatrix.length - width;
        const p = generatrix.getPointAt(l);
        const n = generatrix.getNormalAt(l).normalize(width);
        const np = new paper.Path({
          insert: false,
          segments: [p.subtract(n), p.add(n)],
        });
        if(profile_point == 'b') {
          intersect_point(np, rays.outer, 1);
          intersect_point(np, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(np, rays.outer, 2);
          intersect_point(np, rays.inner, 3);
        }
      }
      else {
        const cnn_point2 = cnn_point.profile.cnn_point(cnn_point.profile_point);
        const profile2 = cnn_point2 && cnn_point2.profile;
        if(profile2) {
          const prays2 = profile2 && profile2.rays;
          const pt1 = intersect_point(prays.inner, rays.outer);
          const pt2 = intersect_point(prays.inner, rays.inner);
          const pt3 = intersect_point(prays2.inner, rays.outer);
          const pt4 = intersect_point(prays2.inner, rays.inner);

          if(profile_point == 'b') {
            intersect_point(prays2.inner, prays.inner, 5);
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 1) : intersect_point(prays2.inner, rays.outer, 1);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 4) : intersect_point(prays2.inner, rays.inner, 4);
          }
          else if(profile_point == 'e') {
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 2) : intersect_point(prays2.inner, rays.outer, 2);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 3) : intersect_point(prays2.inner, rays.inner, 3);
            intersect_point(prays2.inner, prays.inner, 6);
          }
        }
        else{
          if(profile_point == 'b') {
            delete _corns[1];
            delete _corns[4];
          }
          else if(profile_point == 'e') {
            delete _corns[2];
            delete _corns[3];
          }
        }
      }

    }
    else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_type == cnn_types.i) {
      if(profile_point == 'b') {
        delete _corns[1];
        delete _corns[4];
      }
      else if(profile_point == 'e') {
        delete _corns[2];
        delete _corns[3];
      }
    }
    else if(cnn_type == cnn_types.ad) {
      if(profile_point == 'b') {
        intersect_point(prays.outer, rays.outer, 1);
        intersect_point(prays.inner, rays.inner, 4);
      }
      else if(profile_point == 'e') {
        intersect_point(prays.outer, rays.outer, 2);
        intersect_point(prays.inner, rays.inner, 3);
      }

    }
    else if(cnn_type == cnn_types.av) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }
    else if(cnn_type == cnn_types.ah) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }

    if(profile_point == 'b') {
      if(!_corns[1]) {
        _corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]) {
        _corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == 'e') {
      if(!_corns[2]) {
        _corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]) {
        _corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }

    return cnn_point;
  }

  interiorPoint() {
    const {generatrix, d1, d2} = this;
    const igen = generatrix.curves.length == 1 ? generatrix.firstCurve.getPointAt(0.5, true) : (
      generatrix.curves.length == 2 ? generatrix.firstCurve.point2 : generatrix.curves[1].point2
    );
    const normal = generatrix.getNormalAt(generatrix.getOffsetOf(igen));
    return igen.add(normal.multiply(d1).add(normal.multiply(d2)).divide(2));
  }


  select_corn(point) {

    const res = this.corns(point);

    this.path.segments.forEach((segm) => {
      if(segm.point.is_nearest(res.point)) {
        res.segm = segm;
      }
    });

    if(!res.segm && res.point == this.b) {
      res.segm = this.generatrix.firstSegment;
    }

    if(!res.segm && res.point == this.e) {
      res.segm = this.generatrix.lastSegment;
    }

    if(res.segm && res.dist < consts.sticking0) {
      this.project.deselectAll();
      res.segm.selected = true;
    }

    return res;
  }

  is_linear() {
    return this.generatrix.is_linear();
  }

  is_nearest(p) {
    return (this.b.is_nearest(p.b, true) || this.generatrix.is_nearest(p.b)) &&
      (this.e.is_nearest(p.e, true) || this.generatrix.is_nearest(p.e));
  }

  is_collinear(p) {
    let angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
    if(angl < -180) {
      angl += 180;
    }
    return Math.abs(angl) < consts.orientation_delta;
  }

  joined_nearests() {
    return [];
  }

  redraw() {
    const bcnn = this.postcalc_cnn('b');
    const ecnn = this.postcalc_cnn('e');
    const {path, generatrix, rays, project} = this;

    this.path_points(bcnn, 'b');
    this.path_points(ecnn, 'e');

    path.removeSegments();

    this.corns(5) && path.add(this.corns(5));
    path.add(this.corns(1));

    if(generatrix.is_linear()) {
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));
    }
    else {

      let tpath = new paper.Path({insert: false});
      let offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
      let offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
      let step = (offset2 - offset1) / 50;

      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.outer.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));

      tpath = new paper.Path({insert: false});
      offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
      offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
      step = (offset2 - offset1) / 50;
      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.inner.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);

    }

    path.add(this.corns(4));
    path.closePath();
    path.reduce();

    this.children.forEach((elm) => {
      if(elm instanceof ProfileAddl) {
        elm.observer(elm.parent);
        elm.redraw();
      }
    });

    return this;
  }


  corns(corn) {
    const {_corns} = this._attr;
    if(typeof corn == 'number') {
      return _corns[corn];
    }
    else if(corn instanceof paper.Point) {

      const res = {dist: Infinity, profile: this};
      let dist;

      for (let i = 1; i < 5; i++) {
        dist = _corns[i].getDistance(corn);
        if(dist < res.dist) {
          res.dist = dist;
          res.point = _corns[i];
          res.point_name = i;
        }
      }

      const {hhi} = this;
      if(hhi) {
        dist = hhi.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hhi.getDistance(corn);
          res.point = hhi;
          res.point_name = 'hhi';
        }
        const {hho} = this;
        dist = hho.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hho.getDistance(corn);
          res.point = hho;
          res.point_name = 'hho';
        }
      }

      dist = this.b.getDistance(corn);
      if(dist <= res.dist) {
        res.dist = this.b.getDistance(corn);
        res.point = this.b;
        res.point_name = 'b';
      }
      else {
        dist = this.e.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = this.e.getDistance(corn);
          res.point = this.e;
          res.point_name = 'e';
        }
      }

      return res;
    }
    else {
      const index = corn.substr(corn.length - 1, 1);
      const axis = corn.substr(corn.length - 2, 1);
      return _corns[index][axis];
    }
  }

  has_cnn(profile, point) {

    let t = this;
    while (t.parent instanceof ProfileItem) {
      t = t.parent;
    }
    while (profile.parent instanceof ProfileItem) {
      profile = profile.parent;
    }

    if(
      (t.b.is_nearest(point, true) && t.cnn_point('b').profile == profile) ||
      (t.e.is_nearest(point, true) && t.cnn_point('e').profile == profile) ||
      (profile.b.is_nearest(point, true) && profile.cnn_point('b').profile == t) ||
      (profile.e.is_nearest(point, true) && profile.cnn_point('e').profile == t)
    ) {
      return true;
    }

    return false;
  }

  check_distance(element, res, point, check_only) {
    return this.project.check_distance(element, this, res, point, check_only);
  }

  max_right_angle(ares) {
    const {generatrix} = this;
    let has_a = true;
    ares.forEach((res) => {
      res._angle = generatrix.angle_to(res.profile.generatrix, res.point);
      if(res._angle > 180) {
        res._angle = 360 - res._angle;
      }
    });
    ares.sort((a, b) => {
      const aa = Math.abs(a._angle - 90);
      const ab = Math.abs(b._angle - 90);
      return aa - ab;
    });
    return has_a;
  }

}


class Profile extends ProfileItem {

  constructor(attr) {

    const fromCoordinates = !!attr.row;

    super(attr);

    if(this.parent) {
      const {project, observer} = this;

      this.observer = observer.bind(this);
      project._scope.eve.on(consts.move_points, this.observer);

      this.layer.on_insert_elm(this);

      if(fromCoordinates){
        const {cnstr, elm} = attr.row;
        project.ox.coordinates.find_rows({cnstr, parent: {in: [elm, -elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => new ProfileAddl({row, parent: this}));
      }
    }

  }

  get d0() {
    const {_attr} = this;
    if(!_attr.hasOwnProperty('d0')) {
      _attr.d0 = 0;
      const nearest = this.nearest();
      if(nearest) {
        _attr.d0 -= nearest.d2 + (_attr._nearest_cnn ? _attr._nearest_cnn.sz : 20);
      }
    }
    return _attr.d0;
  }

  get elm_type() {
    const {_rays, _nearest} = this._attr;

    if(_rays && !_nearest && (_rays.b.is_tt || _rays.e.is_tt)) {
      return $p.enm.elm_types.Импост;
    }

    if(this.layer.parent instanceof Contour) {
      return $p.enm.elm_types.Створка;
    }

    return $p.enm.elm_types.Рама;
  }

  get pos() {
    const by_side = this.layer.profiles_by_side();
    if(by_side.top == this) {
      return $p.enm.positions.Верх;
    }
    if(by_side.bottom == this) {
      return $p.enm.positions.Низ;
    }
    if(by_side.left == this) {
      return $p.enm.positions.Лев;
    }
    if(by_side.right == this) {
      return $p.enm.positions.Прав;
    }
    return $p.enm.positions.Центр;
  }

  nearest(ign_cnn) {

    const {b, e, _attr, layer, project} = this;
    let {_nearest, _nearest_cnn} = _attr;

    if(!ign_cnn && this.inset.empty()) {
      ign_cnn = true;
    }

    const check_nearest = (elm) => {
      if(!(elm instanceof Profile || elm instanceof ProfileConnective) || !elm.isInserted()) {
        return;
      }
      let {generatrix} = elm;
      if(elm.elm_type === $p.enm.elm_types.Импост) {
        const pb = elm.cnn_point('b').profile;
        const pe = elm.cnn_point('e').profile;
        if(pb && pb.nearest(true) || pe && pe.nearest(true)) {
          generatrix = generatrix.clone({insert: false}).elongation(90);
        }
      }
      let is_nearest = [];
      if(generatrix.is_nearest(b)) {
        is_nearest.push(b);
      }
      if(generatrix.is_nearest(e)) {
        is_nearest.push(e);
      }
      if(is_nearest.length < 2 && elm instanceof ProfileConnective) {
        if(this.generatrix.is_nearest(elm.b)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.b))) {
            is_nearest.push(elm.b);
          }
        }
        if(this.generatrix.is_nearest(elm.e)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.e))) {
            is_nearest.push(elm.e);
          }
        }
      }

      if(is_nearest.length > 1) {
        if(!ign_cnn) {
          if(!_nearest_cnn) {
            _nearest_cnn = project.elm_cnn(this, elm);
          }
          let outer;
          if(elm.is_linear()) {
            outer = Math.abs(elm.angle_hor - this.angle_hor) > 60;
          }
          else {
            const ob = generatrix.getOffsetOf(generatrix.getNearestPoint(b));
            const oe = generatrix.getOffsetOf(generatrix.getNearestPoint(e));
            outer = ob > oe;
          }
          _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, elm, $p.enm.cnn_types.acn.ii, _nearest_cnn, false, outer);
        }
        _attr._nearest = elm;
        return true;
      }

      _attr._nearest = null;
      _attr._nearest_cnn = null;
    };

    const find_nearest = (children) => children.some((elm) => {
      if(_nearest == elm || !elm.generatrix) {
        return;
      }
      if(check_nearest(elm)) {
        return true;
      }
      else {
        _attr._nearest = null;
      }
    });

    if(layer && !check_nearest(_attr._nearest)) {
      if(layer.parent) {
        find_nearest(layer.parent.profiles);
      }
      else {
        find_nearest(project.l_connective.children);
      }
    }

    return _attr._nearest;
  }

  joined_imposts(check_only) {

    const {rays, generatrix, layer} = this;
    const tinner = [];
    const touter = [];

    const candidates = {b: [], e: []};

    const {Снаружи} = $p.enm.cnn_sides;
    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === Снаружи) {
        touter.push(res);
      }
      else {
        tinner.push(res);
      }
    };

    if(layer.profiles.some((curr) => {
        if(curr != this) {
          for(const pn of ['b', 'e']) {
            const p = curr.cnn_point(pn);
            if(p.profile == this && p.cnn) {

              if(p.cnn.cnn_type == $p.enm.cnn_types.t) {
                if(check_only) {
                  return true;
                }
                add_impost(curr.corns(1), curr, p.point);
              }
              else {
                candidates[pn].push(curr.corns(1));
              }
            }
          }
        }
      })) {
      return true;
    }

    ['b', 'e'].forEach((node) => {
      if(candidates[node].length > 1) {
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) === Снаружи) {
            this.cnn_point(node).is_cut = true;
            return true;
          }
        });
      }
    });

    return check_only ? false : {inner: tinner, outer: touter};

  }

  joined_nearests() {
    const res = [];

    this.layer.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) == this) {
          res.push(profile);
        }
      });
    });

    return res;
  }

  cnn_point(node, point) {
    const res = this.rays[node];
    const {cnn, profile, profile_point} = res;

    if(!point) {
      point = this[node];
    }

    if(profile && profile.children.length) {
      if(this.check_distance(profile, res, point, true) === false || res.distance < consts.epsilon) {
        return res;
      }
    }

    res.clear();
    if(this.parent) {
      const {allow_open_cnn} = this.project._dp.sys;
      const ares = [];

      for(const profile of this.parent.profiles) {
        if(this.check_distance(profile, res, point, false) === false || (res.distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l))) {
          ares.push({
            profile_point: res.profile_point,
            profile: profile,
            cnn_types: res.cnn_types,
            point: res.point
          });
          res.clear();
        }
      }

      if(ares.length === 1) {
        res._mixin(ares[0]);
      }
      else if(ares.length >= 2) {
        if(this.max_right_angle(ares)) {
          res._mixin(ares[0]);
          if(cnn && res.cnn_types && res.cnn_types.indexOf(cnn.cnn_type) != -1) {
            res.cnn = cnn;
          }
        }
        else {
          res.clear();
        }
        res.is_cut = true;
      }
    }

    return res;
  }

  do_bind(profile, bcnn, ecnn, moved) {

    let moved_fact;

    if(profile instanceof ProfileConnective) {
      const gen = profile.generatrix.clone({insert: false}).elongation(1000);
      this._attr._rays.clear();
      this.b = gen.getNearestPoint(this.b);
      this.e = gen.getNearestPoint(this.e);
      moved_fact = true;
    }
    else {
      if(bcnn.cnn && bcnn.profile == profile) {
        if($p.enm.cnn_types.acn.a.indexOf(bcnn.cnn.cnn_type) != -1) {
          if(!this.b.is_nearest(profile.e, 0)) {
            if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.b.getDistance(profile.e, true) < consts.sticking2) {
                  this.b = profile.e;
                }
                moved_fact = true;
              }
            }
            else {
              bcnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        else if($p.enm.cnn_types.acn.t.indexOf(bcnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'b')) {
          moved_fact = true;
        }
      }

      if(ecnn.cnn && ecnn.profile == profile) {
        if($p.enm.cnn_types.acn.a.indexOf(ecnn.cnn.cnn_type) != -1) {
          if(!this.e.is_nearest(profile.b, 0)) {
            if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.e.getDistance(profile.b, true) < consts.sticking2) {
                  this.e = profile.b;
                }
                moved_fact = true;
              }
            }
            else {
              ecnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        else if($p.enm.cnn_types.acn.t.indexOf(ecnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'e')) {
          moved_fact = true;
        }
      }
    }

    if(moved && moved_fact) {
      const imposts = this.joined_imposts();
      imposts.inner.concat(imposts.outer).forEach((impost) => {
        if(moved.profiles.indexOf(impost) == -1) {
          impost.profile.observer(this);
        }
      });
    }
  }

  t_parent(be) {
    if(this.elm_type != $p.enm.elm_types.Импост) {
      return this;
    }
    const {_rays} = this._attr;
    if(be === 'b') {
      return _rays && _rays.b.profile;
    }
    if(be === 'e') {
      return _rays && _rays.e.profile;
    }
    return _rays && (_rays.b.profile || _rays.e.profile);
  }
}

EditorInvisible.Profile = Profile;
EditorInvisible.ProfileItem = ProfileItem;



class ProfileAddl extends ProfileItem {

  constructor(attr) {

    const fromCoordinates = !!attr.row;

    super(attr);

    const {project, _attr, _row} = this;

    _attr.generatrix.strokeWidth = 0;

    if(!attr.side && _row.parent < 0){
      attr.side = "outer";
    }

    _attr.side = attr.side || "inner";

    if(!_row.parent){
      _row.parent = this.parent.elm;
      if(this.outer){
        _row.parent = -_row.parent;
      }
    }

    if(fromCoordinates){
      const {cnstr, elm} = attr.row;
      project.ox.coordinates.find_rows({cnstr, parent: {in: [elm, -elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => new ProfileAddl({row, parent: this}));
    }

  }

  get d0() {
    this.nearest();
    return this._attr._nearest_cnn ? -this._attr._nearest_cnn.sz : 0;
  }

  get outer() {
    return this._attr.side == "outer";
  }

  get elm_type() {
    return $p.enm.elm_types.Добор;
  }

  nearest() {
    const {_attr, parent, project} = this;
    const _nearest_cnn = _attr._nearest_cnn || project.elm_cnn(this, parent);
    _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, parent, $p.enm.cnn_types.acn.ii, _nearest_cnn, true);
    return parent;
  }

  cnn_point(node, point) {

    const res = this.rays[node];

    const check_distance = (elm, with_addl) => {

        if(elm == this || elm == this.parent){
          return;
        }

        const gp = elm.generatrix.getNearestPoint(point);
        let distance;

        if(gp && (distance = gp.getDistance(point)) < consts.sticking){
          if(distance <= res.distance){
            res.point = gp;
            res.distance = distance;
            res.profile = elm;
          }
        }

        if(with_addl){
          elm.getItems({class: ProfileAddl, parent: elm}).forEach((addl) => {
            check_distance(addl, with_addl);
          });
        }

      };

    if(!point){
      point = this[node];
    }

    if(res.profile && res.profile.children.length){
      check_distance(res.profile);
      if(res.distance < consts.sticking){
        return res;
      }
    }

    res.clear();
    res.cnn_types = $p.enm.cnn_types.acn.t;

    this.layer.profiles.forEach((addl) => check_distance(addl, true));

    return res;
  }

  path_points(cnn_point, profile_point) {

    const {generatrix, rays} = this;
    const interior = generatrix.getPointAt(generatrix.length/2);

    const _profile = this;
    const _corns = this._attr._corns;

    if(!generatrix.curves.length){
      return cnn_point;
    }

    function intersect_point(path1, path2, index){
      var intersections = path1.getIntersections(path2),
        delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1)
        if(index)
          _corns[index] = intersections[0].point;
        else
          return intersections[0].point.getDistance(cnn_point.point, true);

      else if(intersections.length > 1){
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(cnn_point.point, true);
          if(tdelta < delta){
            delta = tdelta;
            point = o.point;
          }
        });
        if(index)
          _corns[index] = point;
        else
          return delta;
      }
    }

    const {profile} = cnn_point;
    if(profile){
      const prays = profile.rays;

      if(!profile.path.segments.length){
        profile.redraw();
      }

      if(profile_point == "b"){
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else{
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
      }
      else if(profile_point == "e"){
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
        else{
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
    }

    if(profile_point == "b"){
      if(!_corns[1]){
        _corns[1] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]){
        _corns[4] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == "e"){
      if(!_corns[2]){
        _corns[2] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]){
        _corns[3] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }
    return cnn_point;
  }

  do_bind(p, bcnn, ecnn, moved) {

    let imposts, moved_fact;

    const bind_node = (node, cnn) => {

        if(!cnn.profile){
          return;
        }

        const gen = this.outer ? this.parent.rays.outer : this.parent.rays.inner;
        const mpoint = cnn.profile.generatrix.intersect_point(gen, cnn.point, "nearest");
        if(!mpoint.is_nearest(this[node])){
          this[node] = mpoint;
          moved_fact = true;
        }

      };

    if(this.parent == p){
      bind_node("b", bcnn);
      bind_node("e", ecnn);
    }

    if(bcnn.cnn && bcnn.profile == p){

      bind_node("b", bcnn);

    }
    if(ecnn.cnn && ecnn.profile == p){

      bind_node("e", ecnn);

    }

    if(moved && moved_fact){
    }
  }

  glass_segment() {

  }

}



class ProfileConnective extends ProfileItem {

  constructor(attr) {
    super(attr);
    this.parent = this.project.l_connective;
  }

  get d0() {
    return 0;
  }

  get elm_type() {
    return $p.enm.elm_types.Соединитель;
  }

  cnn_point(node) {
    return this.rays[node];
  }

  move_points(delta, all_points, start_point) {

    const nearests = this.joined_nearests();
    const moved = {profiles: []};

    super.move_points(delta, all_points, start_point);

    if(all_points !== false && !paper.Key.isDown('control')){
      nearests.forEach((np) => {
        np.do_bind(this, null, null, moved);
        ['b', 'e'].forEach((node) => {
          const cp = np.cnn_point(node);
          if(cp.profile){
            cp.profile.do_bind(np, cp.profile.cnn_point("b"), cp.profile.cnn_point("e"), moved);
          }
        });
      });
    }

    this.project.register_change();
  }

  joined_nearests() {

    const res = [];

    this.project.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) === this){
          res.push(profile);
        }
      });
    });

    return res;

  }

  nearest() {
    return null;
  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, generatrix} = this;

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.nom = this.nom;
    _row.path_data = generatrix.pathData;
    _row.parent = 0;

    _row.len = this.length;

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0){
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0){
      _row.alp2 = _row.alp2 + 360;
    }

    _row.elm_type = this.elm_type;

  }

  remove() {
    this.joined_nearests().forEach((rama) => {

      const {inner, outer} = rama.joined_imposts();
      for (const {profile} of inner.concat(outer)) {
        profile.rays.clear();
      }
      for (const {_attr, elm} of rama.joined_nearests()) {
        _attr._rays && _attr._rays.clear();
      }

      const {_attr, layer} = rama;
      _attr._rays && _attr._rays.clear();
      if(_attr._nearest){
        _attr._nearest = null;
      }
      if(_attr._nearest_cnn){
        _attr._nearest_cnn = null;
      }

      layer && layer.notify && layer.notify({profiles: [rama], points: []}, consts.move_points);

    });
    super.remove();
  }

}


class ConnectiveLayer extends paper.Layer {

  redraw() {
    this.children.forEach((elm) => elm.redraw());
  }

  save_coordinates() {
    this.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
  }

  glasses() {
    return [];
  }

  notify(obj, type = 'update') {
  }
}

EditorInvisible.ProfileConnective = ProfileConnective;


class BaseLine extends ProfileItem {

  constructor(attr) {
    super(attr);
    this.parent = this.project.l_connective;
    Object.assign(this.generatrix, {
      strokeColor: 'brown',
      fillColor: new paper.Color(1, 0.1),
      strokeScaling: false,
      strokeWidth: 2,
      dashOffset: 4,
      dashArray: [4, 4],
    })
  }

  get d0() {
    return 0;
  }

  get d1() {
    return 0;
  }

  get d2() {
    return 0;
  }

  get path() {
    return this.generatrix;
  }
  set path(v) {
  }

  setSelection(selection) {
    paper.Item.prototype.setSelection.call(this, selection);
  }

  get oxml() {
    return BaseLine.oxml;
  }

  get elm_type() {
    return $p.enm.elm_types.Линия;
  }

  get length() {
    return this.generatrix.length;
  }

  nearest() {
    return null;
  }

  joined_nearests() {

    const res = [];

    this.project.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) === this){
          res.push(profile);
        }
      });
    });

    return res;

  }

  joined_imposts(check_only) {
    const tinner = [];
    const touter = [];
    return check_only ? false : {inner: tinner, outer: touter};
  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row} = this;

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = this.generatrix.pathData;
    _row.parent = this.parent.elm;
    _row.len = this.length;
    _row.angle_hor = this.angle_hor;
    _row.elm_type = this.elm_type;
  }

  cnn_point(node) {
    return this.rays[node];
  }

  redraw() {

  }

}

BaseLine.oxml = {
  ' ': [
    {id: 'info', path: 'o.info', type: 'ro'},
  ],
  'Начало': ['x1', 'y1'],
  'Конец': ['x2', 'y2']
};



class Onlay extends ProfileItem {

  get d0() {
    return 0;
  }

  get elm_type() {
    return $p.enm.elm_types.Раскладка;
  }

  nearest() {

  }

  joined_imposts(check_only) {

    const {rays, generatrix, parent} = this;
    const tinner = [];
    const touter = [];

    const candidates = {b: [], e: []};

    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === $p.enm.cnn_sides.Снаружи) {
        touter.push(res);
      }
      else {
        tinner.push(res);
      }
    };

    if(parent.imposts.some((curr) => {
        if(curr != this) {
          for(const pn of ['b', 'e']) {
            const p = curr.cnn_point(pn);
            if(p.profile == this && p.cnn) {

              if(p.cnn.cnn_type == $p.enm.cnn_types.t) {
                if(check_only) {
                  return true;
                }
                add_impost(curr.corns(1), curr, p.point);
              }
              else {
                candidates[pn].push(curr.corns(1));
              }
            }
          }
        }
      })) {
      return true;
    }

    ['b', 'e'].forEach((node) => {
      if(candidates[node].length > 1) {
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) == $p.enm.cnn_sides.Снаружи) {
            this.cnn_point(node).is_cut = true;
            return true;
          }
        });
      }
    });

    return check_only ? false : {inner: tinner, outer: touter};

  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, project, rays, generatrix} = this;
    const {cnns} = project;
    const {b, e} = rays;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: "b",
      cnn: b.cnn ? b.cnn.ref : "",
      aperture_len: this.corns(1).getDistance(this.corns(4))
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: "e",
      cnn: e.cnn ? e.cnn.ref : "",
      aperture_len: this.corns(2).getDistance(this.corns(3))
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;
    _row.parent = this.parent.elm;


    _row.len = this.length;

    if(b.profile){
      row_b.elm2 = b.profile.elm;
      if(b.profile instanceof Filling)
        row_b.node2 = "t";
      else if(b.profile.e.is_nearest(b.point))
        row_b.node2 = "e";
      else if(b.profile.b.is_nearest(b.point))
        row_b.node2 = "b";
      else
        row_b.node2 = "t";
    }
    if(e.profile){
      row_e.elm2 = e.profile.elm;
      if(e.profile instanceof Filling)
        row_e.node2 = "t";
      else if(e.profile.b.is_nearest(e.point))
        row_e.node2 = "b";
      else if(e.profile.e.is_nearest(e.point))
        row_e.node2 = "b";
      else
        row_e.node2 = "t";
    }

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0)
      _row.alp1 = _row.alp1 + 360;

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0)
      _row.alp2 = _row.alp2 + 360;

    _row.elm_type = this.elm_type;
  }

  cnn_point(node, point) {

    const res = this.rays[node];

    if(!point){
      point = this[node];
    }

    if(res.profile && res.profile.children.length){

      if(res.profile instanceof Filling){
        const np = res.profile.path.getNearestPoint(point);
        if(np.getDistance(point) < consts.sticking_l){
          res.point = np;
          return res;
        }
      }
      else{
        if(this.check_distance(res.profile, res, point, true) === false || res.distance < consts.epsilon){
          return res;
        }
      }
    }

    res.clear();
    if(this.parent){
      const res_bind = this.bind_node(point);
      if(res_bind.binded){
        res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
      }
    }
    return res;
  }

  bind_node(point, glasses) {

    if(!glasses){
      glasses = [this.parent];
    }

    let res = {distance: Infinity, is_l: true};

    glasses.some((glass) => {
      const np = glass.path.getNearestPoint(point);
      let distance = np.getDistance(point);

      if(distance < res.distance){
        res.distance = distance;
        res.point = np;
        res.profile = glass;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }

      if(distance < consts.sticking_l){
        res.binded = true;
        return true;
      }

      res.cnn_types = $p.enm.cnn_types.acn.t;
      const ares = [];
      for(let elm of glass.imposts){
        if (elm !== this && elm.project.check_distance(elm, null, res, point, "node_generatrix") === false ){
          ares.push({
            profile_point: res.profile_point,
            profile: res.profile,
            cnn_types: res.cnn_types,
            point: res.point});
        }
      }

      if(ares.length == 1){
        res._mixin(ares[0]);
      }
      else if(ares.length >= 2){
        if(this.max_right_angle(ares)){
          res._mixin(ares[0]);
        }
        res.is_cut = true;
      }

    });

    if(!res.binded && res.point && res.distance < consts.sticking){
      res.binded = true;
    }

    return res;
  }

  move_nodes(from, to) {
    for(let elm of this.parent.imposts){
      if(elm == this){
        continue;
      }
      if(elm.b.is_nearest(from)){
        elm.b = to;
      }
      if(elm.e.is_nearest(from)){
        elm.e = to;
      }
    }
  }

}




class Scheme extends paper.Project {

  constructor(_canvas, _editor, _silent) {

    super(_canvas);

    const _scheme = _editor.project = this;

    const _attr = this._attr = {
      _silent,
      _bounds: null,
      _calc_order_row: null,
      _update_timer: 0
    };

    const _changes = this._ch = [];

    this._dp = $p.dp.buyers_order.create();

    this.magnetism = new Magnetism(this);

    const isBrowser = typeof requestAnimationFrame === 'function';

    this.redraw = () => {

      _attr._opened && !_attr._silent && _scheme._scope && isBrowser && requestAnimationFrame(_scheme.redraw);

      if(!_attr._opened || _attr._saving || !_changes.length) {
        return;
      }

      _changes.length = 0;
      const {contours} = _scheme;

      if(contours.length) {

        _scheme.l_connective.redraw();

        isBrowser && contours[0].refresh_prm_links(true);

        for (let contour of contours) {
          contour.redraw();
          if(_changes.length) {
            return;
          }
        }

        _attr._bounds = null;
        contours.forEach(({contours, l_dimensions}) => {
          contours.forEach((l) => {
            l.save_coordinates(true);
            isBrowser && l.refresh_prm_links();
          });
          l_dimensions.redraw();
        });

        _scheme.draw_sizes();

        _scheme.view.update();

      }
      else {
        _scheme.draw_sizes();
      }

    };

    if(!_attr._silent) {
      this._dp_listener = this._dp_listener.bind(this);
      this._dp._manager.on('update', this._dp_listener);
    }
  }

  _dp_listener(obj, fields) {

    const {_attr, ox, _scope} = this;

    if(_attr._loading || _attr._snapshot || obj != this._dp) {
      return;
    }

    const scheme_changed_names = ['clr', 'sys'];
    const row_changed_names = ['quantity', 'discount_percent', 'discount_percent_internal'];

    if(fields.hasOwnProperty('clr') || fields.hasOwnProperty('sys')) {
      this.notify(this, 'scheme_changed');
    }

    if(fields.hasOwnProperty('clr')) {
      ox.clr = obj.clr;
      this.getItems({class: ProfileItem}).forEach((p) => {
        if(!(p instanceof Onlay)) {
          p.clr = obj.clr;
        }
      });
    }

    if(fields.hasOwnProperty('sys') && !obj.sys.empty()) {

      obj.sys.refill_prm(ox);

      _scope.eve.emit_async('rows', ox, {extra_fields: true, params: true});

      for (const contour of this.contours) {
        contour.on_sys_changed();
      }

      if(obj.sys != $p.wsql.get_user_param('editor_last_sys')) {
        $p.wsql.set_user_param('editor_last_sys', obj.sys.ref);
      }

      if(ox.clr.empty()) {
        ox.clr = obj.sys.default_clr;
      }

      this.register_change(true);
    }

    for (const name of row_changed_names) {
      if(_attr._calc_order_row && fields.hasOwnProperty(name)) {
        _attr._calc_order_row[name] = obj[name];
        this.register_change(true);
      }
    }

  }

  _papam_listener(obj, fields) {
    const {_attr, ox} = this;
    if(_attr._loading || _attr._snapshot) {
      return;
    }
    if(obj._owner === ox.params || (obj === ox && fields.hasOwnProperty('params'))) {
      this.register_change();
    }
  }

  elm_cnn(elm1, elm2) {
    let res;
    this.cnns.find_rows({
      elm1: elm1.elm,
      elm2: elm2.elm
    }, (row) => {
      res = row.cnn;
      return false;
    });
    return res;
  }

  get cnns() {
    return this.ox.cnn_elmnts;
  }

  get ox() {
    return this._dp.characteristic;
  }

  set ox(v) {
    const {_dp, _attr, _scope} = this;
    let setted;

    if(!_attr._silent) {
      if(!this.hasOwnProperty('_papam_listener')){
        this._papam_listener = this._papam_listener.bind(this);
      }
      _dp.characteristic._manager.off('update', this._papam_listener);
      _dp.characteristic._manager.off('rows', this._papam_listener);
    }

    _dp.characteristic = v;

    const ox = _dp.characteristic;

    _dp.len = ox.x;
    _dp.height = ox.y;
    _dp.s = ox.s;
    _dp.sys = ox.sys;
    _dp.clr = ox.clr;

    _attr._calc_order_row = ox.calc_order_row;

    if(_attr._calc_order_row) {
      'quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note'.split(',').forEach((fld) => _dp[fld] = _attr._calc_order_row[fld]);
    }
    else {
    }


    if(_dp.sys.empty()) {
      if(ox.owner.empty()) {
        _dp.sys = $p.wsql.get_user_param('editor_last_sys');
        setted = !_dp.sys.empty();
      }
      else {
        $p.cat.production_params.find_rows({is_folder: false}, (o) => {
          if(setted) {
            return false;
          }
          o.production.find_rows({nom: ox.owner}, () => {
            _dp.sys = o;
            setted = true;
            return false;
          });
        });
      }
    }

    if(setted) {
      _dp.sys.refill_prm(ox);
    }

    if(_dp.clr.empty()) {
      _dp.clr = _dp.sys.default_clr;
    }

    if(!_attr._silent) {
      _scope.eve.emit_async('rows', ox, {constructions: true});
      _dp._manager.emit_async('rows', _dp, {extra_fields: true});

      _dp.characteristic._manager.on({
        update: this._papam_listener,
        rows: this._papam_listener,
      });
    }

  }

  get builder_props() {
    return this.ox.builder_props;
  }

  load_dimension_lines() {
    const {Размер, Радиус} = $p.enm.elm_types;
    this.ox.coordinates.find_rows({elm_type: {in: [Размер, Радиус]}}, (row) => {
      const layer = this.getItem({cnstr: row.cnstr});
      const Constructor = row.elm_type === Размер ? DimensionLineCustom : DimensionRadius;
      layer && new Constructor({
        parent: layer.l_dimensions,
        row: row
      });
    });
  }

  load_contour(parent) {
    this.ox.constructions.find_rows({parent: parent ? parent.cnstr : 0}, (row) => {
      this.load_contour(new Contour({parent: parent, row: row}));
    });
  }

  load(id, from_service) {
    const {_attr} = this;
    const _scheme = this;

    function load_object(o) {

      _scheme.ox = o;

      _attr._opened = true;
      _attr._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });

      o.coordinates.forEach((row) => {
        if(row.elm_type === $p.enm.elm_types.Соединитель) {
          new ProfileConnective({row});
        }
        else if(row.elm_type === $p.enm.elm_types.Линия) {
          new BaseLine({row});
        }
      })
      o = null;

      _scheme.load_contour(null);

      _scheme.redraw(from_service);

      return new Promise((resolve, reject) => {

        _attr._bounds = null;

        _scheme.load_dimension_lines();

        setTimeout(() => {

          _attr._bounds = null;
          _scheme.zoom_fit();

          const {_scope} = _scheme;

          if(!_attr._snapshot) {
            _scope._undo.clear();
            _scope._undo.save_snapshot(_scheme);
            _scope.set_text();
          }

          _scheme.register_change(true);

          if(_scheme.contours.length) {
            _scheme.notify(_scheme.contours[0], 'layer_activated', true);
          }

          delete _attr._loading;

          ((_scheme.ox.base_block.empty() || !_scheme.ox.base_block.is_new()) ? Promise.resolve() : _scheme.ox.base_block.load())
            .then(() => {
              if(_scheme.ox.coordinates.count()) {
                if(_scheme.ox.specification.count() || from_service) {
                  if(from_service){
                    Promise.resolve().then(() => {
                      _scheme.draw_visualization();
                      _scheme.zoom_fit();
                      resolve();
                    })
                  }
                  else{
                    setTimeout(() => _scheme.draw_visualization(), 100);
                  }
                }
                else {
                  $p.products_building.recalc(_scheme, {});
                }
              }
              else {
                if(from_service){
                  resolve();
                }
                else{
                  _scope.load_stamp && _scope.load_stamp();
                }
              }
              delete _attr._snapshot;

              (!from_service || !_scheme.ox.specification.count()) && resolve();
            });
        });
      });
    }

    _attr._loading = true;
    if(id != this.ox) {
      this.ox = null;
    }
    this.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new()) {
      return load_object(id);
    }
    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)) {
      return $p.cat.characteristics.get(id, true, true)
        .then((ox) =>
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(() => load_object(ox))
        );
    }
  }

  draw_fragment(attr) {

    const {l_dimensions, l_connective} = this;

    const contours = this.getItems({class: Contour});
    contours.forEach((l) => l.hidden = true);
    l_dimensions.visible = false;
    l_connective.visible = false;

    let elm;
    if(attr.elm > 0) {
      elm = this.getItem({class: BuilderElement, elm: attr.elm});
      elm.draw_fragment && elm.draw_fragment();
    }
    else if(attr.elm < 0) {
      const cnstr = -attr.elm;
      contours.some((l) => {
        if(l.cnstr == cnstr) {
          l.hidden = false;
          l.hide_generatrix();
          l.l_dimensions.redraw(true);
          l.zoom_fit();
          return true;
        }
      });
    }
    this.view.update();
    return elm;
  }

  has_changes() {
    return this._ch.length > 0;
  }

  register_update() {
    const {_attr} = this;
    if(_attr._update_timer) {
      clearTimeout(_attr._update_timer);
    }
    _attr._update_timer = setTimeout(() => {
      this.view && this.view.update();
      _attr._update_timer = 0;
    }, 100);
  }

  register_change(with_update) {

    const {_attr, _ch} = this;

    if(!_attr._loading) {

      _attr._bounds = null;

      this.getItems({class: Profile}).forEach((p) => {
        delete p._attr.d0;
      });

      this.ox._data._modified = true;
      this.notify(this, 'scheme_changed');
    }
    _ch.push(Date.now());

    if(with_update) {
      this.register_update();
    }
  }

  get bounds() {
    const {_attr} = this;
    if(!_attr._bounds) {
      this.contours.forEach((l) => {
        if(!_attr._bounds) {
          _attr._bounds = l.bounds;
        }
        else {
          _attr._bounds = _attr._bounds.unite(l.bounds);
        }
      });
    }
    return _attr._bounds;
  }

  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLine}).forEach((dl) => {
      if(dl instanceof DimensionLineCustom || dl._attr.impost || dl._attr.contour) {
        bounds = bounds.unite(dl.bounds);
      }
    });
    this.contours.forEach(({l_visualization}) => {
      const ib = l_visualization._by_insets.bounds;
      if(ib.height && ib.bottom > bounds.bottom) {
        const delta = ib.bottom - bounds.bottom + 10;
        bounds = bounds.unite(
          new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
        );
      }
    });
    return bounds;
  }

  get strokeBounds() {
    let bounds = this.l_dimensions.strokeBounds;
    this.contours.forEach((l) => bounds = bounds.unite(l.strokeBounds));
    return bounds;
  }

  get _calc_order_row() {
    const {_attr, ox} = this;
    if(!_attr._calc_order_row && !ox.empty()) {
      _attr._calc_order_row = ox.calc_order_row;
    }
    return _attr._calc_order_row;
  }

  notify(obj, type = 'update', fields) {
    if(obj.type) {
      type = obj.type;
    }
    this._scope.eve.emit_async(type, obj, fields);
  }

  clear() {
    const {_attr} = this;
    const pnames = '_bounds,_update_timer,_loading,_snapshot,_silent';
    for (let fld in _attr) {
      if(!pnames.match(fld)) {
        delete _attr[fld];
      }
    }

    super.clear();
  }

  unload() {
    const {_dp, _attr, _calc_order_row} = this;
    const pnames = '_loading,_saving';
    for (let fld in _attr) {
      if(pnames.match(fld)) {
        _attr[fld] = true;
      }
      else {
        delete _attr[fld];
      }
    }

    if(this.hasOwnProperty('_dp_listener')){
      _dp._manager.off('update', this._dp_listener);
      this._dp_listener = null;
    }

    const ox = _dp.characteristic;
    if(this.hasOwnProperty('_papam_listener')){
      ox._manager.off('update', this._papam_listener);
      ox._manager.off('rows', this._papam_listener);
      this._papam_listener = null;
    }
    if(ox && ox._modified) {
      if(ox.is_new()) {
        if(_calc_order_row) {
          ox.calc_order.production.del(_calc_order_row);
        }
        ox.unload();
      }
      else {
        setTimeout(ox.load.bind(ox), 100);
      }
    }

    this.remove();
  }

  move_points(delta, all_points) {

    const other = [];
    const layers = [];
    const profiles = new Set;

    const {auto_align, _dp} = this;

    for (const item of this.selectedItems) {
      const {parent, layer} = item;

      if(item instanceof paper.Path && parent instanceof GeneratrixElement && !profiles.has(parent)) {

        profiles.add(parent);

        if(parent._hatching) {
          parent._hatching.remove();
          parent._hatching = null;
        }

        if(layer instanceof ConnectiveLayer) {
          other.push.apply(other, parent.move_points(delta, all_points));
        }
        else if(!parent.nearest || !parent.nearest()) {

          if(auto_align && parent.elm_type == $p.enm.elm_types.Импост) {
            continue;
          }

          let check_selected;
          item.segments.forEach((segm) => {
            if(segm.selected && other.indexOf(segm) != -1) {
              check_selected = !(segm.selected = false);
            }
          });

          if(check_selected && !item.segments.some((segm) => segm.selected)) {
            continue;
          }

          other.push.apply(other, parent.move_points(delta, all_points));

          if(layers.indexOf(layer) == -1) {
            layers.push(layer);
            layer.l_dimensions.clear();
          }
        }
      }
      else if(item instanceof Filling) {
        item.purge_paths();
      }
    }

    other.length && this.do_align(auto_align, profiles);

    _dp._manager.emit_async('update', {}, {x1: true, x2: true, y1: true, y2: true, a1: true, a2: true, cnn1: true, cnn2: true, info: true});

  }

  save_coordinates(attr) {

    const {_attr, bounds, ox} = this;

    if(!bounds) {
      return;
    }

    _attr._saving = true;
    ox._data._loading = true;

    ox.x = bounds.width.round(1);
    ox.y = bounds.height.round(1);
    ox.s = this.area;

    ox.cnn_elmnts.clear();
    ox.glasses.clear();

    this.contours.forEach((contour) => contour.save_coordinates());

    this.l_connective.save_coordinates();

    $p.products_building.recalc(this, attr);

  }

  zoom_fit(bounds, isNode) {

    if(!bounds) {
      bounds = this.strokeBounds;
    }

    if (bounds) {
      if(!isNode) {
        isNode = $p.wsql.alasql.utils.isNode;
      }
      const space = isNode ? 160 : 320;
      const min = 900;
      let {width, height, center} = bounds;
      if (width < min) {
        width = min;
      }
      if (height < min) {
        height = min;
      }
      width += space;
      height += space;
      const {view} = this;
      view.zoom = Math.min(view.viewSize.height / height, view.viewSize.width / width);
      const dx = view.viewSize.width - width * view.zoom;
      if(isNode) {
        const dy = view.viewSize.height - height * view.zoom;
        view.center = center.add([dx, -dy]);
      }
      else {
        view.center = center.add([dx / 2, 50]);
      }
    }
  }

  get_svg(attr) {
    this.deselectAll();

    const svg = this.exportSVG();
    const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

    svg.setAttribute('x', bounds.x);
    svg.setAttribute('y', bounds.y);
    svg.setAttribute('width', bounds.width);
    svg.setAttribute('height', bounds.height);
    svg.querySelector('g').removeAttribute('transform');

    return svg.outerHTML;
  }

  load_stamp(obx, is_snapshot) {

    const do_load = (obx) => {

      const {ox} = this;

      this.clear();

      ox._mixin(is_snapshot ? obx :
        obx._obj, null, ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'base_block', 'note', 'partner'], true);

      if(!is_snapshot) {
        ox.base_block = (obx.base_block.empty() || obx.base_block.calc_order.obj_delivery_state === $p.enm.obj_delivery_states.Шаблон) ? obx : obx.base_block;
      }

      this.load(ox);
      ox._data._modified = true;

    };

    this._attr._loading = true;

    if(is_snapshot) {
      this._attr._snapshot = true;
      do_load(obx);
    }
    else {
      $p.cat.characteristics.get(obx, true, true).then(do_load);
    }
  }

  get auto_align() {
    const {calc_order, base_block} = this.ox;
    const {Шаблон} = $p.enm.obj_delivery_states;
    if(base_block.empty() || calc_order.obj_delivery_state == Шаблон || base_block.calc_order.obj_delivery_state != Шаблон) {
      return false;
    }
    const {auto_align} = $p.job_prm.properties;
    let align;
    if(auto_align) {
      base_block.params.find_rows({param: auto_align}, (row) => {
        align = row.value;
        return false;
      });
      return align && align != '_' && align;
    }
  }

  do_align(auto_align, profiles) {

    if(!auto_align || !profiles.size) {
      return;
    }

    const layers = new Set();
    for (const profile of profiles) {
      profile.layer.fillings && layers.add(profile.layer);
    }

    if(this._attr._align_timer) {
      clearTimeout(this._attr._align_timer);
    }

    this._attr._align_timer = setTimeout(() => {

      this._attr._align_timer = 0;

      const glasses = [];
      for (const layer of layers) {
        for(const filling of layer.fillings){
          glasses.indexOf(filling) == -1 && glasses.push(filling);
        }
      }
      this._scope.glass_align('width', glasses);

    }, 100);

  }

  resize_canvas(w, h) {
    const {viewSize} = this.view;
    viewSize.width = w;
    viewSize.height = h;
  }

  get contours() {
    return this.layers.filter((l) => l instanceof Contour);
  }

  get area() {
    return this.contours.reduce((sum, {area}) => sum + area, 0).round(3);
  }

  get form_area() {
    return this.contours.reduce((sum, {form_area}) => sum + form_area, 0).round(3);
  }

  get clr() {
    return this.ox.clr;
  }

  set clr(v) {
    this.ox.clr = v;
  }

  get l_dimensions() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_dimensions) {
      _attr.l_dimensions = new DimensionLayer();
    }
    if(!_attr.l_dimensions.isInserted()) {
      this.addLayer(_attr.l_dimensions);
    }
    if(activeLayer) {
      this._activeLayer = activeLayer;
    }

    return _attr.l_dimensions;
  }

  get l_connective() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_connective) {
      _attr.l_connective = new ConnectiveLayer();
    }
    if(!_attr.l_connective.isInserted()) {
      this.addLayer(_attr.l_connective);
    }
    if(activeLayer) {
      this._activeLayer = activeLayer;
    }

    return _attr.l_connective;
  }

  draw_sizes() {

    const {bounds, l_dimensions, builder_props} = this;

    if(bounds && builder_props.auto_lines) {

      if(!l_dimensions.bottom) {
        l_dimensions.bottom = new DimensionLine({
          pos: 'bottom',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.bottom.offset = -120;
      }

      if(!l_dimensions.right) {
        l_dimensions.right = new DimensionLine({
          pos: 'right',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.right.offset = -120;
      }



      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'right' && Math.abs(dl.size - bounds.height) < consts.sticking_l))) {
        l_dimensions.right.visible = false;
      }
      else {
        l_dimensions.right.redraw();
      }

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'bottom' && Math.abs(dl.size - bounds.width) < consts.sticking_l))) {
        l_dimensions.bottom.visible = false;
      }
      else {
        l_dimensions.bottom.redraw();
      }
    }
    else {
      if(l_dimensions.bottom) {
        l_dimensions.bottom.visible = false;
      }
      if(l_dimensions.right) {
        l_dimensions.right.visible = false;
      }
    }
  }

  draw_visualization() {
    if(this.view){
      for (let contour of this.contours) {
        contour.draw_visualization();
      }
      this.view.update();
    }
  }

  default_inset(attr) {

    let rows;

    if(!attr.pos) {
      rows = this._dp.sys.inserts(attr.elm_type, true);
      if(attr.inset && rows.some((row) => attr.inset == row)) {
        return attr.inset;
      }
      return rows[0];
    }

    rows = this._dp.sys.inserts(attr.elm_type, 'rows');

    if(rows.length == 1) {
      return rows[0].nom;
    }

    const pos_array = Array.isArray(attr.pos);

    function check_pos(pos) {
      if(pos_array) {
        return attr.pos.some((v) => v == pos);
      }
      return attr.pos == pos;
    }

    if(attr.inset && rows.some((row) => attr.inset == row.nom && (check_pos(row.pos) || row.pos == $p.enm.positions.Любое))) {
      return attr.inset;
    }

    let inset;
    rows.some((row) => {
      if(check_pos(row.pos) && row.by_default) {
        return inset = row.nom;
      }
    });
    if(!inset) {
      rows.some((row) => {
        if(check_pos(row.pos)) {
          return inset = row.nom;
        }
      });
    }
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое && row.by_default) {
          return inset = row.nom;
        }
      });
    }
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое) {
          return inset = row.nom;
        }
      });
    }

    return inset;
  }

  check_inset(attr) {
    const inset = attr.inset ? attr.inset : attr.elm.inset;
    const elm_type = attr.elm ? attr.elm.elm_type : attr.elm_type;
    const rows = [];

    let finded;
    this._dp.sys.elmnts.forEach((row) => {
      if((elm_type ? row.elm_type == elm_type : true)) {
        if(row.nom === inset) {
          finded = true;
          return false;
        }
        rows.push(row);
      }
    });


    if(finded) {
      return inset;
    }
    if(rows.length) {
      return rows[0].nom;
    }

  }

  check_distance(element, profile, res, point, check_only) {
    const {acn} = $p.enm.cnn_types;

    let distance, gp, cnns, addls,
      bind_node = typeof check_only == 'string' && check_only.indexOf('node') != -1,
      bind_generatrix = typeof check_only == 'string' ? check_only.indexOf('generatrix') != -1 : check_only,
      node_distance;

    function check_node_distance(node) {

      if((distance = element[node].getDistance(point)) < parseFloat(consts.sticking_l)) {

        if(typeof res.distance == 'number' && res.distance < distance) {
          res.profile = element;
          res.profile_point = node;
          return 1;
        }

        if(profile && (!res.cnn || res.cnn.empty())) {

          cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
          if(!cnns.length) {
            if(!element.is_collinear(profile)) {
              cnns = $p.cat.cnns.nom_cnn(profile, element, acn.t);
            }
            if(!cnns.length) {
              return 1;
            }
          }



        }
        else if(res.cnn && acn.a.indexOf(res.cnn.cnn_type) == -1) {
          return 1;
        }

        res.point = bind_node ? element[node] : point;
        res.distance = distance;
        res.profile = element;
        if(cnns && cnns.length && acn.t.indexOf(cnns[0].cnn_type) != -1) {
          res.profile_point = '';
          res.cnn_types = acn.t;
          if(!res.cnn) {
            res.cnn = cnns[0];
          }
        }
        else {
          res.profile_point = node;
          res.cnn_types = acn.a;
        }

        return 2;
      }

    }

    const b = res.profile_point === 'b' ? 'b' : 'e';
    const e = b === 'b' ? 'e' : 'b';

    if(element === profile) {
      if(profile.is_linear()) {
        return;
      }
      else {

      }
      return;
    }
    else if((node_distance = check_node_distance(b)) || (node_distance = check_node_distance(e))) {
      if(res.cnn_types !== acn.a && res.profile_point){
        res.cnn_types = acn.a;
        res.distance = distance;
      }
      return node_distance == 2 ? false : void(0);
    }

    res.profile_point = '';


    gp = element.generatrix.getNearestPoint(point);
    distance = gp.getDistance(point);

    if(distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l)) {

      if(distance < res.distance || bind_generatrix) {
        if(element.d0 != 0 && element.rays.outer) {
          res.point = element.rays.outer.getNearestPoint(point);
          res.distance = 0;
        }
        else {
          res.point = gp;
          res.distance = distance;
        }
        res.profile = element;
        res.cnn_types = acn.t;
      }
      if(bind_generatrix) {
        return false;
      }
    }
  }

  default_clr(attr) {
    return this.ox.clr;
  }

  get default_furn() {
    var sys = this._dp.sys,
      res;
    while (true) {
      if(res = $p.job_prm.builder.base_furn[sys.ref]) {
        break;
      }
      if(sys.empty()) {
        break;
      }
      sys = sys.parent;
    }
    if(!res) {
      res = $p.job_prm.builder.base_furn.null;
    }
    if(!res) {
      $p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ''}}, (row) => {
        res = row;
        return false;
      });
    }
    return res;
  }

  selected_profiles(all) {
    const res = [];
    const count = this.selectedItems.length;

    this.selectedItems.forEach((item) => {

      const p = item.parent;

      if(p instanceof ProfileItem) {
        if(all || !item.layer.parent || !p.nearest || !p.nearest()) {

          if(res.indexOf(p) != -1) {
            return;
          }

          if(count < 2 || !(p._attr.generatrix.firstSegment.selected ^ p._attr.generatrix.lastSegment.selected)) {
            res.push(p);
          }

        }
      }
    });

    return res;
  }

  selected_glasses() {
    const res = [];

    this.selectedItems.forEach((item) => {

      if(item instanceof Filling && res.indexOf(item) == -1) {
        res.push(item);
      }
      else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1) {
        res.push(item.parent);
      }
    });

    return res;
  }

  get selected_elm() {
    let res;
    this.selectedItems.some((item) => {
      if(item instanceof BuilderElement) {
        return res = item;

      }
      else if(item.parent instanceof BuilderElement) {
        return res = item.parent;
      }
    });
    return res;
  }

  hitPoints(point, tolerance, selected_first) {
    let item, hit;
    let dist = Infinity;

    function check_corns(elm) {
      const corn = elm.corns(point);
      if(corn.dist < dist) {
        dist = corn.dist;
        if(corn.dist < consts.sticking) {
          hit = {
            item: elm.generatrix,
            point: corn.point
          };
        }
      }
    }

    if(selected_first) {
      this.selectedItems.some((item) => hit = item.hitTest(point, {segments: true, tolerance: tolerance || 8}));
      if(!hit) {
        hit = this.hitTest(point, {segments: true, tolerance: tolerance || 6});
      }
    }
    else {
      for (let elm of this.activeLayer.profiles) {
        check_corns(elm);
        for (let addl of elm.addls) {
          check_corns(addl);
        }
      }
    }

    return hit;
  }

  rootLayer(layer) {
    if(!layer) {
      layer = this.activeLayer;
    }
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }

  deselect_all_points(with_items) {
    this.getItems({class: paper.Path}).forEach((item) => {
      item.segments.forEach((segm) => {
        if(segm.selected) {
          segm.selected = false;
        }
      });
      if(with_items && item.selected) {
        item.selected = false;
      }
    });
  }

  get perimeter() {
    let res = [],
      contours = this.contours,
      tmp;

    if(contours.length == 1) {
      return contours[0].perimeter;
    }



    return res;
  }

  get glasses() {
    return this.getItems({class: Filling});
  }

}


class EditableText extends paper.PointText {

  constructor(props) {
    props.justification = 'center';
    props.fontFamily = 'Mipgost';
    super(props);
    this._edit = null;
    this._owner = props._owner;

    this.on({
      mouseenter: this.mouseenter,
      mouseleave: this.mouseleave,
      click: this.click,
    })
  }

  mouseenter(event) {
    this.project._scope.canvas_cursor('cursor-arrow-ruler-light');
  }

  mouseleave(event) {
    this.project._scope.canvas_cursor('cursor-arrow-white');
  }

  click(event) {
    if(!this._edit) {
      const {view, bounds} = this;
      const point = view.projectToView(bounds.topLeft);
      const edit = this._edit = document.createElement('INPUT');
      view.element.parentNode.appendChild(edit);
      edit.style = `left: ${(point.x - 4).toFixed()}px; top: ${(point.y).toFixed()}px; width: 60px; border: none; position: absolute;`;
      edit.onblur = () => setTimeout(() => this.edit_remove());
      edit.onkeydown = this.edit_keydown.bind(this);
      edit.value = this.content.replace(/\D$/, '');
      setTimeout(() => {
        edit.focus();
        edit.select();
      });
    }
  }

  edit_keydown(event) {
    switch (event.code) {
    case 'Escape':
    case 'Tab':
      return this.edit_remove();
    case 'Enter':
    case 'NumpadEnter':
      this.apply(parseFloat(this._edit.value));
      return this.edit_remove();
    case 'Digit0':
    case 'Digit1':
    case 'Digit2':
    case 'Digit3':
    case 'Digit4':
    case 'Digit5':
    case 'Digit6':
    case 'Digit7':
    case 'Digit8':
    case 'Digit9':
    case 'Numpad0':
    case 'Numpad1':
    case 'Numpad2':
    case 'Numpad3':
    case 'Numpad4':
    case 'Numpad5':
    case 'Numpad6':
    case 'Numpad7':
    case 'Numpad8':
    case 'Numpad9':
    case '.':
    case 'Period':
    case 'NumpadDecimal':
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'Delete':
    case 'Backspace':
      break;
    case 'Comma':
    case ',':
      event.code = '.';
      break;
    default:
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  edit_remove() {
    if(this._edit){
      this._edit.parentNode && this._edit.parentNode.removeChild(this._edit);
      this._edit = null;
    }
  }

  remove() {
    this.edit_remove();
    super.remove();
  }
}

class AngleText extends EditableText {

  constructor(props) {
    props.fillColor = 'blue';
    super(props);
    this._ind = props._ind;
  }

  apply(value) {

    const {project, generatrix, _attr} = this._owner;
    const {zoom} = _attr;
    const {curves, segments} = generatrix;
    const c1 = curves[this._ind - 1];
    const c2 = curves[this._ind];
    const loc1 = c1.getLocationAtTime(0.9);
    const loc2 = c2.getLocationAtTime(0.1);
    const center = c1.point2;
    let angle = loc2.tangent.angle - loc1.tangent.negate().angle;
    if(angle < 0){
      angle += 360;
    }
    const invert = angle > 180;
    if(invert){
      angle = 360 - angle;
    }
    const ray0 = new paper.Point([c2.point2.x - c2.point1.x, c2.point2.y - c2.point1.y]);
    const ray1 = ray0.clone();
    ray1.angle += invert ? angle - value : value - angle;
    const delta = ray1.subtract(ray0);

    let start;
    for(const segment of segments) {
      if(segment.point.equals(c2.point2)) {
        start = true;
      }
      if(start) {
        segment.point = segment.point.add(delta);
      }
    }
    project.register_change(true);

  }
}

class LenText extends EditableText {

  constructor(props) {
    props.fillColor = 'black';
    super(props);
  }

  apply(value) {
    const {path, segment1, segment2, length} = this._owner;
    const {parent: {_attr, project}, segments} = path;
    const {zoom} = _attr;
    const delta = segment1.curve.getTangentAtTime(1).multiply(value * zoom - length);
    let start;
    for(const segment of segments) {
      if(segment === segment2) {
        start = true;
      }
      if(start) {
        segment.point = segment.point.add(delta);
      }
    }
    project.register_change(true);
  }
}

class Sectional extends GeneratrixElement {

  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    _attr._rays = {
      b: {},
      e: {},
      clear() {},
    };

    _attr.children = [];

    _attr.zoom = 5;
    _attr.radius = 40;

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else{
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r){
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
              _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else{
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    _attr.generatrix.strokeColor = 'black';
    _attr.generatrix.strokeWidth = 1;
    _attr.generatrix.strokeScaling = false;
    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

    this.addChild(_attr.generatrix);

  }

  redraw() {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {segments, curves} = generatrix;

    for(let child of children){
      child.remove();
    }

    for(let i = 1; i < segments.length - 1; i++){
      this.draw_angle(i);
    }

    for(let curve of curves){
      const loc = curve.getLocationAtTime(0.5);
      const normal = loc.normal.normalize(radius);
      children.push(new LenText({
        point: loc.point.add(normal).add([0, normal.y < 0 ? 0 : normal.y / 2]),
        content: (curve.length / zoom).toFixed(0),
        fontSize: radius,
        parent: layer,
        _owner: curve
      }));
    }


    return this;
  }

  draw_angle(ind) {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {curves} = generatrix;
    const c1 = curves[ind - 1];
    const c2 = curves[ind];
    const loc1 = c1.getLocationAtTime(0.9);
    const loc2 = c2.getLocationAtTime(0.1);
    const center = c1.point2;
    let angle = loc2.tangent.angle - loc1.tangent.negate().angle;
    if(angle < 0){
      angle += 360;
    }
    if(angle > 180){
      angle = 360 - angle;
    }

    if (c1.length < radius || c2.length < radius || 180 - angle < 1){
      return;
    }

    const from = c1.getLocationAt(c1.length - radius).point;
    const to = c2.getLocationAt(radius).point;
    const end = center.subtract(from.add(to).divide(2)).normalize(radius).negate();
    children.push(new paper.Path.Arc({
      from,
      through: center.add(end),
      to,
      strokeColor: 'grey',
      guide: true,
      parent: layer,
    }));

    children.push(new AngleText({
      point: center.add(end.multiply(-2.2)), 
      content: angle.toFixed(0) + '°',
      fontSize: radius,
      parent: layer,
      _owner: this,
      _ind: ind,
    }));

  }

  save_coordinates() {

    const {_row, generatrix} = this;

    if(!generatrix){
      return;
    }

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;


    _row.len = this.length.round(1);

    _row.elm_type = this.elm_type;

  }

  cnn_point() {

  }

  get length() {
    const {generatrix, zoom} = this._attr;
    return generatrix.length / zoom;
  }

  get rays() {
    return this._attr._rays;
  }

  get elm_type() {
    return $p.enm.elm_types.Водоотлив;
  }
}

EditorInvisible.Sectional = Sectional;


const consts = new function Settings(){

	this.tune_paper = function (settings) {

	  const builder = $p.job_prm.builder || {};

		settings.handleSize = builder.handle_size;

		this.sticking = builder.sticking || 90;
		this.sticking_l = builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = builder.font_size || 72;
    this.elm_font_size = builder.elm_font_size || 52;

    if($p.wsql.alasql.utils.isNode) {
      this.font_size *= 1.2;
      this.elm_font_size *= 1.2;
    }

		this.orientation_delta = builder.orientation_delta || 30;


	}.bind(this);


  this.epsilon = 0.01;
	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';

};


class Pricing {

  constructor($p) {

    $p.md.once("predefined_elmnts_inited", () => {


      this.by_local()
        .then((loc) => {
          return !loc && this.by_range();
        })
        .then(() => {
          const {pouch} = $p.adapters;
          pouch.emit('pouch_complete_loaded');

          if(pouch.local.doc === pouch.remote.doc) {
            pouch.local.doc.changes({
              since: 'now',
              live: true,
              include_docs: true,
              selector: {class_name: {$in: ['doc.nom_prices_setup', 'doc.calc_order']}}
            }).on('change', (change) => {
              if(change.doc.class_name == 'doc.nom_prices_setup'){
                setTimeout(() => {
                  this.by_doc(change.doc)
                }, 1000);
              }
              else if(change.doc.class_name == 'doc.calc_order'){
                pouch.load_changes({docs: [change.doc], update_only: true});
              }
            });
          }

        })
    });

  }

  build_cache(rows) {
    const {nom, currencies} = $p.cat;
    const note = 'Индекс цен номенклатуры';
    for(const {key, value} of rows){
      if(!Array.isArray(value)){
        return setTimeout(() => $p.iface.do_reload('', note), 1000);
      }
      const onom = nom.get(key[0], false, true);
      if (!onom || !onom._data){
        $p.record_log({
          class: 'error',
          nom: key[0],
          note,
          value
        });
        continue;
      }
      if (!onom._data._price){
        onom._data._price = {};
      }
      const {_price} = onom._data;

      if (!_price[key[1]]){
        _price[key[1]] = {};
      }
      _price[key[1]][key[2]] = value.map((v) => ({
        date: new Date(v.date),
        currency: currencies.get(v.currency),
        price: v.price
      }));
    }
  }

  build_cache_local(prices) {

    const {nom, currencies} = $p.cat;
    const note = 'Индекс цен номенклатуры';
    const date = new Date('2010-01-01');

    for(const ref in prices) {
      if(ref[0] === '_' || ref === 'remote_rev') {
        continue;
      }
      const onom = nom.get(ref, false, true);
      const value = prices[ref];

      if (!onom || !onom._data){
        $p.record_log({
          class: 'error',
          nom: ref,
          note,
          value
        });
        continue;
      }
      onom._data._price = value;

      for(const cref in value){
        for(const pref in value[cref]) {
          const price = value[cref][pref][0];
          price.date = date;
          price.currency = currencies.get(price.currency);
        }
      }
    }
  }

  sync_local(pouch, step = 0) {
    return pouch.remote.doc.get(`_local/price_${step}`)
      .then((remote) => {
        return pouch.local.doc.get(`_local/price_${step}`)
          .catch(() => ({}))
          .then((local) => {
            this.build_cache_local(remote);

            if(local.remote_rev !== remote._rev) {
              remote.remote_rev = remote._rev;
              if(!local._rev) {
                delete remote._rev;
              }
              else {
                remote._rev = local._rev;
              }
              pouch.local.doc.put(remote);
            }

            return this.sync_local(pouch, ++step);
          })
      })
      .catch((err) => {
        if(step !== 0) {
          pouch.local.doc.get(`_local/price_${step}`)
            .then((local) => pouch.local.doc.remove(local))
            .catch(() => null);
          return true;
        }
      });
  }

  by_local(step = 0) {
    const {pouch} = $p.adapters;

    const pre = step === 0 && pouch.local.doc.adapter !== 'http' && $p.adapters.pouch.authorized ?
      pouch.remote.doc.info()
        .then(() => this.sync_local(pouch))
        .catch((err) => null)
      :
      Promise.resolve();

    return pre.then((loaded) => {
      if(loaded) {
        return loaded;
      }
      else {
        return pouch.local.doc.get(`_local/price_${step}`)
      }
    })
      .then((prices) => {
        if(prices === true) {
          return prices;
        }
        this.build_cache_local(prices);
        pouch.emit('nom_prices', ++step);
        return this.by_local(step);
      })
      .catch((err) => {
        return step !== 0;
      });
  }

  by_range(startkey, step = 0) {

    return $p.doc.nom_prices_setup.pouch_db.query('doc/doc_nom_prices_setup_slice_last',
      {
        limit: 600,
        include_docs: false,
        startkey: startkey || [''],
        endkey: ['\ufff0'],
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
        $p.adapters.pouch.emit('nom_prices', ++step);
        if (res.rows.length === 600) {
          return this.by_range(res.rows[res.rows.length - 1].key, step);
        }
      })
      .catch((err) => {
        $p.record_log(err);
      });
  }

  by_doc(doc) {
    const keys = doc.goods.map(({nom, nom_characteristic, price_type}) => [nom, nom_characteristic, price_type]);
    return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
      {
        include_docs: false,
        keys: keys,
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
      });
  }

  nom_price(nom, characteristic, price_type, prm, row) {

    if (row && prm) {
      const {_owner} = prm.calc_order_row._owner,
        price_prm = {
          price_type: price_type,
          characteristic: characteristic,
          date: _owner.date,
          currency: _owner.doc_currency
        };

      if (price_type == prm.price_type.price_type_first_cost && !prm.price_type.formula.empty()) {
        price_prm.formula = prm.price_type.formula;
      }
      else if(price_type == prm.price_type.price_type_sale && !prm.price_type.sale_formula.empty()){
        price_prm.formula = prm.price_type.sale_formula;
      }
      if(!characteristic.clr.empty()){
        price_prm.clr = characteristic.clr;
      }
      row.price = nom._price(price_prm);

      return row.price;
    }
  }

  price_type(prm) {

    const {utils, job_prm, enm, ireg, cat} = $p;
    const empty_formula = cat.formulas.get();

    prm.price_type = {
      marginality: 1.9,
      marginality_min: 1.2,
      marginality_internal: 1.5,
      discount: 0,
      discount_external: 10,
      extra_charge_external: 0,
      price_type_first_cost: job_prm.pricing.price_type_first_cost,
      price_type_sale: job_prm.pricing.price_type_sale,
      price_type_internal: job_prm.pricing.price_type_first_cost,
      formula: empty_formula,
      sale_formula: empty_formula,
      internal_formula: empty_formula,
      external_formula: empty_formula
    };

    const {calc_order_row} = prm;
    const {nom, characteristic} = calc_order_row;
    const {partner} = calc_order_row._owner._owner;
    const filter = nom.price_group.empty() ?
        {price_group: nom.price_group} :
        {price_group: {in: [nom.price_group, cat.price_groups.get()]}};
    const ares = [];


    ireg.margin_coefficients.find_rows(filter, (row) => {

      let ok = true;
      if(!row.key.empty()){
        row.key.params.forEach((row_prm) => {

          const {property} = row_prm;
          if(property.is_calculated){
            ok = utils.check_compare(property.calculated_value({calc_order_row}), property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
          }
          else if(property.empty()){
            const vpartner = cat.partners.get(row_prm._obj.value, false, true);
            if(vpartner && !vpartner.empty()){
              ok = vpartner == partner;
            }
          }
          else{
            let finded;
            characteristic.params.find_rows({
              cnstr: 0,
              param: property
            }, (row_x) => {
              finded = row_x;
              return false;
            });
            if(finded){
              ok = utils.check_compare(finded.value, property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
            }
            else{
              ok = false;
            }
          }
          if(!ok){
            return false;
          }
        })
      }
      if(ok){
        ares.push(row);
      }
    });

    if(ares.length){
      ares.sort((a, b) => {

        if ((!a.key.empty() && b.key.empty()) || (a.key.priority > b.key.priority)) {
          return -1;
        }
        if ((a.key.empty() && !b.key.empty()) || (a.key.priority < b.key.priority)) {
          return 1;
        }

        if (a.price_group.ref > b.price_group.ref) {
          return -1;
        }
        if (a.price_group.ref < b.price_group.ref) {
          return 1;
        }

        return 0;
      });
      Object.keys(prm.price_type).forEach((key) => {
        prm.price_type[key] = ares[0][key];
      });
    }

    partner.extra_fields.find_rows({
      property: job_prm.pricing.dealer_surcharge
    }, (row) => {
      const val = parseFloat(row.value);
      if(val){
        prm.price_type.extra_charge_external = val;
      }
      return false;
    });

    return prm.price_type;
  }

  calc_first_cost(prm) {

    const {marginality_in_spec} = $p.job_prm.pricing;
    const fake_row = {};

    if(!prm.spec)
      return;

    if(prm.spec.count()){
      prm.spec.forEach((row) => {

        const {_obj, nom, characteristic} = row;

        this.nom_price(nom, characteristic, prm.price_type.price_type_first_cost, prm, _obj);
        _obj.amount = _obj.price * _obj.totqty1;

        if(marginality_in_spec){
          fake_row.nom = nom;
          const tmp_price = this.nom_price(nom, characteristic, prm.price_type.price_type_sale, prm, fake_row);
          _obj.amount_marged = (tmp_price ? tmp_price : _obj.price) * _obj.totqty1;
        }

      });
      prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
    }
    else{
      fake_row.nom = prm.calc_order_row.nom;
      fake_row.characteristic = prm.calc_order_row.characteristic;
      prm.calc_order_row.first_cost = this.nom_price(fake_row.nom, fake_row.characteristic, prm.price_type.price_type_first_cost, prm, fake_row);
    }

    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_first_cost(fake_prm);
    });
  }

  calc_amount (prm) {

    const {calc_order_row, price_type} = prm;
    const price_cost = $p.job_prm.pricing.marginality_in_spec && prm.spec.count() ?
      prm.spec.aggregate([], ["amount_marged"]) :
      this.nom_price(calc_order_row.nom, calc_order_row.characteristic, price_type.price_type_sale, prm, {});

    if(price_cost){
      calc_order_row.price = price_cost.round(2);
    }
    else{
      calc_order_row.price = (calc_order_row.first_cost * price_type.marginality).round(2);
    }

    calc_order_row.marginality = calc_order_row.first_cost ?
      calc_order_row.price * ((100 - calc_order_row.discount_percent)/100) / calc_order_row.first_cost : 0;


    let extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");
    if(!$p.current_user.partners_uids.length || !extra_charge){
      extra_charge = price_type.extra_charge_external || 0;
    }

    calc_order_row.price_internal = (calc_order_row.price *
      (100 - calc_order_row.discount_percent)/100 * (100 + extra_charge)/100).round(2);

    !prm.hand_start && calc_order_row.value_change("price", {}, calc_order_row.price, true);

    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_amount(fake_prm);
    });

  }

  from_currency_to_currency (amount, date, from, to) {

    const {main_currency} = $p.job_prm.pricing;

    if(!to || to.empty()){
      to = main_currency;
    }
    if(!from || from.empty()){
      from = main_currency;
    }
    if(from == to){
      return amount;
    }
    if(!date){
      date = new Date();
    }
    if(!this.cource_sql){
      this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `period` desc");
    }

    let cfrom = {course: 1, multiplicity: 1},
      cto = {course: 1, multiplicity: 1};
    if(from != main_currency){
      const tmp = this.cource_sql([from.ref, date]);
      if(tmp.length)
        cfrom = tmp[0];
    }
    if(to != main_currency){
      const tmp = this.cource_sql([to.ref, date]);
      if(tmp.length)
        cto = tmp[0];
    }

    return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
  }

  cut_upload () {

    if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов") && !$p.current_user.role_available("ИзменениеТехнологическойНСИ")){
      $p.msg.show_msg({
        type: "alert-error",
        text: $p.msg.error_low_acl,
        title: $p.msg.error_rights
      });
      return true;
    }

    function upload_acc() {
      const mgrs = [
        "cat.users",
        "cat.individuals",
        "cat.organizations",
        "cat.partners",
        "cat.contracts",
        "cat.currencies",
        "cat.nom_prices_types",
        "cat.price_groups",
        "cat.cashboxes",
        "cat.partner_bank_accounts",
        "cat.organization_bank_accounts",
        "cat.projects",
        "cat.stores",
        "cat.cash_flow_articles",
        "cat.cost_items",
        "cat.price_groups",
        "cat.delivery_areas",
        "ireg.currency_courses",
        "ireg.margin_coefficients"
      ];

      const {pouch} = $p.adapters;
      pouch.local.ram.replicate.to(pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {

        })
        .on('paused', (err) => {

        })
        .on('active', () => {

        })
        .on('denied', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {

          if($p.current_user.role_available("ИзменениеТехнологическойНСИ"))
            upload_tech();

          else
            $p.msg.show_msg({
              type: "alert-info",
              text: $p.msg.sync_complite,
              title: $p.msg.sync_title
            });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    function upload_tech() {
      const mgrs = [
        "cat.units",
        "cat.nom",
        "cat.nom_groups",
        "cat.nom_units",
        "cat.nom_kinds",
        "cat.elm_visualization",
        "cat.destinations",
        "cat.property_values",
        "cat.property_values_hierarchy",
        "cat.inserts",
        "cat.insert_bind",
        "cat.color_price_groups",
        "cat.clrs",
        "cat.furns",
        "cat.cnns",
        "cat.production_params",
        "cat.parameters_keys",
        "cat.formulas",
        "cch.properties",
        "cch.predefined_elmnts"

      ];
      const {pouch} = $p.adapters;
      pouch.local.ram.replicate.to(pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {

        })
        .on('paused', (err) => {

        })
        .on('active', () => {

        })
        .on('denied', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {
          $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    if($p.current_user.role_available("СогласованиеРасчетовЗаказов"))
      upload_acc();
    else
      upload_tech();

  }

}


$p.pricing = new Pricing($p);



class ProductsBuilding {

  constructor(listen) {

    let added_cnn_spec,
      ox,
      spec,
      constructions,
      coordinates,
      cnn_elmnts,
      glass_specification,
      params;




    function cnn_row(elm1, elm2) {
      let res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
      if(res.length) {
        return res[0].row;
      }
      res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
      if(res.length) {
        return res[0].row;
      }
      return 0;
    }


    function cnn_need_add_spec(cnn, elm1, elm2, point) {
      if(cnn && cnn.cnn_type == $p.enm.cnn_types.xx) {
        if(!added_cnn_spec.points) {
          added_cnn_spec.points = [];
        }
        for (let p of added_cnn_spec.points) {
          if(p.is_nearest(point, true)) {
            return false;
          }
        }
        added_cnn_spec.points.push(point);
        return true;
      }
      else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1) {
        return false;
      }
      added_cnn_spec[elm1] = elm2;
      return true;
    }



    function cnn_add_spec(cnn, elm, len_angl, cnn_other) {
      if(!cnn) {
        return;
      }
      const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      cnn_filter_spec(cnn, elm, len_angl).forEach((row_cnn_spec) => {

        const {nom} = row_cnn_spec;

        if(nom instanceof $p.CatInserts) {
          if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)) {
            const tmp_len_angl = len_angl._clone();
            tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
            nom.calculate_spec({elm, len_angl: tmp_len_angl, ox});
          }
          else {
            nom.calculate_spec({elm, len_angl, ox});
          }
        }
        else {

          const row_spec = new_spec_row({row_base: row_cnn_spec, origin: len_angl.origin || cnn, elm, nom, spec, ox});

          if(nom.is_pieces) {
            if(!row_cnn_spec.coefficient) {
              row_spec.qty = row_cnn_spec.quantity;
            }
            else {
              row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
                .round(nom.rounding_quantity);
            }
          }
          else {
            row_spec.qty = row_cnn_spec.quantity;

            if(row_cnn_spec.sz || row_cnn_spec.coefficient) {
              let sz = row_cnn_spec.sz, finded, qty;
              if(cnn_other) {
                cnn_other.specification.find_rows({nom}, (row) => {
                  sz += row.sz;
                  qty = row.quantity;
                  return !(finded = true);
                });
              }
              if(!finded) {
                sz *= 2;
              }
              if(!row_spec.qty && finded && len_angl.art1) {
                row_spec.qty = qty;
              }
              row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
            }
          }

          if(!row_cnn_spec.formula.empty()) {
            const qty = row_cnn_spec.formula.execute({
              ox,
              elm,
              len_angl,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_spec,
              row_spec: row_spec
            });
            if(row_cnn_spec.formula.condition_formula && !qty){
              row_spec.qty = 0;
            }
          }
          calc_count_area_mass(row_spec, spec, len_angl, row_cnn_spec.angle_calc_method);
        }

      });
    }


    function cnn_filter_spec(cnn, elm, len_angl) {

      const res = [];
      const {angle_hor} = elm;
      const {art1, art2} = $p.job_prm.nom;
      const {САртикулом1, САртикулом2} = $p.enm.specification_installation_methods;
      const {check_params} = ProductsBuilding;

      const {cnn_type, specification, selection_params} = cnn;
      const {ii, xx, acn} = $p.enm.cnn_types;

      specification.each((row) => {
        const {nom} = row;
        if(!nom || nom.empty() || nom == art1 || nom == art2) {
          return;
        }

        if((row.for_direct_profile_only > 0 && !elm.is_linear()) ||
          (row.for_direct_profile_only < 0 && elm.is_linear())) {
          return;
        }

        if(cnn_type == ii) {
          if(row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len) {
            return;
          }
        }
        else {
          if(row.amin > len_angl.angle || row.amax < len_angl.angle) {
            return;
          }
        }

        if((row.set_specification == САртикулом1 && len_angl.art2) || (row.set_specification == САртикулом2 && len_angl.art1)) {
          return;
        }
        if(len_angl.art2 && acn.a.indexOf(cnn_type) != -1 && row.set_specification != САртикулом2 && cnn_type != xx) {
          return;
        }

        if(check_params({params: selection_params, row_spec: row, elm, ox})) {
          res.push(row);
        }

      });

      return res;
    }



    function furn_spec(contour) {

      if(!contour.parent) {
        return false;
      }

      const {furn_cache, furn} = contour;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      if(!furn_check_opening_restrictions(contour, furn_cache)) {
        return;
      }

      contour.update_handle_height(furn_cache);

      const blank_clr = $p.cat.clrs.get();
      furn.furn_set.get_spec(contour, furn_cache).each((row) => {
        const elm = {elm: -contour.cnstr, clr: blank_clr};
        const row_spec = new_spec_row({elm, row_base: row, origin: row.origin, spec, ox});

        if(row.is_procedure_row) {
          row_spec.elm = row.handle_height_min;
          row_spec.len = row.coefficient / 1000;
          row_spec.qty = 0;
          row_spec.totqty = 1;
          row_spec.totqty1 = 1;
        }
        else {
          row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
          calc_count_area_mass(row_spec, spec);
        }
      });
    }


    function furn_check_opening_restrictions(contour, cache) {

      let ok = true;
      const {new_spec_row} = ProductsBuilding;


      contour.furn.open_tunes.each((row) => {
        const elm = contour.profile_by_furn_side(row.side, cache);
        const len = elm._row.len - 2 * elm.nom.sizefurn;


        if(len < row.lmin || len > row.lmax || (!elm.is_linear() && !row.arc_available)) {
          new_spec_row({elm, row_base: {clr: $p.cat.clrs.get(), nom: $p.job_prm.nom.furn_error}, origin: contour.furn, spec, ox});
          ok = false;
        }

      });

      return ok;
    }



    function cnn_spec_nearest(elm) {
      const nearest = elm.nearest();
      if(nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm._attr._nearest_cnn) {
        cnn_add_spec(elm._attr._nearest_cnn, elm, {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: elm._attr._len,
          origin: cnn_row(elm.elm, nearest.elm)
        });
      }
    }


    function base_spec_profile(elm) {

      const {_row, rays} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const {b, e} = rays;

      if(!b.cnn || !e.cnn) {
        return;
      }
      b.check_err();
      e.check_err();

      const prev = b.profile;
      const next = e.profile;
      const row_cnn_prev = b.cnn.main_row(elm);
      const row_cnn_next = e.cnn.main_row(elm);
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      let row_spec;

      const row_cnn = row_cnn_prev || row_cnn_next;
      if(row_cnn) {

        row_spec = new_spec_row({elm, row_base: row_cnn, nom: _row.nom, origin: cnn_row(_row.elm, prev ? prev.elm : 0), spec, ox});
        row_spec.qty = row_cnn.quantity;

        const seam = $p.enm.angle_calculating_ways.СварнойШов;
        const d45 = Math.sin(Math.PI / 4);
        const dprev = row_cnn_prev ? (
          row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz
        ) : 0;
        const dnext = row_cnn_next ? (
          row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz
        ) : 0;

        row_spec.len = (_row.len - dprev - dnext)
          * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        elm._attr._len = _row.len;
        _row.len = (_row.len
          - (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz)
          - (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz))
          * 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        if(!elm.is_linear()) {
          row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
        }

        if(row_cnn_prev && !row_cnn_prev.formula.empty()) {
          row_cnn_prev.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_prev,
            row_spec: row_spec
          });
        }
        else if(row_cnn_next && !row_cnn_next.formula.empty()) {
          row_cnn_next.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_next,
            row_spec: row_spec
          });
        }

        const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
        const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
        const {СоединениеПополам, Соединение} = $p.enm.angle_calculating_ways;
        calc_count_area_mass(
          row_spec,
          spec,
          _row,
          angle_calc_method_prev,
          angle_calc_method_next,
          angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0,
          angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0
        );
      }

      const len_angl = {
        angle: 0,
        alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
        alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
        len: row_spec ? row_spec.len * 1000 : _row.len,
        art1: false,
        art2: true
      };
      if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0, b.point)) {


        len_angl.angle = len_angl.alp2;

        if(b.cnn.cnn_type == $p.enm.cnn_types.t || b.cnn.cnn_type == $p.enm.cnn_types.i || b.cnn.cnn_type == $p.enm.cnn_types.xx) {
          if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm, e.point)) {
            cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
          }
        }
        else {
          cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
        }

        len_angl.angle = len_angl.alp1;
        len_angl.art2 = false;
        len_angl.art1 = true;
        cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
      }

      elm.inset.calculate_spec({elm, ox});

      cnn_spec_nearest(elm);

      elm.addls.forEach(base_spec_profile);

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }

        len_angl.origin = inset;
        len_angl.angle = elm.angle_hor;
        len_angl.cnstr = elm.layer.cnstr;
        delete len_angl.art1;
        delete len_angl.art2;
        inset.calculate_spec({elm, len_angl, ox});

      });

    }


    function base_spec_sectional(elm) {

      const {_row, _attr, inset, layer} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const spec_tmp = spec;

      inset.calculate_spec({elm, ox});

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          const cx = Object.assign(ox.find_create_cx(elm.elm, inset.ref), inset.contour_attrs(layer));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: layer.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      spec = spec_tmp;

    }


    function base_spec_glass(elm) {

      const {profiles, imposts, _row} = elm;

      if(_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
        return;
      }

      const glength = profiles.length;

      for (let i = 0; i < glength; i++) {
        const curr = profiles[i];

        if(curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        const prev = (i == 0 ? profiles[glength - 1] : profiles[i - 1]).profile;
        const next = (i == glength - 1 ? profiles[0] : profiles[i + 1]).profile;
        const row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

        const len_angl = {
          angle: 0,
          alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
          alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
          len: row_cnn.length ? row_cnn[0].aperture_len : 0,
          origin: cnn_row(_row.elm, curr.profile.elm)

        };

        (len_angl.len > 3) && cnn_add_spec(curr.cnn, curr.profile, len_angl);

      }

      elm.inset.calculate_spec({elm, ox});

      imposts.forEach(base_spec_profile);

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
        }
        inset.calculate_spec({elm, ox});
      });
    }



    function inset_contour_spec(contour) {

      const spec_tmp = spec;

      ox.inserts.find_rows({cnstr: contour.cnstr}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
          const cx = Object.assign(ox.find_create_cx(-contour.cnstr, inset.ref), inset.contour_attrs(contour));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        const elm = {
          _row: {},
          elm: 0,
          clr: clr,
          layer: contour,
        };
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: contour.cnstr
        };
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      spec = spec_tmp;
    }


    function base_spec(scheme) {

      const {Contour, Filling, Sectional, Profile, ProfileConnective} = $p.Editor;

      added_cnn_spec = {};

      for (const contour of scheme.getItems({class: Contour})) {

        for (const elm of contour.children) {
          elm instanceof Profile && base_spec_profile(elm);
        }

        for (const elm of contour.children) {
          if(elm instanceof Filling) {
            base_spec_glass(elm);
          }
          else if(elm instanceof Sectional) {
            base_spec_sectional(elm);
          }
        }

        furn_spec(contour);

        inset_contour_spec(contour);

      }

      for (const elm of scheme.l_connective.children) {
        if(elm instanceof ProfileConnective) {
          base_spec_profile(elm);
        }
      }

      inset_contour_spec({
        cnstr: 0,
        project: scheme,
        get perimeter() {
          return this.project.perimeter;
        }
      });

    }


    this.recalc = function (scheme, attr) {



      ox = scheme.ox;
      spec = ox.specification;
      constructions = ox.constructions;
      coordinates = ox.coordinates;
      cnn_elmnts = ox.cnn_elmnts;
      glass_specification = ox.glass_specification;
      params = ox.params;

      spec.clear();

      ox._order_rows = [];

      base_spec(scheme);

      spec.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');



      scheme.draw_visualization();
      scheme.notify(scheme, 'coordinates_calculated', attr);


      if(ox.calc_order_row) {
        $p.spec_building.specification_adjustment({
          scheme: scheme,
          calc_order_row: ox.calc_order_row,
          spec: spec,
          save: attr.save,
        }, true);
      }

      if(attr.snapshot) {
        scheme.notify(scheme, 'scheme_snapshot', attr);
      }

      if(attr.save) {


        if(attr.svg !== false) {
          ox.svg = scheme.get_svg();
        }

        ox.save().then(() => {
          attr.svg !== false && $p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
          delete scheme._attr._saving;
          ox.calc_order.characteristic_saved(scheme, attr);
          scheme._scope && scheme._scope.eve.emit('characteristic_saved', scheme, attr);

        })
          .then(() => (scheme._scope || attr.close) && setTimeout(() => ox.calc_order._modified && ox.calc_order.save(), 1000))
          .catch((ox) => {


            $p.record_log(ox);
            delete scheme._attr._saving;
            if(ox._data && ox._data._err) {
              $p.msg.show_msg(ox._data._err);
              delete ox._data._err;
            }
          });
      }
      else {
        delete scheme._attr._saving;
      }

      ox._data._loading = false;

    };

  }


  static check_params({params, row_spec, elm, cnstr, origin, ox}) {

    let ok = true;

    params.find_rows({elm: row_spec.elm}, (prm_row) => {
      ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
      if(!ok) {
        return false;
      }
    });

    return ok;
  }


  static new_spec_row({row_spec, elm, row_base, nom, origin, spec, ox}) {
    if(!row_spec) {
      row_spec = spec.add();
    }
    row_spec.nom = nom || row_base.nom;
    if(!row_spec.nom.visualization.empty()) {
      row_spec.dop = -1;
    }
    else if(row_spec.nom.is_procedure) {
      row_spec.dop = -2;
    }
    row_spec.characteristic = row_base.nom_characteristic;
    if(!row_spec.characteristic.empty() && row_spec.characteristic.owner != row_spec.nom) {
      row_spec.characteristic = $p.utils.blank.guid;
    }
    row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr, elm, spec);
    row_spec.elm = elm.elm;
    if(origin) {
      row_spec.origin = origin;
    }
    return row_spec;
  }


  static calc_qty_len(row_spec, row_base, len) {

    const {nom} = row_spec;

    if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
      nom.cutting_optimization_type.empty() || nom.is_pieces) {
      if(!row_base.coefficient || !len) {
        row_spec.qty = row_base.quantity;
      }
      else {
        if(!nom.is_pieces) {
          row_spec.qty = row_base.quantity;
          row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
          if(nom.rounding_quantity) {
            row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
            row_spec.len = 0;
          }
          ;
        }
        else if(!nom.rounding_quantity) {
          row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
        }
        else {
          row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
        }
      }
    }
    else {
      row_spec.qty = row_base.quantity;
      row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
    }
  }


  static calc_count_area_mass(row_spec, spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2) {

    if(!row_spec.qty) {
      if(row_spec.dop >= 0) {
        spec.del(row_spec.row - 1, true);
      }
      return;
    }

    if(row_spec.totqty1 && row_spec.totqty) {
      return;
    }

    if(!angle_calc_method_next) {
      angle_calc_method_next = angle_calc_method_prev;
    }

    if(angle_calc_method_prev && !row_spec.nom.is_pieces) {

      const {Основной, СварнойШов, СоединениеПополам, Соединение, _90} = $p.enm.angle_calculating_ways;

      if((angle_calc_method_prev == Основной) || (angle_calc_method_prev == СварнойШов)) {
        row_spec.alp1 = row_coord.alp1;
      }
      else if(angle_calc_method_prev == _90) {
        row_spec.alp1 = 90;
      }
      else if(angle_calc_method_prev == СоединениеПополам) {
        row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
      }
      else if(angle_calc_method_prev == Соединение) {
        row_spec.alp1 = (alp1 || row_coord.alp1);
      }

      if((angle_calc_method_next == Основной) || (angle_calc_method_next == СварнойШов)) {
        row_spec.alp2 = row_coord.alp2;
      }
      else if(angle_calc_method_next == _90) {
        row_spec.alp2 = 90;
      }
      else if(angle_calc_method_next == СоединениеПополам) {
        row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
      }
      else if(angle_calc_method_next == Соединение) {
        row_spec.alp2 = (alp2 || row_coord.alp2);
      }
    }

    if(row_spec.len) {
      if(row_spec.width && !row_spec.s) {
        row_spec.s = row_spec.len * row_spec.width;
      }
    }
    else {
      row_spec.s = 0;
    }

    if(row_spec.s) {
      row_spec.totqty = row_spec.qty * row_spec.s;
    }
    else if(row_spec.len) {
      row_spec.totqty = row_spec.qty * row_spec.len;
    }
    else {
      row_spec.totqty = row_spec.qty;
    }

    row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

    ['len', 'width', 's', 'qty', 'alp1', 'alp2'].forEach((fld) => row_spec[fld] = row_spec[fld].round(4));
    ['totqty', 'totqty1'].forEach((fld) => row_spec[fld] = row_spec[fld].round(6));
  }

}

if(typeof global !== 'undefined'){
  global.ProductsBuilding = ProductsBuilding;
}
$p.ProductsBuilding = ProductsBuilding;
$p.products_building = new ProductsBuilding(true);



class SpecBuilding {

  constructor($p) {

  }

  calc_row_spec (prm, cancel) {

  }

  specification_adjustment (attr, with_price) {

    const {scheme, calc_order_row, spec, save} = attr;
    const calc_order = calc_order_row._owner._owner;
    const order_rows = new Map();
    const adel = [];
    const ox = calc_order_row.characteristic;
    const nom = ox.empty() ? calc_order_row.nom : (calc_order_row.nom = ox.owner);

    $p.pricing.price_type(attr);

    spec.find_rows({ch: {in: [-1, -2]}}, (row) => adel.push(row));
    adel.forEach((row) => spec.del(row, true));

    $p.cat.insert_bind.insets(ox).forEach(({inset, elm_type}) => {

      const elm = {
        _row: {},
        elm: 0,
        get perimeter() {return scheme ? scheme.perimeter : []},
        clr: ox.clr,
        project: scheme,
      };
      const len_angl = {
        angle: 0,
        alp1: 0,
        alp2: 0,
        len: 0,
        cnstr: 0,
        origin: inset,
      };
      inset.calculate_spec({elm, len_angl, ox, spec});

    });

    if(!ox.empty()){
      adel.length = 0;
      calc_order.production.forEach((row) => {
        if (row.ordn === ox){
          if (ox._order_rows.indexOf(row.characteristic) === -1){
            adel.push(row);
          }
          else {
            order_rows.set(row.characteristic, row);
          }
        }
      });
      adel.forEach((row) => calc_order.production.del(row.row-1));
    }

    const ax = [];

    ox._order_rows && ox._order_rows.forEach((cx) => {
      const row = order_rows.get(cx) || calc_order.production.add({characteristic: cx});
      row.nom = cx.owner;
      row.unit = row.nom.storage_unit;
      row.ordn = ox;
      row.len = cx.x;
      row.width = cx.y;
      row.s = cx.s;
      row.qty = calc_order_row.qty;
      row.quantity = calc_order_row.quantity;

      save && ax.push(cx.save().catch($p.record_log));
      order_rows.set(cx, row);
    });
    if(order_rows.size){
      attr.order_rows = order_rows;
    }

    if(with_price){
      $p.pricing.calc_first_cost(attr);

      $p.pricing.calc_amount(attr);
    }

    if(save && !attr.scheme && (ox.is_new() || ox._modified)){
      ax.push(ox.save().catch($p.record_log));
    }

    return ax;
  }

}

$p.spec_building = new SpecBuilding($p);


(function ({prototype}) {
  const {value_mgr} = prototype;
  prototype.value_mgr = function(row, f, mf, array_enabled, v) {
		const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
		if(tmp){
      return tmp;
    }
		if(f == 'trans'){
      return $p.doc.calc_order;
    }
		else if(f == 'partner'){
      return $p.cat.partners;
    }
	}
})($p.classes.DataManager);

return EditorInvisible;
}));
