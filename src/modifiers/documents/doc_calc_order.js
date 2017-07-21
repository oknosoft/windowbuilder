/**
 * ### Модуль менеджера и документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order
 */

// переопределяем формирование списка выбора
$p.doc.calc_order.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

// подписки на события
$p.doc.calc_order.on({

	// после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
	after_create: function (attr) {

    const {enm, cat, current_user, DocCalc_order} = $p;
	  const {acl_objs} = current_user;

    let obj = this;
	  if(attr instanceof DocCalc_order){
      obj = attr;
      attr = arguments[1];
    }

		//Организация
		acl_objs.find_rows({by_default: true, type: cat.organizations.class_name}, (row) => {
      obj.organization = row.acl_obj;
			return false;
		});

		//Подразделение
    DocCalc_order.set_department.call(obj);

		//Контрагент
		acl_objs.find_rows({by_default: true, type: cat.partners.class_name}, (row) => {
      obj.partner = row.acl_obj;
			return false;
		});

		//Договор
    obj.contract = cat.contracts.by_partner_and_org(obj.partner, obj.organization);

		//Менеджер
    obj.manager = current_user;

		//СостояниеТранспорта
    obj.obj_delivery_state = enm.obj_delivery_states.Черновик;

		//Номер документа
		return obj.new_number_doc();

	},

	// перед записью надо присвоить номер для нового и рассчитать итоги
	before_save: function (attr) {

    const {Отклонен, Отозван, Шаблон, Подтвержден, Отправлен} = $p.enm.obj_delivery_states;

    let obj = this;
    if(attr instanceof $p.DocCalc_order){
      obj = attr;
      attr = arguments[1];
    }

		let doc_amount = 0,
      amount_internal = 0,
      sys_profile = "",
      sys_furn = "";


		// если установлен признак проведения, проверим состояние транспорта
		if(obj.posted){
			if (obj.obj_delivery_state == Отклонен || obj.obj_delivery_state == Отозван || obj.obj_delivery_state == Шаблон){
        $p.msg.show_msg && $p.msg.show_msg({
					type: "alert-warning",
					text: "Нельзя провести заказ со статусом<br/>'Отклонён', 'Отозван' или 'Шаблон'",
					title: obj.presentation
				});
				return false;
			}
			else if(obj.obj_delivery_state != Подтвержден){
        obj.obj_delivery_state = Подтвержден;
			}
		}
		else if(obj.obj_delivery_state == Подтвержден){
      obj.obj_delivery_state = Отправлен;
		}

		// проверим заполненность подразделения
    if(obj.obj_delivery_state == Шаблон){
      obj.department = $p.utils.blank.guid;
    }else if(obj.department.empty()){
      $p.msg.show_msg && $p.msg.show_msg({
        type: "alert-warning",
        text: "Не заполнен реквизит 'офис продаж' (подразделение)",
        title: obj.presentation
      });
      return false;
    }

    obj.production.each((row) => {

			doc_amount += row.amount;
			amount_internal += row.amount_internal;

			if(!row.characteristic.calc_order.empty()){
				const name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
				if(sys_profile.indexOf(name) == -1){
					if(sys_profile)
						sys_profile += " ";
					sys_profile += name;
				}

				// row.characteristic.constructions.each((row) => {
				// 	if(row.parent && !row.furn.empty()){
				// 		const name = row.furn.name_short || row.furn.name;
				// 		if(sys_furn.indexOf(name) == -1){
				// 			if(sys_furn)
				// 				sys_furn += " ";
				// 			sys_furn += name;
				// 		}
				// 	}
				// });
			}
		});

    obj.doc_amount = doc_amount.round(2);
    obj.amount_internal = amount_internal.round(2);
    obj.sys_profile = sys_profile;
		//obj.sys_furn = sys_furn;
    obj.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, obj.date, obj.doc_currency).round(2);

		const {_obj, obj_delivery_state, category, number_internal, partner, client_of_dealer, note} = obj;

		// фильтр по статусу
    if(obj_delivery_state=='Шаблон'){
      _obj.state = 'template'
    }
    else if(category=='Сервис'){
      _obj.state = 'service';
    }
    else if(category=='Рекламация'){
      _obj.state = 'complaints';
    }
    else if(obj_delivery_state=='Отправлен'){
      _obj.state = 'sent';
    }
    else if(obj_delivery_state=='Отклонен'){
      _obj.state = 'declined';
    }
    else if(obj_delivery_state=='Подтвержден'){
      _obj.state = 'confirmed';
    }
    else if(obj_delivery_state=='Архив'){
      _obj.state = 'zarchive';
    }
    else{
      _obj.state = 'draft';
    }

		// строка поиска
		_obj.search = (obj.number_doc +
      (number_internal ? " " + number_internal : "") +
      (client_of_dealer ? " " + client_of_dealer : "") +
      (partner.name ? " " + partner.name : "") +
      (note ? " " + note : "")).toLowerCase();

	},

	// при изменении реквизита
	value_change: function (attr, _obj) {

    const o = _obj || this;

		// реквизиты шапки
		if(attr.field == "organization"){
      o.new_number_doc();
			if(o.contract.organization != attr.value){
        o.contract = $p.cat.contracts.by_partner_and_org(o.partner, attr.value);
      }
		}
		else if(attr.field == "partner" && o.contract.owner != attr.value){
      o.contract = $p.cat.contracts.by_partner_and_org(attr.value, o.organization);

		}
    // табчасть продукции
		else if(attr.tabular_section == "production"){

			if(attr.field == "nom" || attr.field == "characteristic" || attr.field == "quantity"){
			  if(attr.row.characteristic.empty() || attr.row.characteristic.calc_order.empty()){
          const fake_prm = {
            spec: attr.row.characteristic.specification,
            calc_order_row: attr.row
          }
          $p.pricing.price_type(fake_prm);
          $p.pricing.calc_first_cost(fake_prm);
          $p.pricing.calc_amount(fake_prm);
        }
			}

			if(attr.field == "price" || attr.field == "price_internal" || attr.field == "quantity" ||
				attr.field == "discount_percent" || attr.field == "discount_percent_internal"){

				attr.row[attr.field] = attr.value;

				attr.row.amount = (attr.row.price * ((100 - attr.row.discount_percent)/100) * attr.row.quantity).round(2);

				// если есть внешняя цена дилера, получим текущую дилерскую наценку
				if(!attr.no_extra_charge){
					var prm = {calc_order_row: attr.row},
            extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");

					// если пересчет выполняется менеджером, используем наценку по умолчанию
          if(!$p.current_user.partners_uids.length || !extra_charge){
            $p.pricing.price_type(prm);
            extra_charge = prm.price_type.extra_charge_external;
          }

					if(attr.field != "price_internal" && extra_charge && attr.row.price){
            attr.row.price_internal = (attr.row.price * (100 - attr.row.discount_percent)/100 * (100 + extra_charge)/100).round(2);
          }
				}

				attr.row.amount_internal = (attr.row.price_internal * ((100 - attr.row.discount_percent_internal)/100) * attr.row.quantity).round(2);

				// ставка и сумма НДС
				if(o.vat_consider){
          const {НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС} = $p.enm.vat_rates;
					attr.row.vat_rate = attr.row.nom.vat_rate.empty() ? НДС18 : attr.row.nom.vat_rate;
					switch (attr.row.vat_rate){
						case НДС18:
						case НДС18_118:
							attr.row.vat_amount = (attr.row.amount * 18 / 118).round(2);
							break;
						case НДС10:
						case НДС10_110:
							attr.row.vat_amount = (attr.row.amount * 10 / 110).round(2);
							break;
						case НДС20:
						case НДС20_120:
							attr.row.vat_amount = (attr.row.amount * 20 / 120).round(2);
							break;
						case НДС0:
						case БезНДС:
							attr.row.vat_amount = 0;
							break;
					}
					if(!o.vat_included){
						attr.row.amount = (attr.row.amount + attr.row.vat_amount).round(2);
					}
				}
				else{
					attr.row.vat_rate = $p.enm.vat_rates.БезНДС;
					attr.row.vat_amount = 0;
				}

        o.doc_amount = o.production.aggregate([], ["amount"]).round(2);
        o.amount_internal = o.production.aggregate([], ["amount_internal"]).round(2);

				// TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

			}

		}
	}
});

