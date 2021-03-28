/**
 * Рисовалка react
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 23.05.2018.
 */

import paper from 'paper/dist/paper-core';
import drawer from 'wb-core/dist/drawer';
import tools from './tools';
import align from './align';
import StableZoom from './StableZoom';
import Deformer from './Deformer';
import Mover from './Mover';

export default function ($p) {

  // формируем в $p конструктор стандартной рисовалки
  drawer({$p, paper});

  const {EditorInvisible} = $p;
  class Editor extends EditorInvisible {

    constructor(canvas) {
      super();
      this._canvas = canvas;
      new EditorInvisible.Scheme(this._canvas, this, typeof window === 'undefined');

      this._stable_zoom = new StableZoom(this);
      this._deformer = new Deformer(this);
      this._mover = new Mover(this);

      this.project._use_skeleton = true;
      this.project._dp.value_change = this.dp_value_change.bind(this);
      this._recalc_timer = 0;

      this.eve.on('coordinates_calculated', this.coordinates_calculated);
      this._canvas.addEventListener('touchstart', this.canvas_touchstart, false);
      this._canvas.addEventListener('mousewheel', this._stable_zoom.mousewheel, false);
    }

    coordinates_calculated = () => {
      const {ox, _dp} = this.project;
      _dp._data._silent = true;
      _dp.len = ox.x;
      _dp.height = ox.y;
      _dp._data._silent = false;
    };

    canvas_touchstart = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const touch = evt.touches.length && evt.touches[0];
      const {view, tool} = this;
      let {element} = view;
      const offsets = {x: element.offsetLeft, y: element.offsetTop};
      while (element.offsetParent) {
        element = element.offsetParent;
        offsets.x += element.offsetLeft;
        offsets.y += element.offsetTop;
      }
      const point = view.viewToProject([touch.pageX - offsets.x, touch.pageY - offsets.y]);
      const event = {point, modifiers: {}};
      tool.hitTest(event);
      tool.mousedown(event);
    };

    deffered_recalc() {
      const {project} = this;
      clearTimeout(this._recalc_timer);
      project.register_change(true);
      this._recalc_timer = setTimeout(() => {
        project.zoom_fit();
        project.save_coordinates({});
      }, 500);
    }

    dp_value_change(field, type, value) {
      const {project} = this;
      if(project._attr._loading || project._dp._data._silent) {
        return;
      }
      let redraw;
      if(field === 'len') {
        const {bottom} = project.l_dimensions;
        const x = parseFloat(value).round(-1);
        if(x > 300 && x < 3000 && bottom.size != x) {
          bottom._move_points({name: 'right', size: x}, 'x');
          redraw = true;
        }
      }
      else if(field === 'height') {
        const {right} = project.l_dimensions;
        const y = parseFloat(value).round(-1);
        if(y > 300 && y < 3000 && right.size != y) {
          right._move_points({name: 'top', size: y}, 'y');
          redraw = true;
        }
      }
      if(redraw) {
        this.deffered_recalc();
      }
    }

    /**
     * Надевает шаблон на текущее изделие
     * @param base_block {cat.characteristics}
     * @param template {cat.templates}
     */
    apply_template(base_block, template) {
      base_block = template;
    }

    purge_selection(){
      this.project.selectedItems
        .filter((path) => path.parent instanceof EditorInvisible.ProfileItem && path != path.parent.generatrix)
        .forEach((selected) => selected.selected = false);
    }

    // Returns serialized contents of selected items.
    capture_selection_state() {

      const originalContent = [];

      this.project.selectedItems.forEach((item) => {
        if (item instanceof paper.Path && !item.guide){
          originalContent.push({
            id: item.id,
            json: item.exportJSON({asString: false}),
            selectedSegments: []
          });
        }
      });

      return originalContent;
    }

    // Restore the state of selected items.
    restore_selection_state(originalContent) {
      originalContent.forEach((orig) => {
        const item = this.project.getItem({id: orig.id});
        if (item){
          // HACK: paper does not retain item IDs after importJSON,
          // store the ID here, and restore after deserialization.
          const id = item.id;
          item.importJSON(orig.json);
          item._id = id;
        }
      });
    }

    /**
     * Create pixel perfect dotted rectable for drag selections
     * @param p1
     * @param p2
     * @return {paper.CompoundPath}
     */
    drag_rect(p1, p2) {
      const {view} = this;
      const half = new paper.Point(0.5 / view.zoom, 0.5 / view.zoom);
      const start = p1.add(half);
      const end = p2.add(half);
      const rect = new paper.CompoundPath();

      rect.moveTo(start);
      rect.lineTo(new paper.Point(start.x, end.y));
      rect.lineTo(end);
      rect.moveTo(start);
      rect.lineTo(new paper.Point(end.x, start.y));
      rect.lineTo(end);
      rect.strokeColor = 'black';
      rect.strokeWidth = 1.0 / view.zoom;
      rect.dashOffset = 0.5 / view.zoom;
      rect.dashArray = [1.0 / view.zoom, 1.0 / view.zoom];
      rect.removeOn({
        drag: true,
        up: true
      });
      rect.guide = true;
      return rect;
    }

    fragment_spec(elm, name) {
      const {ui: {dialogs}, cat: {characteristics}} = $p;
      if(elm) {
        return dialogs.alert({
          timeout: 0,
          title: `Спецификация ${elm >= 0 ? 'элемента' : 'слоя'} №${Math.abs(elm)} (${name})`,
          Component: characteristics.SpecFragment,
          props: {_obj: this.project.ox, elm},
          initFullScreen: true,
          hide_btn: true,
          noSpace: true,
        });
      }
      dialogs.alert({text: 'Элемент не выбран', title: $p.msg.main_title});
    }

    unload() {
      this.project._dp._manager.off('update');
      this._canvas.removeEventListener("touchstart", this.canvas_touchstart);
      this._canvas.removeEventListener('mousewheel', this._stable_zoom.mousewheel);
      super.unload();
      clearTimeout(this._recalc_timer);
    }

  }
  $p.Editor = Editor;

  if(typeof window !== 'undefined') {
    tools(Editor, $p);
    align(Editor, $p);
  }
}
