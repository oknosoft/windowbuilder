/**
 * ### Дополнительные методы справочника _Соединения_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 * @module cat_cnns
 * Created 23.12.2015
 */

$p.cat.cnns.__define({

  _nomcache: {
    value: {}
  },

  sql_selection_list_flds: {
    value: function(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
        " left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
    }
  },

  /**
   * Возвращает массив соединений, доступный для сочетания номенклатур.
   * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
   * @param nom1 {_cat.nom|BuilderElement}
   * @param [nom2] {_cat.nom|BuilderElement}
   * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
   * @return {Array}
   */
  nom_cnn: {
    value: function(nom1, nom2, cnn_types, ign_side){

      // если второй элемент вертикальный - меняем местами эл 1-2 при поиске
      if(nom1 instanceof $p.Editor.ProfileItem &&
        nom2 instanceof $p.Editor.ProfileItem &&
        cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
        nom1.orientation != $p.enm.orientations.Вертикальная &&
        nom2.orientation == $p.enm.orientations.Вертикальная ){

        return this.nom_cnn(nom2, nom1, cnn_types);
      }

      // если оба элемента - профили, определяем сторону
      const side = !ign_side && nom1 instanceof $p.Editor.ProfileItem && nom2 instanceof $p.Editor.ProfileItem && nom2.cnn_side(nom1);

      let onom2, a1, a2, thickness1, thickness2, is_i = false, art1glass = false, art2glass = false;

      if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
        is_i = true;
        onom2 = nom2 = $p.cat.nom.get();
      }
      else{
        if(nom2 instanceof $p.Editor.BuilderElement){
          onom2 = nom2.nom;
        }
        else if($p.utils.is_data_obj(nom2)){
          onom2 = nom2;
        }
        else{
          onom2 = $p.cat.nom.get(nom2);
        }
      }

      const ref1 = nom1.ref;
      const ref2 = onom2.ref;

      if(!is_i){
        if(nom1 instanceof $p.Editor.Filling){
          art1glass = true;
          thickness1 = nom1.thickness;
        }
        else if(nom2 instanceof $p.Editor.Filling){
          art2glass = true;
          thickness2 = nom2.thickness;
        }
      }

      if(!this._nomcache[ref1]){
        this._nomcache[ref1] = {};
      }
      a1 = this._nomcache[ref1];
      if(!a1[ref2]){
        a2 = (a1[ref2] = []);
        // для всех элементов справочника соединения
        this.each((cnn) => {
          // если в строках соединяемых элементов есть наша - добавляем
          let is_nom1 = art1glass ? (cnn.art1glass && thickness1 >= cnn.tmin && thickness1 <= cnn.tmax && cnn.cnn_type == $p.enm.cnn_types.Наложение) : false,
            is_nom2 = art2glass ? (cnn.art2glass && thickness2 >= cnn.tmin && thickness2 <= cnn.tmax) : false;

          cnn.cnn_elmnts.each((row) => {
            if(is_nom1 && is_nom2){
              return false;
            }
            is_nom1 = is_nom1 || (row.nom1 == ref1 && (row.nom2.empty() || row.nom2 == onom2));
            is_nom2 = is_nom2 || (row.nom2 == onom2 && (row.nom1.empty() || row.nom1 == ref1));
          });
          if(is_nom1 && is_nom2){
            a2.push(cnn);
          }
        });
      }

      if(cnn_types){
        const types = Array.isArray(cnn_types) ? cnn_types : (
            $p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1 ? $p.enm.cnn_types.acn.a : [cnn_types]
          );
        return a1[ref2].filter((cnn) => {
          if(types.indexOf(cnn.cnn_type) != -1){
            if(!side){
              return true
            }
            if(cnn.sd1 == $p.enm.cnn_sides.Изнутри){
              return side == $p.enm.cnn_sides.Изнутри;
            }
            else if(cnn.sd1 == $p.enm.cnn_sides.Снаружи){
              return side == $p.enm.cnn_sides.Снаружи;
            }
            else{
              return true;
            }
          }
        });
      }

      return a1[ref2];
    }
  },

  /**
   * Возвращает соединение между элементами
   * @param elm1
   * @param elm2
   * @param [cnn_types] {Array}
   * @param [curr_cnn] {_cat.cnns}
   * @param [ign_side] {Boolean}
   */
  elm_cnn: {
    value: function(elm1, elm2, cnn_types, curr_cnn, ign_side){

      // если установленное ранее соединение проходит по типу и стороне, нового не ищем
      if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type)!=-1)){

        // TODO: проверить геометрию

        if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Изнутри){
          if(elm2.cnn_side(elm1) == $p.enm.cnn_sides.Изнутри)
            return curr_cnn;
        }
        else if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Снаружи){
          if(elm2.cnn_side(elm1) == $p.enm.cnn_sides.Снаружи)
            return curr_cnn;
        }
        else{
          return curr_cnn;
        }
      }

      const cnns = this.nom_cnn(elm1, elm2, cnn_types, ign_side);

      // сортируем по непустой стороне и приоритету
      if(cnns.length){
        const sides = [$p.enm.cnn_sides.Изнутри, $p.enm.cnn_sides.Снаружи];
        if(cnns.length > 1){
          cnns.sort((a, b) => {
            if(sides.indexOf(a.sd1) != -1 && sides.indexOf(b.sd1) == -1){
              return -1;
            }
            if(sides.indexOf(b.sd1) != -1 && sides.indexOf(a.sd1) == -1){
              return 1;
            }
            if (a.priority > b.priority) {
              return -1;
            }
            if (a.priority < b.priority) {
              return 1;
            }
            if (a.name > b.name) {
              return -1;
            }
            if (a.name < b.name) {
              return 1;
            }
            return 0;
          });
        }
        return cnns[0];
      }
      // TODO: возможно, надо вернуть соединение с пустотой
      else{

      }
    }
  },

})

// публичные методы объекта
$p.CatCnns.prototype.__define({

	/**
	 * Возвращает основную строку спецификации соединения между элементами
	 */
	main_row: {
		value: function (elm) {

			var ares, nom = elm.nom;

			// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
			if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

				var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

				ares = this.specification.find_rows({nom: art12});
				if(ares.length)
					return ares[0]._row;
			}

			// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
			if(this.cnn_elmnts.find_rows({nom1: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
				if(ares.length)
					return ares[0]._row;
			}
			if(this.cnn_elmnts.find_rows({nom2: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
				if(ares.length)
					return ares[0]._row;
			}
			ares = this.specification.find_rows({nom: nom});
			if(ares.length)
				return ares[0]._row;

		}
	},

	/**
	 * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
	 */
	check_nom2: {
		value: function (nom) {
			var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
			return this.cnn_elmnts._obj.some(function (row) {
				return row.nom == ref;
			})
		}
	}

});
