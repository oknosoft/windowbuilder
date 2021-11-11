import orderForms from './CalcOrder/index.js';
import characteristicsForms from './CatCharacteristics/index.js';
const all = [].concat(orderForms).concat(characteristicsForms);
const {
  cat: {
    formulas
  },
  adapters: {
    pouch
  }
} = $p;
export function items() {
  const {
    current_user,
    job_prm
  } = $p;
  return all.filter(v => {
    return true;
  });
}

function create_formula(formulas, Component) {
  const formula = formulas.create({
    ref: Component.ref,
    jsx: true,
    parent: formulas.predefined('printing_plates'),
    name: Component.title,
    params: [{
      param: 'destination',
      value: Component.destination
    }]
  }, false, true);
  formula._data._formula = Component;

  formula._set_loaded(Component.ref);

  return formula;
}

pouch.once('pouch_doc_ram_loaded', () => {
  const components = items().map(Component => create_formula(formulas, Component));
  formulas.load_formulas(components);
});
