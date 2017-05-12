/**
 * ### Вспомогательные классы для формирования размерных линий
 *
 * Created by Evgeniy Malyarov on 12.05.2017.
 *
 * @module geometry
 * @submodule dimension_drawer
 */

class DimensionGroup {

  clear(){
    for(let key in this){
      this[key].removeChildren();
      this[key].remove();
      delete this[key];
    }
  }

  has_size(size) {
    for(let key in this){
      const {path} = this[key];
      if(path && Math.abs(path.length - size) < 1){
        return true;
      }
    }
  }

}

/**
 * ### Служебный слой размерных линий
 * Унаследован от [paper.Layer](http://paperjs.org/reference/layer/)
 *
 * @class DimensionLayer
 * @extends paper.Layer
 * @param attr
 * @constructor
 */
class DimensionLayer extends paper.Layer {

  get bounds() {
    return this.project.bounds;
  }

  get owner_bounds() {
    return this.bounds;
  }

  get dimension_bounds() {
    return this.project.dimension_bounds;
  }

}

/**
 * ### Построитель авторазмерных линий
 *
 * @class DimensionDrawer
 * @extends paper.Group
 * @param attr
 * @param attr.parent - {paper.Item}, родитель должен иметь свойства profiles_by_side(), is_pos(), profiles, imposts
 * @constructor
 */
class DimensionDrawer extends paper.Group {

  constructor(attr) {
    super(attr);
    this.bringToFront();
  }

  /**
   * ### Стирает размерные линии
   *
   * @method clear
   */
  clear() {

    this.ihor && this.ihor.clear();
    this.ivert && this.ivert.clear();

    for(let pos of ['bottom','top','right','left']){
      if(this[pos]){
        this[pos].removeChildren();
        this[pos].remove();
        this[pos] = null;
      }
    }

    this.layer.parent && this.layer.parent.l_dimensions.clear();
  }

  /**
   * формирует авторазмерные линии
   */
  redraw(forse) {

    const {parent} = this;
    const {contours, bounds} = parent;

    if(forse){
      this.clear();
    }

    // сначала, перерисовываем размерные линии вложенных контуров, чтобы получить отступы
    for(let chld of parent.contours){
      chld.l_dimensions.redraw();
    }

    // для внешних контуров строим авторазмерные линии
    if(!parent.parent || forse){

      const by_side = parent.profiles_by_side();

      // сначала, строим размерные линии импостов

      // получаем все профили контура, делим их на вертикальные и горизонтальные
      const ihor = [
        {
          point: bounds.top.round(0),
          elm: by_side.top,
          p: by_side.top.b.y < by_side.top.e.y ? "b" : "e"
        },
        {
          point: bounds.bottom.round(0),
          elm: by_side.bottom,
          p: by_side.bottom.b.y < by_side.bottom.e.y ? "b" : "e"
        }];
      const ivert = [
        {
          point: bounds.left.round(0),
          elm: by_side.left,
          p: by_side.left.b.x > by_side.left.e.x ? "b" : "e"
        },
        {
          point: bounds.right.round(0),
          elm: by_side.right,
          p: by_side.right.b.x > by_side.right.e.x ? "b" : "e"
        }];

      // подмешиваем импосты вложенных контуров
      const profiles = new Set(parent.profiles);
      parent.imposts.forEach((elm) => !elm.layer.hidden && profiles.add(elm));

      for(let elm of profiles){

        // получаем точки начала и конца элемента
        const our = !elm.parent || elm.parent === parent;
        const eb = our ? (elm instanceof GlassSegment ? elm.sub_path.firstSegment.point : elm.b) : elm.rays.b.npoint;
        const ee = our ? (elm instanceof GlassSegment ? elm.sub_path.lastSegment.point : elm.e) : elm.rays.e.npoint;

        if(ihor.every((v) => v.point != eb.y.round(0))){
          ihor.push({
            point: eb.y.round(0),
            elm: elm,
            p: "b"
          });
        }
        if(ihor.every((v) => v.point != ee.y.round(0))){
          ihor.push({
            point: ee.y.round(0),
            elm: elm,
            p: "e"
          });
        }
        if(ivert.every((v) => v.point != eb.x.round(0))){
          ivert.push({
            point: eb.x.round(0),
            elm: elm,
            p: "b"
          });
        }
        if(ivert.every((v) => v.point != ee.x.round(0))){
          ivert.push({
            point: ee.x.round(0),
            elm: elm,
            p: "e"
          });
        }
      };

      // для ihor добавляем по вертикали
      if(ihor.length > 2){
        ihor.sort((a, b) => b.point - a.point);
        if(parent.is_pos("right")){
          this.by_imposts(ihor, this.ihor, "right");
        }
        else if(parent.is_pos("left")){
          this.by_imposts(ihor, this.ihor, "left");
        }
      }
      else{
        ihor.length = 0;
      }

      // для ivert добавляем по горизонтали
      if(ivert.length > 2){
        ivert.sort((a, b) => a.point - b.point);
        if(parent.is_pos("bottom")){
          this.by_imposts(ivert, this.ivert, "bottom");
        }
        else if(parent.is_pos("top")){
          this.by_imposts(ivert, this.ivert, "top");
        }
      }
      else{
        ivert.length = 0;
      }

      // далее - размерные линии контура
      this.by_contour(ihor, ivert, forse);

    }

    // перерисовываем размерные линии текущего контура
    for(let dl of this.children){
      dl.redraw && dl.redraw()
    }

  }

