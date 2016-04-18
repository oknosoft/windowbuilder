/**
 * Модуль документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 * Created 16.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module doc_calc_order
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.doc.calc_order;

		// после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
		_mgr.attache_event("after_create", function (attr) {

			var acl = $p.current_acl.acl_objs,
				obj = this;

			//Организация
			acl.find_rows({
				by_default: true,
				type: $p.cat.organizations.metadata().obj_presentation || $p.cat.organizations.metadata().name}, function (row) {
				obj.organization = row.acl_obj;
				return false;
			});

			//Подразделение
			acl.find_rows({
				by_default: true,
				type: $p.cat.divisions.metadata().obj_presentation || $p.cat.divisions.metadata().name}, function (row) {
				obj.department = row.acl_obj;
				return false;
			});

			//Контрагент
			acl.find_rows({
				by_default: true,
				type: $p.cat.partners.metadata().obj_presentation || $p.cat.partners.metadata().name}, function (row) {
				obj.partner = row.acl_obj;
				return false;
			});

			//Договор
			obj.contract = $p.cat.contracts.by_partner_and_org(obj.partner, obj.organization);

			//Менеджер
			obj.manager = $p.current_user;

			//СостояниеТранспорта
			obj.obj_delivery_state = $p.enm.obj_delivery_states.Черновик;

			//Заказ
			obj._obj.invoice = $p.generate_guid();

			//Номер документа
			return obj.new_number_doc();

		});

		// перед записью надо присвоить номер для нового и рассчитать итоги
		_mgr.attache_event("before_save", function (attr) {
			attr = null;
		});

		// при изменении реквизита
		_mgr.attache_event("value_change", function (attr) {
			
			// реквизиты шапки
			if(attr.field == "organization" && this.contract.organization != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);

			}else if(attr.field == "partner" && this.contract.owner != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);
				
			// табчасть продукции
			}else if(attr.tabular_section == "production"){

				if(attr.field == "nom" || attr.field == "characteristic"){
					
				}else if(attr.field == "price" || attr.field == "price_internal" || attr.field == "quantity"){
					
					attr.row[attr.field] = attr.value;
					
					attr.row.amount = (attr.row.price * attr.row.quantity).round(2);
					attr.row.amount_internal = (attr.row.price_internal * attr.row.quantity).round(2);

					this.doc_amount = this.production.aggregate([], ["amount"]);
				}
				
			}
		});

		// свойства и методы объекта
		_mgr._obj_constructor.prototype.__define({

			// при установке нового номера
			new_number_doc: {

				value: function () {

					var obj = this,
						prefix = ($p.current_acl.prefix || "") + obj.organization.prefix,
						code_length = obj._metadata.code_length - prefix.length,
						part;

					return obj._manager.pouch_db.query("doc_calc_order/number_doc",
						{
							limit : 1,
							include_docs: false,
							startkey: prefix + '\uffff',
							endkey: prefix,
							descending: true
						})
						.then(function (res) {
							if(res.rows.length){
								part = (parseInt(res.rows[0].key.substr(prefix.length)) + 1).toFixed(0);
							}else{
								part = "1";
							}
							while (part.length < code_length)
								part = "0" + part;
							obj.number_doc = prefix + part;

							return obj;
						});
				}
			},

			// валюту документа получаем из договора
			doc_currency: {
				get: function () {
					return this.contract.settlements_currency;
				}
			},

			print_data: {
				get: function () {
					var res = {
						АдресДоставки: "",
						ВалютаДокумента: this.doc_currency.presentation,
						ДатаЗаказаФорматD: $p.dateFormat(this.date, $p.dateFormat.masks.short_ru),
						ДатаЗаказаФорматDD: $p.dateFormat(this.date, $p.dateFormat.masks.longDate),
						ДатаТекущаяФорматD: $p.dateFormat(new Date(), $p.dateFormat.masks.short_ru),
						ДатаТекущаяФорматDD: $p.dateFormat(new Date(), $p.dateFormat.masks.longDate),
						ДоговорДатаФорматD: $p.dateFormat(this.contract.date.valueOf() == $p.blank.date.valueOf() ? this.date : this.contract.date, $p.dateFormat.masks.short_ru),
						ДоговорДатаФорматDD: $p.dateFormat(this.contract.date.valueOf() == $p.blank.date.valueOf() ? this.date : this.contract.date, $p.dateFormat.masks.longDate),
						ДоговорНомер: this.contract.number_doc ? this.contract.number_doc : this.number_doc,
						ДоговорСрокДействия: $p.dateFormat(this.contract.validity, $p.dateFormat.masks.short_ru),
						ЗаказНомер: this.number_doc,
						Контрагент: this.partner.presentation,
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
						Организация: this.organization.presentation,
						ОрганизацияГород: this.organization.contact_information._obj.reduce(function (val, row) { return val || row.city }, "") || "Москва",
						ОрганизацияБанкБИК: "",
						ОрганизацияБанкГород: "",
						ОрганизацияБанкКоррСчет: "",
						ОрганизацияБанкНаименование: "",
						ОрганизацияБанкНомерСчета: "",
						ОрганизацияИндивидуальныйПредприниматель: "",
						ОрганизацияИНН: "",
						ОрганизацияКПП: "",
						ОрганизацияСвидетельствоДатаВыдачи: "",
						ОрганизацияСвидетельствоКодОргана: "",
						ОрганизацияСвидетельствоНаименованиеОргана: "",
						ОрганизацияСвидетельствоСерияНомер: "",
						ОрганизацияЮрФизЛицо: "",
						ОрганизацияЛоготип: "",
						Продукция: [],
						Проект: "",
						СистемыПрофилей: "",
						СистемыФурнитуры: "",
						Сотрудник: this.manager.presentation,
						СотрудникДолжность: this.manager.individual_person.Должность,
						СотрудникДолжностьРП: this.manager.individual_person.ДолжностьРП,
						СотрудникИмя: this.manager.individual_person.Имя,
						СотрудникИмяРП: this.manager.individual_person.ИмяРП,
						СотрудникОснованиеРП: this.manager.individual_person.ОснованиеРП,
						СотрудникОтчество: this.manager.individual_person.Отчество,
						СотрудникОтчествоРП: this.manager.individual_person.ОтчествоРП,
						СотрудникФамилия: this.manager.individual_person.Фамилия,
						СотрудникФамилияРП: this.manager.individual_person.ФамилияРП,
						СотрудникФИОРП: this.manager.individual_person.ФамилияРП + " " + this.manager.individual_person.ИмяРП + " " + this.manager.individual_person.ОтчествоРП,
						СуммаВключаетНДС: this.contract.vat_included,
						СуммаДокумента: this.doc_amount,
						СуммаДокументаПрописью: this.doc_amount.in_words(),
						СуммаНДС: "",
						ТелефонПоАдресуДоставки: this.phone,
						УчитыватьНДС: this.contract.vat_consider
					};
					
					// СвойствоХарактеристикастроения: "",
					
					return Promise.resolve(res);
				}
			}


		});

	}

);