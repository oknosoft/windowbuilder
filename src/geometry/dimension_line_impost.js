/**
 *
 *
 * @module dimension_line_impost
 *
 * Created by Evgeniy Malyarov on 25.05.2018.
 */


class DimensionLineImpost extends DimensionLineCustom {

  constructor(attr) {

    attr.row = {
      cnstr: 1,
      elm: 1,
      _owner: {
        del() {}
      }
    }

    super(attr);

    new paper.PointText({
      parent: this,
      name: 'dx1',
      justification: 'center',
      fontFamily: consts.font_family,
      fillColor: 'black',
      fontSize: consts.font_size});

    new paper.PointText({
      parent: this,
      name: 'dx2',
      justification: 'center',
      fontFamily: consts.font_family,
      fillColor: 'black',
      fontSize: consts.font_size});

  }

  get path() {

    // рисум линию между точками dx1 и dx2 и смещаем на offset

    const {children, _attr: {elm1, p1, p2, dx1, dx2}} = this;
    if(!children.length){
      return;
    }
    const {generatrix} = elm1;

    let b = generatrix.getPointAt(typeof p1 == 'number' ? dx2 : dx1);
    let e = generatrix.getPointAt(typeof p1 == 'number' ? dx1 : dx2);
    // если точки профиля еще не нарисованы - выходим
    if(!b || !e){
      return;
    }
    const path = new paper.Path({insert: false, segments: [b, e]});
    path.offset = 0;
    return path;
  }

  redraw() {

    const {children, path, offset, _attr: {p1, p2, dx1, dx2}} = this;
    if(!children.length){
      return;
    }
    if(!path){
      this.visible = false;
      return;
    }

    this.visible = true;

    const b = path.firstSegment.point;
    const e = path.lastSegment.point;
    const normal = path.getNormalAt(0).multiply(offset + path.offset);
    const tangent = path.getTangentAt(0);
    const ns = normal.normalize(normal.length - 20);
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
    children.scale.elongation(200);

    children.text.rotation = children.dx1.rotation = children.dx2.rotation = 0;
    children.text.content = (typeof p1 == 'number' ? p1 : p2).toFixed(0);
    children.dx1.content = (dx1).toFixed(0);
    children.dx2.content = (dx2).toFixed(0);
    const bdx1 = children.dx1.bounds;
    const bdx2 = children.dx2.bounds;
    if(offset > 0) {
      children.dx1.justification = 'left';
      children.dx2.justification = 'right';
      children.dx1.position = bs
        .add(tangent.normalize(-Math.sign(offset) * ((consts.font_size + bdx1.width) / 2)))
        .add(normal.normalize(-consts.font_size * 0.6));
      children.dx2.position = es
        .add(tangent.normalize(Math.sign(offset) * ((consts.font_size + bdx1.width) / 2)))
        .add(normal.normalize(-consts.font_size * 0.6));
    }
    else {
      children.dx1.justification = 'right';
      children.dx2.justification = 'left';
      children.dx1.position = es
        .add(tangent.normalize(-Math.sign(offset) * ((consts.font_size + bdx1.width) / 2)))
        .add(normal.normalize(-consts.font_size * 0.6));
      children.dx2.position = bs
        .add(tangent.normalize(Math.sign(offset) * ((consts.font_size + bdx1.width) / 2)))
        .add(normal.normalize(-consts.font_size * 0.6));
    }
    children.text.rotation = children.dx1.rotation = children.dx2.rotation = e.subtract(b).angle;

    children.text.position = bs.add(es).divide(2).add(normal.normalize(consts.font_size * 0.8));
  }

}