  /**
   * ### Формирует размерные линии импоста
   */
  by_imposts(arr, collection, pos) {
    const offset = (pos == "right" || pos == "bottom") ? -130 : 90;
    for(let i = 0; i < arr.length - 1; i++){
      if(!collection[i]){
        collection[i] = new DimensionLine({
          pos: pos,
          elm1: arr[i].elm,
          p1: arr[i].p,
          elm2: arr[i+1].elm,
          p2: arr[i+1].p,
          parent: this,
          offset: offset,
          impost: true
        });
      }
    }
  }

  /**
   * ### Формирует размерные линии контура
   */
  by_contour (ihor, ivert, forse) {

    const {project, parent} = this;
    const {bounds} = parent;


    if (project.contours.length > 1 || forse) {

      if(parent.is_pos("left") && !parent.is_pos("right") && project.bounds.height != bounds.height){
        if(!this.ihor.has_size(bounds.height)){
          if(!this.left){
            this.left = new DimensionLine({
              pos: "left",
              parent: this,
              offset: ihor.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else{
            this.left.offset = ihor.length > 2 ? 220 : 90;
          }
        }
      }
      else{
        if(this.left){
          this.left.remove();
          this.left = null;
        }
      }

      if(parent.is_pos("right") && (project.bounds.height != bounds.height || forse)){
        if(!this.ihor.has_size(bounds.height)){
          if(!this.right){
            this.right = new DimensionLine({
              pos: "right",
              parent: this,
              offset: ihor.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else{
            this.right.offset = ihor.length > 2 ? -260 : -130;
          }
        }
      }
      else{
        if(this.right){
          this.right.remove();
          this.right = null;
        }
      }

      if(parent.is_pos("top") && !parent.is_pos("bottom") && project.bounds.width != bounds.width){
        if(!this.ivert.has_size(bounds.width)){
          if(!this.top){
            this.top = new DimensionLine({
              pos: "top",
              parent: this,
              offset: ivert.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else{
            this.top.offset = ivert.length > 2 ? 220 : 90;
          }
        }
      }
      else{
        if(this.top){
          this.top.remove();
          this.top = null;
        }
      }

      if(parent.is_pos("bottom") && (project.bounds.width != bounds.width || forse)){
        if(!this.ivert.has_size(bounds.width)){
          if(!this.bottom){
            this.bottom = new DimensionLine({
              pos: "bottom",
              parent: this,
              offset: ivert.length > 2 ? -260 : -130,
              contour: true
            });
          }else{
            this.bottom.offset = ivert.length > 2 ? -260 : -130;
          }
        }
      }
      else{
        if(this.bottom){
          this.bottom.remove();
          this.bottom = null;
        }
      }

    }
  }

  get owner_bounds() {
    return this.parent.bounds;
  }

  get dimension_bounds() {
    return this.parent.dimension_bounds;
  }

  get ihor() {
    return this._ihor || (this._ihor = new DimensionGroup())
  }

  get ivert() {
    return this._ivert || (this._ivert = new DimensionGroup())
  }
}
