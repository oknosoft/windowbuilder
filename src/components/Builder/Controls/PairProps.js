
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PairProfiles from './PairProfiles';

export default function PairProps(props) {
  const {elm} = props;
  const {ProfileItem} = $p.EditorInvisible;
  if(elm[0] instanceof ProfileItem && elm[1] instanceof ProfileItem) {
    return <PairProfiles {...props}/>;
  }
  return <Typography variant="subtitle2">{`Пара элементов ${props.elm}}`}</Typography>;
}

PairProps.propTypes = {
  elm: PropTypes.array.isRequired,
};
