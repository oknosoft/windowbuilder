/**
 * Модификаторы обработки _builder_pen_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module dp_builder_pen
 * Created 13.05.2016
 */

$p.modifiers.push(

	function($p) {

		$p.dp.builder_pen.attache_event("value_change", function (attr) {

			if(attr.field == "elm_type") {
				this.inset = paper.project.default_inset({elm_type: this.elm_type});
				this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
			}
		});
	}
);