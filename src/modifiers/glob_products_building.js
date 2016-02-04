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

		$p.products_building = new ProductsBuilding();

		function ProductsBuilding(){

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
			function before_save(o, row, prm, cancel) {

			}

			/**
			 * Спецификации фурнитуры
			 */
			function spec_furn(scheme, spec) {

			}

			/**
			 * Спецификации соединений
			 */
			function spec_cnns(scheme, spec) {

			}

			/**
			 * Спецификации вставок
			 */
			function spec_insets(scheme, spec) {

			}

			/**
			 * Базовая cпецификация по соединениям и вставкам таблицы координат
			 */
			function spec_base(scheme, spec) {

				// для всех контуров изделия
				scheme.contours.forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(function (profile) {

					});

					// для всех заполнений контура
					contour.glasses(false, true).forEach(function (profile) {

					});
				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme) {

				var attr = {url: ""},
					spec = scheme.ox.specification;

				// чистим спецификацию
				spec.clear();

				// рассчитываем базовую сецификацию
				spec_base(scheme, spec);

				$p.rest.build_select(attr, {
					rest_name: "Module_ИнтеграцияЗаказДилера/РассчитатьСпецификациюСтроки/",
					class_name: "cat.characteristics"
				});

				return $p.ajax.post_ex(attr.url,
					JSON.stringify({
						dp: scheme._dp._obj,
						ox: scheme.ox._obj,
						doc: scheme.ox.calc_order._obj
					}), attr)
					.then(function (req) {
						return JSON.parse(req.response);
					});

			});

		}

	}
);

