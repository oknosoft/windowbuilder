import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../DhtmlxCell';
import {withIface} from 'metadata-redux';
import {Prompt} from 'react-router-dom';
import {lazy} from './lazy';                        // конструкторы для контекста

class DataObjPage extends DhtmlxCell {

  componentDidMount() {
    const {handlers, props} = this;
    if(!props.match._owner) {
      super.componentDidMount();

      props._mgr.form_obj(this.cell, {
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
  }

  componentWillUnmount() {
    const {cell, props} = this;
    if(!props.match._owner) {
      cell && cell.close && cell.close();
      super.componentWillUnmount();
    }
  }

  /**
   * проверка, можно ли покидать страницу
   * @param loc
   * @return {*}
   */
  prompt = (loc) => {
    const {prompt} = this.cell;
    if(!prompt || loc.pathname.match(/\/builder|\/templates/)){
      return true;
    }
    return prompt(loc);
  };

  render() {
    const {match, dialog, ...other} = this.props;

    if(match._owner) {
      const {FrmObj} = lazy;
      return <FrmObj handlers={this.handlers} match={match} {...other} />;
    }

    const Dialog = dialog && dialog.ref && dialog.Component;
    return [
      <Prompt key="prompt" when message={this.prompt} />,
      <div key="el" ref={el => this.el = el}/>,
      Dialog && <Dialog key="dialog" handlers={this.handlers} dialog={dialog} owner={this} />,
    ];
  }

}

DataObjPage.rname = 'DataObjPage';

export default withIface(DataObjPage);


