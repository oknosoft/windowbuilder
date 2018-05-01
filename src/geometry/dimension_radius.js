/**
 * ### Размерная линия радиуса
 *
 * @module dimension_radius
 *
 * Created by Evgeniy Malyarov on 01.05.2018.
 */

class DimensionRadius extends DimensionLineCustom {

  /**
   * Возвращает тип элемента (размерная линия радиуса)
   */
  get elm_type() {
    return $p.enm.elm_types.Радиус;
  }

}
