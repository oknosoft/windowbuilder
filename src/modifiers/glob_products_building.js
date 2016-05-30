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

				["len","width","s","qty","totqty","totqty1","alp1","alp2"].forEach(function (fld) {
					row_cpec[fld] = row_cpec[fld].round(4);
				});
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
			 * @return {Number|DataObj}
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
			function cnn_need_add_spec(cnn, elm1, elm2){

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
			 * @return {TabularSectionRow.cat.characteristics.specification}
			 */
			function new_spec_row(row_spec, elm, row_base, nom, origin){
				if(!row_spec)
					row_spec = spec.add();
				row_spec.nom = nom || row_base.nom;
				row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr);
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
			function cnn_add_spec(cnn, elm, len_angl){

				var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

				cnn_filter_spec(cnn, elm, len_angl).forEach(function (row_cnn_spec) {
					var nom = row_cnn_spec.nom;

					// TODO: nom может быть вставкой - в этом случае надо разузловать
					if(nom._manager == $p.cat.inserts){
						if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)){
							var tmp_len_angl = len_angl._clone();
							tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
							inset_spec(elm, nom, tmp_len_angl);
						}else
							inset_spec(elm, nom, len_angl);

					}else {

						var row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin);

						// В простейшем случае, формула = "ДобавитьКомандуСоединения(Парам);"
						if(row_cnn_spec.formula.empty()) {
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
									row_spec.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
							}

						}else {
							// TODO: заменить eval и try-catch на динамическую функцию
							try{
								if(eval(row_cnn_spec.formula) === false)
									return;
							}catch(err){
								$p.record_log(err);
							}
						}

						if(!row_spec.qty)
							spec.del(row_spec.row-1);
						else
							calc_count_area_mass(row_spec, len_angl, row_cnn_spec.angle_calc_method);
						
					}


				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function cnn_filter_spec(cnn, elm, len_angl){

				var res = [], nom, angle_hor = elm.angle_hor;

				cnn.specification.each(function (row) {
					nom = row.nom;
					if(!nom || nom.empty() ||
							nom == $p.job_prm.nom.art1 ||
							nom == $p.job_prm.nom.art2)
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
					}

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
			function inset_check(inset, elm, by_perimetr, len_angl){

				var is_tabular = true,
					_row = elm._row,
					len = len_angl ? len_angl.len : _row.len;

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
					if(inset.lmin > len || (inset.lmax < len && inset.lmax > 0))
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
			function inset_filter_spec(inset, elm, is_high_level_call, len_angl){

				var res = [], glass_rows;
				if(!inset || inset.empty())
					return res;

				if(is_high_level_call && inset.insert_type == $p.enm.inserts_types.Стеклопакет){
					glass_rows = glass_specification.find_rows({elm: elm.elm}).map(function (row) {
						return row._row;
					});
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
							inset_filter_spec(row.inset, elm, false, len_angl).forEach(function (row) {
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
					if(!inset_check(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль, len_angl))
						return;

					// Проверяем параметры изделия
					if(!check_params(inset.selection_params, row.elm))
						return;

					// Добавляем или разузловываем дальше
					if(row.nom._manager == $p.cat.inserts)
						inset_filter_spec(row.nom, elm, false, len_angl).forEach(function (row) {
							res.push(row);
						});
					else
						res.push(row);
						
				});

				return res;
			}

			/**
			 * Спецификации фурнитуры
			 * @param contour {Contour}
			 */
			function furn_spec(contour) {

				// у рамных контуров фурнитуры не бывает
				if(!contour.parent)
					return false;
				
				// кеш сторон фурнитуры
				var cache = {
					profiles: contour.outer_nodes,
					bottom: contour.profiles_by_side("bottom"),
					params: contour.project.ox.params
				};

				// проверяем, подходит ли фурнитура под геометрию контура
				if(!furn_check_opening_restrictions(contour, cache))
					return;

				// уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
				furn_update_handle_height(contour, cache, contour.furn.furn_set);

				// получаем спецификацию фурнитуры и переносим её в спецификацию изделия
				furn_get_spec(contour, cache, contour.furn.furn_set).each(function (row) {
					var elm = {elm: -contour.cnstr, clr: contour.clr_furn},
						row_spec = new_spec_row(null, elm, row, row.nom_set, row.origin);

					if(row.is_procedure_row){
						row_spec.elm = row.handle_height_min;
						row_spec.len = row.coefficient / 1000;
						row_spec.qty = 0;
						row_spec.totqty = 1;
						row_spec.totqty1 = 1;
						if(!row_spec.nom.visualization.empty())
							row_spec.dop = -1;

					}else{
						row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
						calc_count_area_mass(row_spec);
					}
				});
			}

			/**
			 * Проверяет ограничения открывания, добавляет визуализацию ошибок
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @return {boolean}
			 */
			function furn_check_opening_restrictions(contour, cache) {

				var ok = true;

				// TODO: реализовать проверку по количеству сторон

				// проверка геометрии
				contour.furn.open_tunes.each(function (row) {
					var elm = contour.profile_by_furn_side(row.side, cache),
						len = elm._row.len - 2 * elm.nom.sizefurn;

					// angle_hor = elm.angle_hor; TODO: реализовать проверку углов

					if(len < row.lmin ||
						len > row.lmax ||
						(!elm.is_linear() && !row.arc_available)){

						new_spec_row(null, elm, {clr: $p.cat.clrs.get()}, $p.job_prm.nom.furn_error, contour.furn).dop = -1;
						ok = false;
					}

				});

				return ok;
			}

			/**
			 * Уточняет высоту ручки
			 * @param contour {Contour}
			 * @param cache {Object}
			 */
			function furn_update_handle_height(contour, cache, furn_set){

				if(!contour.furn.handle_side && furn_set.empty())
					return;

				// получаем элемент, на котором ручка и длину элемента
				var elm = contour.profile_by_furn_side(contour.furn.handle_side, cache),
					len = elm._row.len;

				// бежим по спецификации набора в поисках строки про ручку
				furn_set.specification.find_rows({dop: 0}, function (row) {

					// проверяем, проходит ли строка
					if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
						return;

					if(furn_set_handle_height(contour, row, len))
						return false;

					if(row.is_set_row){
						var ok = false;
						furn_get_spec(contour, cache, row.nom_set, true).each(function (sub_row) {
							if(furn_set_handle_height(contour, sub_row, len))
								return !(ok = true);
						});
						if(ok)
							return false;
					}

				})


			}

			/**
			 * Устанавливает высоту ручки в контуре, если этого требует текущая строка спецификации фкрнитуры
			 * @param contour {Contour}
			 * @param row {TabularSectionRow.cat.furns.specification}
			 * @param len {Number}
			 */
			function furn_set_handle_height(contour, row, len){

				if(row.handle_height_base == -1){
					contour._row.h_ruch = (len / 2).round(0);
					contour._row.fix_ruch = false;
					return true;

				}else if(row.handle_height_base > 0){
					contour._row.h_ruch = row.handle_height_base;
					contour._row.fix_ruch = true;
					return true;

				}
			}

			/**
			 * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @param furn_set {_cat.furns}
			 * @param [exclude_dop] {Boolean}
			 */
			function furn_get_spec(contour, cache, furn_set, exclude_dop) {

				var res = $p.dp.buyers_order.create().specification;

				// бежим по всем строкам набора
				furn_set.specification.find_rows({dop: 0}, function (row) {

					// проверяем, проходит ли строка
					if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
						return;

					// ищем строки дополнительной спецификации
					if(!exclude_dop){
						furn_set.specification.find_rows({is_main_specification_row: false, elm: row.elm}, function (dop_row) {

							if(!furn_check_row_restrictions(contour, cache, furn_set, dop_row))
								return;

							// расчет координаты и (или) визуализации
							if(dop_row.is_procedure_row){

								var invert = contour.direction == $p.enm.open_directions.Правое,
									invert_nearest = false,
									coordin = 0,
									elm = contour.profile_by_furn_side(dop_row.side, cache),
									len = elm._row.len,
									sizefurn = elm.nom.sizefurn,
									dx0 = (len - elm.data._len) / 2,
									dx1 = $p.job_prm.builder.add_d ? sizefurn : 0,
									faltz = len - 2 * sizefurn;

								if(dop_row.offset_option == $p.enm.offset_options.Формула){


								}else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
									coordin = faltz + dop_row.contraction;

								}else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
									// строим горизонтальную линию от нижней границы контура, находим пересечение и offset
									var bounds = contour.bounds,
										by_side = contour.profiles_by_side(),
										hor;
									if(elm == by_side.top || elm == by_side.bottom){
										hor = new paper.Path({
											insert: false,
											segments: [[bounds.left + contour.h_ruch, bounds.top - 200], [bounds.left + contour.h_ruch, bounds.bottom + 200]]
										});
									}else
										hor = new paper.Path({
											insert: false,
											segments: [[bounds.left - 200, bounds.bottom - contour.h_ruch], [bounds.right + 200, bounds.bottom - contour.h_ruch]]
										});


									coordin = elm.generatrix.getOffsetOf(elm.generatrix.intersect_point(hor));

								}else{

									if(invert){

										if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
											coordin = dop_row.contraction;

										}else{
											coordin = len - dop_row.contraction;
										}

									}else{

										if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
											coordin = len - dop_row.contraction;

										}else{
											coordin = dop_row.contraction;
										}
									}
								}

								var procedure_row = res.add(dop_row);
								procedure_row.origin = furn_set;
								procedure_row.handle_height_min = elm.elm;
								procedure_row.handle_height_max = contour.cnstr;
								procedure_row.coefficient = coordin;

								return;

							}else if(!dop_row.quantity)
								return;

							// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
							if(dop_row.is_set_row){
								furn_get_spec(contour, cache, dop_row.nom_set).each(function (sub_row) {

									if(sub_row.is_procedure_row)
										res.add(sub_row);

									else if(!sub_row.quantity)
										return;

									res.add(sub_row).quantity = row.quantity * sub_row.quantity;

								});
							}else{
								res.add(dop_row).origin = furn_set;
							}

						});
					}

					// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
					if(row.is_set_row){
						furn_get_spec(contour, cache, row.nom_set).each(function (sub_row) {

							if(sub_row.is_procedure_row)
								res.add(sub_row);

							else if(!sub_row.quantity)
								return;

							res.add(sub_row).quantity = row.quantity * sub_row.quantity;

						});
					}else{
						res.add(row).origin = furn_set;
					}

				});

				return res;
			}

			/**
			 * Аналог УПзП-шного _ПроверитьОграниченияСтрокиФурнитуры_
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @param furn_set {_cat.furns}
			 * @param row {_cat.furns.specification.row}
			 */
			function furn_check_row_restrictions(contour, cache, furn_set, row) {

				var res = true;

				// по таблице параметров
				furn_set.selection_params.find_rows({elm: row.elm, dop: row.dop}, function (row) {

					var ok = false;

					if($p.job_prm.properties.direction == row.param){
						ok = contour.direction == row.value;

					}else{
						cache.params.find_rows({cnstr: contour.cnstr, param: row.param, value: row.value}, function () {
							return !(ok = true);
						});
					}

					if(!ok)
						return res = false;

				});

				// по таблице ограничений
				if(res){
					furn_set.specification_restrictions.find_rows({elm: row.elm, dop: row.dop}, function (row) {

						var elm = contour.profile_by_furn_side(row.side, cache),
							len = elm._row.len - 2 * elm.nom.sizefurn;

						if(len < row.lmin || len > row.lmax ){
							return res = false;

						}
					});
				}

				return res;
			}


			/**
			 * Спецификации соединений примыкающих профилей
			 * @param elm {Profile}
			 */
			function cnn_spec_nearest(elm) {
				var nearest = elm.nearest();
				if(nearest && elm.data._nearest_cnn)
					cnn_add_spec(elm.data._nearest_cnn, elm, {
						angle:  0,
						alp1:   0,
						alp2:   0,
						len:    elm.data._len,
						origin: cnn_row(elm.elm, nearest.elm)
					});
			}

			/**
			 * Спецификация профиля
			 * @param elm {Profile}
			 */
			function base_spec_profile(elm) {

				var b, e, prev, next, len_angle,
					_row, row_cnn_prev, row_cnn_next, row_spec;

				_row = elm._row;
				if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure)
					return;

				b = elm.rays.b;
				e = elm.rays.e;

				if(!b.cnn || !e.cnn){
					$p.record_log({
						note: "не найдено соединение",
						obj: _row._obj
					});
					return;
				}

				prev = b.profile;
				next = e.profile;
				row_cnn_prev = b.cnn.main_row(elm);
				row_cnn_next = e.cnn.main_row(elm);

				// добавляем строку спецификации
				if(row_cnn_prev || row_cnn_next){
					row_spec = new_spec_row(null, elm, row_cnn_prev || row_cnn_next, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0));

					// уточняем размер
					row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
						* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

					// profile.Длина - то, что получится после обработки
					// row_spec.Длина - сколько взять (отрезать)
					elm.data._len = _row.len;
					_row.len = (_row.len
						- (!row_cnn_prev || row_cnn_prev.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_prev.sz)
						- (!row_cnn_next || row_cnn_next.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_next.sz))
						* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

					// припуск для гнутых элементов
					if(!elm.is_linear())
						row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;

					else if((row_cnn_prev && !row_cnn_prev.formula.empty()) || (row_cnn_next && !row_cnn_next.formula.empty())){
						// TODO: дополнительная корректировка длины формулой

					}

					// РассчитатьКоличествоПлощадьМассу
					calc_count_area_mass(row_spec, _row, row_cnn_prev ? row_cnn_prev.angle_calc_method : null, row_cnn_next ? row_cnn_next.angle_calc_method : null);
				}

				// НадоДобавитьСпецификациюСоединения
				if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

					len_angle = {
						angle: 0,
						alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
						alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90
						// art1: true TODO: учесть art-1-2
					};

					if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){
						// соединение Т-образное или незамкнутый контур: для них арт 1-2 не используется

						// для него надо рассчитать еще и с другой стороны
						if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm)){
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
					cnn_add_spec(b.cnn, elm, len_angle);

				}


				// спецификация вставки
				inset_spec(elm);

				// если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
				cnn_spec_nearest(elm);

				// если у профиля есть доборы, добавляем их спецификации
				elm.addls.forEach(base_spec_profile);

			}

			/**
			 * Спецификация заполнения
			 * @param glass {Filling}
			 */
			function base_spec_glass(glass) {

				var curr, prev, next, len_angle, _row, row_cnn;

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

					// добавляем спецификацию соединения рёбер заполнения с профилем
					cnn_add_spec(curr.cnn, curr.profile, len_angle);

				}

				// добавляем спецификацию вставки в заполнение
				inset_spec(glass);

				// TODO: для всех раскладок заполнения
			}

			/**
			 * Спецификация вставки элемента
			 * @param elm {BuilderElement}
			 */
			function inset_spec(elm, inset, len_angl) {

				var _row = elm._row;
				
				if(!inset)
					inset = elm.inset;

				inset_filter_spec(inset, elm, true, len_angl).forEach(function (row_ins_spec) {

					var row_spec;

					// добавляем строку спецификации, если профиль или не про шагам
					if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
						&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
						$p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1)
						row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);

					if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !row_ins_spec.formula.empty()){
						try{
							row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, inset);
							if(eval(row_ins_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}

					}else if($p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1 ||
								row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
						// Для вставок в профиль способ расчета количество не учитывается
						calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);

					}else{

						if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
							row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
							row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
							row_spec.s = _row.s;

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
							var row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
							elm.perimeter.forEach(function (rib) {
								row_prm._row._mixin(rib);
								if(inset_check(row_ins_spec, row_prm, true)){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
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
									row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
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
			 * Основная cпецификация по соединениям и вставкам таблицы координат
			 * @param scheme {Scheme}
			 */
			function base_spec(scheme) {

				// сбрасываем структуру обработанных соединений
				added_cnn_spec = {};

				// для всех контуров изделия
				scheme.getItems({class: $p.Editor.Contour}).forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(base_spec_profile);

					// для всех заполнений контура
					contour.glasses(false, true).forEach(base_spec_glass);

					// фурнитура контура
					furn_spec(contour);

				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme, attr) {

				//console.time("base_spec");
				//console.profile();


				// ссылки для быстрого доступа к свойствам обхекта продукции
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
				base_spec(scheme);

				// сворачиваем
				spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");


				//console.timeEnd("base_spec");
				//console.profileEnd();


				// информируем мир об окончании расчета координат
				$p.eve.callEvent("coordinates_calculated", [scheme, attr]);

				
				// рассчитываем цены

				// типы цен получаем заранее, т.к. они пригодятся при расчете корректировки спецификации
				var prm = {
					calc_order_row: ox.calc_order_row,
					spec: spec
				};
				if(prm.calc_order_row){

					$p.pricing.price_type(prm);

					// производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
					$p.spec_building.specification_adjustment(prm);

					// рассчитываем плановую себестоимость
					$p.pricing.calc_first_cost(prm);

					// рассчитываем стоимость продажи
					$p.pricing.calc_amount(prm);
				}



				// информируем мир о завершении пересчета
				if(attr.snapshot){
					$p.eve.callEvent("scheme_snapshot", [scheme, attr]);
				}
				
				// информируем мир о записи продукции
				if(attr.save){

					// сохраняем картинку вместе с изделием
					ox.save(undefined, undefined, {
							svg: {
								"content_type": "image/svg+xml",
								"data": new Blob([scheme.get_svg()], {type: "image/svg+xml"})
							}
						})
						.then(function () {
							$p.msg.show_msg("Спецификация рассчитана");
							delete scheme.data._saving;
							$p.eve.callEvent("characteristic_saved", [scheme, attr]);
						});

				}else{
					delete scheme.data._saving;
				}

			});

		}

	}
);

