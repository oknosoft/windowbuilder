/**
 *
 *
 * @module Tool
 *
 * Created by Evgeniy Malyarov on 30.11.2021.
 */

export function decorate(editor, items){
  for(const elm of items) {
    const glass = editor.elm(elm);
    if(glass) {
      glass.selected = true;
    }
  }
  for(const glass of editor.project.glasses) {
    glass.onMouseEnter = glass_mouse_enter;
    glass.onMouseLeave = glass_mouse_leave;
    decorate_select(glass);
  }
}

function decorate_profiles({project, constructor}){
  for(const profile of project.getItems({class: constructor.ProfileItem})) {
    profile.opacity = 0.2;
  }
}

function decorate_select(glass){
  glass.path.strokeColor = glass.selected ? 'blue' : 'grey';
  glass.path.strokeWidth = glass.selected ? 20 : 0;
}

function glass_mouse_enter(event){
  this.path.strokeWidth = this.selected ? 20 : 10;
  this.path.dashArray = [40, 20];
}

function glass_mouse_leave(event){
  this.path.strokeWidth = this.selected ? 20 : 0;
  this.path.dashArray = [];
}

export function tool(editor, setSelect) {

  class SelectGlass extends editor.Tool {

    onMouseMove = (event) => {
      event.stop();
    };

    onMouseDown = (event) => {
      if(event.item instanceof editor.constructor.Filling) {
        event.item.selected = !event.item.selected;
        decorate_select(event.item);
        setSelect(event.item.elm);
      }
      event.stop();
    };
  }

  editor.tool = new SelectGlass();
  decorate_profiles(editor);
}
