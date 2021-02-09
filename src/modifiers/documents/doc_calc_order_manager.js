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

  // дополняем отбор номенклатуры в метаданных заказа
  const {nom} = _mgr.metadata('production').fields;
  if(!nom.choice_params) {
    nom.choice_params = [];
  }
  nom.choice_params.push({name: 'is_procedure', path: false});

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

})($p.doc.calc_order);
