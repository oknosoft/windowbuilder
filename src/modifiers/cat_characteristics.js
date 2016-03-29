/**
 * Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 * Created 16.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module cat_characteristics
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.cat.characteristics;

		// перед записью надо пересчитать наименование и рассчитать итоги
		_mgr.attache_event("before_save", function (attr) {

			var name = this.prod_name();
			if(name)
				this.name = name;
			
		});

		_mgr._obj_сonstructor.prototype.__define({
			
			calc_order_row: {
				get: function () {
					var _calc_order_row;
					this.calc_order.production.find_rows({characteristic: this}, function (_row) {
						_calc_order_row = _row;
						return false;
					});
					return _calc_order_row;
				},
				enumerable: false
			},
			
			prod_name: {
				value: function (short) {

					var _row = this.calc_order_row,
						name = "";
					
					if(_row){
						
						name = (this.calc_order.number_internal || this.calc_order.number_doc) + "/" + _row.row.pad();
						
						if(!short){
							if(this.clr.name)
								name += "/" + this.clr.name;

							if(this.x && this.y)
								name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
							else if(this.x)
								name += "/" + this.x.toFixed(0);
							else if(this.y)
								name += "/" + this.y.toFixed(0);

							if(this.z){
								if(this.x || this.y)
									name += "x" + this.z.toFixed(0);
								else
									name += "/" + this.z.toFixed(0);
							}

							if(this.s)
								name += "/S:" + this.s.toFixed(3);	
						}
					}
					return name;
				}
			}
		});

	}

);
