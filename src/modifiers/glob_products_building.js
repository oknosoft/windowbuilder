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
				glass_specification,
				glass_formulas,
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
			function calc_count_area_mass(row_cpec, row_coord, angle_calc_method_prev, angle_calc_method_next){

				//TODO: учесть angle_calc_method
				if(!angle_calc_method_next)
					angle_calc_method_next = angle_calc_method_prev;

				if(angle_calc_method_prev && !row_cpec.nom.is_pieces){

					if((angle_calc_method_prev == $p.enm.angle_calculating_ways.Основной) ||
						(angle_calc_method_prev == $p.enm.angle_calculating_ways.СварнойШов)){
						row_cpec.alp1 = row_coord.alp1;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways._90){
						row_cpec.alp1 = 90;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.СоединениеПополам){
						row_cpec.alp1 = row_coord.alp1 / 2;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.Соединение){
						row_cpec.alp1 = row_coord.alp1;
					}

					if((angle_calc_method_next == $p.enm.angle_calculating_ways.Основной) ||
						(angle_calc_method_next == $p.enm.angle_calculating_ways.СварнойШов)){
						row_cpec.alp2 = row_coord.alp2;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways._90){
						row_cpec.alp2 = 90;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.СоединениеПополам){
						row_cpec.alp2 = row_coord.alp2 / 2;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.Соединение){
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
			 * РассчитатьQtyLen
			 * @param row_spec
			 * @param row_base
			 * @param len
			 */
			function calc_qty_len(row_spec, row_base, len){

				var nom = row_spec.nom;

				if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
						nom.cutting_optimization_type.empty() || nom.is_pieces){

					if(!row_base.coefficient || !len)
						row_spec.qty = row_base.quantity;

					else{
						if(!nom.is_pieces){
							row_spec.qty = row_base.quantity;
							row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
							if(nom.rounding_quantity){
								row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
								row_spec.len = 0;
							};

						}else if(!nom.rounding_quantity){
							row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);

						}else{
							row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
						}
					}

				}else{
					row_spec.qty = row_base.quantity;
					row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
				}
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
			 * Добавляет или заполняет строку спецификации
			 * @param row_spec
			 * @param elm
			 * @param row_base
			 * @param [nom]
			 * @param [origin]
			 * @return {TabularSectionRow.<cat.characteristics.specification>}
			 */
			function new_spec_row(row_spec, elm, row_base, nom, origin){
				if(!row_spec)
					row_spec = spec.add();
				row_spec.nom = nom || row_base.nom;
				row_spec.clr = $p.cat.clrs.by_predefined(row_base.clr, elm.clr, ox.clr);
				row_spec.elm = elm.elm;
				if(origin)
					row_spec.origin = origin;
				return row_spec;
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
					// TODO: nom может быть вставкой - в этом случае надо разузловать
					var row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin);

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
								row_spec.len = (len_angl.len - (len_angl.glass ? cnn.sz * 2 : 0) - sign * 2 * row_cnn_spec.sz) *
									(row_cnn_spec.coefficient || 0.001);
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
						calc_count_area_mass(row_spec, len_angl, row_cnn_spec.angle_calc_method);
				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function filter_cnn_spec(cnn, elm, len_angl){

				var res = [], nom, angle_hor = elm.angle_hor;

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
							(row.set_specification == $p.enm.specification_installation_methods.САртикулом2 && !len_angl.art2)
						))
						return;

					// Проверяем параметры изделия и добавляем, если проходит по ограничениям
					if(check_params(cnn.selection_params, row.elm))
						res.push(row);

				});
				return res;
			}

			/**
			 * Проверяет соответствие параметров отбора параметрам изделия
			 * @param selection_params
			 * @param elm
			 * @param [cnstr]
			 * @return {boolean}
			 */
			function check_params(selection_params, elm, cnstr){
				var ok = true;
				selection_params.find_rows({elm: elm}, function (prm) {
					ok = false;
					params.find_rows({cnstr: cnstr || 0, param: prm.param, value: prm.value}, function () {
						ok = true;
						return false;
					});
					return ok;
				});
				return ok;
			}

			/**
			 * ПроверитьОграниченияВставки
			 * TODO: перенести в прототип объекта вставки
			 * @param inset
			 * @param elm
			 * @param by_perimetr
			 * @return {boolean}
			 */
			function check_inset(inset, elm, by_perimetr){

				var is_tabular = true,
					_row = elm._row;

				// проверяем площадь
				if(inset.smin > _row.s || (_row.s && inset.smax && inset.smax < _row.s))
					return false;

				// Главный элемент с нулевым количеством не включаем
				if(inset.is_main_elm && !inset.quantity)
					return false;

				if($p.is_data_obj(inset)){

					// только для прямых или только для кривых профилей
					if((inset.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
						(inset.for_direct_profile_only < 0 &&elm.profile.is_linear()))
						return false;

					if(inset.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
						if(!elm.joined_imposts(true))
							return false;

					}else if(inset.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
						if(elm.joined_imposts(true))
							return false;
					}
					is_tabular = false;
				}


				if(!is_tabular || by_perimetr || inset.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
					if(inset.lmin > _row.len || (inset.lmax < _row.len && inset.lmax > 0))
						return false;
					if(inset.ahmin > _row.angle_hor || inset.ahmax < _row.angle_hor)
						return false;
				}

				//// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

				return true;
			}

			/**
			 * ПолучитьСпецификациюВставкиСФильтром
			 * @param inset
			 * @param elm
			 * @param [is_high_level_call]
			 */
			function filter_inset_spec(inset, elm, is_high_level_call){

				var res = [], glass_rows;
				if(!inset || inset.empty())
					return res;

				if(is_high_level_call && inset.insert_type == $p.enm.inserts_types.Стеклопакет){
					glass_rows = glass_specification.find_rows({elm: elm.elm});
					if(!glass_rows.length){
						// заполняем спецификацию заполнений по умолчанию, чтобы склеить формулу
						inset.specification.each(function (row) {
							glass_rows.push(
								glass_specification.add({
									elm: elm.elm,
									gno: 0,
									inset: row.nom,
									clr: row.clr
								})
							);
						});
					}

					if(glass_rows.length){
						glass_formulas[elm.elm] = "";
						glass_rows.forEach(function (row) {
							filter_inset_spec(row.inset, elm).forEach(function (row) {
								res.push(row);
							});
							if(!glass_formulas[elm.elm])
								glass_formulas[elm.elm] = row.inset.name;
							else
								glass_formulas[elm.elm] += "x" + row.inset.name;
						});
						return res;
					}
				}

				inset.specification.each(function (row) {

					// Проверяем ограничения строки вставки
					if(!check_inset(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль))
						return;

					// Проверяем параметры изделия
					if(!check_params(inset.selection_params, row.elm))
						return;

					// Добавляем или разузловываем дальше
					if(row.nom._manager.class_name == "cat.nom")
						res.push(row);
					else
						filter_inset_spec(row.nom, elm).forEach(function (row) {
							res.push(row);
						});
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
			function spec_nearest_cnn(elm) {
				var nearest = elm.nearest();
				if(nearest && elm.data._nearest_cnn)
					add_cnn_spec(elm.data._nearest_cnn, elm, {
						angle:  0,
						alp1:   0,
						alp2:   0,
						len:    elm.data._len,
						origin: cnn_row(elm.elm, nearest.elm)
					});
			}

			/**
			 * Спецификация вставки элемента
			 */
			function spec_insets(elm) {

				var _row = elm._row;

				filter_inset_spec(elm.inset, elm, true).forEach(function (row_ins_spec) {

					var row_spec;

					// добавляем строку спецификации, если профиль или не про шагам
					if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
						&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
						$p.enm.elm_types.profiles.indexOf(_row.elm_type) != -1)
						row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);

					if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && row_ins_spec.formula){
						try{
							row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, elm.inset);
							if(eval(row_ins_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}

					}else if($p.enm.elm_types.profiles.indexOf(_row.elm_type) != -1 ||
								row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
						// Для вставок в профиль способ расчета количество не учитывается
						calc_qty_len(row_spec, row_ins_spec, _row.len);

					}else{

						if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
							row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
							row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
							row_spec.s = _row.s;

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
							var row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
							elm.perimeter.forEach(function (rib) {
								row_prm._row._mixin(rib);
								if(check_inset(row_ins_spec, row_prm, true)){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);
									calc_qty_len(row_spec, row_ins_spec, rib.len);
									calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
								}
								row_spec = null;
							});

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам){

							var h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
							if((row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
								row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление) && row_ins_spec.step){

								for(var i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);
									calc_qty_len(row_spec, row_ins_spec, w);
									calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
								}
								row_spec = null;
							}

						}else{
							throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
						}

					}

					if(row_spec)
						calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);

				});
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
						if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure)
							return;

						b = curr.rays.b;
						e = curr.rays.e;
						prev = b.profile;
						next = e.profile;
						row_cnn_prev = b.cnn.main_row(curr);
						row_cnn_next = e.cnn.main_row(curr);

						// добавляем строку спецификации
						row_spec = new_spec_row(null, curr, row_cnn_prev, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0))

						// уточняем размер
						row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
							* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

						// profile.Длина - то, что получится после обработки
						// row_spec.Длина - сколько взять (отрезать)
						curr.data._len = _row.len;
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
						calc_count_area_mass(row_spec, _row, row_cnn_prev.angle_calc_method, row_cnn_next.angle_calc_method);

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
								//	TODO: ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
								}
							}

							// для раскладок доппроверка
							//Если СтрК.ТипЭлемента = Перечисления.пзТипыЭлементов.Раскладка И (СоедСлед != Неопределено)
							//	И (СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.ТОбразное
							//	Или СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.НезамкнутыйКонтур) Тогда
							//	Если НадоДобавитьСпецификациюСоединения(СтруктураПараметров, СоедСлед, СтрК, След) Тогда
							//		ДлиныУглыСлед.Вставить("ДлинаСоединения", СтрК.Длина);
							//		ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
							//	КонецЕсли;
							//КонецЕсли;

							// спецификацию с предыдущей стороны рассчитваем всегда
							add_cnn_spec(b.cnn, curr, len_angle);

						}


						// Спецификация вставки
						spec_insets(curr);

						// Если у профиля есть примыкающий элемент, добавим спецификацию соединения
						if(contour.parent)
							spec_nearest_cnn(curr);

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
								origin: cnn_row(_row.elm, curr.profile.elm),
								glass: true

							};

							// добавляем спецификацию соединения рёбер заполнения с профилем
							add_cnn_spec(curr.cnn, curr.profile, len_angle);

						}

						// добавляем спецификацию вставки в заполнение
						spec_insets(glass);

						// TODO: для всех раскладок заполнения

					});




				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme, attr) {

				ox = scheme.ox;
				spec = ox.specification;
				constructions = ox.constructions;
				coordinates = ox.coordinates;
				cnn_elmnts = ox.cnn_elmnts;
				glass_specification = ox.glass_specification;
				glass_formulas = {};
				params = ox.params;

				// чистим спецификацию
				spec.clear();

				// рассчитываем базовую сецификацию
				spec_base(scheme);

				// сворачиваем
				spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin", "qty,totqty,totqty1");

				// информируем мир об окончании расчета координат
				$p.eve.callEvent("coordinates_calculated", [scheme, attr]);

				// рассчитываем цены


				// информируем мир о записи продукции
				if(attr.save){
					ox.save()
						.then(function () {
							$p.msg.show_msg("Спецификация рассчитана");
							$p.eve.callEvent("characteristic_saved", [scheme, attr]);
						});
				}

			});

		}

	}
);

