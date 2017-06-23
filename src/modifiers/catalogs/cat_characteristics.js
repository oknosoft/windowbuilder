/**
 * ### Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_characteristics
 *
 * Created 16.03.2016
 */

// при старте приложения
$p.on({

	// загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
	predefined_elmnts_inited: function common_characteristics() {
		$p.off(common_characteristics);
		return $p.cat.characteristics.pouch_load_view("doc/nom_characteristics");
	}

});

// перед записью объекта и при изменении реквизита в форме
$p.cat.characteristics.on({

	// перед записью надо пересчитать наименование и рассчитать итоги
	before_save: function (attr) {

    let obj = this;
    if(attr instanceof $p.CatCharacteristics){
      obj = attr;
      attr = arguments[1];
    }

		// уточняем номенклатуру системы
    const {prod_nom, calc_order} = obj;

    // контроль прав на запись характеристики
    if(calc_order.is_read_only){
      obj._data._err = {
        title: 'Права доступа',
        type: 'alert-error',
        text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
      };
      return false;
    }

		// пересчитываем наименование
		const name = obj.prod_name();
		if(name){
      obj.name = name;
    }

		// дублируем контрагента для целей RLS
    obj.partner = calc_order.partner;

	},

  // при изменении реквизита
  value_change: function (attr) {
	  // для вложенных вставок перезаполняем параметры
	  if(attr.field == 'inset' && attr.tabular_section == 'inserts'){
      this.add_inset_params(attr.value, attr.row.cnstr);
    }
  }


});

// свойства менеджера характеристики
Object.defineProperties($p.cat.characteristics, {

  // индивидуальная форма объекта
  form_obj: {
    value: function(pwnd, attr){

      const _meta = this.metadata();

      attr.draw_tabular_sections = function (o, wnd, tabular_init) {

        _meta.form.obj.tabular_sections_order.forEach((ts) => {
          if(ts == "specification"){
            // табчасть со специфическим набором кнопок
            tabular_init("specification", $p.injected_data["toolbar_characteristics_specification.xml"]);
            wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent("onclick", (btn_id) => {

              const selId = wnd.elmnts.grids.specification.getSelectedRowId();
              if(selId && !isNaN(Number(selId))){
                return o.open_origin(Number(selId)-1);
              }

              $p.msg.show_msg({
                type: "alert-warning",
                text: $p.msg.no_selected_row.replace("%1", "Спецификация"),
                title: o.presentation
              });

            });
          }else{
            tabular_init(ts);
          }
        });
      }

      return this.constructor.prototype.form_obj.call(this, pwnd, attr)
        .then(function (res) {
          if(res){
            o = res.o;
            wnd = res.wnd;
            return res;
          }
        });
    }
  }


});


