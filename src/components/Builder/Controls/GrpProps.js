
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import ManyProfiles from "./ManyProfiles";

export default function GrpProps({editor, elm, classes}) {
  const {ProfileItem} = $p.EditorInvisible;
  if (elm.every(el => el instanceof ProfileItem)) {
    return <ManyProfiles editor={editor} profiles={elm} classes={classes}/>;
  }
  return <Typography variant="subtitle2">{`Группа элементов ${elm.length}`}</Typography>;
}

GrpProps.propTypes = {
  elm: PropTypes.array.isRequired
};
