/**
 * Загружает шаблоны из облака
 * Имеет смысл только для  push автономного режима работы
 *
 * @module Templates
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Templates extends Component {

  render() {
    return <div>Templates</div>;
  }
}

Templates.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Templates;
