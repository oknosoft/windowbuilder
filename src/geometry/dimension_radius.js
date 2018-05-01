/**
 * ### Размерная линия радиуса
 *
 * @module dimension_radius
 *
 * Created by Evgeniy Malyarov on 01.05.2018.
 */

class DimensionRadius extends DimensionLineCustom {

  /**
   * Возвращает тип элемента (размерная линия радиуса)
   */
  get elm_type() {
    return $p.enm.elm_types.Радиус;
  }

  get path() {
    // ищем точку 1 на пути профиля
    // строим нормаль - это и будет наш путь

    const {children, _attr} = this;
    if(!children.length){
      return;
    }
    const {path} = _attr.elm1;
    // если точки профиля еще не нарисованы - выходим
    if(!path){
      return;
    }

    // точка начала
    let b = path.getPointAt(_attr.p1);
    // нормаль
    const n = path.getNormalAt(_attr.p1).normalize(100);
    // путь
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

    const {generatrix} = _attr.elm1;
    const np = generatrix.getNearestPoint(b);
    const curv = Math.abs(generatrix.getCurvatureAt(generatrix.getOffsetOf(np)));
    if(curv) {
      children.text.content = `R${(1 / curv).round(-1)}`;
      children.text.rotation = e.subtract(b).angle;
      children.text.justification = 'left';
    }
    children.text.position = e.add(path.getTangentAt(0).multiply(consts.font_size * 1.4));
  }

}
