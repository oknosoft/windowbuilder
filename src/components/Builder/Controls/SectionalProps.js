
import React from 'react';
import PropTypes from "prop-types";
import Typography from '@material-ui/core/Typography';

export default function SectionalProps({elm}) {
  return <Typography variant="subtitle2">{`Свойства разреза ${elm}`}</Typography>;
}

SectionalProps.propTypes = {
  elm: PropTypes.object.isRequired,
};
