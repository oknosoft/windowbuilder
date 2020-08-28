/**
 * Обработчик команд деформации изделия
 */
class Deformer {

  constructor(editor) {
    this.editor = editor;
    const {constructor: {BuilderElement}, project} = editor;
    this.elm = (elm) => project.getItem({class: BuilderElement, elm});
  }

  get history() {
    return this.editor._undo;
  }

  get mover() {
    return this.editor._mover;
  }

  get project() {
    return this.editor.project;
  }

  /**
   * Выделяет элемент или узел
   */
  select(items) {
    const {project, editor} = this;
    let deselect;
    for(const {elm, node, shift} of items) {
      const item = this.elm(elm);
      if(item) {
        if(node) {
          item.generatrix[node === 'b' ? 'firstSegment' : 'lastSegment'].selected = true;
          //item[node].selected = true;
        }
        else {
          deselect = true;
          item.selected = true;
          if(item.layer){
            editor.eve.emit_async('layer_activated', item.layer);
            editor.eve.emit_async('elm_activated', item, shift);
          }
        }
      }
    }
    deselect && project.deselect_all_points();
  }

  /**
   * Снимант выделение элемента или узла
   */
  deselect(items) {
    const {project, editor} = this;
    if(!items || !items.length || items.some(({elm}) => !elm)) {
      project.deselectAll();
      return editor.eve.emit('elm_deactivated', null);
    }
    for(const {elm, node} of items) {
      const item = this.elm(elm);
      if(item) {
        if(node) {
          item.generatrix[node === 'b' ? 'firstSegment' : 'lastSegment'].selected = false;
        }
        else {
          item.selected = false;
        }
      }
    }
  }

  /**
   * Смещает выделенные объекты
   */
  move(delta) {
    const {project, editor: {Point}} = this;
    project.move_points(new Point(delta));
  }

  /**
   * Объединяет вершины
   */
  merge() {

  }

  /**
   * Отрывает вершину из узла
   */
  separate() {

  }

  /**
   * Делит профиль на два
   */
  split() {

  }

  /**
   * Добавляет элемент, слой или вложенную вставку
   */
  add() {

  }

  /**
   * Удаляет элемент, слой или вложенную вставку
   */
  remove() {

  }

  /**
   * Устанавливает свойства элемента, слоя, вложенной вставки или изделия
   */
  prop() {

  }


}
