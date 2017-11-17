/**
 * ### Форма добавления услуг и комплектуюущих
 * Абстрактная строка допвставки - от неё наследуются строки подоконников, отливов и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'material-ui/Form';
import TabularSection from 'metadata-react/TabularSection';

export default class AdditionsItem extends Component {

  state = {scheme: null};

  render_row() {
    return '123';
  }

  render() {
    const {dp, meta, scheme, tref, minHeight} = this.props;

    return <TabularSection
      ref={tref}
      _obj={dp}
      _meta={meta}
      _tabular="production"
      scheme={scheme}
      minHeight={minHeight}
      hideToolbar
    />;
  }

}

AdditionsItem.propTypes = {
  dp: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
  scheme: PropTypes.object.isRequired,
};
