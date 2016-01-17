/**
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  glob_pricing
 */

$p.modifiers.push(
	function($p){

		$p.pricing = new Pricing($p);


		function Pricing($p){

			/**
			 * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
			 * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
			 * @method nom_price
			 * @param nom
			 * @param characteristic
			 * @param price_type
			 * @param prm
			 * @param row
			 * @param cache
			 */
			this.nom_price = function (nom, characteristic, price_type, prm, row, cache) {

			};

			/**
			 * Возвращает структуру типов цен и КМарж
			 * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
			 * @method price_type
			 * @param prm
			 */
			this.price_type = function (prm) {

			};

			/**
			 * Формирует кеш цен номенклатуры по типу на дату
			 * Аналог УПзП-шного __СформироватьКешЦен__
			 * @param anom
			 * @param price_type
			 * @param date
			 * @param cache
			 */
			this.build_cache = function (anom, price_type, date, cache) {

			};

			/**
			 * Рассчитывает плановую себестоимость строки документа Расчет
			 * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
			 * @param prm
			 * @param cancel
			 */
			this.calc_first_cost = function (prm, cancel) {

			};

			/**
			 * Рассчитывает стоимость продажи в строке документа Расчет
			 * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
			 * @param prm
			 * @param cancel
			 */
			this.calc_amount = function (prm, cancel) {

			}
		}

	}
);
