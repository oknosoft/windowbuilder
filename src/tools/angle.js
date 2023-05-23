
/**
 * @summary Размерная линия угла
 *
 * @class ToolAngle
 * @extends ToolElement
 */
class ToolAngle extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {name: 'angle'},
      disable_size: true,
      mode: 0,        // 1 - выбрана первый луч, 2 - второй, 3 - выбрано положение дуги и надписи
      hitItem: null,  // текущий сегмент
      hitPoint: null, // текущая точка на сегменте
      b: null,        // начальный луч
      e: null,        // конечный луч
      o: null,        // точка пересечения лучей
      paths: new Map(),
      rect_pos: '',
      swap: false,
      sign: 1,
    });

    this.on({
      activate: this.on_activate,
      deactivate: this.on_deactivate,
      mouseup: this.on_mouseup,
      mousemove: this.on_mousemove,
      keyup: this.on_keyup,
    });
  }

  on_activate() {
    super.on_activate('cursor-autodesk');
    Object.assign(this, {
      mode: 0,
      b: null,
      e: null,
    });
  }

  on_deactivate() {
    for(const [name, path] of this.paths) {
      path.remove?.();
    }
    this.paths.clear();
    this.mode = 0;
    this.b = this.e = null;
    this.project.deselect_all_points(true);
  }

  on_mouseup(event) {
    let {mode, hitPoint, b, e, o, paths, project, rect_pos, swap, sign} = this;
    if(event.event.which === 3 || !hitPoint) {
      return this.on_deactivate();
    }
    const current = paths.get('current');
    switch (mode) {
      case 0:
        paths.set('callout1', current.clone());
        mode = 1;
        return ;
      case 1:
        paths.set('callout2', current.clone());
        mode = 2;
        return ;
      case 2:

        break;
    }
    let callout = paths.get('callout1');
    if(swap) {
      [b, e] = [e, b];
      callout = paths.get('callout2');
      sign = -sign;
    }
    if(mode === 2) {
      // создать линию
      const attr = {
        elm1: b.profile,
        elm2: e.profile,
        p1: b.point_name,
        p2: e.point_name,
        parent: b.profile.layer.l_dimensions,
        project,
      };
      if(rect_pos !== 'free') {
        attr.fix_angle = true;
        attr.angle = paths.get('size').getTangentAt(0).angle;
      }
      attr.offset = sign * callout.length;
      new Editor.DimensionLineCustom(attr);
      project.register_change(true);
      return this.on_deactivate();
    }
    if(!hitPoint) {
      return;
    }
    if(!mode) {
      this.mode = 1;
      this.b = hitPoint;
    }
    else if(mode === 1) {
      this.mode = 2;
      this.e = hitPoint;
    }
  }

  on_mousemove(event) {
    this._scope.canvas_cursor('cursor-autodesk');
    this.hitTest(event);
    const {mode, paths, b, e, o, project} = this;

    if(this.hitItem) {

      if(mode < 2) {
        const {curve} = this.hitItem.location;
        if(paths.has('current')) {
          paths.get('current').firstSegment.point = curve.point1;
          paths.get('current').lastSegment.point = curve.point2;
        }
        else {
          paths.set('current', new paper.Path({
            parent: project.l_dimensions,
            segments: [curve.point1, curve.point2],
            strokeColor: 'black',
            strokeWidth: 3,
            strokeScaling: false,
            guide: true,
          }));
        }
      }

      switch (mode) {
        case 0:

          break;
        case 1:
          // если есть обе точки
          if(!paths.has('size')) {
            paths.set('size', new paper.Path({
              parent: project.l_dimensions,
              segments: [b.point, event.point],
              strokeColor: 'black',
              guide: true,
            }));
          }
          paths.get('size').lastSegment.point = event.point;
          break;

        case 2:
          // если есть обе точки и смещение линии
          // добавляем выноски и линию размера
          if(!paths.has('callout1')) {
            paths.set('callout1', new paper.Path({
              parent: project.l_dimensions,
              segments: [b.point, event.point],
              strokeColor: 'black',
              guide: true,
            }));
          }
          if(!paths.has('callout2')) {
            paths.set('callout2', new paper.Path({
              parent: project.l_dimensions,
              segments: [e.point, event.point],
              strokeColor: 'black',
              guide: true,
            }));
          }
          const rect = new paper.Rectangle(b.point, e.point);
          const gen = new paper.Path({
            insert: false,
            segments: [b.point, e.point],
          });
          const {rib, pos, parallel} = rect.nearest_rib(event.point);
          this.rect_pos = pos;
          this.swap = false;
          this.sign = gen.point_pos(event.point);
          const pt = gen.getNearestPoint(event.point);
          const line = paths.get('size');
          if(rect.contains(event.point) || !rib) {
            this.rect_pos = 'free';
            const delta = pt.getDistance(event.point);
            const normal = gen.getNormalAt(0).multiply(delta * this.sign);
            paths.get('callout1').lastSegment.point = b.point.add(normal);
            paths.get('callout2').lastSegment.point = e.point.add(normal);
            line.firstSegment.point = b.point.add(normal);
            line.lastSegment.point = e.point.add(normal);
          }
          else {
            const pp2 = parallel.point.add(parallel.vector);
            line.firstSegment.point = parallel.point;
            line.lastSegment.point = pp2;
            if(b.point.getDistance(parallel.point) > b.point.getDistance(pp2)) {
              this.swap = true;
              paths.get('callout1').lastSegment.point = pp2;
              paths.get('callout2').lastSegment.point = parallel.point;
            }
            else {
              paths.get('callout1').lastSegment.point = parallel.point;
              paths.get('callout2').lastSegment.point = pp2;
            }
          }
          this.sign = gen.point_pos(line.interiorPoint);
          // добавляем текст
          if(!paths.has('text')) {
            paths.set('text', new paper.PointText({
              parent: project.l_dimensions,
              justification: 'center',
              fillColor: 'black',
              fontFamily: paper.consts?.font_family,
              fontSize: Editor.DimensionLine._font_size(project.bounds)})
            );
          }
          const text = paths.get('text');
          text.content = line.length.round(1).toString();
          const vector = line.getTangentAt(0);
          text.rotation = vector.angle;
          text.position = line.getPointAt(line.length/2).add(line.getNormalAt(0).multiply(text.fontSize / 1.6));
          if(line.length < 20) {
            text.position = text.position.add(line.getTangentAt(0).multiply(text.fontSize / 3));
          }
          break;
      }

    }
    else if(paths.has('current'))  {
      paths.get('current').remove();
      paths.delete('current');
    }
  }

  on_keyup(event) {
    const {code, target} = event.event;
    if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
      return;
    }
    // удаление размерной линии
    if(['Escape'].includes(code)) {
      this.on_deactivate();
    }
    else if(['Delete', 'NumpadSubtract', 'Backspace'].includes(code)) {
      for(const {parent} of this.project.selectedItems) {
        if(parent instanceof Editor.DimensionLineCustom) {
          parent.remove();
        }
      }
    }
    else if(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(code)) {
      const sign = ['ArrowRight', 'ArrowUp'].includes(code) ? 1 : -1;
      for(const {parent} of this.project.selectedItems) {
        if(parent instanceof Editor.DimensionLineCustom) {
          parent.offset = parent.offset + sign * 10;
        }
      }
    }
    event.stop();
  }

  hitTest({point}) {
    this.hitItem = this.hitPoint = null;
    const items = this.project.hitTestAll(point, {
      class: paper.Path,
      tolerance: 16,
      fill: false,
      segments: false,
      curves: true,
    });
    let path, delta = Infinity;
    for(const item of items) {
      // {item, location, point, type}
      if(item.type === 'curve' && item.item.closed && item.item.parent instanceof Editor.ProfileItem) {
        const td = item.point.getDistance(point);
        if(td <= delta) {
          delta = td;
          this.hitItem = item;
          this.hitPoint = item.point;
        }
      }
    }
  }

}

Editor.ToolAngle = ToolAngle;
