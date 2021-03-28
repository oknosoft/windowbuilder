export default class StableZoom {

  constructor(editor) {
    this.editor = editor;
  }

  mousewheel = (evt) => {
    const {view, Point} = this.editor;
    if (evt.shiftKey || evt.altKey) {
      if(evt.shiftKey && !evt.deltaX){
        view.center = this.changeCenter(view.center, evt.deltaY, 0, 1);
      }
      else{
        view.center = this.changeCenter(view.center, evt.deltaX, evt.deltaY, 1);
      }
      return evt.preventDefault();
    }
    else if (evt.ctrlKey) {
      const mousePosition = new Point(evt.offsetX, evt.offsetY);
      const viewPosition = view.viewToProject(mousePosition);
      const _ref1 = this.changeZoom(view.zoom, evt.deltaY, view.center, viewPosition);
      view.zoom = _ref1[0];
      view.center = view.center.add(_ref1[1]);
      evt.preventDefault();
      return view.draw();
    }
  };

  changeZoom(oldZoom, delta, c, p) {
    const factor = 1.05;
    const newZoom = delta ? (delta < 0 ? oldZoom * factor : oldZoom / factor) : oldZoom;
    const beta = oldZoom / newZoom;
    const pc = p.subtract(c);
    return [newZoom, p.subtract(pc.multiply(beta)).subtract(c)];
  }

  changeCenter(oldCenter, deltaX, deltaY, factor) {
    const offset = new this.editor.Point(deltaX, -deltaY);
    return oldCenter.add(offset.multiply(factor));
  }

}
