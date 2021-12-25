import React from 'react';
import PropTypes from 'prop-types';
import ProfileProps from './ProfileProps';
import GlassProps from './GlassProps';
import SectionalProps from './SectionalProps';

export default function ElmProps(props) {
  const {elm} = props;
  const {fields} = elm.__metadata(false);
  const {ProfileItem, Filling} = $p.EditorInvisible;
  const CProps = elm instanceof ProfileItem ? ProfileProps : (elm instanceof Filling ? GlassProps : SectionalProps);

  return <CProps {...props} fields={fields}/>;
}

ElmProps.propTypes = {
  elm: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
