/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module materials_demand
 * Created 07.11.2016
 */

export default function ($p) {

  const {characteristics, nom, nom_kinds, clrs} = $p.cat

  // свойства объекта отчета _Потребность по материалам_
  Object.defineProperties($p.RepMaterials_demand.prototype, {

    formatters: {
      value: {
        characteristic: v => {
          v = characteristic_mgr.get(v.value)
          return (<div>{v instanceof Promise ? 'loading...' : v.presentation}</div>)
        }
      }
    }
  })

}