// метод загрузки шаблонов
$p.doc.calc_order.load_templates = async function () {

  if(!$p.job_prm.builder){
    $p.job_prm.builder = {};
  }
  if(!$p.job_prm.builder.base_block){
    $p.job_prm.builder.base_block = [];
  }
  if(!$p.job_prm.pricing){
    $p.job_prm.pricing = {};
  }

  // дополним base_block шаблонами из систем профилей
  $p.cat.production_params.forEach((o) => {
    if(!o.is_folder)
      o.base_blocks.forEach((row) => {
        if($p.job_prm.builder.base_block.indexOf(row.calc_order) == -1){
          $p.job_prm.builder.base_block.push(row.calc_order);
        }
      });
  });

  // загрузим шаблоны пачками по 10 документов
  const refs = [];
  for(let o of $p.job_prm.builder.base_block){
    refs.push(o.ref);
    if(refs.length > 9){
      await $p.doc.calc_order.pouch_load_array(refs);
      refs.length = 0;
    }
  }
  return refs.length ? $p.doc.calc_order.pouch_load_array(refs) : undefined;

  //$p.job_prm.builder.base_block.forEach((o) => o.load());
};

// свойства и методы объекта
(() => {

  const Proto = $p.DocCalc_order;
  delete Proto.prototype.contract;

  $p.DocCalc_order = class DocCalc_order extends Proto {

    /**
     * Возвращает валюту документа
     */
    get doc_currency() {
      const currency = this.contract.settlements_currency;
      return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
    }

    /**
     * При установке договора, синхронно устанавливаем параметры НДС
     */
    get contract() {
      return this._getter('contract')
    }
    set contract(v) {
      this._setter('contract',v);
      this.vat_consider = this.contract.vat_consider;
      this.vat_included = this.contract.vat_included;
    }

    /**
     * рассчитывает итоги диспетчеризации
     * @return {Promise.<TResult>|*}
     */
    dispatching_totals() {
      var options = {
        reduce: true,
        limit: 10000,
        group: true,
        keys: []
      };
      this.production.forEach(function (row) {
        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
          options.keys.push([row.characteristic.ref, "305e374b-3aa9-11e6-bf30-82cf9717e145", 1, 0])
        }
      });

      return $p.wsql.pouch.remote.doc.query('server/dispatching', options)
        .then(function (result) {
          var res = {};
          result.rows.forEach(function (row) {
            if(row.value.plan){
              row.value.plan = moment(row.value.plan).format("L")
            }
            if(row.value.fact){
              row.value.fact = moment(row.value.fact).format("L")
            }
            res[row.key[0]] = row.value
          });
          return res;
        });
    }

    /**
     * Возвращает данные для печати
     */
    print_data() {
      const {organization, bank_account, contract, manager} = this;
      const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
      const get_imgs = [];
      const {contact_information_kinds} = $p.cat;

      // заполняем res теми данными, которые доступны синхронно
      const res = {
        АдресДоставки: this.shipping_address,
        ВалютаДокумента: this.doc_currency.presentation,
        ДатаЗаказаФорматD: moment(this.date).format("L"),
        ДатаЗаказаФорматDD: moment(this.date).format("LL"),
        ДатаТекущаяФорматD: moment().format("L"),
        ДатаТекущаяФорматDD: moment().format("LL"),
        ДоговорДатаФорматD: moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format("L"),
        ДоговорДатаФорматDD: moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format("LL"),
        ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
        ДоговорСрокДействия: moment(contract.validity).format("L"),
        ЗаказНомер: this.number_doc,
        Контрагент: this.partner.presentation,
        КонтрагентОписание: this.partner.long_presentation,
        КонтрагентДокумент: "",
        КонтрагентКЛДолжность: "",
        КонтрагентКЛДолжностьРП: "",
        КонтрагентКЛИмя: "",
        КонтрагентКЛИмяРП: "",
        КонтрагентКЛК: "",
        КонтрагентКЛОснованиеРП: "",
        КонтрагентКЛОтчество: "",
        КонтрагентКЛОтчествоРП: "",
        КонтрагентКЛФамилия: "",
        КонтрагентКЛФамилияРП: "",
        КонтрагентЮрФизЛицо: "",
        КратностьВзаиморасчетов: this.settlements_multiplicity,
        КурсВзаиморасчетов: this.settlements_course,
        ЛистКомплектацииГруппы: "",
        ЛистКомплектацииСтроки: "",
        Организация: organization.presentation,
        ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, "") || "Москва",
        ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
          if(row.kind == contact_information_kinds.predefined("ЮрАдресОрганизации") && row.presentation){
            return row.presentation;
          }
          else if(val){
            return val;
          }
          else if(row.presentation && (
              row.kind == contact_information_kinds.predefined("ФактАдресОрганизации") ||
              row.kind == contact_information_kinds.predefined("ПочтовыйАдресОрганизации")
            )){
            return row.presentation;
          }
        }, ""),
        ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
          if(row.kind == contact_information_kinds.predefined("ТелефонОрганизации") && row.presentation){
            return row.presentation;
          }
          else if(val){
            return val;
          }
          else if(row.kind == contact_information_kinds.predefined("ФаксОрганизации") && row.presentation){
            return row.presentation;
          }
        }, ""),
        ОрганизацияБанкБИК: our_bank_account.bank.id,
        ОрганизацияБанкГород: our_bank_account.bank.city,
        ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
        ОрганизацияБанкНаименование: our_bank_account.bank.name,
        ОрганизацияБанкНомерСчета: our_bank_account.account_number,
        ОрганизацияИндивидуальныйПредприниматель: organization.individual_entrepreneur.presentation,
        ОрганизацияИНН: organization.inn,
        ОрганизацияКПП: organization.kpp,
        ОрганизацияСвидетельствоДатаВыдачи: organization.certificate_date_issue,
        ОрганизацияСвидетельствоКодОргана: organization.certificate_authority_code,
        ОрганизацияСвидетельствоНаименованиеОргана: organization.certificate_authority_name,
        ОрганизацияСвидетельствоСерияНомер: organization.certificate_series_number,
        ОрганизацияЮрФизЛицо: organization.individual_legal.presentation,
        ПродукцияЭскизы: {},
        Проект: this.project.presentation,
        СистемыПрофилей: this.sys_profile,
        СистемыФурнитуры: this.sys_furn,
        Сотрудник: manager.presentation,
        СотрудникДолжность: manager.individual_person.Должность || "менеджер",
        СотрудникДолжностьРП: manager.individual_person.ДолжностьРП,
        СотрудникИмя: manager.individual_person.Имя,
        СотрудникИмяРП: manager.individual_person.ИмяРП,
        СотрудникОснованиеРП: manager.individual_person.ОснованиеРП,
        СотрудникОтчество: manager.individual_person.Отчество,
        СотрудникОтчествоРП: manager.individual_person.ОтчествоРП,
        СотрудникФамилия: manager.individual_person.Фамилия,
        СотрудникФамилияРП: manager.individual_person.ФамилияРП,
        СотрудникФИО: manager.individual_person.Фамилия +
        (manager.individual_person.Имя ? " " + manager.individual_person.Имя[1].toUpperCase() + "." : "" )+
        (manager.individual_person.Отчество ? " " + manager.individual_person.Отчество[1].toUpperCase() + "." : ""),
        СотрудникФИОРП: manager.individual_person.ФамилияРП + " " + manager.individual_person.ИмяРП + " " + manager.individual_person.ОтчествоРП,
        СуммаДокумента: this.doc_amount.toFixed(2),
        СуммаДокументаПрописью: this.doc_amount.in_words(),
        СуммаДокументаБезСкидки: this.production._obj.reduce(function (val, row){
          return val + row.quantity * row.price;
        }, 0).toFixed(2),
        СуммаСкидки: this.production._obj.reduce(function (val, row){
          return val + row.discount;
        }, 0).toFixed(2),
        СуммаНДС: this.production._obj.reduce(function (val, row){
          return val + row.vat_amount;
        }, 0).toFixed(2),
        ТекстНДС: this.vat_consider ? (this.vat_included ? "В том числе НДС 18%" : "НДС 18% (сверху)") : "Без НДС",
        ТелефонПоАдресуДоставки: this.phone,
        СуммаВключаетНДС: contract.vat_included,
        УчитыватьНДС: contract.vat_consider,
        ВсегоНаименований: this.production.count(),
        ВсегоИзделий: 0,
        ВсегоПлощадьИзделий: 0,
        Продукция: [],
        Подразделение: this.department.presentation
      };


      // дополняем значениями свойств
      this.extra_fields.forEach((row) => {
        res["Свойство" + row.property.name.replace(/\s/g,"")] = row.value.presentation || row.value;
      });

      // TODO: дополнить датами доставки и монтажа
      res.МонтажДоставкаСамовывоз = !this.shipping_address ? "Самовывоз" : "Монтаж по адресу: " + this.shipping_address;

      // получаем логотип организации
      for(let key in organization._attachments){
        if(key.indexOf("logo") != -1){
          get_imgs.push(organization.get_attachment(key)
            .then((blob) => {
              return $p.utils.blob_as_text(blob, blob.type.indexOf("svg") == -1 ? "data_url" : "")
            })
            .then((data_url) => {
              res.ОрганизацияЛоготип = data_url;
            })
            .catch($p.record_log));
          break;
        }
      }

      // получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
      this.production.forEach((row) => {

        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

          res.Продукция.push(this.row_description(row));

          res.ВсегоИзделий+= row.quantity;
          res.ВсегоПлощадьИзделий+= row.quantity * row.s;

          get_imgs.push($p.cat.characteristics.get_attachment(row.characteristic.ref, "svg")
            .then((blob) => $p.utils.blob_as_text(blob))
            .then((svg_text) => {
              res.ПродукцияЭскизы[row.characteristic.ref] = svg_text;
            })
            .catch((err) => err && err.status != 404 && $p.record_log(err))
          );
        }
      });
      res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

      return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
        .then(() => {

          if(!window.QRCode)
            return new Promise((resolve, reject) => {
              $p.load_script("lib/qrcodejs/qrcode.js", "script", resolve);
            });

        })
        .then(() => {

          const svg = document.createElement("SVG");
          svg.innerHTML = "<g />";
          const qrcode = new QRCode(svg, {
            text: "http://www.oknosoft.ru/zd/",
            width: 100,
            height: 100,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H,
            useSVG: true
          });
          res.qrcode = svg.innerHTML;

          return res;
        });
    }

    /**
     * Возвращает струклуру с описанием строки продукции для печати
     */
    row_description(row) {

      if(!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic){
        this.production.find_rows({characteristic: row.characteristic}, (prow) => {
          row = prow;
          return false;
        })
      }
      const {characteristic, nom} = row;
      const res = {
        ref: characteristic.ref,
        НомерСтроки: row.row,
        Количество: row.quantity,
        Ед: row.unit.name || "шт",
        Цвет: characteristic.clr.name,
        Размеры: row.len + "x" + row.width + ", " + row.s + "м²",
        Площадь: row.s,
        Номенклатура: nom.name_full || nom.name,
        Характеристика: characteristic.name,
        Заполнения: "",
        Фурнитура: "",
        Параметры: [],
        Цена: row.price,
        ЦенаВнутр: row.price_internal,
        СкидкаПроцент: row.discount_percent,
        СкидкаПроцентВнутр: row.discount_percent_internal,
        Скидка: row.discount.round(2),
        Сумма: row.amount.round(2),
        СуммаВнутр: row.amount_internal.round(2)
      };

      // формируем описание заполнений
      characteristic.glasses.forEach((row) => {
        const {name} = row.nom;
        if(res.Заполнения.indexOf(name) == -1){
          if(res.Заполнения){
            res.Заполнения += ", ";
          }
          res.Заполнения += name;
        }
      });

      // наименования фурнитур
      characteristic.constructions.forEach((row) => {
        const {name} = row.furn;
        if(name && res.Фурнитура.indexOf(name) == -1){
          if(res.Фурнитура){
            res.Фурнитура += ", ";
          }
          res.Фурнитура += name;
        }
      });

      // параметры, помеченные к включению в описание
      const params = new Map();
      characteristic.params.forEach((row) => {
        if(row.param.include_to_description){
          params.set(row.param, row.value);
        }
      });
      for (let [param, value] of params) {
        res.Параметры.push({
          param: param.presentation,
          value: value.presentation || value
        });
      }

      return res;
    }

    /**
     * Заполняет табчасть планирования данными по умолчанию
     */
    fill_plan(confirmed) {

      // если табчасть не пустая - задаём вопрос
      if(this.planning.count() && !confirmed){
        dhtmlx.confirm({
          title: $p.msg.main_title,
          text: $p.msg.tabular_will_cleared.replace('%1', "Планирование"),
          cancel: $p.msg.cancel,
          callback: function(btn) {
            if(btn){
              this.fill_plan(true);
            }
          }.bind(this)
        });
        return;
      }

      this.planning.clear();

    }

    /**
     * Выясняет, можно ли редактировать данный объект
     */
    get is_read_only() {
      const {obj_delivery_state, posted, _deleted} = this;
      const {Черновик, Шаблон, Отозван} = $p.enm.obj_delivery_states;
      let ro = false;
      // технолог может изменять шаблоны
      if(obj_delivery_state == Шаблон){
        ro = !$p.current_user.role_available("ИзменениеТехнологическойНСИ");
      }
      // ведущий менеджер может изменять проведенные
      else if(posted || _deleted){
        ro = !$p.current_user.role_available("СогласованиеРасчетовЗаказов");
      }
      else if(!obj_delivery_state.empty()){
        ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
      }
      return ro;
    }

    /**
     * Загружает в RAM данные характеристик продукций заказа
     * @return {Promise.<TResult>|*}
     */
    load_production() {
      const prod = [];
      this.production.forEach((row) => {
        const {nom, characteristic} = row;
        if (!characteristic.empty() && characteristic.is_new() && !nom.is_procedure && !nom.is_service && !nom.is_accessory) {
          prod.push(characteristic.ref);
        }
      });
      const mgr = $p.cat.characteristics;
      return (mgr.pouch_load_array ? mgr.pouch_load_array(prod) : mgr.adapter.load_array(mgr, prod))
        .then(() => {
        prod.length = 0;
        this.production.forEach((row) => {
          const {nom, characteristic} = row;
          if (!characteristic.empty() && !nom.is_procedure && !nom.is_service && !nom.is_accessory) {
            prod.push(characteristic);
          }
        });
        return prod;
      });
    }

    create_product_row({row_spec, elm, len_angl, params, create, grid}) {

      const row = this.production.add({
        qty: 1,
        quantity: 1,
        discount_percent_internal: $p.wsql.get_user_param("discount_percent_internal", "number")
      });

      if(grid){
        this.production.sync_grid(grid);
        grid.selectRowById(row.row);
      }

      if(!create){
        return row;
      }

      // ищем объект продукции в RAM
      const mgr = $p.cat.characteristics;
      let cx;
      mgr.find_rows({calc_order: this, product: row.row}, (ox) => {
        for(let ts in mgr.metadata().tabular_sections){
          ox[ts].clear(true);
        }
        ox.leading_elm = 0;
        ox.leading_product = '';
        cx = Promise.resolve(ox);
      });

      // объект продукции создаём, но из базы не читаем и пока не записываем
      return (cx || mgr.create({
        ref: $p.utils.generate_guid(),
        calc_order: this,
        product: row.row
      }, true))
        .then((ox) => {
          // устанавливаем характеристику в строке заказа
          row.characteristic = ox;
          // записываем расчет, если не сделали этого ранее, чтобы не погибла ссылка на расчет в характеристике
          return this.is_new() ? this.save().then(() => ox) : ox;
      })
        .then((ox) => {
          // если указана строка-генератор, заполняем реквизиты
          if(row_spec instanceof $p.DpBuyers_orderProductionRow){
            ox.owner = row.nom = row_spec.inset.nom(elm, true);
            ox.origin = row_spec.inset;
            ox.x = row.len = row_spec.len;
            ox.y = row.width = row_spec.height;
            ox.z = row_spec.depth;
            ox.s = row.s = row_spec.s;
            ox.clr = row_spec.clr;
            row.qty = row.quantity = row_spec.quantity;
            ox.note = row.note = row_spec.note;

            if(params){
              params.find_rows({elm: row_spec.row}, (prow) => {
                ox.params.add(prow, true);
              });
            }

            ox.name = ox.prod_name();
          }
          return row;
      });

    }

    /**
     * Создаёт продукции заказа по массиву строк и параметров
     * @method process_add_product_list
     * @param dp {DpBuyers_order} - экземпляр обработки с заполненными табличными частями
     */
    process_add_product_list(dp) {

      return new Promise(async (resolve, reject) => {

        const ax = [];

        for(let i = 0; i < dp.production.count(); i++){
          const row_spec = dp.production.get(i);
          if(row_spec.inset.empty()){
            return;
          }

          // рассчитываем спецификацию по текущей вставке
          const len_angl = {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: row_spec.len,
            origin: row_spec.inset,
            cnstr: 0
          };
          const elm = {
            elm: 0,
            angle_hor: 0,
            get _row() {return this},
            get clr() {return row_spec.clr},
            get len() {return row_spec.len},
            get height() {return row_spec.height},
            get depth() {return row_spec.depth},
            get s() {return row_spec.s},
            get perimeter() {return [{len: row_spec.len, angle: 0}, {len: row_spec.height, angle: 90}]},
            get x1() {return 0},
            get y1() {return 0},
            get x2() {return row_spec.height},
            get y2() {return row_spec.len},
          };
          // создаём строку заказа с уникальной харктеристикой
          const row_prod = await this.create_product_row({row_spec, elm, len_angl, params: dp.product_params, create: true});
          row_spec.inset.calculate_spec({elm, len_angl, ox: row_prod.characteristic});

          // сворачиваем
          row_prod.characteristic.specification.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");

          // производим дополнительную корректировку спецификации и рассчитываем цены
          [].push.apply(ax, $p.spec_building.specification_adjustment({
            //scheme: scheme,
            calc_order_row: row_prod,
            spec: row_prod.characteristic.specification,
            save: true,
          }, true));

        }

        resolve(ax);

      });
    }

    /**
     * Устанавливает подразделение по умолчанию
     */
    static set_department() {
      const department = $p.wsql.get_user_param("current_department");
      if(department){
        this.department = department;
      }
      const {current_user, cat} = $p;
      if(this.department.empty() || this.department.is_new()){
        current_user.acl_objs && current_user.acl_objs.find_rows({by_default: true, type: cat.divisions.class_name}, (row) => {
          if(this.department != row.acl_obj){
            this.department = row.acl_obj;
          }
          return false;
        });
      }
    }

  }
})();

