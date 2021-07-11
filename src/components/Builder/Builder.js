import React from 'react';
import {render} from 'react-dom';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import {withIface} from 'metadata-redux';

import {Prompt} from 'react-router-dom';
import ToolWnd from './ToolWnds/ToolWnd';

class Builder extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers} = this;
    this._editor = new $p.Editor(cell, handlers);
    render(<ToolWnd editor={this._editor}/>, this._editor._acc._tool.cell);
  }

  componentWillUnmount() {
    const {cell, _editor} = this;
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
    if(!this._editor || !this._editor.project || loc.pathname.match(/\/templates/)) {
      return true;
    }
    const {ox} = this._editor.project;
    return ox && ox._modified ? `Изделие ${ox.prod_name(true)} изменено.\n\nЗакрыть без сохранения?` : true;
  }

  render() {
    const {dialog} = this.props;
    const Dialog = dialog && dialog.ref && dialog.Component;

    return <div>
      <Prompt when message={this.prompt} />
      <div ref={el => this.el = el}/>
      {Dialog && <Dialog handlers={this.handlers} dialog={dialog} owner={this} />}
    </div>;
  }

}

Builder.rname = 'Builder';

export default WindowSizer(withIface(Builder));


