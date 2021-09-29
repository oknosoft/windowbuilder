
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
    super();
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
    });

    this.on({

      activate() {
        this.on_activate('cursor-text-select');
      },

      deactivate() {
        this._scope.hide_selection_bounds();
      },

      mousedown({point}) {
        this.text = null;
        this.changed = false;

        this.project.deselectAll();
        this.mouseStartPos = point.clone();

        if(this.hitItem) {

          if(this.hitItem.item instanceof Editor.FreeText) {
            this.text = this.hitItem.item;
            this.text.selected = true;

          }
          else {
            this.text = new Editor.FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }
          this.textStartPos = this.text.point;
        }

        this.eve.emit_async('tool_activated', this);
      },

      mouseup() {

        if (this.mode && this.changed) {
          //undo.snapshot("Move Shapes");
        }

        this._scope.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag({point, modifiers}) {

        if (this.text) {
          let delta = point.subtract(this.mouseStartPos);
          if(modifiers.shift) {
            delta = delta.snap_to_angle();
          }
          this.text.move_points(this.textStartPos.add(delta));
        }
      },

      mousemove: this.hitTest,

      keydown({event}) {
        const {code, target} = event;

        if (['Delete','NumpadSubtract','Backspace'].includes(code)) {

          if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
            return;
          }

          for (const text of  this.project.selectedItems) {
            if(text instanceof Editor.FreeText){
              text.remove();
              this.text = null;
              this.eve.emit_async('tool_activated', this);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    });
  }

  hitTest({point}) {
    const hitSize = 6;
    const {project} = this;

    // хит над текстом обрабатываем особо
    this.hitItem = project.hitTest(point, {class: Editor.FreeText, bounds: true, fill: true, stroke: true, tolerance: hitSize});
    if(!this.hitItem) {
      this.hitItem = project.hitTest(point, {fill: true, stroke: false, tolerance: hitSize});
    }
    if(!this.hitItem) {
      const hit = project.hitTest(point, {fill: false, stroke: true, tolerance: hitSize});
      if(hit && hit.item.parent instanceof Editor.Sectional) {
        this.hitItem = hit;
      }
    }

    if(this.hitItem) {
      if(this.hitItem.item instanceof Editor.FreeText) {
        this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
      }
      else if(this.hitItem.item instanceof paper.PointText) {
        this.hitItem = null;
        this._scope.canvas_cursor('cursor-text-select');  // указатель с вопросом
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

Editor.ToolText = ToolText;
