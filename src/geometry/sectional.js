/**
 * ### Разрез
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule sectional
 */

/**
 * Вид в разрезе. например, водоотливы
 * @param arg {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Sectional(arg){
	Sectional.superclass.constructor.call(this, arg);
}
Sectional._extend(BuilderElement);
