/**
 * Подключает список печатных форм,
 * обрезанный по подразделению или иным свойствам текущего пользователя
 *
 * @module items
 *
 * Created by Evgeniy Malyarov on 19.04.2020.
 */

const all = [];
const {cat: {formulas}, adapters: {pouch}} = $p;

// фильтрует список печатных форм с учетом свойств пользователя
export function items() {
  const {current_user, job_prm} = $p;
  return all.filter(v => {
    return true;
  });
}

// создаёт виртуальную печатную форму
function create_formula(formulas, Component) {
  const formula = formulas.create({
    ref: Component.ref,
    jsx: true,
    parent: formulas.predefined('printing_plates'),
    name: Component.title,
    params: [{param: 'destination', value: Component.destination}],
  }, false, true);
  formula._data._formula = Component;

  formula._set_loaded(Component.ref);

  return formula;
}

// после загрузки данных, подключаем виртуальные формулы
pouch.once('pouch_doc_ram_loaded', () => {
  const components = items().map(Component => create_formula(formulas, Component));
  formulas.load_formulas(components);
});
