/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  glob_products_building
 */

$p.modifiers.push(
	function($p){

		$p.products_building = new ProductsBuilding($p);

		function ProductsBuilding($p){

			/**
			 * Перед записью изделия построителя
			 * Аналог УПзП-шного __ПередЗаписьюНаСервере__
			 * @method before_save
			 * @for ProductsBuilding
			 * @param o
			 * @param row
			 * @param prm
			 * @param cancel
			 */
			this.before_save = function (o, row, prm, cancel) {

			}

			$p.eve.attachEvent("save_coordinates", function (dp) {

				var attr = {url: ""};

				$p.rest.build_select(attr, {
					rest_name: "Module_ИнтеграцияЗаказДилера/РассчитатьСпецификациюСтроки/",
					class_name: "cat.characteristics"
				});

				return $p.ajax.post_ex(attr.url,
					JSON.stringify({
						ox: dp.characteristic._obj,
						dp: dp._obj,
						doc: dp.characteristic.calc_order._obj
					}), attr)
					.then(function (req) {
						return JSON.parse(req.response);
					});

			});

		}

	}
);

