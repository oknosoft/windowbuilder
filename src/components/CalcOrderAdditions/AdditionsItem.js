/**
 * ### Форма добавления услуг и комплектуюущих
 * Абстрактная строка допвставки - от неё наследуются строки подоконников, отливов и т.д.
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FormGroup } from 'material-ui/Form';

export default class AdditionsItem extends Component {

  render_row() {
    return '123';
  }

  render() {
    return <FormGroup row>
      {this.render_row()}
    </FormGroup>
  }

}
