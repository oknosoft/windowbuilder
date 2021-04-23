import React from 'react';
import PropTypes from 'prop-types';
import DhtmlxCell from '../../DhtmlxCell';
import WindowSizer from 'metadata-react/WindowSize';
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';
import {withIface} from 'metadata-redux';
import {set_state_and_title} from '../../App/menu_items';
import FromClipboard from './FromClipboard';

class CalcOrderList extends DhtmlxCell {

  componentDidMount() {

    let {location, state_filter, handleIfaceState} = this.props;
    const search = $p.job_prm.parse_url_str(location.search);
    if (search.state_filter && search.state_filter != state_filter) {
      state_filter = search.state_filter;
    }
    else if (!state_filter) {
      state_filter = 'draft';
    }
    set_state_and_title(state_filter, handleIfaceState);

    super.componentDidMount();
    const {cell, handlers, export_start, export_ok, export_err, import_start} = this;
    const {calc_order} = $p.doc;
    calc_order.form_list(cell, null, handlers);
    calc_order.on({export_start, export_ok, export_err, import_start});
  }

  componentWillUnmount() {
    const {cell, export_start, export_ok, export_err, import_start} = this;
    cell && cell.close && cell.close();
    $p.doc.calc_order.off({export_start, export_ok, export_err, import_start});
    super.componentWillUnmount();
  }

  shouldComponentUpdate(nextProps, nextState) {
    let res = super.shouldComponentUpdate(nextProps);
    if(!res) {
      const {loading, import_start} = this.state;
      res = nextState.loading !== loading || nextState.import_start !== import_start;
    }
    return res;
  }


  state = {loading: false, import_start: false};

  export_start = () => {
    this.setState({loading: true});
  };

  export_ok = (raw) => {
    const {doc: {calc_order}, ui: {dialogs}} = $p;
    const doc = calc_order.get(raw.ref);
    return navigator.clipboard.writeText(JSON.stringify(raw))
      .then(() => {
        this.setState({loading: false}, () => dialogs.alert({
          title: 'Экспорт данных',
          text: <><i>{doc.presentation}</i> скопирован в буфер обмена</>,
          timeout: 10000,
        }));
      })
      .catch(this.export_err);
  };

  export_err = (err) => {
    this.setState({loading: false});
    $p.ui.dialogs.alert({title: 'Экспорт заказа', text: err.message});
  };

  import_start = () => {
    this.setState({import_start: true});
  };

  import_fin = () => {
    this.setState({import_start: false});
  };


  render() {
    const {props: {dialog, handleNavigate}, state}  = this;
    const Dialog = dialog && dialog.Component;
    return [
      <div key="el" ref={el => this.el = el} />,
      Dialog && <Dialog key="dialog" handlers={this.handlers} dialog={dialog} owner={this} />,
      state.import_start && <FromClipboard key="clip" handleNavigate={handleNavigate} queryClose={this.import_fin} />,
      state.loading && <LoadingModal key="loading" open handleClose={this.export_ok} text="Подготовка заказа..." />
    ];
  }

}

CalcOrderList.rname = 'CalcOrderList';

CalcOrderList.propTypes = {
  dialog: PropTypes.object.isRequired,
  location: PropTypes.object,
  state_filter: PropTypes.object,
  handleNavigate: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
};

export default WindowSizer(withIface(CalcOrderList));


