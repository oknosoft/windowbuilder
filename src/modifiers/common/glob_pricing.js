/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 * @module  glob_pricing
 */

/**
 * ### Ценообразование
 *
 * @class Pricing
 * @param $p {MetaEngine} - контекст
 * @static
 */
class Pricing {

  constructor($p) {

    // виртуальный срез последних
    function build_cache(startkey) {

      return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
        {
          limit : 5000,
          include_docs: false,
          startkey: startkey || [''],
          endkey: ['\uffff']
          // ,reduce: function(keys, values, rereduce) {
          // 	return values.length;
          // }
        })
        .then((res) => {
          res.rows.forEach((row) => {

            const onom = $p.cat.nom.get(row.key[0], false, true);

            if(!onom || !onom._data)
              return;

            if(!onom._data._price)
              onom._data._price = {};

            if(!onom._data._price[row.key[1]])
              onom._data._price[row.key[1]] = {};

            if(!onom._data._price[row.key[1]][row.key[2]])
              onom._data._price[row.key[1]][row.key[2]] = [];

            onom._data._price[row.key[1]][row.key[2]].push({
              date: new Date(row.value.date),
              price: row.value.price,
              currency: $p.cat.currencies.get(row.value.currency)
            });
          });
          if(res.rows.length == 5000){
            return build_cache(res.rows[res.rows.length-1].key);
          }
        });
    }

    // подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
    const init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", () => {
      $p.eve.detachEvent(init_event_id);
      build_cache();
    })

    // следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
    $p.eve.attachEvent("pouch_change", (dbid, change) => {
      if (dbid != $p.doc.nom_prices_setup.cachable){
        return;
      }

      // формируем новый
    })

  }

  /**
   * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
   * Если в маржинальных коэффициентах или номенклатуре указана формула - выполняет
   *
   * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
   * @method nom_price
   * @param nom
   * @param characteristic
   * @param price_type
   * @param prm
   * @param row
   */
  nom_price(nom, characteristic, price_type, prm, row) {

    if (row && prm) {
      const calc_order = prm.calc_order_row._owner._owner,
        price_prm = {
          price_type: price_type,
          characteristic: characteristic,
          date: calc_order.date,
          currency: calc_order.doc_currency
        };
      if (price_type == prm.price_type.price_type_first_cost && !prm.price_type.formula.empty()) {
        price_prm.formula = prm.price_type.formula;
      }
      row.price = nom._price(price_prm);

      return row.price;
    }
  }

  /**
   * Возвращает структуру типов цен и КМарж
   * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
   * @method price_type
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  price_type(prm) {

    // Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
    // 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
    // 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
    const empty_formula = $p.cat.formulas.get();

    prm.price_type = {
      marginality: 1.9,
      marginality_min: 1.2,
      marginality_internal: 1.5,
      discount: 0,
      discount_external: 10,
      extra_charge_external: 0,
      price_type_first_cost: $p.job_prm.pricing.price_type_first_cost,
      price_type_sale: $p.job_prm.pricing.price_type_first_cost,
      price_type_internal: $p.job_prm.pricing.price_type_first_cost,
      formula: empty_formula,
      sale_formula: empty_formula,
      internal_formula: empty_formula,
      external_formula: empty_formula
    };

    const {nom, characteristic} = prm.calc_order_row;
    const filter = nom.price_group.empty() ?
        {price_group: nom.price_group} :
        {price_group: {in: [nom.price_group, $p.cat.price_groups.get()]}};
    const ares = [];

    $p.ireg.margin_coefficients.find_rows(filter, (row) => {

      // фильтруем по параметрам
      let ok = true;
      if(!row.key.empty()){
        row.key.params.forEach((row_prm) => {

          // для вычисляемых параметров выполняем формулу
          if(row_prm.property.is_calculated){

          }
          // обычные параметры ищем в параметрах изделия
          else{
            let finded;
            characteristic.params.find_rows({
              cnstr: 0,
              param: row_prm.property
            }, (row_x) => {
              finded = row_x;
              return false;
            });

            if(finded){
              if(row_prm.comparison_type == $p.enm.comparison_types.in){
                ok = row_prm.txt_row.match(finded.value.ref);
              }
              else if(row_prm.comparison_type == $p.enm.comparison_types.nin){
                ok = !row_prm.txt_row.match(finded.value.ref);
              }
              else if(row_prm.comparison_type.empty() || row_prm.comparison_type == $p.enm.comparison_types.eq){
                ok = row_prm.value == finded.value;
              }
              else if(row_prm.comparison_type.empty() || row_prm.comparison_type == $p.enm.comparison_types.ne){
                ok = row_prm.value != finded.value;
              }
            }
            else{
              ok = false;
            }
          }
          if(!ok){
            return false;
          }
        })
      }
      if(ok){
        ares.push(row);
      }
    });

    // сортируем по приоритету и ценовой группе
    if(ares.length){
      ares.sort((a, b) => {

        if (a.key.priority > b.key.priority) {
          return -1;
        }
        if (a.key.priority < b.key.priority) {
          return 1;
        }

        if (a.price_group.ref < b.price_group.ref) {
          return -1;
        }
        if (a.price_group.ref > b.price_group.ref) {
          return 1;
        }

        return 0;

      });
      Object.keys(prm.price_type).forEach((key) => {
        prm.price_type[key] = ares[0][key];
      });
    }

    // если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
    prm.calc_order_row._owner._owner.partner.extra_fields.find_rows({
      property: $p.job_prm.pricing.dealer_surcharge
    }, (row) => {
      const val = parseFloat(row.value);
      if(val){
        prm.price_type.extra_charge_external = val;
      }
      return false;
    });

    return prm.price_type;
  }

  /**
   * Рассчитывает плановую себестоимость строки документа Расчет
   * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
   *
   * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  calc_first_cost(prm) {

    const marginality_in_spec = $p.job_prm.pricing.marginality_in_spec;
    const fake_row = {};

    if(!prm.spec)
      return;

    // пытаемся рассчитать по спецификации
    if(prm.spec.count()){
      prm.spec.each((row) => {

        $p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_first_cost, prm, row);
        row.amount = row.price * row.totqty1;

        if(marginality_in_spec){
          fake_row._mixin(row, ["nom"]);
          const tmp_price = $p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_sale, prm, fake_row);
          row.amount_marged = (tmp_price ? tmp_price : row.price) * row.totqty1;
        }

      });
      prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);

    }else{

      // расчет себестомиости по номенклатуре строки расчета
      fake_row.nom = prm.calc_order_row.nom;
      fake_row.characteristic = prm.calc_order_row.characteristic;
      prm.calc_order_row.first_cost = $p.pricing.nom_price(fake_row.nom, fake_row.characteristic, prm.price_type.price_type_first_cost, prm, fake_row);
    }

    // себестоимость вытянутых строк спецификации в заказ
    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_first_cost(fake_prm);
    });
  }

  /**
   * Рассчитывает стоимость продажи в строке документа Расчет
   *
   * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
   * @param prm {Object}
   * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
   */
  calc_amount (prm) {

    // TODO: реализовать расчет цены продажи по номенклатуре строки расчета
    const price_cost = $p.job_prm.pricing.marginality_in_spec ? prm.spec.aggregate([], ["amount_marged"]) : 0;
    let extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");

    // если пересчет выполняется менеджером, используем наценку по умолчанию
    if(!$p.current_acl.partners_uids.length || !extra_charge){
      extra_charge = prm.price_type.extra_charge_external;
    }

    // цена продажи
    if(price_cost){
      prm.calc_order_row.price = price_cost.round(2);
    }
    else{
      prm.calc_order_row.price = (prm.calc_order_row.first_cost * prm.price_type.marginality).round(2);
    }

    // КМарж в строке расчета
    prm.calc_order_row.marginality = prm.calc_order_row.first_cost ?
      prm.calc_order_row.price * ((100 - prm.calc_order_row.discount_percent)/100) / prm.calc_order_row.first_cost : 0;


    // TODO: Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
    if(extra_charge){
      prm.calc_order_row.price_internal = (prm.calc_order_row.price *
      (100 - prm.calc_order_row.discount_percent)/100 * (100 + extra_charge)/100).round(2);

      // TODO: учесть формулу
    }

    // Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
    if(!prm.hand_start){
      $p.doc.calc_order.handle_event(prm.calc_order_row._owner._owner, "value_change", {
        field: "price",
        value: prm.calc_order_row.price,
        tabular_section: "production",
        row: prm.calc_order_row,
        no_extra_charge: true
      });
    }

    // Цены и суммы вытянутых строк спецификации в заказ
    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_amount(fake_prm);
    });

  }

  /**
   * Пересчитывает сумму из валюты в валюту
   * @param amount {Number} - сумма к пересчету
   * @param date {Date} - дата курса
   * @param from - исходная валюта
   * @param [to] - конечная валюта
   * @return {Number}
   */
  from_currency_to_currency (amount, date, from, to) {

    const {main_currency} = $p.job_prm.pricing;

    if(!to || to.empty()){
      to = main_currency;
    }
    if(!from || from == to){
      return amount;
    }
    if(!date){
      date = new Date();
    }
    if(!this.cource_sql){
      this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `date` desc");
    }

    let cfrom = {course: 1, multiplicity: 1},
      cto = {course: 1, multiplicity: 1};
    if(from != main_currency){
      const tmp = this.cource_sql([from.ref, date]);
      if(tmp.length)
        cfrom = tmp[0];
    }
    if(to != main_currency){
      const tmp = this.cource_sql([to.ref, date]);
      if(tmp.length)
        cto = tmp[0];
    }

    return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
  }

  /**
   * Выгружает в CouchDB изменённые в RAM справочники
   */
  cut_upload () {

    if(!$p.current_acl || (
      !$p.current_acl.role_available("СогласованиеРасчетовЗаказов") &&
      !$p.current_acl.role_available("ИзменениеТехнологическойНСИ"))){
      $p.msg.show_msg({
        type: "alert-error",
        text: $p.msg.error_low_acl,
        title: $p.msg.error_rights
      });
      return true;
    }

    function upload_acc() {
      const mgrs = [
        "cat.users",
        "cat.individuals",
        "cat.organizations",
        "cat.partners",
        "cat.contracts",
        "cat.currencies",
        "cat.nom_prices_types",
        "cat.price_groups",
        "cat.cashboxes",
        "cat.partner_bank_accounts",
        "cat.organization_bank_accounts",
        "cat.projects",
        "cat.stores",
        "cat.cash_flow_articles",
        "cat.cost_items",
        "cat.price_groups",
        "cat.delivery_areas",
        "ireg.currency_courses",
        "ireg.margin_coefficients"
      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {
          //handle change

        })
        .on('paused', (err) => {
          // replication paused (e.g. replication up to date, user went offline)

        })
        .on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        })
        .on('denied', (err) => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {

          if($p.current_acl.role_available("ИзменениеТехнологическойНСИ"))
            upload_tech();

          else
            $p.msg.show_msg({
              type: "alert-info",
              text: $p.msg.sync_complite,
              title: $p.msg.sync_title
            });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    function upload_tech() {
      const mgrs = [
        "cat.units",
        "cat.nom",
        "cat.nom_groups",
        "cat.nom_units",
        "cat.nom_kinds",
        "cat.elm_visualization",
        "cat.destinations",
        "cat.property_values",
        "cat.property_values_hierarchy",
        "cat.inserts",
        "cat.insert_bind",
        "cat.color_price_groups",
        "cat.clrs",
        "cat.furns",
        "cat.cnns",
        "cat.production_params",
        "cat.parameters_keys",
        "cat.formulas",
        "cch.properties",
        "cch.predefined_elmnts"

      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {
          //handle change

        })
        .on('paused', (err) => {
          // replication paused (e.g. replication up to date, user went offline)

        })
        .on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        })
        .on('denied', (err) => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {
          $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    if($p.current_acl.role_available("СогласованиеРасчетовЗаказов"))
      upload_acc();
    else
      upload_tech();

  }

}


/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__ в контексте MetaEngine
 *
 * @property pricing
 * @type Pricing
 */
$p.pricing = new Pricing($p);
