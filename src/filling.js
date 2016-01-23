/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  filling
 */


/**
 * Инкапсулирует поведение элемента заполнения.<br />
 * У заполнения есть коллекция рёбер, образующая путь контура.<br />
 * Путь всегда замкнутый, образует простой многоугольник без внутренних пересечений, рёбра могут быть гнутыми.
 * @class Filling
 * @param arg {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Filling(attr){

	Filling.superclass.constructor.call(this, attr);

	var _row = attr.row,
		_filling = this;

	// initialize
	(function(){

		var h = _filling.project.bounds.height;

		//this.guide = true

		if(_row.path_data)
			this.data.path = new paper.Path(_row.path_data);

		else if(attr.path){

			this.data.path = new paper.Path();
			this.path = attr.path;

		}else
			this.data.path = new paper.Path([
				[_row.x1, h - _row.y1],
				[_row.x1, h - _row.y2],
				[_row.x2, h - _row.y2],
				[_row.x2, h - _row.y1]
			]);
		this.data.path.closePath(true);
		this.data.path.guide = true;
		this.data.path.strokeWidth = 0;
		this.data.path.fillColor = {
			stops: ['#def', '#d0ddff', '#eff'],
			origin: this.data.path.bounds.bottomLeft,
			destination: this.data.path.bounds.topRight
		};
		this.data.path.visible = false;

		this.addChild(this.data.path);
		//this.addChild(this.data.generatrix);


	}).call(this);

	/**
	 * Рёбра заполнения
	 * @property ribs
	 * @type {paper.Group}
	 */
	//this.ribs = new paper.Group();

}
Filling._extend(BuilderElement);

Filling.prototype.__define({

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {

			this.purge_path();

			var h = this.project.bounds.height,
				_row = this._row,
				glass = this.project.ox.glasses.add({
					elm: _row.elm
				});

			_row.path_data = this.path.pathData;
		}
	},

	/**
	 * путь элемента - состоит из кривых, соединяющих вершины элемента
	 * @property path
	 * @type paper.Path
	 */
	path: {
		get : function(){ return this.data.path; },
		set : function(glass_path){
			if(glass_path instanceof paper.Path){
				this.data.path.removeSegments();

				// Если в передаваемом пути есть привязка к профилям контура - используем
				if(glass_path.data.curve_nodes){

					this.data.path.addSegments(glass_path.segments);
				}else{
					this.data.path.addSegments(glass_path.segments);
				}

				if(!this.data.path.closed)
					this.data.path.closePath(true);
			}
		},
		enumerable : true
	},

	purge_path: {
		value: function () {

			var curves = this.path.curves,
				prev, curr, dangle, i;

			// убираем малые искривления
			for(i = 0; i < curves.length; i++){
				prev = curves[i];
				curr = prev.getCurvatureAt(0.5, true);
				if(prev.hasHandles() && curr < 1e-6 && curr > -1e-6)
					prev.clearHandles();
			}

			// убираем лишние сегменты
			prev = curves[0];
			i = 1;
			while (i < curves.length){

				if(prev.length < consts.filling_min_length)
					this.path.removeSegment(i);
				else{
					curr = curves[i];
					if(!curr.hasHandles() && !prev.hasHandles()){
						dangle = Math.abs(curr.getTangentAt(0).angle - prev.getTangentAt(0).angle);
						if(dangle < 0.01 || Math.abs(dangle - 180) < 0.01)
							this.path.removeSegment(i);
						else{
							prev = curr;
							i++;
						}
					}else{
						prev = curr;
						i++;
					}
				}
			}

			// выравниваем горизонт
			if(curves.length == 4 && !this.path.hasHandles()){
				for(i = 0; i < curves.length; i++){
					prev = curves[i];
					if(!prev.hasHandles()){
						dangle = curr.getTangentAt(0).angle;
						// todo: выравниваем горизонт
					}
				}
			}
		}
	}

});