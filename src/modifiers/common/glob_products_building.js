/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module  glob_products_building
 * Created 26.05.2015
 */

function ProductsBuilding(){

  let added_cnn_spec,
		ox,
		spec,
		constructions,
		coordinates,
		cnn_elmnts,
		glass_specification,
		params,
    find_cx_sql;


	/**
	 * РассчитатьКоличествоПлощадьМассу
	 * @param row_spec
	 * @param row_coord
	 */
	function calc_count_area_mass(row_spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2){

    if(!row_spec.qty && !row_spec.len){
      return spec.del(row_spec.row-1, true);
    }

		//TODO: учесть angle_calc_method
		if(!angle_calc_method_next){
      angle_calc_method_next = angle_calc_method_prev;
    }

		if(angle_calc_method_prev && !row_spec.nom.is_pieces){

		  const {Основной, СварнойШов, СоединениеПополам, Соединение, _90} = $p.enm.angle_calculating_ways;

			if((angle_calc_method_prev == Основной) || (angle_calc_method_prev == СварнойШов)){
				row_spec.alp1 = row_coord.alp1;
			}
			else if(angle_calc_method_prev == _90){
				row_spec.alp1 = 90;
			}
			else if(angle_calc_method_prev == СоединениеПополам){
				row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
			}
			else if(angle_calc_method_prev == Соединение){
				row_spec.alp1 = (alp1 || row_coord.alp1);
			}

			if((angle_calc_method_next == Основной) || (angle_calc_method_next == СварнойШов)){
				row_spec.alp2 = row_coord.alp2;
			}
			else if(angle_calc_method_next == _90){
				row_spec.alp2 = 90;
			}
			else if(angle_calc_method_next == СоединениеПополам){
				row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
			}
			else if(angle_calc_method_next == Соединение){
				row_spec.alp2 = (alp2 || row_coord.alp2);
			}
		}

		if(row_spec.len){
			if(row_spec.width && !row_spec.s)
				row_spec.s = row_spec.len * row_spec.width;
		}else
			row_spec.s = 0;

		if(!row_spec.qty && (row_spec.len || row_spec.width))
			row_spec.qty = 1;

		if(row_spec.s)
			row_spec.totqty = row_spec.qty * row_spec.s;

		else if(row_spec.len)
			row_spec.totqty = row_spec.qty * row_spec.len;

		else
			row_spec.totqty = row_spec.qty;

		row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

		["len","width","s","qty","alp1","alp2"].forEach((fld) => row_spec[fld] = row_spec[fld].round(4));
    ["totqty","totqty1"].forEach((fld) => row_spec[fld] = row_spec[fld].round(6));
	}

	/**
	 * РассчитатьQtyLen
	 * @param row_spec
	 * @param row_base
	 * @param len
	 */
	function calc_qty_len(row_spec, row_base, len){

		const {nom} = row_spec;

		if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
			  nom.cutting_optimization_type.empty() || nom.is_pieces){
			if(!row_base.coefficient || !len){
        row_spec.qty = row_base.quantity;
      }
			else{
				if(!nom.is_pieces){
					row_spec.qty = row_base.quantity;
					row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
					if(nom.rounding_quantity){
						row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
						row_spec.len = 0;
					};
				}
				else if(!nom.rounding_quantity){
					row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
				}
				else{
					row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
				}
			}
		}
		else{
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
		let res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
		if(res.length){
      return res[0].row;
    }
		res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
		if(res.length){
      return res[0].row;
    }
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
		if(cnn && cnn.cnn_type == $p.enm.cnn_types.КрестВСтык){
      return false;
    }
    else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1){
      return false;
    }
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
		if(!row_spec){
      row_spec = spec.add();
    }
		row_spec.nom = nom || row_base.nom;
		row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr);
		row_spec.elm = elm.elm;
    if(!row_spec.nom.visualization.empty()){
      row_spec.dop = -1;
    }
		if(origin){
      row_spec.origin = origin;
    }
		return row_spec;
	}

	/**
	 * ДополнитьСпецификациюСпецификациейСоединения
	 * @method cnn_add_spec
	 * @param cnn {_cat.Cnns}
	 * @param elm {BuilderElement}
	 * @param len_angl {Object}
	 */
	function cnn_add_spec(cnn, elm, len_angl, cnn_other){
		if(!cnn){
      return;
    }
		const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

		cnn_filter_spec(cnn, elm, len_angl).forEach((row_cnn_spec) => {

			const {nom} = row_cnn_spec;

			// TODO: nom может быть вставкой - в этом случае надо разузловать
			if(nom._manager == $p.cat.inserts){
				if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)){
					const tmp_len_angl = len_angl._clone();
					tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
					inset_spec(elm, nom, tmp_len_angl);
				}else{
          inset_spec(elm, nom, len_angl);
        }
			}
			else {

        const row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin || cnn);

				// рассчитаем количество
				if(nom.is_pieces){
					if(!row_cnn_spec.coefficient){
            row_spec.qty = row_cnn_spec.quantity;
          }
					else{
            row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
              .round(nom.rounding_quantity);
          }
				}
				else{
					// TODO: Строго говоря, нужно брать не размер соединения, а размеры предыдущего и последующего
					row_spec.qty = row_cnn_spec.quantity;

					if(row_cnn_spec.sz || row_cnn_spec.coefficient){
            let sz = row_cnn_spec.sz;
            let finded;
            if(cnn_other){
              cnn_other.specification.find_rows({nom}, (row) => {
                sz += row.sz;
                return !(finded = true);
              })
            }
            if(!finded){
              sz *= 2;
            }
            row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
          }
				}

				// если указана формула - выполняем
				if(!row_cnn_spec.formula.empty()) {
					row_cnn_spec.formula.execute({
						ox,
						elm,
            len_angl,
            cnstr: 0,
            inset: $p.utils.blank.guid,
						row_cnn: row_cnn_spec,
						row_spec: row_spec
					});
				}

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

		const res = [];
		const {angle_hor} = elm;
		const {art1, art2} = $p.job_prm.nom;
    const {САртикулом1, САртикулом2} = $p.enm.specification_installation_methods;

		cnn.specification.each((row) => {
			const {nom} = row;
			if(!nom || nom.empty() || nom == art1 || nom == art2){
        return;
      }

			// только для прямых или только для кривых профилей
			if((row.for_direct_profile_only > 0 && !elm.is_linear()) ||
				(row.for_direct_profile_only < 0 && elm.is_linear())){
        return;
      }

			//TODO: реализовать фильтрацию
			if(cnn.cnn_type == $p.enm.cnn_types.Наложение){
				if(row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len){
          return;
        }
			}else{
				if(row.amin > len_angl.angle || row.amax < len_angl.angle){
          return;
        }
			}

			// "Устанавливать с" проверяем только для соединений профиля
			if((row.set_specification == САртикулом1 && len_angl.art2) || (row.set_specification == САртикулом2 && len_angl.art1)){
        return;
      }

			// Проверяем параметры изделия и добавляем, если проходит по ограничениям
			if(check_params(cnn.selection_params, row, elm)){
        res.push(row);
      }

		});

		return res;
	}

	/**
	 * Проверяет соответствие параметров отбора параметрам изделия
	 * @param selection_params {TabularSection} - табчасть параметров вставки или соединения
   * @param row_spec {TabularSectionRow}
	 * @param elm {BuilderElement}
	 * @param [cnstr] {Number} - номер конструкции или элемента
	 * @return {boolean}
	 */
	function check_params(selection_params, row_spec, elm, cnstr, origin){

		let ok = true;

		// режем параметры по элементу
		selection_params.find_rows({elm: row_spec.elm}, (prm_row) => {
		  // выполнение условия рассчитывает объект CchProperties
			ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
			if(!ok){
			  return false;
      }
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

	  const {_row} = elm;
	  const len = len_angl ? len_angl.len : _row.len;
	  const is_linear = elm.is_linear ? elm.is_linear() : true;
		let is_tabular = true;

		// проверяем площадь
		if(inset.smin > _row.s || (_row.s && inset.smax && inset.smax < _row.s)){
      return false;
    }

		// Главный элемент с нулевым количеством не включаем
		if(inset.is_main_elm && !inset.quantity){
      return false;
    }

    // только для прямых или только для кривых профилей
    if((inset.for_direct_profile_only > 0 && !is_linear) || (inset.for_direct_profile_only < 0 && is_linear)){
      return false;
    }

		if($p.utils.is_data_obj(inset)){

			if(inset.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
				if(!elm.joined_imposts(true)){
          return false;
        }

			}else if(inset.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
				if(elm.joined_imposts(true)){
          return false;
        }
			}
			is_tabular = false;
		}


		if(!is_tabular || by_perimetr || inset.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
			if(inset.lmin > len || (inset.lmax < len && inset.lmax > 0)){
        return false;
      }
			if(inset.ahmin > _row.angle_hor || inset.ahmax < _row.angle_hor){
        return false;
      }
		}

		//// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

		return true;
	}

	/**
	 * ПолучитьСпецификациюВставкиСФильтром
	 * @param inset (CatInserts) - вставка
	 * @param elm {BuilderElement} - элемент, к которому привязана вставка
	 * @param [is_high_level_call] {Boolean} - вызов верхнего уровня - специфично для стеклопакетов
   * @param [len_angl] {BuilderElement} - элемент, к которому привязана вставка
	 */
	function inset_filter_spec(inset, elm, is_high_level_call, len_angl){

		const res = [];
		const glass_rows = [];

		if(!inset || inset.empty()){
      return res;
    }

    // для заполнений, можно переопределить состав верхнего уровня
		if(is_high_level_call && (inset.insert_type == "Заполнение" || inset.insert_type == "Стеклопакет" || inset.insert_type == "ТиповойСтеклопакет")){

			glass_specification.find_rows({elm: elm.elm}, (row) => {
        glass_rows.push(row);
			});

      // если спецификация верхнего уровня задана в изделии, используем её, параллельно формируем формулу
			if(glass_rows.length){
				glass_rows.forEach((row) => {
					inset_filter_spec(row.inset, elm, false, len_angl).forEach((row) => {
						res.push(row);
					});
				});
				return res;
			}
		}

		inset.specification.each((row) => {

			// Проверяем ограничения строки вставки
			if(!inset_check(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль, len_angl)){
        return;
      }

			// Проверяем параметры изделия, контура или элемента
			if(!check_params(inset.selection_params, row, elm, len_angl && len_angl.cnstr, len_angl && len_angl.origin)){
        return;
      }

			// Добавляем или разузловываем дальше
			if(row.nom instanceof $p.CatInserts){
        inset_filter_spec(row.nom, elm, false, len_angl).forEach((subrow) => {
          const fakerow = {}._mixin(subrow, ['angle_calc_method','clr','count_calc_method','elm','formula','is_main_elm','is_order_row','nom','sz']);
          fakerow.quantity = (subrow.quantity || 1) * (row.quantity || 1);
          fakerow.coefficient = (subrow.coefficient || 1) * (row.coefficient || 1);
          fakerow._origin = row.nom;
          if(fakerow.clr.empty()){
            fakerow.clr = row.clr;
          }
          res.push(fakerow);
        });
      }
			else{
        res.push(row);
      }

		});

		return res;
	}

	/**
	 * Спецификации фурнитуры
	 * @param contour {Contour}
	 */
	function furn_spec(contour) {

		// у рамных контуров фурнитуры не бывает
		if(!contour.parent){
      return false;
    }

		// кеш сторон фурнитуры
		const {furn_cache, furn} = contour;

		// проверяем, подходит ли фурнитура под геометрию контура
		if(!furn_check_opening_restrictions(contour, furn_cache)){
      return;
    }

		// уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
    contour.update_handle_height(furn_cache);

		// получаем спецификацию фурнитуры и переносим её в спецификацию изделия
    const blank_clr = $p.cat.clrs.get();
    furn.furn_set.get_spec(contour, furn_cache).each((row) => {
			const elm = {elm: -contour.cnstr, clr: blank_clr};
			const row_spec = new_spec_row(null, elm, row, row.nom_set, row.origin);

			if(row.is_procedure_row){
				row_spec.elm = row.handle_height_min;
				row_spec.len = row.coefficient / 1000;
				row_spec.qty = 0;
				row_spec.totqty = 1;
				row_spec.totqty1 = 1;
			}
			else{
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

		let ok = true;

		// TODO: реализовать проверку по количеству сторон

		// проверка геометрии
		contour.furn.open_tunes.each((row) => {
			const elm = contour.profile_by_furn_side(row.side, cache);
			const len = elm._row.len - 2 * elm.nom.sizefurn;

			// angle_hor = elm.angle_hor; TODO: реализовать проверку углов

			if(len < row.lmin || len > row.lmax || (!elm.is_linear() && !row.arc_available)){
				new_spec_row(null, elm, {clr: $p.cat.clrs.get()}, $p.job_prm.nom.furn_error, contour.furn);
				ok = false;
			}

		});

		return ok;
	}


	/**
	 * Спецификации соединений примыкающих профилей
	 * @param elm {Profile}
	 */
	function cnn_spec_nearest(elm) {
		const nearest = elm.nearest();
		if(nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm.data._nearest_cnn)
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

		const {_row, rays} = elm;

		if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
      return;
    }

    const {b, e} = rays;

		if(!b.cnn || !e.cnn){
			return;
		}

    const prev = b.profile;
    const next = e.profile;
    const row_cnn_prev = b.cnn.main_row(elm);
    const row_cnn_next = e.cnn.main_row(elm);

    let row_spec;

		// добавляем строку спецификации
    const row_cnn = row_cnn_prev || row_cnn_next;
		if(row_cnn){

			row_spec = new_spec_row(null, elm, row_cnn, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0));
      row_spec.qty = row_cnn.quantity;

			// уточняем размер
      const seam = $p.enm.angle_calculating_ways.СварнойШов;
      const d45 = Math.sin(Math.PI / 4);
      const dprev = row_cnn_prev ? (
          row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz
        ) : 0;
      const dnext = row_cnn_next ? (
          row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz
        ) : 0;

      row_spec.len = (_row.len - dprev - dnext)
				* ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

			// profile._len - то, что получится после обработки
			// row_spec.len - сколько взять (отрезать)
			elm.data._len = _row.len;
			_row.len = (_row.len
				- (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz)
				- (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz))
				* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

			// припуск для гнутых элементов
			if(!elm.is_linear()){
        row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
      }

			// дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
			if(row_cnn_prev && !row_cnn_prev.formula.empty()){
				row_cnn_prev.formula.execute({
					ox: ox,
					elm: elm,
          cnstr: 0,
          inset: $p.utils.blank.guid,
					row_cnn: row_cnn_prev,
					row_spec: row_spec
				});
			}
			else if(row_cnn_next && !row_cnn_next.formula.empty()){
				row_cnn_next.formula.execute({
					ox: ox,
					elm: elm,
          cnstr: 0,
          inset: $p.utils.blank.guid,
					row_cnn: row_cnn_next,
					row_spec: row_spec
				});
			}

			// РассчитатьКоличествоПлощадьМассу
      const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
      const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
      const {СоединениеПополам, Соединение} = $p.enm.angle_calculating_ways;
			calc_count_area_mass(
			  row_spec,
        _row,
        angle_calc_method_prev,
        angle_calc_method_next,
        angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0,
        angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0
      );
		}

		// НадоДобавитьСпецификациюСоединения
		if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

			const len_angl = {
				angle: 0,
				alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
				alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
        len: row_spec ? row_spec.len * 1000 : _row.len,
				art1: false
			};

			if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){

				// для него надо рассчитать еще и с другой стороны
				if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm)){
					//	TODO: ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
          len_angl.angle = len_angl.alp2;
          len_angl.art2 = true;
          cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
				}
			}

			// спецификацию с предыдущей стороны рассчитваем всегда
      len_angl.angle = len_angl.alp1;
      len_angl.art2 = false;
      len_angl.art1 = true;
			cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
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

    const {profiles, onlays, _row} = glass;

    if(_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
      return;
    }

    const glength = profiles.length;

		// для всех рёбер заполнения
		for(let i=0; i<glength; i++ ){
			const curr = profiles[i];

      if(curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
        return;
      }

      const prev = (i==0 ? profiles[glength-1] : profiles[i-1]).profile;
      const next = (i==glength-1 ? profiles[0] : profiles[i+1]).profile;
      const row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

			const len_angl = {
				angle: 0,
				alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
				alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
				len: row_cnn.length ? row_cnn[0].aperture_len : 0,
				origin: cnn_row(_row.elm, curr.profile.elm)

			};

			// добавляем спецификацию соединения рёбер заполнения с профилем
			cnn_add_spec(curr.cnn, curr.profile, len_angl);

		}

		// добавляем спецификацию вставки в заполнение
		inset_spec(glass);

		// для всех раскладок заполнения
    onlays.forEach(base_spec_profile);
	}

	/**
	 * Спецификация вставки элемента
	 * @param elm {BuilderElement}
	 */
	function inset_spec(elm, inset, len_angl) {

		const {_row} = elm;

		if(!inset)
			inset = elm.inset;

		inset_filter_spec(inset, elm, true, len_angl).forEach((row_ins_spec) => {

		  const origin = row_ins_spec._origin || inset;

			let row_spec;

			// добавляем строку спецификации, если профиль или не про шагам
			if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
				&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
				$p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1)
				row_spec = new_spec_row(null, elm, row_ins_spec, null, origin);

			if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !row_ins_spec.formula.empty()){

				// если строка спецификации не добавлена на предыдущем шаге, делаем это сейчас
				row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, origin);

				// выполняем формулу
				row_ins_spec.formula.execute({
					ox: ox,
					elm: elm,
          cnstr: len_angl && len_angl.cnstr || 0,
          inset: (len_angl && len_angl.hasOwnProperty('cnstr')) ? len_angl.origin : $p.utils.blank.guid,
					row_ins: row_ins_spec,
					row_spec: row_spec,
          len: len_angl ? len_angl.len : _row.len
				});
			}
			else if($p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1 ||
				row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
				// для вставок в профиль способ расчета количество не учитывается
				calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
			}
			else{

				if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
					row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
					row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
					row_spec.s = _row.s;
				}
				else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
					const row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
					elm.perimeter.forEach((rib) => {
						row_prm._row._mixin(rib);
            row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
						if(inset_check(row_ins_spec, row_prm, true)){
							row_spec = new_spec_row(null, elm, row_ins_spec, null, origin);
							calc_qty_len(row_spec, row_ins_spec, rib.len);
							calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
						}
						row_spec = null;
					});

				}
				else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам){

					var h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
					if((row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
						row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление) && row_ins_spec.step){

						for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
							row_spec = new_spec_row(null, elm, row_ins_spec, null, origin);
							calc_qty_len(row_spec, row_ins_spec, w);
							calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
						}
						row_spec = null;
					}
				}
				else{
					throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
				}
			}

			if(row_spec){
        calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
      }
		})
	}

  /**
   * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
   * @param elm
   * @param origin
   * @return {$p.CatCharacteristics}
   */
	function find_create_cx(elm, origin) {
    if(!find_cx_sql){
      find_cx_sql = $p.wsql.alasql.compile("select top 1 ref from cat_characteristics where leading_product = ? and leading_elm = ? and origin = ?")
    }
    const aref = find_cx_sql([ox.ref, elm, origin]);
    const cx = aref.length ? $p.cat.characteristics.get(aref[0].ref, false) :
      $p.cat.characteristics.create({
        leading_product: ox,
        leading_elm: elm,
        origin: origin
      }, false, true)._set_loaded();

    // переносим в cx параметры
    const {length, width} = $p.job_prm.properties;
    cx.params.clear(true);
    ox.params.find_rows({cnstr: -elm, inset: origin}, (row) => {
      if(row.param != length && row.param != width){
        cx.params.add({param: row.param, value: row.value});
      }
    });
    // переносим в cx цвет
    ox.inserts.find_rows({cnstr: -elm, inset: origin}, (row) => {
      cx.clr = row.clr;
    });
    cx.prod_name();
    return cx;
  }

  /**
   * Спецификация вставок в контур
   * @param contour
   */
  function inset_contour_spec(contour) {

    // во время расчетов возможна подмена объекта спецификации
    const spec_tmp = spec;

    ox.inserts.find_rows({cnstr: contour.cnstr}, ({inset, clr}) => {

      const elm = {
        _row: {},
        elm: 0,
        clr: ox.clr,
        get perimeter() {return contour.perimeter}
      };

      // если во вставке указано создавать продукцию, создаём
      if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция){
        // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
        const cx = find_create_cx(-contour.cnstr, inset.ref)._mixin(inset.contour_attrs(contour));
        ox._order_rows.push(cx);
        spec = cx.specification;
        spec.clear();
      }

      // рассчитаем спецификацию вставки
      const len_angl = {
        angle: 0,
        alp1: 0,
        alp2: 0,
        len: 0,
        origin: inset,
        cnstr: contour.cnstr
      }
      inset_spec(elm, inset, len_angl);

    });

    // восстанавливаем исходную ссылку объекта спецификации
    spec = spec_tmp;
  }

	/**
	 * Основная cпецификация по соединениям и вставкам таблицы координат
	 * @param scheme {Scheme}
	 */
	function base_spec(scheme) {

		// сбрасываем структуру обработанных соединений
		added_cnn_spec = {};

		// для всех контуров изделия
    scheme.getItems({class: $p.Editor.Contour}).forEach((contour) => {

			// для всех профилей контура
			contour.profiles.forEach(base_spec_profile);

			// для всех заполнений контура
      contour.glasses(false, true).forEach(base_spec_glass);

			// фурнитура контура
			furn_spec(contour);

      // спецификация вставок в контур
      inset_contour_spec(contour)

		});

    // спецификация вставок в изделие
    inset_contour_spec({
      cnstr:0,
      project: scheme,
      get perimeter() {return this.project.perimeter}
    });

	}

	/**
	 * Пересчет спецификации при записи изделия
	 */
	$p.eve.attachEvent("save_coordinates", (scheme, attr) => {

		//console.time("base_spec");
		//console.profile();


		// ссылки для быстрого доступа к свойствам объекта продукции
		ox = scheme.ox;
		spec = ox.specification;
		constructions = ox.constructions;
		coordinates = ox.coordinates;
		cnn_elmnts = ox.cnn_elmnts;
		glass_specification = ox.glass_specification;
		params = ox.params;

		// чистим спецификацию
		spec.clear();

    // массив продукций к добавлению в заказ
    ox._order_rows = [];

		// рассчитываем базовую сецификацию
		base_spec(scheme);

		// сворачиваем
		spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");


		//console.timeEnd("base_spec");
		//console.profileEnd();

		// информируем мир об окончании расчета координат
		$p.eve.callEvent("coordinates_calculated", [scheme, attr]);


    // производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
    // внутри корректировки будут рассчитаны цены продажи и плановой себестоимости
		if(ox.calc_order_row){
			$p.spec_building.specification_adjustment({
        scheme: scheme,
        calc_order_row: ox.calc_order_row,
        spec: spec,
        save: attr.save,
      }, true);
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
				.then(() => {
					$p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
					delete scheme.data._saving;
					$p.eve.callEvent("characteristic_saved", [scheme, attr]);
				})
        .catch((ox) => {
          $p.record_log(ox);
          delete scheme.data._saving;
          const {_err} = ox._data;
          if(_err){
            $p.msg.show_msg(_err);
            delete ox._data._err;
          }
        });
		}
		else{
			delete scheme.data._saving;
		}

	});

}


$p.products_building = new ProductsBuilding();

