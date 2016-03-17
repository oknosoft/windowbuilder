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
			if(attr.field == "organization" && this.contract.organization != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);

			}else if(attr.field == "partner" && this.contract.owner != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);

			}
		});

		// при установке нового номера
		_mgr._obj_сonstructor.prototype.__define({
			new_number_doc: {

				value: function () {

					var obj = this,
						prefix = ($p.current_acl.prefix || "") + obj.organization.prefix,
						code_length = obj._metadata.code_length - prefix.length,
						part;

					return $p.wsql.pouch.local[obj._manager.cachable].query("doc_calc_order/number_doc",
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
			}
		});

	}

);