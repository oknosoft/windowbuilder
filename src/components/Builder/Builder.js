import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import {withIface} from 'metadata-redux';

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
      const {ox} = _editor.project;
      _editor.unload();
      delete this._editor;

      // если закрыли без сохранения характеристики - восстанавливаем заказ из базы
      if(ox._modified && ox.calc_order._modified) {
        ox.calc_order._data._reload = true;
      }
    }
    cell.detachObject(true);
    super.componentWillUnmount();
  }

  /**
   * проверка, можно ли покидать страницу
   * @param loc
   * @return {*}
   */
  prompt = (loc) => {
    return this._editor.prompt(loc);
  }

  render() {
    return <div>
      <Prompt when message={this.prompt} />
      <div ref={el => this.el = el}/>
    </div>;
  }

}

Builder.rname = 'Builder';

export default WindowSizer(withIface(Builder));


