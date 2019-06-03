/**
 * Предопределенные дополнительные реквизиты
 *
 * @module predefined_props
 *
 * Created by Evgeniy Malyarov on 01.06.2019.
 */

$p.md.once('predefined_elmnts_inited', () => {
  const {DocCalc_order, doc: {calc_order}, cat: {destinations}, cch: {properties}, enm: {obj_delivery_states}, job_prm} = $p;
  const dst = destinations.predefined('Документ_Расчет');
  const predefined = [
    {
      class_name: 'cch.properties',
      ref: '198ac4ac-8453-11e9-bc71-873e65ad9246',
      name: 'Параметры из системы',
      caption: 'Параметры из системы',
      sorting_field: 1143,
      available: true,
      list: 0,
      destination: dst.ref,
      type: {types: ['boolean']}
    },
    {
      class_name: 'cch.properties',
      ref: '28278e46-8453-11e9-bc71-873e65ad9246',
      name: 'Уточнять систему',
      caption: 'Уточнять систему',
      sorting_field: 1144,
      available: true,
      list: 0,
      destination: dst.ref,
      type: {types: ['boolean']}
    },
    {
      class_name: 'cch.properties',
      ref: '323b3eaa-8453-11e9-bc71-873e65ad9246',
      name: 'Уточнять фурнитуру',
      caption: 'Уточнять фурнитуру',
      sorting_field: 1145,
      available: true,
      list: 0,
      destination: dst.ref,
      type: {types: ['boolean']}
    }
  ];
  properties.load_array(predefined);

  const templates_props = predefined.map(({ref}) => properties.get(ref));

  Object.defineProperties(DocCalc_order.prototype, {
    refill_props: {
      get() {
        const row = this.extra_fields.find({property: templates_props[0]});
        return row ? row.value : job_prm.builder.refill_props;
      }
    },
    specify_sys: {
      get() {
        const row = this.extra_fields.find({property: templates_props[1]});
        return row ? row.value : false;
      }
    },
    specify_furn: {
      get() {
        const row = this.extra_fields.find({property: templates_props[2]});
        return row ? row.value : false;
      }
    }
  });

  const {extra_fields} = Object.getPrototypeOf(calc_order);
  calc_order.extra_fields = function (obj) {
    const res = extra_fields.call(calc_order, obj);
    return obj.obj_delivery_state === obj_delivery_states.Шаблон ? res.concat(templates_props) : res;
  }
});

