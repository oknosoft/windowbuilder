import React from 'react';
// import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';
import withIface from '../../redux/withIface';

import {Prompt} from 'react-router-dom';

class DataObjPage extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers, props} = this;
    props._mngr.form_obj(cell, {
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
  prompt(loc) {
    if(loc.pathname.match(/builder/)){
      return true;
    }
    return this.cell.prompt(loc);
  }

  render() {
    return <div>
      <Prompt when message={this.prompt.bind(this)} />
      <div ref={el => this.el = el}/>
    </div>;
  }

}

export default WindowSizer(withIface(DataObjPage));


