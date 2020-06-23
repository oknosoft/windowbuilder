/**
 *
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 16.06.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

export default class Editor extends React.Component {

  createEditor(el, width, height){
    if(el) {
      if(this.editor && this.editor._canvas === el) {
        this.editor.project.resize_canvas(width, height);
      }
      else {
        const {sz_product} = this.props;
        this.editor = new $p.EditorInvisible();
        this.editor._canvas = el;
        this.editor.create_scheme();
        this.editor.project.load(sz_product, {custom_lines: false, mosquito: false /*, visualization: false */})
      }
    }
  }

  componentWillUnmount() {
    if(this.editor) {
      this.editor.unload();
    }
  }

  render() {
    const {editor} = this;

    let note;
    if(editor) {
      const {width, height} = editor.project.activeLayer.bounds;
      note = `${width.toFixed()} x ${height.toFixed()}`;
    }
    return <AutoSizer>
      {({width, height}) => {
        if(width < 400) {
          width = 400;
        }
        else {
          width -= 4;
        }
        if(height < 300) {
          height = 300;
        }
        else {
          height -= 4;
        }
        if(note) {
          height -= 32;
        }
        return [
          <canvas
            key="canvas"
            ref={(el) => this.createEditor(el, width, height)}
            width={width}
            height={height}
          />,
          note && <div key="note" style={{height: 32}}>
            <div style={{
              color: '#900',
              width,
              bottom: 4,
              paddingLeft: 8,
              fontSize: 'large',
              position: 'absolute',
            }}>{note}</div>
          </div>,
        ];
      }}
    </AutoSizer>;
  }
}

// Editor.propTypes = {
//   registerChild: PropTypes.func.isRequired,
// };
