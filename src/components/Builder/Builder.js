import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';
import withIface from '../../redux/withIface';

class Builder extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers} = this;
    this._editor = new $p.Editor(cell, {
      set_text(title) {
        handlers.handleIfaceState({
          component: '',
          name: 'title',
          value: title,
        });
      }
    }, handlers);
  }

  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    if(this._editor && this._editor.unload){
      this._editor.unload();
      delete this._editor;
    }
    super.componentWillUnmount();
  }

}

export default WindowSizer(withIface(Builder));


