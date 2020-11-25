/**
 * Редактор каркаса витража
 *
 * @module tool_vitrazh
 *
 * Created by Evgeniy Malyarov on 21.11.2020.
 */

import ToolWnd from '../../components/Builder/ToolWnds/VitrazhWnd';

export default function tool_stulp_flap ({Editor, classes: {BaseDataObj}, dp: {builder_pen}, cat: {characteristics}, utils, ui: {dialogs}}) {

  const {ToolElement, Filling, Profile} = Editor;
  const {Path} = Object.getPrototypeOf(Editor).prototype;

  class ToolVitrazh extends ToolElement {

  }

  ToolVitrazh.ToolWnd = ToolWnd;
  Editor.ToolVitrazh = ToolVitrazh;
}
