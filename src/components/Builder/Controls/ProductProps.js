
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
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

  const {wsql, utils, current_user: user} = $p;
  const is_dialer = !user || !user.role_available('СогласованиеРасчетовЗаказов') && !user.role_available('РедактированиеСкидок');
  const hide_dealer = wsql.get_user_param('hide_price_dealer');

  // корректируем метаданные поля выбора цвета
  const {fields} = _dp._metadata();
  const cmeta = utils._clone(fields.clr);
  const clr_group = $p.cat.clrs.selection_exclude_service(cmeta, _dp, project);

  return <>
    <RootToolbar project={project} ox={ox} _dp={_dp} />
    <PropField _obj={_dp} _fld="sys"/>
    <FieldClr _obj={_dp} _fld="clr" _meta={cmeta} clr_group={clr_group}/>
    <LinkedProps ts={ox.params} cnstr={0} inset={elm.inset.ref} project={project}/>

    <Bar>Строка заказа</Bar>
    <PropField _obj={_dp} _fld="note" />
    <PropField Component={FieldNumberNative} _obj={_dp} _fld="quantity" _meta={fields.quantity} />
    <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="discount_percent"
      _meta={Object.assign({}, fields.discount_percent, {synonym: hide_dealer ? 'Скидка %' : 'Скидка пост %'})}  read_only={is_dialer}/>
    <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="price"
      _meta={Object.assign({}, fields.price, {synonym: hide_dealer ? 'Цена' : 'Цена пост'})}
      value={_dp.price}
      read_only/>
    <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="amount"
      _meta={Object.assign({}, fields.amount, {synonym: hide_dealer ? 'Сумма' : 'Сумма пост'})}
      value={_dp.amount}
      read_only/>

    {!hide_dealer && <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="discount_percent_internal"
      _meta={Object.assign({}, fields.discount_percent_internal, {synonym: 'Скидка дил %'})}
      read_only={is_dialer}/>}
    {!hide_dealer && <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="price_internal"
      _meta={Object.assign({}, fields.price_internal, {synonym: 'Цена дилера'})}
      value={_dp.price_internal}
      read_only />}
    {!hide_dealer && <PropField
      Component={FieldNumberNative}
      _obj={_dp}
      _fld="amount_internal"
      _meta={Object.assign({}, fields.amount_internal, {synonym: 'Сумма дилера'})}
      value={_dp.amount_internal}
      read_only/>}

    <ElmInsets elm={elm}/>
  </>;
}

ProductProps.propTypes = {
  editor: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
