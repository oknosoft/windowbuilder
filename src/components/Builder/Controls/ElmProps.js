import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import ProfileProps from './ProfileProps';
import GlassProps from './GlassProps';
import SectionalProps from './SectionalProps';
const {ProfileItem, Filling, BuilderElement} = $p.EditorInvisible;

export default function ElmProps(props) {
  const {elm} = props;
  if(elm instanceof BuilderElement) {
    const {fields} = elm.__metadata(false);
    fields.r.type.fraction = 0;
    const CProps = elm instanceof ProfileItem ? ProfileProps : (elm instanceof Filling ? GlassProps : SectionalProps);
    return <CProps {...props} fields={fields}/>;
  }
  return <>
    <Typography>Текущий элемент не выбран</Typography>
  </>;
}

ElmProps.propTypes = {
  elm: PropTypes.object,
  ox: PropTypes.object.isRequired,
};
