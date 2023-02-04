import React from 'react';
import ReactDOM from 'react-dom/client';
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
    this._editor.eve.on('unload', () => {
      const {_root} = this;
      if(_root) {
        _root.unmount();
        this._root = null;
      }
    });
    const {_acc} = this._editor;
    _acc.tabbar.attachEvent('onSelect', (tab, lastTab) => {
      if(tab !== lastTab) {
        this.createRoot({tab, cell: _acc.tabbar.cells(tab).cell.firstChild});
      }
      return true;
    });
    const tab = _acc.tabbar.getActiveTab();
    this.createRoot({tab, cell: _acc.tabbar.cells(tab).cell.firstChild});
  }

  componentWillUnmount() {
    const {cell, _editor, _root} = this;
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
    if(_root) {
      setTimeout(() => {
        _root?.unmount?.();
      });
    }
    this._root = null;
    cell.detachObject(true);
    super.componentWillUnmount();
  }

  createRoot({tab, cell}) {
    const {_editor, _root} = this;
    if(_root) {
      _root.unmount();
      this._root = null;
    }
    if(tab === 'tool') {
      this._root = ReactDOM.createRoot(cell);
      this._root.render(<ToolWnd editor={_editor}/>);
    }
    else if(tab === 'prod') {
      this._root = ReactDOM.createRoot(cell);
      this._root.render(<ToolWnd editor={_editor} fix="root"/>);
    }
    else if(tab === 'stv') {
      this._root = ReactDOM.createRoot(cell);
      this._root.render(<ToolWnd editor={_editor} fix="layer"/>);
    }
    else if(tab === 'elm') {
      this._root = ReactDOM.createRoot(cell);
      this._root.render(<ToolWnd editor={_editor} fix="elm"/>);
    }
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
  };

  render() {
    const {dialog} = this.props;
    const Dialog = dialog && dialog.ref && dialog.Component;

    return <>
      <Prompt when message={this.prompt} />
      <div ref={el => this.el = el}/>
      {Dialog && <Dialog handlers={this.handlers} dialog={dialog} owner={this} />}
    </>;
  }

}

Builder.rname = 'Builder';

export default WindowSizer(withIface(Builder));


