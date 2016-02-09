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

			var added_cnn_spec;

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
			 * РассчитатьКоличествоПлощадьМассу
			 * @param row_cpec
			 * @param row_coord
			 */
			function calc_count_area_mass(row_cpec, row_coord, angle_calc_method){

				//TODO: учесть angle_calc_method
				if(angle_calc_method && row_cpec.nom.is_pieces){
					if((angle_calc_method == $p.enm.angle_calculating_ways.Основной) ||
						(angle_calc_method = $p.enm.angle_calculating_ways.СварнойШов)){
						row_cpec.alp1 = row_coord.ALP1;
						row_cpec.alp2 = row_coord.ALP2;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways._90){
						row_cpec.alp1 = 90;
						row_cpec.alp2 = 90;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways.СоединениеПополам){
						//row_cpec.alp1 = СтруктураПараметров.УголСоединения1 / 2;
						//row_cpec.alp2 = СтруктураПараметров.УголСоединения2 / 2;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways.Соединение){
						//row_cpec.alp1 = СтруктураПараметров.УголСоединения1;
						//row_cpec.alp2 = СтруктураПараметров.УголСоединения2;

					}
				}

				if(row_cpec.len){
					if(row_cpec.width && !row_cpec.s)
						row_cpec.s = row_cpec.len * row_cpec.width;
				}else
					row_cpec.s = 0;

				if(!row_cpec.qty && (row_cpec.len || row_cpec.width))
					row_cpec.qty = 1;

				if(row_cpec.s)
					row_cpec.totqty = row_cpec.qty * row_cpec.s;

				else if(row_cpec.len)
					row_cpec.totqty = row_cpec.qty * row_cpec.len;

				else
					row_cpec.totqty = row_cpec.qty;

				row_cpec.totqty1 = row_cpec.totqty * row_cpec.nom.loss_factor;
			}

			/**
			 * СтрокаСоединений
			 * @param cnn_elmnts
			 * @param elm1
			 * @param elm2
			 * @return {*}
			 */
			function cnn_row(cnn_elmnts, elm1, elm2){
				var res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
				if(res.length)
					return res[0].row;
				res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
				if(res.length)
					return res[0].row;
				return 0;
			}

			/**
			 * НадоДобавитьСпецификациюСоединения
			 * @param cnn
			 * @param elm1
			 * @param elm2
			 */
			function need_add_cnn_spec(cnn, elm1, elm2){

				// соединения крест пересечение и крест в стык обрабатываем отдельно
				if(cnn && cnn.cnn_type == $p.enm.cnn_types.КрестВСтык)
					return false;

				else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1)
					return false;

				added_cnn_spec[elm1] = elm2;
				return true;
			}

			/**
			 * ДополнитьСпецификациюСпецификациейСоединения
			 * @param spec
			 * @param params
			 * @param cnn
			 * @param elm1
			 * @param elm2
			 */
			function add_cnn_spec(spec, params, cnn, elm1, elm2){

				var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

				filter_cnn_spec(cnn, elm1, elm2).forEach(function (row_cnn_spec) {
					var row_spec = spec.add({

					});
				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm1
			 * @param elm2
			 */
			function filter_cnn_spec(cnn, elm1, elm2){

				var res = [], nom, ok;

				cnn.specification.each(function (row) {
					nom = row.nom;
					if(!nom || nom.empty() ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1") ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2"))
						return;

					// только для прямых или только для кривых профилей
					if((row.for_direct_profile_only > 0 && !elm1.profile.is_linear()) ||
							(row.for_direct_profile_only < 0 &&elm1.profile.is_linear()))
						return;

					//TODO: реализовать фильтрацию
					//Если Соединение.ТипСоединения = Перечисления.пзТипыСоединений.Наложение Тогда
					//	Если Стр.УголМин > СтрК.УголКГоризонту Тогда
					//		Продолжить;
					//	КонецЕсли;
					//	Если Стр.УголМакс < СтрК.УголКГоризонту Тогда
					//		Продолжить;
					//	КонецЕсли;
					//Иначе
					//	Если Стр.УголМин > ДлиныУглы.УголМеждуПрямыми Тогда
					//		Продолжить;
					//	КонецЕсли;
					//	Если Стр.УголМакс < ДлиныУглы.УголМеждуПрямыми Тогда
					//		Продолжить;
					//	КонецЕсли;
					//КонецЕсли;

					//Если (Стр.УстанавливатьСпецификацию = Перечисления.пзСпособыУстановкиСпецификации.САртикулом1)
					//		И (Не ДлиныУглы.ЭтоАртикул1) Тогда
					//	Продолжить;
					//КонецЕсли;
					//Если (Стр.УстанавливатьСпецификацию = Перечисления.пзСпособыУстановкиСпецификации.САртикулом2)
					//		И (Не ДлиныУглы.ЭтоАртикул2) Тогда
					//	Продолжить;
					//КонецЕсли;

					// Проверяем параметры изделия
					ok = true;
					cnn.selection_params.find_rows({elm: row.elm}, function (prm) {
						ok = false;
						params.find_rows({cnstr: 0, param: prm.param, value: prm.value}, function () {
							ok = true;
							return false;
						});
						return ok;
					});
					if(ok)
						res.push(row);

				});
				return res;
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
					params = ox.params,
					_row, row_constr,
					b, e, prev, next, row_cnn_prev, row_cnn_next, row_spec;

				added_cnn_spec = {};

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
						if(!profile.is_linear())
							row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
						else if((row_cnn_prev && row_cnn_prev.formula) || (row_cnn_next && row_cnn_next.formula)){
							// TODO: дополнительная корректировка длины формулой

						}

						// РассчитатьКоличествоПлощадьМассу
						calc_count_area_mass(row_spec, _row);

						// НадоДобавитьСпецификациюСоединения
						if(need_add_cnn_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){


							if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){
								// соединение Т-образное или незамкнутый контур: для них арт 1-2 не используется

								// для него надо рассчитать еще и с другой стороны
								if(need_add_cnn_spec(e.cnn, next ? next.elm : 0, _row.elm)){
								//	ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
								}
							}

							// для раскладок доппроверка
							//Если СтрК.ТипЭлемента = Перечисления.пзТипыЭлементов.Раскладка И (СоедСлед <> Неопределено)
							//	И (СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.ТОбразное
							//	Или СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.НезамкнутыйКонтур) Тогда
							//	Если НадоДобавитьСпецификациюСоединения(СтруктураПараметров, СоедСлед, СтрК, След) Тогда
							//		ДлиныУглыСлед.Вставить("ДлинаСоединения", СтрК.Длина);
							//		ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
							//	КонецЕсли;
							//КонецЕсли;

							// спецификацию с предыдущей стороны рассчитваем всегда
							row_spec.origin = cnn_row(cnn_elmnts, _row.elm, prev ? prev.elm : 0);
							add_cnn_spec(spec, params, b.cnn, profile, prev);

						}


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

