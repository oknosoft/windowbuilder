/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  glob_spec_building
 */

$p.modifiers.push(
	function($p){

		$p.spec_building = new SpecBuilding($p);

		function SpecBuilding($p){

			/**
			 * Рассчитывает спецификацию в строке документа Расчет
			 * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
			 * @param prm
			 * @param cancel
			 */
			this.calc_row_spec = function (prm, cancel) {

			}

		}

	}
);


