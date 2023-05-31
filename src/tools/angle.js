
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
    if(event.event.which === 3) {
      return this.on_deactivate();
    }
    const current = paths.get('current');
    if(!current && mode < 2) {
      return ;
    }
    switch (mode) {
      case 0:
        if(paths.has('callout1')) {
          paths.get('callout1').remove();
        }
        paths.set('callout1', current.clone());
        this.mode = 1;
        return ;

      case 1: {
        if(paths.has('callout2')) {
          paths.get('callout2').remove();
          paths.delete('callout2');
        }
        const callout1 = paths.get('callout1');
        const ln1 = new paper.Line(callout1.firstSegment.point, callout1.lastSegment.point);
        const ln2 = new paper.Line(current.firstSegment.point, current.lastSegment.point);
        o = ln1.intersect(ln2, true);
        if(o && o.getDistance(hitPoint) < 10000) {
          this.o = o;
          // корректируем callout1
          if(o.getDistance(callout1.firstSegment.point) < o.getDistance(callout1.lastSegment.point)) {
            callout1.firstSegment.point = o;
          }
          else {
            callout1.lastSegment.point = o;
            callout1.reverse();
          }
          if(o.getDistance(current.firstSegment.point) < o.getDistance(current.lastSegment.point)) {
            current.firstSegment.point = o;
          }
          else {
            current.lastSegment.point = o;
            current.reverse();
          }
          paths.set('callout2', current.clone());
          this.mode = 2;
        }
        else {
          $p.ui.dialogs.alert({
            title: 'Измерение угла',
            text: 'Сегменты параллельны',
            timeout: 10000,
          });
        }
        return ;
      }

      case 2:
        if(paths.has('arc')) {
          this.mode = 3;
        }
        return ;

      case 3: {
        const callout1 = paths.get('callout1');
        const callout2 = paths.get('callout2');
        const text = paths.get('text');
        const arc = paths.get('arc');
        const through = arc.getPointAt(arc.length / 2);
        // создать линию
        const attr = {
          o: [callout1.firstSegment.point.x, callout1.firstSegment.point.y],
          p1: [callout1.lastSegment.point.x, callout1.lastSegment.point.y],
          p2: [callout2.lastSegment.point.x, callout2.lastSegment.point.y],
          through: [through.x, through.y],
          pos: [text.position.x, text.position.y],
          content: text.content,
          parent: project.l_connective,
          project,
        };
        new Editor.DimensionAngle(attr);
        project.register_change(true);
        return this.on_deactivate();
      }
    }
  }

  on_mousemove(event) {
    this._scope.canvas_cursor('cursor-autodesk');
    this.hitTest(event);
    let {mode, paths, b, e, o, project, hitItem, hitPoint} = this;

    if(hitItem) {
      if(mode < 2) {
        const {curve} = hitItem.location;
        const tangent = hitItem.location.tangent.multiply(100);
        const pt1 = hitPoint.add(tangent);
        const pt2 = hitPoint.subtract(tangent);
        if(paths.has('current')) {
          paths.get('current').firstSegment.point = pt1;
          paths.get('current').lastSegment.point = pt2;
        }
        else {
          paths.set('current', new paper.Path({
            parent: project.l_connective,
            segments: [pt1, pt2],
            strokeColor: 'black',
            strokeWidth: 3,
            strokeScaling: false,
            guide: true,
          }));
        }
        return;
      }
    }
    else if(paths.has('current'))  {
      paths.get('current').remove();
      paths.delete('current');
    }

    if(mode === 2) {
      // есть первый и второй отрезки, строим дугу
      const radius = o.getDistance(event.point);
      const callout1 = paths.get('callout1');
      const callout2 = paths.get('callout2');
      const circle= new paper.Path.Circle({
        center: o,
        radius,
        insert: false
      });
      const i1 = circle.getIntersections(callout1.clone({insert: false}).elongation(10000));
      const i2 = circle.getIntersections(callout2.clone({insert: false}).elongation(10000));
      if(i1.length === 2 && i2.length === 2) {
        if(event.point.getDistance(i1[0].point) < event.point.getDistance(i1[1].point)) {
          callout1.lastSegment.point = i1[0].point;
        }
        else {
          callout1.lastSegment.point = i1[1].point;
        }
        if(event.point.getDistance(i2[0].point) < event.point.getDistance(i2[1].point)) {
          callout2.lastSegment.point = i2[0].point;
        }
        else {
          callout2.lastSegment.point = i2[1].point;
        }
        callout1.strokeWidth = 2;
        callout2.strokeWidth = 2;
        const arc = new paper.Path.Arc({
          from: callout1.lastSegment.point,
          through: event.point,
          to: callout2.lastSegment.point,
          parent: project.l_connective,
          strokeColor: 'black',
          strokeWidth: 2,
          strokeScaling: false,
          guide: true,
        });
        if(paths.get('arc')) {
          paths.get('arc').remove();
        }
        paths.set('arc', arc);
      }
      else if(paths.has('arc')) {
        paths.get('arc').remove();
        paths.delete('arc');
      }
    }
    else if(mode === 3) {
      // есть отрезки и дуга, рисуем текст
      const arc = paths.get('arc');
      if(paths.has('text')) {
        paths.get('text').remove();
      }
      paths.set('text', new paper.PointText({
        parent: project.l_connective,
        fillColor: 'black',
        fontFamily: paper.consts?.font_family,
        fontSize: Editor.DimensionLine._font_size(project.bounds),
        content: this.content(),
        position: event.point,
      }));
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

  content() {
    const callout1 = this.paths.get('callout1'), callout2 = this.paths.get('callout2');
    if(!callout1 || !callout2) {
      return '-';
    }
    const v1 = callout1.getNormalAt(0);
    const v2 = callout2.getNormalAt(0);
    const angle = v1.getAngle(v2).toFixed(1);
    return `${angle}°`;
  }

  get is_smart_size() {
    return true;
  }
}

Editor.ToolAngle = ToolAngle;
