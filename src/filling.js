/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
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

	var _row = attr.row,
		_filling = this;

	Filling.superclass.constructor.call(this, attr);

	// initialize
	(function(){

		var h = _filling.project.bounds.height;

		//this.guide = true

		if(_row.path_data)
			this.data.path = new paper.Path(_row.path_data);
		else
			this.data.path = new paper.Path([
				[_row.cornx1, h - _row.corny1],
				[_row.cornx2, h - _row.corny2],
				[_row.cornx3, h - _row.corny3],
				[_row.cornx4, h - _row.corny4]
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