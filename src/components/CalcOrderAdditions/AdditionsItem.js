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

  render_row() {
    return '123';
  }

  render() {
    const {group, dp} = this.props;

    return <TabularSection _obj={dp} _tabular="production" minHeight={180}/>;
  }

}
