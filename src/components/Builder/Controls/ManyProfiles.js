import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PropField from 'metadata-react/DataField/PropField';
import FieldInsetProfile from 'wb-forms/dist/CatInserts/FieldInsetProfile';

export default function ManyProfiles({profiles}) {
  const [elm] = profiles;
  // если ражные типы элементов - править нельзя
  const {elm_type} = elm;
  const vsr_types = profiles.some((profile) => profile.elm_type !== elm_type );
  return <>
    <Typography variant="subtitle2">{`Группа профилей ${
      vsr_types ? 'с разными типами элементов' : `${profiles.length} шт., ${elm_type.toString()}` }`}</Typography>
    <FieldInsetProfile disabled={vsr_types} elm={elm}/>
    <PropField _obj={elm} _fld="clr" /*_meta={elm._metadata.fields.clr}*/ />
  </>;
}

ManyProfiles.propTypes = {
  profiles: PropTypes.array.isRequired,
};
