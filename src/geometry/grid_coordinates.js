/**
 * ### Визкализация таблицы координат
 *
 * @module grid_coordinates
 *
 * Created by Evgeniy Malyarov on 08.09.2018.
 */

class GridCoordinates extends paper.Group {

  constructor(attr) {
    super();
    this.parent = this.project.l_dimensions;

    const points_color = new paper.Color(0, 0.7, 0, 0.8);
    const lines_color = new paper.Color(0, 0, 0.7, 0.8);

    // создаём детей
    this._attr = {
      lines_color,
      points_color,
      step: attr.step,
      offset: attr.offset,
      angle: attr.angle,
      bind: attr.bind,
      line: new paper.Path({
        parent: this,
        strokeColor: new paper.Color(0, 0, 0.7),
        strokeWidth: 2,
        strokeScaling: false,
      }),
      point: new paper.Path.Circle({
        parent: this,
        guide: true,
        radius: 22,
        fillColor: points_color,
      }),
      lines: new paper.Group({
        parent: this,
        guide: true,
        strokeColor: lines_color,
        strokeScaling: false
      }),
    };

  }

  get path() {
    return this._attr.path;
  }
  set path(v) {
    this._attr.path = v;
    this.set_line();
    this.set_bind();
  }

  set_line() {
    const {bind, offset, path, line, angle} = this._attr;
    let {firstSegment: {point: b}, lastSegment: {point: e}} = path;
    if(bind === 'e') {
      [b, e] = [e, b];
    }
    if(line.segments.length) {
      line.segments[0].point = b;
      line.segments[1].point = e;
    }
    else {
      line.addSegments([b, e]);
    }

    // повернём линию при необходимости
    const langle = e.subtract(b).angle;

    const n0 = line.getNormalAt(0).multiply(offset);
    line.firstSegment.point = line.firstSegment.point.subtract(n0);
    line.lastSegment.point = line.lastSegment.point.subtract(n0);
  }

  set_bind() {
    const {point, path, bind} = this._attr;
    switch (bind) {
    case 'b':
      point.position = path.firstSegment.point;
      break;
    case 'e':
      point.position = path.lastSegment.point;
      break;
    case 'product':
      point.position = this.project.bounds.bottomLeft;
      break;
    case 'contour':
      point.position = path.layer.bounds.bottomLeft;
      break;
    }
  }

  get bind() {
    return this._attr.bind;
  }
  set bind(v) {
    this._attr.bind = v;
    this.set_bind();
    this.set_line();
  }

  get step() {
    return this._attr.step;
  }
  set step(v) {
    this._attr.step = v;
  }

  get angle() {
    return this._attr.angle;
  }
  set angle(v) {
    this._attr.angle = v;
    this.set_line();
  }

  get offset() {
    return this._attr.offset;
  }
  set offset(v) {
    this._attr.offset = v;
    this.set_line();
  }

  grid_points() {
    const {path, line, lines, lines_color, step, point: {position}} = this._attr;
    const res = [];

    function add(tpath, x, tpoint, point) {

      if(position.getDistance(point) > 20) {
        new paper.Path.Circle({
          parent: lines,
          guide: true,
          radius: 22,
          center: point,
          fillColor: lines_color,
        });
      }

      new paper.Path({
        parent: lines,
        guide: true,
        strokeColor: lines_color,
        strokeScaling: false,
        segments: [tpoint, point],
      })

      const d1 = tpath.getOffsetOf(tpoint);
      const d2 = tpath.getOffsetOf(point);
      res.push({x: x.round(1), y: (d2 - d1).round(1)});
    }

    lines.removeChildren();


    const n0 = line.getNormalAt(0).multiply(10000);
    let do_break;
    let prev;
    for (let x = 0; x < line.length + step; x += step) {
      if(x >= line.length) {
        if(do_break) {
          break;
        }
        do_break = true;
        x = line.length;
      }
      if(prev && (x - prev) < (step / 4)) {
        break;
      }
      prev = x;
      const tpoint = x < line.length ? line.getPointAt(x) : line.lastSegment.point;
      const tpath = new paper.Path({
        segments: [tpoint.subtract(n0), tpoint.add(n0)],
        insert: false
      });
      const intersections = path.getIntersections(tpath);
      if(intersections.length) {
        add(tpath, x, tpoint, intersections[0].point);
      }
      else if(x === 0) {
        add(tpath, x, tpoint, path.firstSegment.point);
      }
      else if(x === line.length) {
        add(tpath, x, tpoint, path.lastSegment.point);
      }
    }

    return res;
  }


}
