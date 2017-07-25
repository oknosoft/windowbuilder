import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../metadata-ui/DhtmlxCell';
import WindowSizer from '../../metadata-ui/WindowSize';
import withIface from '../../redux/withIface';

class DataObjPage extends DhtmlxCell {

  componentDidMount() {
    super.componentDidMount();
    const {cell, handlers, props} = this;
    props._mngr.form_obj(cell, {
      ref: props.match.params.ref,
      bind_pwnd: true,
      hide_header: true,
      set_text(title) {
        handlers.handleIfaceState({
          component: '',
          name: 'title',
          value: title,
        });
      },
      on_close(o) {
        if(o && o._obj){
          const {ref, state} = o._obj;
          setTimeout(() => handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`));
        }
        else{
          setTimeout(() => handlers.handleNavigate(`/`));
        }
      },
    }, handlers);
  }



  componentWillUnmount() {
    //$p.off('hash_route', this.hash_route);
    super.componentWillUnmount();
  }

}

export default WindowSizer(withIface(DataObjPage));


