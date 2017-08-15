import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import withIface from '../../redux/withIface';

import {Prompt} from 'react-router-dom';

class Builder extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers} = this;
    this._editor = new $p.Editor(cell, handlers);
  }

  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    const {cell, _editor} = this;
    if(_editor){
      _editor.unload();
      delete this._editor;
    }
    cell.detachObject(true);
    super.componentWillUnmount();
  }

  /**
   * проверка, можно ли покидать страницу
   * @param loc
   * @return {*}
   */
  prompt(loc) {
    return this._editor.prompt(loc);
  }

  render() {
    return <div>
      <Prompt when message={this.prompt.bind(this)} />
      <div ref={el => this.el = el}/>
    </div>;
  }

}

export default WindowSizer(withIface(Builder));


