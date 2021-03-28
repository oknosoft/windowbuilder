/**
 * Ввод и редактирование произвольного текста
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author    Evgeniy Malyarov
 * @module  tool_text
 */

import TextWnd from '../../components/Builder/ToolWnds/TextWnd';

export default function text (Editor) {

  const {ToolElement, FreeText, Sectional} = Editor;
  const {Point, TextItem, PointText} = Object.getPrototypeOf(Editor).prototype;

  /**
   * ### Произвольный текст
   *
   * @class ToolText
   * @extends ToolElement
   * @constructor
   * @menuorder 60
   * @tooltip Добавление текста
   */
  Editor.ToolText = class ToolText extends ToolElement {

    constructor() {
      super();
      Object.assign(this, {
        options: {name: 'text'},
        ToolWnd: TextWnd,
        mouseStartPos: new Point(),
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

        mousedown: this.mousedown,

        mouseup: this.mouseup,

        mousedrag: this.mousedrag,

        mousemove: this.hitTest,

        keydown: this.keydown,

      });
    }

    hitTest(event) {
      const hitSize = 6;
      const {project} = this;

      // хит над текстом обрабатываем особо
      this.hitItem = project.hitTest(event.point, {class: TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize});
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
        if(this.hitItem.item instanceof PointText) {
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

    mousedown(event) {
      this.changed = false;

      this.project.deselectAll();
      this.mouseStartPos = event.point.clone();

      if(this.hitItem) {

        if(this.hitItem.item instanceof PointText) {
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

      }
      else {
        this.text = null;
      }
      this.eve.emit_async('tool_activated', this);

    }

    mouseup() {
      this._scope.canvas_cursor('cursor-arrow-lay');
    }

    mousedrag(event) {

      if (this.text) {
        let delta = event.point.subtract(this.mouseStartPos);
        if(event.modifiers.shift) {
          delta = delta.snap_to_angle();
        }
        this.text.move_points(this.textStartPos.add(delta));
      }
    }

    keydown(event) {

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

  };
}


