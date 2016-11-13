/**
 * Работа с буфером обмена
 * @author Evgeniy Malyarov
 * @module clipboard
 */

/**
 * ### Буфер обмена
 * Объект для прослушивания и обработки событий буфера обмена
 *
 * @class Clipbrd
 * @param _editor
 * @constructor
 */
function Clipbrd(_editor) {

	var fakecb = {
		clipboardData: {
			types: ['text/plain'],
			json: '{a: 0}',
			getData: function () {
				return this.json;
			}
		}
	};

	function onpaste(e) {
		var _scheme = _editor.project;

		if(!e)
			e = fakecb;

		if(!_scheme.ox.empty()){

			if(e.clipboardData.types.indexOf('text/plain') == -1)
				return;

			try{
				var data = JSON.parse(e.clipboardData.getData('text/plain'));
				e.preventDefault();
			}catch(e){
				return;
			}

		}
	}

	function oncopy(e) {

		if(e.target && ["INPUT","TEXTAREA"].indexOf(e.target.tagName) != -1)
			return;

		var _scheme = _editor.project;
		if(!_scheme.ox.empty()){

			// получаем выделенные элементы
			var sitems = [];
			_scheme.selectedItems.forEach(function (el) {
				if(el.parent instanceof Profile)
					el = el.parent;
				if(el instanceof BuilderElement && sitems.indexOf(el) == -1)
					sitems.push(el);
			});

			// сериализуем
			var res = {
				sys: {
					ref: _scheme._dp.sys.ref,
					presentation: _scheme._dp.sys.presentation
				},

				clr: {
					ref: _scheme.clr.ref,
					presentation: _scheme.clr.presentation
				},

				calc_order: {
					ref: _scheme.ox.calc_order.ref,
					presentation: _scheme.ox.calc_order.presentation
				}
			};
			if(sitems.length){
				res.product = {
					ref: _scheme.ox.ref,
					presentation: _scheme.ox.presentation
				};
				res.items = [];
				sitems.forEach(function (el) {
					res.items.push({
						elm: el.elm,
						elm_type: el._row.elm_type.name,
						inset: {
							ref: el.inset.ref,
							presentation: el.inset.presentation
						},
						clr: {
							ref: el.clr.ref,
							presentation: el.clr.presentation
						},
						path_data: el.path.pathData,
						x1: el.x1,
						x2: el.x2,
						y1: el.y1,
						y2: el.y2
					});
				});

			}else{
				_editor.project.save_coordinates({
					snapshot: true,
					clipboard: true,
					callback: function (scheme) {
						res.product = {}._mixin(scheme.ox._obj, [], ["extra_fields","glasses","specification","predefined_name"]);
					}
				});
			}
			fakecb.clipboardData.json = JSON.stringify(res, null, '\t');

			e.clipboardData.setData('text/plain', fakecb.clipboardData.json);
			//e.clipboardData.setData('text/html', '<b>Hello, world!</b>');
			e.preventDefault();
		}
	}

	this.copy = function () {
		document.execCommand('copy');
	};

	this.paste = function () {
		onpaste();
	};

	// при готовности снапшота, помещаем результат в буфер обмена
	$p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
		if(scheme == _editor.project && attr.clipboard){
			attr.callback(scheme);
		}
	});

	document.addEventListener('copy', oncopy);

	document.addEventListener('paste', onpaste);
}
