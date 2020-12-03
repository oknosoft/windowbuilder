/**
 * Возвращает список печатных форм, обрезанный по подразделению
 *
 * @module items
 *
 * Created by Evgeniy Malyarov on 19.04.2020.
 */

import Invoice1 from '../../components/CalcOrder/PrintingPlates/Invoice1';

const all = [Invoice1];


export function items() {
  const {current_user, job_prm} = $p;

  return all.filter((v) => {
    return true;
  });
}

function create_formula(formulas, Component) {
  const formula = formulas.create({
    ref: Component.ref,
    jsx: true,
    parent: formulas.predefined('printing_plates'),
    name: Component.title,
    params: [{param: 'destination', value: 'doc.calc_order'}],
  }, false, true);

  formula._data._formula = Component;
  formula._set_loaded(Component.ref);
  return formula;
}

export default function ($p) {

  // после загрузки данных, создаём виртуальную формулу
  $p.adapters.pouch.once('pouch_doc_ram_loaded', () => {
    const {cat: {formulas}} = $p;
    const components = items().map((Component) => create_formula(formulas, Component));
    formulas.load_formulas(components);
  });

}
