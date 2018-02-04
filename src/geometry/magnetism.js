/**
 * Варианты притягивания узлов
 * @module magnetism
 *
 * Created by Evgeniy Malyarov on 04.02.2018.
 */

class Magnetism {

  constructor(scheme) {
    this.scheme = scheme;
  }

  /**
   * Возвращает единственный выделенный узел
   */
  get selected() {
    const {profiles} = this.scheme.activeLayer;
    const selected = {profiles};
    for(const {generatrix} of profiles) {
      if(generatrix.firstSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'b';
      };
      if(generatrix.lastSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'e';
      };
    }
    return selected;
  }

  m1() {
    console.log('m1');
  }

}
