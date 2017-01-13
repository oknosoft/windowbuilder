/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_inserts
 */

$p.cat.inserts.__define({

	_inserts_types_filling: {
		value: [
			$p.enm.inserts_types.Стеклопакет,
			$p.enm.inserts_types.Заполнение,
			$p.enm.inserts_types.ТиповойСтеклопакет
		]
	},

	by_thickness: {
		value: function (min, max) {

			if(!this._by_thickness){
				this._by_thickness = {};
				this.find_rows({insert_type: {in: this._inserts_types_filling}}, function (ins) {
					if(ins.thickness > 0){
						if(!this._by_thickness[ins.thickness])
							this._by_thickness[ins.thickness] = [];
						this._by_thickness[ins.thickness].push(ins);
					}
				}.bind(this));
			}

			var res = [];
			for(var thickness in this._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, this._by_thickness[thickness]);
			}
			return res;

		}
	},

  sql_selection_list_flds: {
	  value: function (initial_value) {
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as insert_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_inserts AS _t_" +
        " left outer join enm_inserts_types as _k_ on _k_.ref = _t_.insert_type %3 %4 LIMIT 300";
    }
  }

});

$p.CatInserts.prototype.__define({

	/**
	 * Возвращает номенклатуру вставки в завсисмости от свойств элемента
	 */
	nom: {
		value: function (elm) {

			var main_rows = [], _nom;

			this.specification.find_rows({is_main_elm: true}, function (row) {
				main_rows.push(row);
			});

			if(!this._cache)
				this._cache = {};

			if(this._cache.nom)
				return this._cache.nom;

			if(!main_rows.length && this.specification.count())
				main_rows.push(this.specification.get(0));

			if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts)
				_nom = main_rows[0].nom.nom();

			else if(main_rows.length)
				_nom = main_rows[0].nom;

			else
				_nom = $p.cat.nom.get();

			if(main_rows.length < 2)
				this._cache.nom = _nom;

			return _nom;

		}
	},

  /**
   * Возвращает атрибуты характеристики виртуальной продукции по вставке в контур
   */
  contour_attrs: {
    value: function (contour) {

      var main_rows = [],
        res = {calc_order: contour.project.ox.calc_order};

      this.specification.find_rows({is_main_elm: true}, function (row) {
        main_rows.push(row);
        return false;
      });

      if(main_rows.length){
        var irow = main_rows[0],
          sizes = {},
          sz_keys = {},
          sz_prms = ['length', 'width', 'thickness'].map(function (name) {
            var prm = $p.job_prm.properties[name];
            sz_keys[prm.ref] = name;
            return prm;
          });

        // установим номенклатуру продукции
        res.owner = irow.nom instanceof $p.CatInserts ? irow.nom.nom() : irow.nom;

        // если в параметрах вставки задействованы свойства длина и или ширина - габариты получаем из свойств
        contour.project.ox.params.find_rows({
          cnstr: contour.cnstr,
          inset: this,
          param: {in: sz_prms}
        }, function (row) {
          sizes[sz_keys[row.param.ref]] = row.value
        });

        if(Object.keys(sizes).length > 0){
          res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.s = ((res.x * res.y) / 1000000).round(3);
          res.z = sizes.thickness * (irow.coefficient * 1000 || 1);

        }else{

          if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()){
            irow.formula.execute({
              ox: contour.project.ox,
              contour: contour,
              inset: this,
              row_ins: irow,
              res: res
            });

          }else{
            res.x = contour.w + irow.sz;
            res.y = contour.h + irow.sz;
            res.s = ((res.x * res.y) / 1000000).round(3)

          }
        }
      }

      return res;

    }
  },

	/**
	 * Возвращает толщину вставки
   *
   * @property thickness
   * @return {Number}
	 */
	thickness: {
		get: function () {

			if(!this._cache)
				this._cache = {};

			var _cache = this._cache;

			if(!_cache.hasOwnProperty("thickness")){
				_cache.thickness = 0;
				if(this.insert_type == $p.enm.inserts_types.ТиповойСтеклопакет || this.insert_type == $p.enm.inserts_types.Стеклопакет){

					if(this.insert_glass_type == $p.enm.inserts_glass_types.Рамка)
						_cache.thickness += this.nom().thickness;

					else if(this.insert_glass_type == $p.enm.inserts_glass_types.Стекло)
						this.specification.each(function (row) {
							_cache.thickness += row.nom.thickness;
						});
				}else
					_cache.thickness = this.nom().thickness;
			}

			return _cache.thickness;

		}
	},

  /**
   * Возвращает массив задействованных во вставке параметров
   * @property used_params
   * @return {Array}
   */
  used_params: {
	  get: function () {
      var res = [];

      this.selection_params.each(function (row) {
        if(!row.param.empty() && res.indexOf(row.param) == -1){
          res.push(row.param)
        }
      })

      return res;
    }
  }

});

