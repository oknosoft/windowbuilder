
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

export default function PairProps({elm}) {
  return <Typography variant="subtitle2">{`Пара элементов ${elm}`}</Typography>;
}

PairProps.propTypes = {
  elm: PropTypes.object.isRequired,
};
