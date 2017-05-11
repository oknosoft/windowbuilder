
delete Contour.prototype.refresh_links;
Contour.prototype.refresh_links = function () {

}

delete Scheme.prototype.zoom_fit;
Scheme.prototype.zoom_fit = function () {
  Contour.prototype.zoom_fit.call(this);
}

// формирует json описания продукции с эскизами
async function prod(ctx, next) {
  const editor = new Editor();

  const calc_order = await $p.doc.calc_order.get(ctx.params.ref, 'promise');

  const prod = await calc_order.load_production();

  const res = {number_doc: calc_order.number_doc};

  const {project, view} = editor;

  for(let ox of prod){

    await project.load(ox);

    // project.draw_fragment({elm: -1});
    // view.update();
    // ctx.type = 'image/png';
    // ctx.body = return view.element.toBuffer();

    const {_obj} = ox;

    res[ox.ref] = {
      imgs: {
        'l0': view.element.toBuffer().toString('base64')
      },
      constructions: _obj.constructions,
      coordinates: _obj.coordinates,
      specification: _obj.specification,
      glasses: _obj.glasses,
      params: _obj.params,
      clr: _obj.clr,
      sys: _obj.sys,
      x: _obj.x,
      y: _obj.y,
      z: _obj.z,
      s: _obj.s,
      weight: _obj.weight,
      origin: _obj.origin,
      leading_elm: _obj.leading_elm,
      leading_product: _obj.leading_product,
      product: _obj.product,
    };

    ox.constructions.forEach(({cnstr}) => {
      project.draw_fragment({elm: -cnstr});
      res[ox.ref].imgs[`l${cnstr}`] = view.element.toBuffer().toString('base64');
    })
  }

  setTimeout(() => {
    calc_order.unload();
    editor.project.unload();
    for(let ox of prod){
      ox.unload();
    }
  });

  //ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  ctx.body = res;
}

// формирует массив эскизов по параметрам запроса
async function array(ctx, next) {

}

// формирует единичный эскиз по параметрам запроса
async function png(ctx, next) {

}

// формирует единичный эскиз по параметрам запроса
async function svg(ctx, next) {

}

module.exports = async (ctx, next) => {

  switch (ctx.params.class){
    case 'doc.calc_order':
      return prod(ctx, next);
    case 'array':
      return array(ctx, next);
    case 'png':
      return png(ctx, next);
    case 'svg':
      return svg(ctx, next);
  }

};
