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
    const _canvas = document.createElement('CANVAS');
    _canvas.height = 480;
    _canvas.width = 480;
    this.setup(_canvas);
    new Scheme(_canvas, this, true);
    if(!(this.projects[0] instanceof Scheme)) {
      this.projects[0].remove();
    }
  }

}

/**
 * Экспортируем конструктор EditorInvisible, чтобы экземпляры построителя можно было создать снаружи
 * @property EditorInvisible
 * @for MetaEngine
 * @type function
 */
$p.EditorInvisible = EditorInvisible;
