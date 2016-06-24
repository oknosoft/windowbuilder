/**
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  glob_pricing
 */

$p.modifiers.push(
	function($p){

		// экспортируем класс Pricing (модуль ценообразования)
		$p.pricing = new Pricing($p);

		// методы ценообразования в прототип номенклатуры
		$p.cat.nom._obj_constructor.prototype.__define({

			/**
			 * Возвращает цену номенклатуры указанного типа
			 * - на дату
			 * - с подбором характеристики по цвету
			 * - с пересчетом из валюты в валюту
			 */
			_price: {
				value: function (attr) {
					
					if(!attr)
						attr = {};

					if(!attr.price_type)
						attr.price_type = $p.job_prm.pricing.price_type_sale;
					else if($p.is_data_obj(attr.price_type))
						attr.price_type = attr.price_type.ref;

					if(!attr.characteristic)
						attr.characteristic = $p.blank.guid;
					else if($p.is_data_obj(attr.characteristic))
						attr.characteristic = attr.characteristic.ref;

					if(!attr.date)
						attr.date = new Date();

					var price = 0, currency, date = $p.blank.date;

					if(this._data._price){
						if(this._data._price[attr.characteristic]){
							if(this._data._price[attr.characteristic][attr.price_type]){
								this._data._price[attr.characteristic][attr.price_type].forEach(function (row) {
									if(row.date > date && row.date <= attr.date){
										price = row.price;
										currency = row.currency;
									}
								})
							}
						}else if(attr.clr){

						}
					}

					// Пересчитать из валюты в валюту
					return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

				}
			}
		});

		/**
		 * Обработчик события "при изменении свойства" в шапке или табличной части при редактировании в форме объекта
		 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
		 */
		$p.doc.nom_prices_setup.attache_event("add_row", function (attr) {

			// установим валюту и тип цен по умолчению при добавлении строки
			if(attr.tabular_section == "goods"){
				attr.row.price_type = this.price_type;
				attr.row.currency = this.price_type.price_currency;
			}

		});

		$p.doc.nom_prices_setup.attache_event("after_create", function (attr) {

			//Номер документа
			return this.new_number_doc();

		});



		function Pricing($p){

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
			this.nom_price = function (nom, characteristic, price_type, prm, row) {

				if(row && prm){
					var calc_order = prm.calc_order_row._owner._owner;
					row.price = nom._price({
						price_type: price_type,
						characteristic: characteristic,
						date: calc_order.date,
						currency: calc_order.doc_currency
					});

					return row.price;
				}
			};

			/**
			 * Возвращает структуру типов цен и КМарж
			 * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
			 * @method price_type
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.price_type = function (prm) {

				// Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
				// 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
				// 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
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
					formula: "",
					sale_formula: "",
					internal_formula: "",
					external_formula: ""
				};

				var filter = prm.calc_order_row.nom.price_group.empty() ?
					{price_group: prm.calc_order_row.nom.price_group} :
					{price_group: {in: [prm.calc_order_row.nom.price_group, $p.cat.price_groups.get()]}},
					ares = [];

				$p.ireg.margin_coefficients.find_rows(filter, function (row) {
					ares.push(row);
				});

				// заглушка - фильтр только по ценовой группе
				if(ares.length)
					Object.keys(prm.price_type).forEach(function (key) {
						prm.price_type[key] = ares[0][key];
					});

				// если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
				prm.calc_order_row._owner._owner.partner.extra_fields.find_rows({
					property: $p.job_prm.pricing.dealer_surcharge
				}, function (row) {
					prm.price_type.extra_charge_external = row.value;
					return false;
				});

				return prm.price_type;
			};

			/**
			 * Рассчитывает плановую себестоимость строки документа Расчет
			 * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
			 *
			 * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.calc_first_cost = function (prm) {

				var marginality_in_spec = $p.job_prm.pricing.marginality_in_spec,
					fake_row = {};

				if(!prm.spec)
					return;

				// пытаемся рассчитать по спецификации
				if(prm.spec.count()){
					prm.spec.each(function (row) {

						$p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_first_cost, prm, row);
						row.amount = row.price * row.totqty1;

						if(marginality_in_spec){
							fake_row._mixin(row, ["nom"]);
							tmp_price = $p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_sale, prm, fake_row);
							row.amount_marged = (tmp_price ? tmp_price : row.price) * row.totqty1;
						}

					});
					prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
				}else{
					// TODO: реализовать расчет себестомиости по номенклатуре строки расчета
				}
				
				
				
				
			};

			/**
			 * Рассчитывает стоимость продажи в строке документа Расчет
			 * 
			 * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.calc_amount = function (prm) {

				// TODO: реализовать расчет цены продажи по номенклатуре строки расчета
				var price_cost = $p.job_prm.pricing.marginality_in_spec ? prm.spec.aggregate([], ["amount_marged"]) : 0;

				// цена продажи
				if(price_cost)
					prm.calc_order_row.price = price_cost.round(2);
				else
					prm.calc_order_row.price = (prm.calc_order_row.first_cost * prm.price_type.marginality).round(2);

				// КМарж в строке расчета
				prm.calc_order_row.marginality = prm.calc_order_row.first_cost ?
					prm.calc_order_row.price * ((100 - prm.calc_order_row.discount_percent)/100) / prm.calc_order_row.first_cost : 0;
				

				// TODO: Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
				if(prm.price_type.extra_charge_external){

					prm.calc_order_row.price_internal = prm.calc_order_row.price *
						(100 - prm.calc_order_row.discount_percent)/100 * (100 + prm.price_type.extra_charge_external)/100;

					// TODO: учесть формулу

				}


				// TODO: вытягивание строк спецификации в заказ

				// Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
				if(!prm.hand_start){
					$p.doc.calc_order.handle_event(prm.calc_order_row._owner._owner, "value_change", {
						field: "price",
						value: prm.calc_order_row.price,
						tabular_section: "production",
						row: prm.calc_order_row
					});
				}



			};

			/**
			 * Пересчитывает сумму из валюты в валюту
			 * @param amount {Number} - сумма к пересчету
			 * @param date {Date} - дата курса
			 * @param from - исходная валюта
			 * @param [to] - конечная валюта
			 * @return {Number}
			 */
			this.from_currency_to_currency = function (amount, date, from, to) {

				if(!to || to.empty())
					to = $p.job_prm.pricing.main_currency;
				
				if(!from || from == to)
					return amount;
				
				if(!date)
					date = new Date();

				if(!this.cource_sql)
					this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `date` desc");

				var cfrom = {course: 1, multiplicity: 1}, 
					cto = {course: 1, multiplicity: 1},
					tmp;
				if(from != $p.job_prm.pricing.main_currency){
					tmp = this.cource_sql([from.ref, date]);
					if(tmp.length)
						cfrom = tmp[0];
				}
				if(to != $p.job_prm.pricing.main_currency){
					tmp = this.cource_sql([to.ref, date]);
					if(tmp.length)
						cto = tmp[0];
				}

				return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
			};


			/**
			 * Выгружает в CouchDB изменённые в RAM справочники
			 */
			this.cut_upload = function () {

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
					var mgrs = [
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
						filter: function (doc) {
							return mgrs.indexOf(doc._id.split("|")[0]) != -1;
						}
					})
						.on('change', function (info) {
							//handle change

						})
						.on('paused', function (err) {
							// replication paused (e.g. replication up to date, user went offline)

						})
						.on('active', function () {
							// replicate resumed (e.g. new changes replicating, user went back online)

						})
						.on('denied', function (err) {
							// a document failed to replicate (e.g. due to permissions)
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						})
						.on('complete', function (info) {
							
							if($p.current_acl.role_available("ИзменениеТехнологическойНСИ"))
								upload_tech();

							else
								$p.msg.show_msg({
									type: "alert-info",
									text: $p.msg.sync_complite,
									title: $p.msg.sync_title
								});

						})
						.on('error', function (err) {
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						});
				}

				function upload_tech() {
					var mgrs = [
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
						filter: function (doc) {
							return mgrs.indexOf(doc._id.split("|")[0]) != -1;
						}
					})
						.on('change', function (info) {
							//handle change

						})
						.on('paused', function (err) {
							// replication paused (e.g. replication up to date, user went offline)

						})
						.on('active', function () {
							// replicate resumed (e.g. new changes replicating, user went back online)

						})
						.on('denied', function (err) {
							// a document failed to replicate (e.g. due to permissions)
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						})
						.on('complete', function (info) {
							$p.msg.show_msg({
								type: "alert-info",
								text: $p.msg.sync_complite,
								title: $p.msg.sync_title
							});

						})
						.on('error', function (err) {
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						});
				}

				
				if($p.current_acl.role_available("СогласованиеРасчетовЗаказов"))
					upload_acc();
				else
					upload_tech();				
				
			};
			
			// виртуальный срез последних
			function build_cache() {

				return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
					{
						limit : 1000,
						include_docs: false,
						startkey: [''],
						endkey: ['\uffff']
						// ,reduce: function(keys, values, rereduce) {
						// 	return values.length;
						// }
					})
					.then(function (res) {
						res.rows.forEach(function (row) {

							var onom = $p.cat.nom.get(row.key[0], false, true);

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
					});
			}

			// подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
			var init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", function () {
				$p.eve.detachEvent(init_event_id);
				build_cache();
			});

			// следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
			$p.eve.attachEvent("pouch_change", function (dbid, change) {
				if (dbid != $p.doc.nom_prices_setup.cachable)
					return;

				// формируем новый
			});
		}

	}
);
