/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 12.03.2016
 *
 * @module tools
 * @submodule tool_element
 */

/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * @class ToolElement
 * @extends paper.Tool
 * @constructor
 */
function ToolElement() {
	ToolElement.superclass.constructor.call(this);
}
ToolElement._extend(paper.Tool);

ToolElement.prototype.__define({

	/**
	 * ### Отключает и выгружает из памяти окно свойств инструмента
	 *
	 * @method detache_wnd
	 * @for ToolElement
	 * @param tool
	 */
	detache_wnd: {
		value: function(){
			if(this.wnd){
				
				if(this._grid && this._grid.destructor){
					if(this.wnd.detachObject)
						this.wnd.detachObject(true);
					delete this._grid;
				}
				
				if(this.wnd.wnd_options){
					this.wnd.wnd_options(this.options.wnd);
					$p.wsql.save_options("editor", this.options);
					this.wnd.close();
				}
				
				delete this.wnd;
			}
			this.profile = null;
		}
	},


	/**
	 * ### Проверяет, есть ли в проекте стои, при необходимости добавляет
	 * @method detache_wnd
	 * @for ToolElement
	 */
	check_layer: {
		value: function () {
			if(!this._scope.project.contours.length){

				// создаём пустой новый слой
				new Contour( {parent: undefined});

				// оповещаем мир о новых слоях
				Object.getNotifier(this._scope.project._noti).notify({
					type: 'rows',
					tabular: "constructions"
				});

			}
		}
	},

	/**
	 * ### Общие действия при активизации инструмента
	 *
	 * @method on_activate
	 * @for ToolElement
	 */
	on_activate: {
		value: function (cursor) {

			this._scope.tb_left.select(this.options.name);

			this._scope.canvas_cursor(cursor);

			// для всех инструментов, кроме select_node...
			if(this.options.name != "select_node"){

				this.check_layer();

				// проверяем заполненность системы
				if(this._scope.project._dp.sys.empty()){
					$p.msg.show_msg({
						type: "alert-warning",
						text: $p.msg.bld_not_sys,
						title: $p.msg.bld_title
					});
				}
			}

		}
	}

});

