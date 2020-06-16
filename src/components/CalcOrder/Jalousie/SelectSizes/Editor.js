/**
 *
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 16.06.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default function Editor({sz_product}) {
  return <div>{`Editor: ${sz_product.name}`}</div>;
}
