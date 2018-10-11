/**
 * ### Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module cat_characteristics
 *
 * Created 16.03.2016
 */

// при старте приложения, загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
$p.md.once('predefined_elmnts_inited', () => {
  const _mgr = $p.cat.characteristics;

  // грузим характеристики
  _mgr.adapter.load_view(_mgr, 'linked', {
    limit: 10000,
    include_docs: true,
    startkey: [$p.utils.blank.guid, 'cat.characteristics'],
    endkey: [$p.utils.blank.guid, 'cat.characteristics\u0fff']
  })
    .then(() => {
      // и корректируем метаданные формы спецификации с учетом ролей пользователя
      const {current_user} = $p;
      if(current_user && (
          current_user.role_available('СогласованиеРасчетовЗаказов') ||
          current_user.role_available('ИзменениеТехнологическойНСИ') ||
          current_user.role_available('РедактированиеЦен')
        )) {
        return;
      };
      _mgr.metadata().form.obj.tabular_sections.specification.widths = "50,*,70,*,50,70,70,80,70,70,70,0,0,0";
    })
});

// свойства объекта характеристики
$p.CatCharacteristics = class CatCharacteristics extends $p.CatCharacteristics {

  // перед записью надо пересчитать наименование и рассчитать итоги
  before_save(attr) {

    // уточняем номенклатуру системы
    const {prod_nom, calc_order, _data} = this;

    // контроль прав на запись характеристики
    if(calc_order.is_read_only) {
      _data._err = {
        title: 'Права доступа',
        type: 'alert-error',
        text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
      };
      return false;
    }

    // пересчитываем наименование
    const name = this.prod_name();
    if(name) {
      this.name = name;
    }

    // дублируем контрагента для целей RLS
    this.partner = calc_order.partner;

  }

  /**
   * Добавляет параметры вставки, пересчитывает признак hide
   * @param inset
   * @param cnstr
   */
  add_inset_params(inset, cnstr, blank_inset) {
    const ts_params = this.params;
    const params = [];

    ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, (row) => {
      params.indexOf(row.param) === -1 && params.push(row.param);
      return row.param;
    });

    inset.used_params.forEach((param) => {
      if((!param.is_calculated || param.show_calculated) && params.indexOf(param) == -1) {
        ts_params.add({
          cnstr: cnstr,
          inset: blank_inset || inset,
          param: param
        });
        params.push(param);
      }
    });

    ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, (row) => {
      const links = row.param.params_links({grid: {selection: {cnstr}}, obj: row});
      row.hide = links.some((link) => link.hide);
    });
  }

  /**
   * Рассчитывает наименование продукции
   */
  prod_name(short) {
    const {calc_order_row, calc_order, leading_product, sys, clr, origin} = this;
    let name = '';

    if(calc_order_row) {

      if(calc_order.number_internal) {
        name = calc_order.number_internal.trim();
      }
      else {
        // убираем нули из середины номера
        let num0 = calc_order.number_doc, part = '';
        for (let i = 0; i < num0.length; i++) {
          if(isNaN(parseInt(num0[i]))) {
            name += num0[i];
          }
          else {
            break;
          }
        }
        for (let i = num0.length - 1; i > 0; i--) {
          if(isNaN(parseInt(num0[i]))) {
            break;
          }
          part = num0[i] + part;
        }
        name += parseInt(part || 0).toFixed(0);
      }

      name += '/' + calc_order_row.row.pad();

      // для подчиненных, номер строки родителя
      if(!leading_product.empty()) {
        name += ':' + leading_product.calc_order_row.row.pad();
      }

      // добавляем название системы или вставки
      if(!sys.empty()) {
        name += '/' + sys.name;
      }
      else if(!origin.empty()) {
        name += '/' + origin.name;
      }

      if(!short) {

        // добавляем название цвета
        if(!clr.empty()) {
          name += '/' + this.clr.name;
        }

        // добавляем размеры
        if(this.x && this.y) {
          name += '/' + this.x.toFixed(0) + 'x' + this.y.toFixed(0);
        }
        else if(this.x) {
          name += '/' + this.x.toFixed(0);
        }
        else if(this.y) {
          name += '/' + this.y.toFixed(0);
        }

        if(this.z) {
          if(this.x || this.y) {
            name += 'x' + this.z.toFixed(0);
          }
          else {
            name += '/' + this.z.toFixed(0);
          }
        }

        if(this.s) {
          name += '/S:' + this.s.toFixed(3);
        }

        // подмешиваем значения параметров
        let sprm = '';
        this.params.find_rows({cnstr: 0}, (row) => {
          if(row.param.include_to_name && sprm.indexOf(String(row.value)) == -1) {
            sprm && (sprm += ';');
            sprm += String(row.value);
          }
        });
        if(sprm) {
          name += '|' + sprm;
        }
      }
    }
    return name;
  }

  /**
   * Открывает форму происхождения строки спецификации
   */
  open_origin(row_id) {
    try {
      let {origin} = this.specification.get(row_id);
      if(typeof origin == 'number') {
        origin = this.cnn_elmnts.get(origin - 1).cnn;
      }
      if(origin.is_new()) {
        return $p.msg.show_msg({
          type: 'alert-warning',
          text: `Пустая ссылка на настройки в строке №${row_id + 1}`,
          title: o.presentation
        });
      }
      origin.form_obj();
    }
    catch (err) {
      $p.record_log(err);
    }
  }

  /**
   * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
   * @param elm {Number} - номер элемента или контура
   * @param origin {CatInserts} - порождающая вставка
   * @return {CatCharacteristics}
   */
  find_create_cx(elm, origin) {
    const {_manager, calc_order, params, inserts} = this;
    let cx;
    _manager.find_rows({leading_product: this, leading_elm: elm, origin}, (obj) => {
      if(!obj._deleted) {
        cx = obj;
        return false;
      }
    });
    if(!cx) {
      cx = $p.cat.characteristics.create({
        calc_order: calc_order,
        leading_product: this,
        leading_elm: elm,
        origin: origin
      }, false, true)._set_loaded();
    }

    // переносим в cx параметры
    const {length, width} = $p.job_prm.properties;
    cx.params.clear();
    params.find_rows({cnstr: -elm, inset: origin}, (row) => {
      if(row.param != length && row.param != width) {
        cx.params.add({param: row.param, value: row.value});
      }
    });
    // переносим в cx цвет
    inserts.find_rows({cnstr: -elm, inset: origin}, (row) => {
      cx.clr = row.clr;
    });
    cx.name = cx.prod_name();
    return cx;
  }

  /**
   * Возврвщает строку заказа, которой принадлежит продукция
   */
  get calc_order_row() {
    let _calc_order_row;
    this.calc_order.production.find_rows({characteristic: this}, (_row) => {
      _calc_order_row = _row;
      return false;
    });
    return _calc_order_row;
  }

  /**
   * Возвращает номенклатуру продукции по системе
   */
  get prod_nom() {
    if(!this.sys.empty()) {

      var setted,
        param = this.params;

      if(this.sys.production.count() == 1) {
        this.owner = this.sys.production.get(0).nom;

      }
      else if(this.sys.production.count() > 1) {
        this.sys.production.each((row) => {

          if(setted) {
            return false;
          }

          if(row.param && !row.param.empty()) {
            param.find_rows({cnstr: 0, param: row.param, value: row.value}, () => {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }

        });
        if(!setted) {
          this.sys.production.find_rows({param: $p.utils.blank.guid}, (row) => {
            setted = true;
            param._owner.owner = row.nom;
            return false;
          });
        }
        if(!setted) {
          this.owner = this.sys.production.get(0).nom;
        }
      }
    }

    return this.owner;
  }

  /**
   * Дополнительные свойства изделия для рисовалки
   */
  get builder_props() {
    const defaults = this.constructor.builder_props_defaults;
    const props = {};
    let tmp;
    try {
      tmp = JSON.parse(this._obj.builder_props || '{}');
    }
    catch(e) {
      tmp = props;
    }
    for(const prop in defaults){
      if(tmp.hasOwnProperty(prop)) {
        props[prop] = typeof tmp[prop] === 'number' ? tmp[prop] : !!tmp[prop];
      }
      else {
        props[prop] = defaults[prop];
      }
    }
    return props;
  }
  set builder_props(v) {
    if(this.empty()) {
      return;
    }
    const {_obj, _data} = this;
    const name = 'builder_props';
    if(_data && _data._loading) {
      _obj[name] = v;
      return;
    }
    let _modified;
    if(!_obj[name] || typeof _obj[name] !== 'string'){
      _obj[name] = JSON.stringify(this.constructor.builder_props_defaults);
      _modified = true;
    }
    const props = this.builder_props;
    for(const prop in v){
      if(props[prop] !== v[prop]) {
        props[prop] = v[prop];
        _modified = true;
      }
    }
    if(_modified) {
      _obj[name] = JSON.stringify(props);
      this.__notify(name);
    }
  }

  /**
   * Пересчитывает изделие по тем же правилам, что и визуальная рисовалка
   * @param attr
   * @param editor
   */
  recalc(attr = {}, editor) {

    // сначала, получаем объект заказа и продукции заказа в озу, т.к. пересчет изделия может приводить к пересчету соседних продукций

    // загружаем изделие в редактор
    const remove = !editor;
    if(remove) {
      editor = new $p.EditorInvisible();
    }
    const project = editor.create_scheme();
    return project.load(this, true)
      .then(() => {

        // выполняем пересчет
        project.save_coordinates({save: true, svg: false});

      })
      .then(() => {
        project.ox = '';
        if(remove) {
          editor.unload();
        }
        else {
          project.unload();
        }
        return this;
      });

  }

  /**
   * Рисует изделие или фрагмент изделия в Buffer в соответствии с параметрами attr
   * @param attr
   * @param editor
   */
  draw(attr = {}, editor) {

    const ref = $p.utils.snake_ref(this.ref);
    const res = attr.res || {};
    res[ref] = {imgs: {}};

    // загружаем изделие в редактор
    const remove = !editor;
    if(remove) {
      editor = new $p.EditorInvisible();
    }
    const project = editor.create_scheme();
    return project.load(this, attr.builder_props || true)
      .then(() => {
        const {_obj: {glasses, constructions, coordinates}} = this;
        // формируем эскиз(ы) в соответствии с attr
        if(attr.elm) {
          project.draw_fragment({elm: attr.elm});
          const num = attr.elm > 0 ? `g${attr.elm}` : `l${attr.elm}`;
          if(attr.format === 'png') {
            res[ref].imgs[num] = project.view.element.toDataURL('image/png').substr(22);
          }
          else {
            res[ref].imgs[num] = project.get_svg(attr);
          }
        }
        else if(attr.glasses) {
          res[ref].glasses = glasses.map((glass) => Object.assign({}, glass));
          res[ref].glasses.forEach((row) => {
            const glass = project.draw_fragment({elm: row.elm});
            // подтянем формулу стеклопакета
            if(attr.format === 'png') {
              res[ref].imgs[`g${row.elm}`] = project.view.element.toDataURL('image/png').substr(22);
            }
            else {
              res[ref].imgs[`g${row.elm}`] = project.get_svg(attr);
            }
            if(glass){
              row.formula_long = glass.formula(true);
              glass.visible = false;
            }
          });
        }
        else {
          if(attr.format === 'png') {
            res[ref].imgs[`l0`] = project.view.element.toDataURL('image/png').substr(22);
          }
          else {
            res[ref].imgs[`l0`] = project.get_svg(attr);
          }
          if(attr.glasses !== false) {
            constructions.forEach(({cnstr}) => {
              project.draw_fragment({elm: -cnstr});
              if(attr.format === 'png') {
                res[ref].imgs[`l${cnstr}`] = project.view.element.toDataURL('image/png').substr(22);
              }
              else {
                res[ref].imgs[`l${cnstr}`] = project.get_svg(attr);
              }
            });
          }
        }
      })
      .then(() => {
        project.ox = '';
        if(remove) {
          editor.unload();
        }
        else {
          project.unload();
        }
        return res;
      });
  }

};

$p.CatCharacteristics.builder_props_defaults = {
  auto_lines: true,
  custom_lines: true,
  cnns: true,
  visualization: true,
  txts: true,
  rounding: 0,
};

// при изменении реквизита табчасти вставок
$p.CatCharacteristicsInsertsRow.prototype.value_change = function (field, type, value) {
  // для вложенных вставок перезаполняем параметры
  if(field == 'inset') {
    if (value != this.inset) {
      const {_owner} = this._owner;
      const {cnstr} = this;

      //Проверяем дубли вставок (их не должно быть, иначе параметры перезаписываются)
      if (value != $p.utils.blank.guid) {
        const res = _owner.params.find_rows({cnstr, inset: value, row: {not: this.row}});
        if (res.length) {
          $p.md.emit('alert', {
            obj: _owner,
            row: this,
            title: $p.msg.data_error,
            type: 'alert-error',
            text: 'Нельзя добавлять две одинаковые вставки в один контур'
          });
          return false;
        }
      }

      // удаляем параметры старой вставки
      !this.inset.empty() && _owner.params.clear({inset: this.inset, cnstr});

      // устанавливаем значение новой вставки
      this._obj.inset = value;

      // заполняем параметры по умолчанию
      _owner.add_inset_params(this.inset, cnstr);
    }
  }
}
