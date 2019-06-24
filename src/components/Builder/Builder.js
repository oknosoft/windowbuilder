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
    const {cell, _editor, handlers} = this;
    if(_editor){
      const {ox} = _editor.project;
      const {calc_order} = ox;
      _editor.unload();
      if($p.ui.idle) {
        _editor.close(ox, calc_order);
      }
      delete this._editor;

      // если закрыли без сохранения характеристики - восстанавливаем заказ из базы
      if(ox._modified && calc_order._modified) {
        calc_order._data._reload = true;
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
    if(!this._editor || !this._editor.project) {
      return true;
    }
    const {ox} = this._editor.project;
    return ox && ox._modified ? `Изделие ${ox.prod_name(true)} изменено.\n\nЗакрыть без сохранения?` : true;
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


