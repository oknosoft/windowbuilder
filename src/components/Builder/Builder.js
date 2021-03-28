// @flow

import React from 'react';
import PropTypes from 'prop-types';
import {prm} from '../../metadata/common/events'

export default class Builder extends React.Component {

  componentWillUnmount() {
    if(this.editor) {
      this.editor.unload();
      this.props.registerChild(this.editor = null);
      window.paper = null;

    }
  }

  createEditor(el){
    if(el) {
      if(this.editor && this.editor._canvas === el) {
        const {project} = this.editor;
        //project.resize_canvas(width, height);
      }
      else {
        const editor = this.editor = new $p.Editor(el);
        window.paper = editor;
        editor.create_tools();
        const {project} = editor;

        const {order, action} = prm();
        project.load(this.props.match.params.ref)
          .then(() => {
            const {ox} = project;
            if(ox.is_new() || (order && ox.calc_order != order)) {
              ox.calc_order = order;
            }
            if(ox.calc_order.is_new()) {
              return ox.calc_order.load();
            }
          })
          .then(() => {
            const {ox} = project;
            if(!ox.calc_order.production.find(ox.ref, 'characteristic')) {
              const row = ox.calc_order.production.add({characteristic: ox});
              ox.product = row.row;
            }
            if(action === 'refill' || action === 'new') {
              const {base_block} = $p.cat.templates._select_template;
              if(ox.base_block != base_block && !base_block.empty()) {
                return project.load_stamp(base_block);
              }
            }
          })
          // .then(() => props.handleIfaceState({
          //   component: '',
          //   name: 'title',
          //   value: project.ox.prod_name(true),
          // }))
          .catch(console.log);
      }
    }
    this.editor && this.props.registerChild(this.editor);
  }

  arrowClick = (btn) => () => {
    if(this.editor && this.editor.tool) {
      this.editor.tool.emit('keydown', {
        key: btn,
        modifiers: {}
      });
    }
  };

  render() {
    const {classes} = this.props;
    return <canvas
      className={classes.canvas}
      ref={(el) => this.createEditor(el)}
    />;
  }
}

Builder.propTypes = {
  registerChild: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};
