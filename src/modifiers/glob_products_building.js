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

			var added_cnn_spec,
				ox,
				spec,
				constructions,
				coordinates,
				cnn_elmnts,
				params;

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
						row_cpec.alp1 = row_coord.alp1;
						row_cpec.alp2 = row_coord.alp2;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways._90){
						row_cpec.alp1 = 90;
						row_cpec.alp2 = 90;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways.СоединениеПополам){
						row_cpec.alp1 = row_coord.alp1 / 2;
						row_cpec.alp2 = row_coord.alp2 / 2;

					}else if(angle_calc_method == $p.enm.angle_calculating_ways.Соединение){
						row_cpec.alp1 = row_coord.alp1;
						row_cpec.alp2 = row_coord.alp2;

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
			 * @param elm1
			 * @param elm2
			 * @return {*}
			 */
			function cnn_row(elm1, elm2){
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
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function add_cnn_spec(cnn, elm, len_angl){

				var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

				filter_cnn_spec(cnn, elm, len_angl).forEach(function (row_cnn_spec) {
					var nom = row_cnn_spec.nom;
					// TODO: nom млжет быть вставкой - в этом случае надо разузловать
					var row_spec = spec.add({
						nom: nom,
						clr: $p.cat.clrs.by_predefined(row_cnn_spec.clr, elm.clr, ox.clr),
						origin: len_angl.origin,
						elm: elm.elm
					});

					// В простейшем случае, формула = "ДобавитьКомандуСоединения(Парам);"
					if(!row_cnn_spec.formula) {
						if(nom.is_pieces){
							if(!row_cnn_spec.coefficient)
								row_spec.qty = row_cnn_spec.quantity;
							else
								row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
									.round(nom.rounding_quantity);
						}else{
							// TODO: Строго говоря, нужно брать не размер соединения, а размеры предыдущего и последующего
							row_spec.qty = row_cnn_spec.quantity;
							if(row_cnn_spec.sz || row_cnn_spec.coefficient)
								row_spec.len = (len_angl.len - (sign < 0 ? cnn.sz * 2 : 0) - sign * 2 * row_cnn_spec.sz) *
									(row_cnn_spec.coefficient == 0 ? 1 : row_cnn_spec.coefficient);
						}

					}else {
						try{
							if(eval(row_cnn_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}
					};

					if(!row_spec.qty)
						spec.del(row_spec.row-1);
					else
						calc_count_area_mass(row_spec, len_angl);
				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function filter_cnn_spec(cnn, elm, len_angl){

				var res = [], nom, ok, angle_hor = elm.angle_hor;

				cnn.specification.each(function (row) {
					nom = row.nom;
					if(!nom || nom.empty() ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1") ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2"))
						return;

					// только для прямых или только для кривых профилей
					if((row.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
							(row.for_direct_profile_only < 0 &&elm.profile.is_linear()))
						return;

					//TODO: реализовать фильтрацию
					if(cnn.cnn_type == $p.enm.cnn_types.Наложение){
						if(row.amin > angle_hor || row.amax < angle_hor)
							return;
					}else{
						if(row.amin > len_angl.angle || row.amax < len_angl.angle)
							return;
					};

					// "Устанавливать с" проверяем только для соединений профиля
					if(($p.enm.cnn_types.acn.a.indexOf(cnn.cnn_type) != -1) && (
							(row.set_specification == $p.enm.specification_installation_methods.САртикулом1 && !len_angl.art1) ||
							(row.set_specification = $p.enm.specification_installation_methods.САртикулом2 && !len_angl.art2)
						))
						return;

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

				var b, e, curr, prev, next, len_angle,
					_row, row_constr, row_cnn, row_cnn_prev, row_cnn_next, row_spec;

				added_cnn_spec = {};

				// для всех контуров изделия
				scheme.contours.forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(function (curr) {
						_row = curr._row;
						b = curr.rays.b;
						e = curr.rays.e;
						prev = b.profile;
						next = e.profile;
						row_cnn_prev = b.cnn.main_row(curr);
						row_cnn_next = e.cnn.main_row(curr);

						// добавляем строку спецификации
						row_spec = spec.add({
							nom: _row.nom,
							elm: _row.elm,
							clr: _row.clr
						});

						// уточняем цвет
						if(row_cnn_prev && row_cnn_next && row_cnn_prev.clr == row_cnn_next.clr)
							row_spec.clr = $p.cat.clrs.by_predefined(row_cnn_next.clr, curr.clr, ox.clr);

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
						if(!curr.is_linear())
							row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
						else if((row_cnn_prev && row_cnn_prev.formula) || (row_cnn_next && row_cnn_next.formula)){
							// TODO: дополнительная корректировка длины формулой

						}

						// РассчитатьКоличествоПлощадьМассу
						calc_count_area_mass(row_spec, _row);

						// НадоДобавитьСпецификациюСоединения
						if(need_add_cnn_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

							len_angle = {
								angle: 0,
								alp1: prev.generatrix.angle_to(curr.generatrix, curr.b, true),
								alp2: curr.generatrix.angle_to(next.generatrix, curr.e, true),
								// art1: true TODO: учесть art-1-2
							};

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
							row_spec.origin = cnn_row(_row.elm, prev ? prev.elm : 0);
							add_cnn_spec(b.cnn, curr, len_angle);

						}


					});


					// для всех заполнений контура
					contour.glasses(false, true).forEach(function (glass) {

						var profiles = glass.profiles,
							glength = profiles.length;

						_row = glass._row;

						// для всех рёбер заполнения
						for(var i=0; i<glength; i++ ){
							curr = profiles[i];
							prev = (i==0 ? profiles[glength-1] : profiles[i-1]).profile;
							next = (i==glength-1 ? profiles[0] : profiles[i+1]).profile;
							row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

							len_angle = {
								angle: 0,
								alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
								alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
								len: row_cnn.length ? row_cnn[0].aperture_len : 0,
								origin: cnn_row(_row.elm, curr.profile.elm)

							};

							add_cnn_spec(curr.cnn, curr.profile, len_angle);
						}

					});


				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme) {

				var attr = {url: ""};

				ox = scheme.ox;
				spec = ox.specification;
				constructions = ox.constructions;
				coordinates = ox.coordinates;
				cnn_elmnts = ox.cnn_elmnts;
				params = ox.params;

				// чистим спецификацию
				spec.clear();

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

