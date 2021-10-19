import React from 'react';
import PropTypes from 'prop-types';
import ProfileProps from './ProfileProps';
import GlassProps from './GlassProps';
import SectionalProps from './SectionalProps';

export default function ElmProps({elm, ox}) {
  const {fields} = elm.__metadata(false);
  const {ProfileItem, Filling} = $p.EditorInvisible;
  const CProps = elm instanceof ProfileItem ? ProfileProps : (elm instanceof Filling ? GlassProps : SectionalProps);

  return <>
    <CProps fields={fields} elm={elm} ox={ox}/>
  </>;
}

ElmProps.propTypes = {
  elm: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