// свойства объекта характеристики
Object.defineProperties($p.CatCharacteristics.prototype, {

  /**
   * Возврвщает строку заказа, которой принадлежит продукция
   */
  calc_order_row: {
    get: function () {
      let _calc_order_row;
      this.calc_order.production.find_rows({characteristic: this}, (_row) => {
        _calc_order_row = _row;
        return false;
      });
      return _calc_order_row;
    }
  },

  /**
   * Рассчитывает наименование продукции
   */
  prod_name: {
    value: function (short) {

      const {calc_order_row, calc_order, leading_product, sys, clr} = this;
      let name = "";

      if(calc_order_row){

        if(calc_order.number_internal)
          name = calc_order.number_internal.trim();

        else{
          // убираем нули из середины номера
          let num0 = calc_order.number_doc, part = "";
          for(let i = 0; i<num0.length; i++){
            if(isNaN(parseInt(num0[i])))
              name += num0[i];
            else
              break;
          }
          for(let i = num0.length-1; i>0; i--){
            if(isNaN(parseInt(num0[i])))
              break;
            part = num0[i] + part;
          }
          name += parseInt(part || 0).toFixed(0);
        }

        name += "/" + calc_order_row.row.pad();

        // для подчиненных, номер строки родителя
        if(!leading_product.empty()){
          name += ":" + leading_product.calc_order_row.row.pad();
        }

        // добавляем название системы
        if(!sys.empty()){
          name += "/" + sys.name;
        }

        if(!short){

          // добавляем название цвета
          if(!clr.empty()){
            name += "/" + this.clr.name;
          }

          // добавляем размеры
          if(this.x && this.y)
            name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
          else if(this.x)
            name += "/" + this.x.toFixed(0);
          else if(this.y)
            name += "/" + this.y.toFixed(0);

          if(this.z){
            if(this.x || this.y)
              name += "x" + this.z.toFixed(0);
            else
              name += "/" + this.z.toFixed(0);
          }

          if(this.s){
            name += "/S:" + this.s.toFixed(3);
          }

          // подмешиваем значения параметров
          let sprm = "";
          this.params.find_rows({cnstr: 0}, (row) => {
            if(row.param.include_to_name && sprm.indexOf(String(row.value)) == -1){
              sprm && (sprm += ';');
              sprm += String(row.value);
            }
          });
          if(sprm){
            name += "|" + sprm;
          }
        }
      }
      return name;
    }
  },

  /**
   * Возвращает номенклатуру продукции по системе
   */
  prod_nom: {

    get: function () {

      if(!this.sys.empty()){

        var setted,
          param = this.params;

        if(this.sys.production.count() == 1){
          this.owner = this.sys.production.get(0).nom;

        }else if(this.sys.production.count() > 1){
          this.sys.production.each(function (row) {

            if(setted)
              return false;

            if(row.param && !row.param.empty()){
              param.find_rows({cnstr: 0, param: row.param, value: row.value}, function () {
                setted = true;
                param._owner.owner = row.nom;
                return false;
              });
            }

          });
          if(!setted){
            this.sys.production.find_rows({param: $p.utils.blank.guid}, function (row) {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }
          if(!setted){
            this.owner = this.sys.production.get(0).nom;
          }
        }
      }

      return this.owner;
    }

  },

  /**
   * Добавляет параметры вставки
   * @param inset
   * @param cnstr
   */
  add_inset_params: {
    value: function (inset, cnstr, blank_inset) {

      var ts_params = this.params,
        params = [];

      ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, function (row) {
        if(params.indexOf(row.param) == -1){
          params.push(row.param);
        }
        return row.param;
      });

      inset.used_params.forEach(function (param) {
        if(params.indexOf(param) == -1){
          ts_params.add({
            cnstr: cnstr,
            inset: blank_inset || inset,
            param: param
          })
          params.push(param)
        }
      })
    }
  },

  /**
   * Открывает форму происхождения строки спецификации
   */
  open_origin: {
    value: function (row_id) {
      try{
        let {origin} = this.specification.get(row_id);
        if(typeof origin == "number"){
          origin = this.cnn_elmnts.get(origin-1).cnn;
        }
        if(origin.is_new()){
          return $p.msg.show_msg({
            type: "alert-warning",
            text: `Пустая ссылка на настройки в строке №${row_id+1}`,
            title: o.presentation
          });
        }
        origin.form_obj();
      }
      catch (err){
        $p.record_log(err);
      }
    }
  },

  /**
   * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
   * @param elm {Number} - номер элемента или контура
   * @param origin {CatInserts} - порождающая вставка
   * @return {CatCharacteristics}
   */
  find_create_cx: {
    value: function (elm, origin) {
      const {_manager, ref, calc_order, params, inserts} = this;
      if(!_manager._find_cx_sql){
        _manager._find_cx_sql = $p.wsql.alasql.compile("select top 1 ref from cat_characteristics where leading_product = ? and leading_elm = ? and origin = ?")
      }
      const aref = _manager._find_cx_sql([ref, elm, origin]);
      const cx = aref.length ? $p.cat.characteristics.get(aref[0].ref, false) :
        $p.cat.characteristics.create({
          calc_order: calc_order,
          leading_product: this,
          leading_elm: elm,
          origin: origin
        }, false, true)._set_loaded();

      // переносим в cx параметры
      const {length, width} = $p.job_prm.properties;
      cx.params.clear(true);
      params.find_rows({cnstr: -elm, inset: origin}, (row) => {
        if(row.param != length && row.param != width){
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
  },

});


