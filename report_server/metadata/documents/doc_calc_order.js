/**
 * ### Модуль менеджера и документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_calc_order
 */

module.exports = function ($p) {

	// свойства и методы объекта
	Object.defineProperties($p.DocCalc_order.prototype, {


		/**
		 * Возвращает валюту документа
		 */
		doc_currency: {
			get: function () {
				var currency = this.contract.settlements_currency;
				return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
			}
		},

		/**
		 * Итоги диспетчеризации по изделиям заказа
		 */
		dispatching_totals: {
			value: function () {

				options = {
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

				return $p.adapters.pouch.remote.doc.query('server/dispatching', options)
					.then(function (result) {
						var res = {};
						result.rows.forEach(function (row) {
							if(row.value.plan){
								row.value.plan = $p.utils.moment(row.value.plan).format("L")
							}
							if(row.value.fact){
								row.value.fact = $p.utils.moment(row.value.fact).format($p.utils.moment._masks.date_time)
							}
							res[row.key[0]] = row.value
						});
						return res;
					});

			}
		},

		/**
		 * Возвращает данные для печати
		 */
		print_data: {
			get: function () {
				var our_bank_account = this.bank_account && !this.bank_account.empty() ? this.bank_account : this.organization.main_bank_account,
					characteristics = [];

				// заполняем res теми данными, которые доступны синхронно
				var res = {
					АдресДоставки: this.shipping_address,
					ВалютаДокумента: this.doc_currency.presentation,
					ДатаЗаказаФорматD: $p.utils.moment(this.date).format("L"),
					ДатаЗаказаФорматDD: $p.utils.moment(this.date).format("LL"),
					ДатаТекущаяФорматD: $p.utils.moment().format("L"),
					ДатаТекущаяФорматDD: $p.utils.moment().format("LL"),
					ДоговорДатаФорматD: $p.utils.moment(this.contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : this.contract.date).format("L"),
					ДоговорДатаФорматDD: $p.utils.moment(this.contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : this.contract.date).format("LL"),
					ДоговорНомер: this.contract.number_doc ? this.contract.number_doc : this.number_doc,
					ДоговорСрокДействия: $p.utils.moment(this.contract.validity).format("L"),
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
					ОрганизацияЛоготип: this.organization._attachments && this.organization._attachments['logo.png']
						? 'data:image/gif;base64,'+this.organization._attachments['logo.png'].data.toString('base64') : '',
					Организация: this.organization.presentation,
					ОрганизацияГород: this.organization.contact_information._obj.reduce(function (val, row) { return val || row.city }, "") || "Москва",
					ОрганизацияАдрес: this.organization.contact_information._obj.reduce(function (val, row) {

						if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресОрганизации") && row.presentation)
							return row.presentation;

						else if(val)
							return val;

						else if(row.presentation && (
								row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресОрганизации") ||
								row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресОрганизации")
							))
							return row.presentation;

					}, ""),
					ОрганизацияТелефон: this.organization.contact_information._obj.reduce(function (val, row) {

						if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонОрганизации") && row.presentation)
							return row.presentation;

						else if(val)
							return val;

						else if(row.kind == $p.cat.contact_information_kinds.predefined("ФаксОрганизации") && row.presentation)
							return row.presentation;

					}, ""),
					ОрганизацияБанкБИК: our_bank_account.bank.id,
					ОрганизацияБанкГород: our_bank_account.bank.city,
					ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
					ОрганизацияБанкНаименование: our_bank_account.bank.name,
					ОрганизацияБанкНомерСчета: our_bank_account.account_number,
					ОрганизацияИндивидуальныйПредприниматель: this.organization.individual_entrepreneur.presentation,
					ОрганизацияИНН: this.organization.inn,
					ОрганизацияКПП: this.organization.kpp,
					ОрганизацияСвидетельствоДатаВыдачи: $p.utils.moment(this.organization.certificate_date_issue).format("L"),
					ОрганизацияСвидетельствоКодОргана: this.organization.certificate_authority_code,
					ОрганизацияСвидетельствоНаименованиеОргана: this.organization.certificate_authority_name,
					ОрганизацияСвидетельствоСерияНомер: this.organization.certificate_series_number,
					ОрганизацияЮрФизЛицо: this.organization.individual_legal.presentation,
					ПродукцияЭскизы: {},
					Проект: this.project.presentation,
					СистемыПрофилей: this.sys_profile,
					СистемыФурнитуры: this.sys_furn,
					Сотрудник: this.manager.presentation,
					СотрудникДолжность: this.manager.individual_person.Должность || "менеджер",
					СотрудникДолжностьРП: this.manager.individual_person.ДолжностьРП,
					СотрудникИмя: this.manager.individual_person.Имя,
					СотрудникИмяРП: this.manager.individual_person.ИмяРП,
					СотрудникОснованиеРП: this.manager.individual_person.ОснованиеРП,
					СотрудникОтчество: this.manager.individual_person.Отчество,
					СотрудникОтчествоРП: this.manager.individual_person.ОтчествоРП,
					СотрудникФамилия: this.manager.individual_person.Фамилия,
					СотрудникФамилияРП: this.manager.individual_person.ФамилияРП,
					СотрудникФИО: this.manager.individual_person.Фамилия +
					(this.manager.individual_person.Имя ? " " + this.manager.individual_person.Имя[1].toUpperCase() + "." : "" )+
					(this.manager.individual_person.Отчество ? " " + this.manager.individual_person.Отчество[1].toUpperCase() + "." : ""),
					СотрудникФИОРП: this.manager.individual_person.ФамилияРП + " " + this.manager.individual_person.ИмяРП + " " + this.manager.individual_person.ОтчествоРП,
					СуммаДокумента: this.doc_amount.toFixed(2),
					// TODO СуммаДокументаПрописью: this.doc_amount.in_words(),
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
					СуммаВключаетНДС: this.contract.vat_included,
					УчитыватьНДС: this.contract.vat_consider,
					ВсегоНаименований: this.production.count(),
					ВсегоИзделий: 0,
					ВсегоПлощадьИзделий: 0,
					Продукция: []
				};

				// дополняем значениями свойств
				this.extra_fields.each(function (row) {
					res["Свойство" + row.property.name.replace(/\s/g,"")] = $p.utils.is_data_obj(row.value) ? row.value.presentation : row.value;
				});

				// TODO: дополнить датами доставки и монтажа
				// if(!this.shipping_address){
				// 	res.МонтажДоставкаСамовывоз = "Самовывоз";
				// }else{
				// 	res.МонтажДоставкаСамовывоз = "Монтаж по адресу: " + this.shipping_address;
				// }

				// получаем объекты продукций
				this.production.forEach(function (row) {
					const characteristic = row.characteristic;
					if(characteristic instanceof Promise){
						characteristics.push(characteristic)
					}
				});

				return Promise.all(characteristics)
					.then(() => {
						const attachments = [];
						this.production.forEach((row) => {
							if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
								attachments.push(row.characteristic.get_attachment('svg'))
							}else{
								attachments.push(Promise.resolve(''))
							}
						});
						return Promise.all(attachments)
					})
					.then((attachments) => {

						return this.dispatching_totals()
							.then((dispatching) => {

								// получаем объекты продукций, параллельно
								// - накапливаем количество и площадь изделий
								// - приклеиваем вложения
								// - приклеиваем данные диспетчеризации
								this.production.forEach((row) => {

									const row_description = this.row_description(row);
									if(attachments[row.row-1]){
										row_description.svg = attachments[row.row-1].toString('utf8')
									}
									if(dispatching[row.characteristic.ref]){
										row_description.dispatching = dispatching[row.characteristic.ref]
									}
									res.Продукция.push(row_description)

									if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
										res.ВсегоИзделий+= row.quantity;
										res.ВсегоПлощадьИзделий+= row.quantity * row.s;
									}
								});
								res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

								return res;

							})
					});
			}
		},

		/**
		 * Возвращает струклуру с описанием строки продукции для печати
		 */
		row_description: {
			value: function (row) {

				var product = row.characteristic,
					res = {
						characteristic: product.ref,
						nom: row.nom.ref,
						НомерСтроки: row.row,
						Количество: row.quantity,
						Ед: row.unit.name || "шт",
						Цвет: product.clr.name,
						Размеры: row.len + "x" + row.width + ", " + row.s + "м²",
						Номенклатура: row.nom.name_full || row.nom.name,
						Характеристика: product.name,
						Заполнения: "",
						Цена: row.price,
						ЦенаВнутр: row.price_internal,
						СкидкаПроцент: row.discount_percent,
						СкидкаПроцентВнутр: row.discount_percent_internal,
						Скидка: row.discount,
						Сумма: row.amount,
						СуммаВнутр: row.amount_internal
					};

				product.glasses.forEach(function (row) {
					if(res.Заполнения.indexOf(row.nom.name) == -1){
						if(res.Заполнения)
							res.Заполнения += ", ";
						res.Заполнения += row.nom.name;
					}
				});

				return res;
			}
		}


	});

}


