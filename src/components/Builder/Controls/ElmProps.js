import React from 'react';
import Typography from '@material-ui/core/Typography';
import PropField from 'metadata-react/DataField/PropField';
import ProfileProps from './ProfileProps';
import GlassProps from './GlassProps';
import SectionalProps from './SectionalProps';

export default function ElmProps({elm, ox}) {
  const {fields} = elm.__metadata(false);
  const {ProfileItem, Filling, Sectional} = $p.EditorInvisible;
  const CProps = elm instanceof ProfileItem ? ProfileProps : (elm instanceof Filling ? GlassProps : SectionalProps);

  return <>
    <CProps fields={fields} elm={elm} ox={ox}/>
  </>;
}
