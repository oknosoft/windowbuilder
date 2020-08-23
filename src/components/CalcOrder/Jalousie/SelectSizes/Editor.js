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

const decorate_layers = (project) => {
  const {activeLayer} = project;
  project.getItems({class: $p.EditorInvisible.Contour}).forEach((layer) => {
    layer.opacity = (layer === activeLayer) ? 1 : 0.5;
  });
};

export default class Editor extends React.Component {

  createEditor(el, width, height){
    if(el) {
      if(this.editor && this.editor._canvas === el) {
        this.editor.project.resize_canvas(width, height);
      }
      else {
        const {sz_product} = this.props;
        const editor = this.editor = new $p.EditorInvisible();
        editor._canvas = el;
        editor.create_scheme();
        const {project} = editor;
        project.load(sz_product, {custom_lines: false, mosquito: false /*, visualization: false */});
        editor.tool = new editor.Tool();
        editor.tool.onMouseDown = (event) => {
          if(event.item && event.item.layer) {
            event.item.layer.activate();
            decorate_layers(project);
            this.props.setSizes(event.item.layer.bounds);
            this.forceUpdate();
          }
        };
        project.l_dimensions.activate();
        decorate_layers(project);
      }
    }
  }

  componentWillUnmount() {
    if(this.editor) {
      this.editor.unload();
    }
  }

  render() {
    const {editor, props: {dp}} = this;

    let note;
    if(editor) {
      const {height, len} = dp;
      if(height && len) {
        note = `${len.toFixed()} x ${height.toFixed()}`;
      }
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

Editor.propTypes = {
  dp: PropTypes.object.isRequired,
  sz_product: PropTypes.object.isRequired,
  setSizes: PropTypes.func.isRequired,
};
