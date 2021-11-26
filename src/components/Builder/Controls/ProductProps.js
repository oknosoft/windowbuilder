
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import ElmInsets from './ElmInsets';

export default function ProductProps({_dp, ox, project}) {
  const elm = new project.constructor.FakePrmElm(project);

  return <>
    <PropField fullWidth _obj={_dp} _fld="sys"/>
    <PropField fullWidth _obj={_dp} _fld="clr"/>
    <LinkedProps ts={ox.params} cnstr={0} inset={elm.inset.ref}/>

    <ElmInsets elm={elm}/>
  </>;
}

ProductProps.propTypes = {
  _dp: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
};
