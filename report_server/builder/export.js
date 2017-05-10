
module.exports = async (attr = {}) => {

  if(attr.class == 'doc.calc_order'){

    const editor = new Editor();

    const obj = await $p.doc.calc_order.get(attr.ref, 'promise');

    return {img: editor.project, number_doc: obj.number_doc};
  }
  return attr;

};
