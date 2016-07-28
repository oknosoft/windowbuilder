/**
 * ### Модуль менеджера и документа Установка цен номенклатуры
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module doc_nom_prices_setup
 * Created 28.07.2016
 */


// Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

// Подписываемся на события
$p.doc.nom_prices_setup.on({

	/**
	 * Обработчик при создании документа
	 */
	after_create: function (attr) {

		//Номер документа
		return this.new_number_doc();

	},

	/**
	 * Обработчик события "при изменении свойства" в шапке или табличной части при редактировании в форме объекта
	 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
	 */
	add_row: function (attr) {

		// установим валюту и тип цен по умолчению при добавлении строки
		if(attr.tabular_section == "goods"){
			attr.row.price_type = this.price_type;
			attr.row.currency = this.price_type.price_currency;
		}

	}
});