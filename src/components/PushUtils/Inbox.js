/**
 * Заказы, отправленные сотруднику с push автономным режимом работы
 *
 * @module Inbox
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Inbox extends Component {

  render() {
    return <div>Inbox</div>;
  }
}

Inbox.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Inbox;
