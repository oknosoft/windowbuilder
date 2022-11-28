
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';
import RootToolbar from './Toolbar/RootToolbar';
import ElmInsets from './ElmInsets';

export default function ProductProps(props) {
  const {ox, editor} = props;
  const {project} = editor;
  const {_dp, constructor} = project;
  const elm = new constructor.FakePrmElm(project);
  const cmeta = _dp._metadata('clr');

  // корректируем метаданные поля выбора цвета
  const clr_group = $p.cat.clrs.selection_exclude_service(cmeta, _dp, project);

  return <>
    <RootToolbar project={project} ox={ox} _dp={_dp} />
    <PropField fullWidth _obj={_dp} _fld="sys"/>
    <FieldClr fullWidth _obj={_dp} _fld="clr" _meta={cmeta} clr_group={clr_group}/>
    <LinkedProps ts={ox.params} cnstr={0} inset={elm.inset.ref} project={project}/>

    <ElmInsets elm={elm}/>
  </>;
}

ProductProps.propTypes = {
  editor: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
