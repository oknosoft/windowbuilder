/**
 *
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 16.06.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {tool, decorate} from './Tool';

export default class Editor extends React.Component {

  createEditor(el, width, height){
    if(el) {
      if(this.editor && this.editor._canvas === el) {
        this.editor.project.resize_canvas(width, height);
      }
      else {
        const {ox, value, setSelect} = this.props;
        const editor = this.editor = new $p.EditorInvisible();
        editor._canvas = el;
        editor.create_scheme();
        const {project} = editor;
        project.load(ox, {auto_lines: false, custom_lines: false, mosquito: false, visualization: false})
          .then(() => decorate(editor, value));
        tool(editor, setSelect);
      }
    }
  }

  componentWillUnmount() {
    if(this.editor) {
      this.editor.unload();
    }
  }

  render() {
    return <canvas
      key="canvas"
      ref={(el) => this.createEditor(el, 620, 380)}
      width={620}
      height={380}
    />;
  }
}

Editor.propTypes = {
  ox: PropTypes.object.isRequired,
  value: PropTypes.array.isRequired,
  setSelect: PropTypes.func.isRequired,
};
