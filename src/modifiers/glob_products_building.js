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
			function spec_furn(scheme) {

			}

			/**
			 * Спецификации соединений
			 */
			function spec_cnns(scheme) {

			}

			/**
			 * Спецификации вставок
			 */
			function spec_insets(scheme) {

			}

			/**
			 * Базовая cпецификация по соединениям и вставкам таблицы координат
			 */
			function spec_base(scheme) {

				var ox = scheme.ox,
					spec = ox.specification,
					constructions = ox.constructions,
					coordinates = ox.coordinates,
					cnn_elmnts = ox.cnn_elmnts,
					_row, row_constr,
					b, e, prev, next, row_cnn_prev, row_cnn_next, row_spec;

				// для всех контуров изделия
				scheme.contours.forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(function (profile) {
						_row = profile._row;
						b = profile.rays.b;
						e = profile.rays.e;
						prev = b.profile;
						next = e.profile;
						row_cnn_prev = b.cnn.main_row(profile);
						row_cnn_next = e.cnn.main_row(profile);

						// добавляем строку спецификации
						row_spec = spec.add({
							nom: _row.nom,
							elm: _row.elm,
							clr: _row.clr
						});

						// уточняем цвет
						if(row_cnn_prev && row_cnn_next && row_cnn_prev.clr == row_cnn_next.clr)
							row_spec.clr = $p.cat.clrs.by_predefined(row_cnn_next.clr, profile.clr, ox.clr);

						// уточняем размер
						row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
							* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

						// profile.Длина - то, что получится после обработки
						// row_spec.Длина - сколько взять (отрезать)
						_row.len = (_row.len
							- (!row_cnn_prev || row_cnn_prev.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_prev.sz)
							- (!row_cnn_next || row_cnn_next.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_next.sz))
							* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

						// припуск для гнутых элементов
						if(!profile.generatrix.is_linear())
							row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
						else if((row_cnn_prev && row_cnn_prev.formula) || (row_cnn_next && row_cnn_next.formula)){
							// TODO: дополнительная корректировка длины формулой

						}

						// РассчитатьКоличествоПлощадьМассу

						// НадоДобавитьСпецификациюСоединения


					});

					// для всех заполнений контура
					contour.glasses(false, true).forEach(function (glass) {

					});
				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme) {

				var attr = {url: ""},
					ox = scheme.ox;

				// чистим спецификацию
				ox.specification.clear();

				// рассчитываем базовую сецификацию
				spec_base(scheme);

				$p.rest.build_select(attr, {
					rest_name: "Module_ИнтеграцияЗаказДилера/РассчитатьСпецификациюСтроки/",
					class_name: "cat.characteristics"
				});

				return $p.ajax.post_ex(attr.url,
					JSON.stringify({
						dp: scheme._dp._obj,
						ox: ox._obj,
						doc: ox.calc_order._obj
					}), attr)
					.then(function (req) {
						return JSON.parse(req.response);
					});

			});

		}

	}
);

