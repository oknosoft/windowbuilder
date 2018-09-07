/**
 * Ввод и редактирование произвольного текста
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author    Evgeniy Malyarov
 * @module  tool_text
 */

/**
 * ### Произвольный текст
 *
 * @class ToolText
 * @extends ToolElement
 * @constructor
 * @menuorder 60
 * @tooltip Добавление текста
 */
class ToolText extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {
        name: 'text',
        wnd: {
          caption: "Произвольный текст",
          width: 290,
          height: 290
        }
      },
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-text-select');
      },

      deactivate: function() {
        this._scope.hide_selection_bounds();
        this.detache_wnd();
      },

      mousedown: function(event) {
        this.text = null;
        this.changed = false;

        this.project.deselectAll();
        this.mouseStartPos = event.point.clone();

        if(this.hitItem) {

          if(this.hitItem.item instanceof paper.PointText) {
            this.text = this.hitItem.item;
            this.text.selected = true;

          }
          else {
            this.text = new FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }

          this.textStartPos = this.text.point;

          // включить диалог свойст текстового элемента
          if(!this.wnd || !this.wnd.elmnts) {
            $p.wsql.restore_options('editor', this.options);
            this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
            this._grid = this.wnd.attachHeadFields({
              obj: this.text
            });
          }
          else {
            this._grid.attach({obj: this.text});
          }

        }
        else {
          this.detache_wnd();
        }

      },

      mouseup: function(event) {

        if (this.mode && this.changed) {
          //undo.snapshot("Move Shapes");
        }

        this._scope.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag: function(event) {

        if (this.text) {
          var delta = event.point.subtract(this.mouseStartPos);
          if (event.modifiers.shift)
            delta = delta.snap_to_angle();

          this.text.move_points(this.textStartPos.add(delta));

        }

      },

      mousemove: this.hitTest,

      keydown: function(event) {

        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1){
            return;
          }

          for (const text of  this.project.selectedItems) {
            if(text instanceof FreeText){
              text.text = "";
              setTimeout(() => this._scope.view.update(), 100);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    })

  }

  hitTest(event) {
    const hitSize = 6;
    const {project} = this;

    // хит над текстом обрабатываем особо
    this.hitItem = project.hitTest(event.point, {class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize});
    if(!this.hitItem) {
      this.hitItem = project.hitTest(event.point, {fill: true, stroke: false, tolerance: hitSize});
    }
    if(!this.hitItem) {
      const hit = project.hitTest(event.point, {fill: false, stroke: true, tolerance: hitSize});
      if(hit && hit.item.parent instanceof Sectional) {
        this.hitItem = hit;
      }
    }

    if(this.hitItem) {
      if(this.hitItem.item instanceof paper.PointText) {
        this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
      }
      else {
        this._scope.canvas_cursor('cursor-text-add'); // указатель с серым Т
      }
    }
    else {
      this._scope.canvas_cursor('cursor-text-select');  // указатель с вопросом
    }

    return true;
  }

}

