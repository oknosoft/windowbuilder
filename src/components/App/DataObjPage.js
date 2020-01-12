import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';

import {withIface} from 'metadata-redux';

import {Prompt} from 'react-router-dom';

class DataObjPage extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers, props} = this;
    props._mgr.form_obj(cell, {
      ref: props.match.params.ref,
      bind_pwnd: true,
      hide_header: true,
      set_text(title) {
        handlers.props.title != title && handlers.handleIfaceState({
          component: '',
          name: 'title',
          value: title,
        });
      },
    }, handlers);
  }

  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    const {cell} = this;
    cell && cell.close && cell.close();
    super.componentWillUnmount();
  }

  /**
   * проверка, можно ли покидать страницу
   * @param loc
   * @return {*}
   */
  prompt = (loc) => {
    const {prompt} = this.cell;
    if(!prompt || loc.pathname.match(/builder/)){
      return true;
    }
    return prompt(loc);
  }

  render() {
    const {match, dialog} = this.props;
    const Dialog = dialog && match.params.ref === dialog.ref && dialog.Component;
    return [
      <Prompt key="prompt" when message={this.prompt} />,

      <div key="el" ref={el => this.el = el}/>,

      Dialog && <Dialog key="dialog" handlers={this.handlers} dialog={dialog} owner={this} />
    ];
  }

}

DataObjPage.rname = 'DataObjPage';

export default withIface(DataObjPage);


