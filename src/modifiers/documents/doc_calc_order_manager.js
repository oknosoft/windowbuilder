/**
 * ### Модуль менеджера документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order
 */

((_mgr) => {

  // переопределяем формирование списка выбора
  const {form, tabular_sections} = _mgr.metadata();
  tabular_sections.production.fields.characteristic._option_list_local = true;

  // структура дополнительных форм, связанных с реквизитами
  // те же самые данные можно было разместить в meta_patch и пересобрать init.js
  form.client_of_dealer = {
    // описание полей по общим правилам метаданных
    fields: {
      surname: {
        synonym: 'Фамилия',
        mandatory: true,
        type: {types: ['string'], str_len: 50}
      },
      name: {
        synonym: 'Имя',
        mandatory: true,
        type: {types: ['string'], str_len: 50}
      },
      patronymic: {
        synonym: 'Отчество',
        type: {types: ['string'], str_len: 50}
      },
      passport_serial_number: {
        synonym: 'Серия и номер паспорта',
        tooltip: 'Серия и номер через пробел',
        type: {types: ['string'], str_len: 20}
      },
      passport_date: {
        synonym: 'Дата выдачи паспорта',
        type: {types: ['string'], str_len: 20}
      },
      note: {
        synonym: 'Дополнительно',
        multiline_mode: true,
        type: {types: ['string'], str_len: 0}
      }
    },
    // форма объекта
    obj: {
      items: [
        {
          element: 'FormGroup',
          row: true,
          items: [
            {
              element: 'FormGroup',
              items: [
                {
                  element: 'DataField',
                  fld: 'surname',
                },
                {
                  element: 'DataField',
                  fld: 'name',
                },
                {
                  element: 'DataField',
                  fld: 'patronymic',
                },
              ]
            },
            {
              element: 'FormGroup',
              items: [
                {
                  element: 'DataField',
                  fld: 'passport_serial_number',
                },
                {
                  element: 'DataField',
                  fld: 'passport_date',
                },
                {
                  element: 'DataField',
                  fld: 'note',
                },
              ]
            }
          ]
        }
      ]
    },
    // форма выбора
    selection: {
      indexes: [
        {
          mango: false,
          name: ''
        }
      ]
    }
  };

  // переопределяем объекты назначения дополнительных реквизитов
  _mgr._destinations_condition = {predefined_name: {in: ['Документ_Расчет', 'Документ_ЗаказПокупателя']}};

  // индивидуальная строка поиска
  _mgr.build_search = function (tmp, obj) {

    const {number_internal, client_of_dealer, partner, note} = obj;

    tmp.search = (obj.number_doc +
      (number_internal ? ' ' + number_internal : '') +
      (client_of_dealer ? ' ' + client_of_dealer : '') +
      (partner.name ? ' ' + partner.name : '') +
      (note ? ' ' + note : '')).toLowerCase();
  };

  // метод загрузки шаблонов
  _mgr.load_templates = async function () {

    if(!$p.job_prm.builder) {
      $p.job_prm.builder = {};
    }
    if(!$p.job_prm.builder.base_block) {
      $p.job_prm.builder.base_block = [];
    }
    if(!$p.job_prm.pricing) {
      $p.job_prm.pricing = {};
    }

    // дополним base_block шаблонами из систем профилей
    const {base_block} = $p.job_prm.builder;
    $p.cat.production_params.forEach((o) => {
      if(!o.is_folder) {
        o.base_blocks.forEach((row) => {
          if(base_block.indexOf(row.calc_order) == -1) {
            base_block.push(row.calc_order);
          }
        });
      }
    });

    // загрузим шаблоны пачками по 10 документов
    const refs = [];
    for (let o of base_block) {
      refs.push(o.ref);
      if(refs.length > 9) {
        await _mgr.adapter.load_array(_mgr, refs);
        refs.length = 0;
      }
    }
    if(refs.length) {
      await _mgr.adapter.load_array(_mgr, refs);
    }

    // загружаем характеристики из первых строк шаблонов - нужны для фильтра по системам
    refs.length = 0;
    base_block.forEach(({production}) => {
      if(production.count()) {
        refs.push(production.get(0).characteristic.ref);
      }
    });
    return $p.cat.characteristics.adapter.load_array($p.cat.characteristics, refs);

  };

  // копирует заказ, возвращает промис с новым заказом
  _mgr.clone = async function(src) {
    if(typeof src === 'string') {
      src = await _mgr.get(src, 'promise');
    }
    await src.load_production();
    // создаём заказ
    const {organization, partner, contract, ...others} = src._obj;
    const dst = await _mgr.create({date: new Date(), organization, partner, contract});
    dst._mixin(others, null, 'ref,date,number_doc,posted,_deleted,number_internal,production,planning,manager,obj_delivery_state'.split(','), true);
    // заполняем продукцию и сохраненные эскизы
    const map = new Map();
    const aatt = [];
    const db = _mgr.adapter.db(_mgr);
    src.production.forEach((row) => {
      const prow = Object.assign({}, row._obj);
      if(row.characteristic.calc_order === src) {
        const cx = prow.characteristic = $p.cat.characteristics.create({calc_order: dst.ref}, false, true);
        cx._mixin(row.characteristic._obj, null, 'ref,name,calc_order,timestamp'.split(','), true);
        cx._data._modified = true;
        cx._data._is_new = true;
        map.set(row.characteristic, cx);
        if(row.characteristic._attachments) {
          aatt.push(db.getAttachment(`cat.characteristics|${row.characteristic.ref}`, 'svg')
            .then((att) => cx._obj._attachments = {svg: {content_type: 'image/svg+xml', data: att}})
            .catch((err) => null));
        }
      }
      dst.production.add(prow);
    });

    // дожидаемся вложений
    await Promise.all(aatt);

    // обновляем leading_product
    dst.production.forEach((row) => {
      const cx = map.get(row.ordn);
      if(cx) {
        row.ordn = row.characteristic.leading_product = cx;
      }
    });
    dst._data.before_save_sync = true;
    return dst.save();
  }


})($p.doc.calc_order);
