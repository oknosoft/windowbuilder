
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import RootToolbar from './Toolbar/RootToolbar';
import ElmInsets from './ElmInsets';

export default function ProductProps(props) {
  const {ox, editor} = props;
  const {project} = editor;
  const {_dp} = project;
  const elm = new project.constructor.FakePrmElm(project);

  return <>
    <RootToolbar project={project} ox={ox} _dp={_dp} />
    <PropField fullWidth _obj={_dp} _fld="sys"/>
    <PropField fullWidth _obj={_dp} _fld="clr"/>
    <LinkedProps ts={ox.params} cnstr={0} inset={elm.inset.ref}/>

    <ElmInsets elm={elm}/>
  </>;
}

ProductProps.propTypes = {
  editor: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
