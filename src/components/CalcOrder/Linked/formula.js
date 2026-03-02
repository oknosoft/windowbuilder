
const {cat: {formulas}, md, ui} = $p;
const ref = '019c99ad-3f02-76d9-bac0-390a3a8cb847';
const title = 'Связанные заказы';

md.once('predefined_elmnts_inited', () => {

  const formula = formulas.create({
    ref,
    name: title,
    parent: formulas.predefined('filling'),
    params: [{param: 'destination', value: 'doc.calc_order'}],
  }, false, true);

  import('./DialogBody').then(({DialogBody}) => {
    formula._data._formula = function (obj) {
      return ui.dialogs.alert({
        title,
        timeout: 0,
        Component: DialogBody,
        props: {obj},
        //initFullScreen: true,
        hide_btn: true,
        //noSpace: true,
      });
    };
  });
});


