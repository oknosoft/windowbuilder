import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';
import FieldInsetProfile from 'wb-forms/dist/CatInserts/FieldInsetProfile';
import ProfileToolbar from './Toolbar/ProfileToolbar';

export default function ManyProfiles({editor, classes, profiles}) {
  const [elm] = profiles;
  // если ражные типы элементов - править нельзя
  const {elm_type} = elm;
  const {fields} = elm.__metadata(false);
  const clr_group = $p.cat.clrs.selection_exclude_service(fields.clr, elm, elm.ox);
  const vsr_types = profiles.some((profile) => profile.elm_type !== elm_type );
  return <>
    <ProfileToolbar editor={editor} elm={elm} classes={classes} />
    <Typography variant="subtitle2">{`Группа профилей ${
      vsr_types ? 'с разными типами элементов' : `${profiles.length} шт., ${elm_type.toString()}` }`}</Typography>
    <FieldInsetProfile disabled={vsr_types} elm={elm}/>
    <FieldClr _obj={elm} _fld="clr" _meta={fields.clr} clr_group={clr_group} />
  </>;
}

ManyProfiles.propTypes = {
  profiles: PropTypes.array.isRequired,
};
