/**
 * Показывает фрагмент спецификации, обрезанный элементом или слоем
 *
 * @module SpecFragment
 *
 * Created by Evgeniy Malyarov on 19.05.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Dialog from 'metadata-react/App/Dialog';
import FrmObj from 'metadata-react/FrmObj';
import BtnOrigin from './BtnOrigin';


class Spec extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {open: false};
    if(props.scheme) {
      this.scheme = props.scheme;
    }
    else {
      $p.cat.scheme_settings.find_rows({obj: 'cat.characteristics.specification'}, (scheme) => {
        if(scheme.name.endsWith('main')) {
          this.scheme = scheme;
          return true;
        }
      });
    }

  }

  handleClose = () => this.setState({open: false});

  handleOpen = () => {
    const {spec_ref, props: {_obj}} = this;
    if(spec_ref) {
      const {_tabular, selected} = spec_ref.state;
      if(selected && selected.hasOwnProperty('rowIdx')) {
        this.row = spec_ref.rowGetter(selected.rowIdx);
        this.fld = 'origin';
        if(typeof this.row.origin === 'number') {
          this.row = _obj.cnn_elmnts.get(this.row.origin - 1);
          this.fld = 'cnn';
        }
        if(this.row[this.fld]) {
          this.setState({open: true});
        }
      }
    }
  };

  filter = (collection) => {
    const res = [];
    const {elm} = this.props;
    collection.forEach((row) => {
      if(!elm || row.elm === elm) {
        res.push(row);
      }
    });
    return res;
  };

  render() {
    const {state: {open}, props: {_obj}, row, fld} = this;
    const origin = open && row[fld];
    return [
      <TabularSection
        key="ts_spec"
        _obj={_obj}
        _tabular="specification"
        scheme={this.scheme}
        filter={this.filter}
        denyAddDel
        denyReorder
        ref={(el) => this.spec_ref = el}
        btns={<BtnOrigin key="origin" handleOpen={this.handleOpen} />}
      />,
      open && <Dialog
        open
        noSpace
        title={origin.presentation || 'Ссылка оборвана'}
        onClose={this.handleClose}
        //initFullScreen
      >
        <FrmObj
          _mgr={origin._manager}
          _acl="r"
          match={{params: {ref: origin.ref}}}
          handlers={{}}
        />
      </Dialog>
    ];
  }
}

Spec.propTypes = {
  _obj: PropTypes.object.isRequired,
  scheme: PropTypes.object,
  elm: PropTypes.number,
};

export default Spec;
