
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

export default function GrpProps({elm}) {
  return <Typography variant="subtitle2">{`Группа элементов ${elm.length}`}</Typography>;
}

GrpProps.propTypes = {
  elm: PropTypes.object.isRequired,
};
