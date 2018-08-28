/**
 *
 *
 * @module invisible
 *
 * Created by Evgeniy Malyarov on 04.04.2018.
 */

class EditorInvisible extends paper.PaperScope {

  constructor() {

    super();

    /**
     * fake-undo
     * @private
     */
    this._undo = {
      clear() {},
      save_snapshot() {},
    };

    /**
     * Собственный излучатель событий для уменьшения утечек памяти
     */
    this.eve = new (Object.getPrototypeOf($p.md.constructor))();

    consts.tune_paper(this.settings);
  }

  /**
   * Возвращает элемент по номеру
   * @param num
   */
  elm(num) {
    return this.project.getItem({class: BuilderElement, elm: num});
  }

  /**
   * Заглушка установки заголовка редактора
   */
  set_text() {
  }

  /**
   * Создаёт проект с заданным типом канваса
   * @param format
   */
  create_scheme() {
    if(!this._canvas) {
      this._canvas = document.createElement('CANVAS');
      this._canvas.height = 480;
      this._canvas.width = 480;
      this.setup(this._canvas);
    }
    if(this.projects.lengrh && !(this.projects[0] instanceof Scheme)) {
      this.projects[0].remove();
    }
    return new Scheme(this._canvas, this, true);
  }

  unload() {
    this.eve.removeAllListeners();
    const arr = this.projects.concat(this.tools);
    while (arr.length) {
      const elm = arr[0];
      if(elm.unload) {
        elm.unload();
      }
      else if(elm.remove) {
        elm.remove();
      }
      arr.splice(0, 1);
    }
    for(let i in EditorInvisible._scopes) {
      if(EditorInvisible._scopes[i] === this) {
        delete EditorInvisible._scopes[i];
      }
    }
  }

  static draw_scheme(ox) {

  }
}

/**
 * Экспортируем конструктор EditorInvisible, чтобы экземпляры построителя можно было создать снаружи
 * @property EditorInvisible
 * @for MetaEngine
 * @type function
 */
$p.EditorInvisible = EditorInvisible;
