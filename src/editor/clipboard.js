/**
 * Работа с буфером обмена
 * @author Evgeniy Malyarov
 * @module clipboard
 */

/**
 * Объект для прослушивания и обработки событий буфера обмена
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
		var _scheme = _editor.project;
		if(!_scheme.ox.empty()){
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

	document.addEventListener('copy', oncopy);

	document.addEventListener('paste', onpaste);
}