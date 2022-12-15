
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';
import RootToolbar from './Toolbar/RootToolbar';
import ElmInsets from './ElmInsets';
import Bar from './Bar';

export default function ProductProps(props) {
  const {ox, editor} = props;
  const {project} = editor;
  const {_dp, constructor} = project;
  const elm = new constructor.FakePrmElm(project);

  // корректируем метаданные поля выбора цвета
  const cmeta = _dp._metadata('clr');
  const clr_group = $p.cat.clrs.selection_exclude_service(cmeta, _dp, project);

  const {calc_order_row, params} = ox;
  const [quantity, setQuantity] = React.useState(calc_order_row.quantity);

  return <>
    <RootToolbar project={project} ox={ox} _dp={_dp} />
    <PropField _obj={_dp} _fld="sys"/>
    <FieldClr _obj={_dp} _fld="clr" _meta={cmeta} clr_group={clr_group}/>
    <LinkedProps ts={params} cnstr={0} inset={elm.inset.ref} project={project}/>
    <Bar>Строка заказа</Bar>
    <PropField _obj={calc_order_row} _fld="quantity" handleValueChange={setQuantity}/>
    <PropField _obj={calc_order_row} _fld="price" read_only/>
    <PropField _obj={calc_order_row} _fld="amount" read_only/>

    <ElmInsets elm={elm}/>
  </>;
}

ProductProps.propTypes = {
  editor: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
