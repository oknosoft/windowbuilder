
delete Contour.prototype.refresh_links;
Contour.prototype.refresh_links = function () {

}

module.exports = async (attr = {}) => {

  if(attr.class == 'doc.calc_order'){

    const editor = new Editor();

    const calc_order = await $p.doc.calc_order.get(attr.ref, 'promise');

    const prod = await calc_order.load_production();

    const res = {number_doc: calc_order.number_doc};

    const {project, view} = editor;

    for(let ox of prod){

      await project.load(ox);

      project.draw_fragment({elm: -2});

      view.update();

      return view.element.toBuffer();

      res[ox.ref] = {
        imgs: {
          '0': view.element.toBuffer().toString('base64')
        },
        constructions: ox._obj.constructions,
        coordinates: ox._obj.coordinates,
        specification: ox._obj.specification,
        glasses: ox._obj.glasses,
        params: ox._obj.params,
      };
    }

    setTimeout(() => {
      calc_order.unload();
      editor.project.unload();
      for(let ox of prod){
        ox.unload();
      }
    });

    return JSON.stringify(res);
  }
  return attr;

};
