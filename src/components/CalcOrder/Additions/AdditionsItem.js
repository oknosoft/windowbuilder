/**
 * ### Форма добавления услуг и комплектуюущих
 * Абстрактная строка допвставки - от неё наследуются строки подоконников, отливов и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
//import {FormGroup} from '@material-ui/core/Form';
import TabularSection from 'metadata-react/TabularSection';

export default class AdditionsItem extends Component {

  render() {
    const {dp, meta, scheme, tref, onRowUpdated, onCellSelected, minHeight} = this.props;

    return <TabularSection
      ref={tref}
      _obj={dp}
      _meta={meta}
      _tabular="production"
      scheme={scheme}
      onRowUpdated={onRowUpdated}
      onCellSelected={onCellSelected}
      minHeight={minHeight}
      hideToolbar
    />;
  }

}

AdditionsItem.propTypes = {
  dp: PropTypes.object.isRequired,
  scheme: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  tref: PropTypes.func.isRequired,
  onRowUpdated: PropTypes.func.isRequired,
  onCellSelected: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
};
