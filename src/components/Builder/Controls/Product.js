import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import ProductToolbar from './ProductToolbar';
import LinkedProps from './LinkedProps';

function Product({editor}) {
  const {project} = editor;
  const {_dp, ox} = project;
  const {wsql, utils, current_user: user} = $p;
  const is_dialer = !user || !user.role_available('СогласованиеРасчетовЗаказов') && !user.role_available('РедактированиеСкидок');
  const hide_dealer = wsql.get_user_param('hide_price_dealer');
  const {fields} = _dp._metadata();
  return <div>
    <ProductToolbar project={project}/>
    <PropField _obj={_dp} _fld="sys" />
    <PropField _obj={_dp} _fld="clr" />
    <LinkedProps ts={ox.params} cnstr={0} inset={utils.blank.guid}/>
    <PropField _obj={_dp} _fld="quantity" />
    {!hide_dealer && <PropField
      _obj={_dp}
      _fld="price_internal"
      _meta={Object.assign({}, fields.price_internal, {synonym: 'Цена дилера'})} read_only />}
    {!hide_dealer && <PropField
      _obj={_dp}
      _fld="discount_percent_internal"
      _meta={Object.assign({}, fields.discount_percent_internal, {synonym: 'Скидка дил %'})} read_only={is_dialer}/>}
    {!hide_dealer && <PropField
      _obj={_dp}
      _fld="amount_internal"
      _meta={Object.assign({}, fields.amount_internal, {synonym: 'Сумма дилера'})} read_only/>}
    <PropField
      _obj={_dp}
      _fld="price"
      _meta={Object.assign({}, fields.price, {synonym: hide_dealer ? 'Цена' : 'Цена пост'})} read_only/>
    <PropField
      _obj={_dp}
      _fld="discount_percent"
      _meta={Object.assign({}, fields.discount_percent, {synonym: hide_dealer ? 'Скидка %' : 'Скидка пост %'})}  read_only={is_dialer}/>
    <PropField
      _obj={_dp}
      _fld="amount"
      _meta={Object.assign({}, fields.amount, {synonym: hide_dealer ? 'Сумма' : 'Сумма пост'})} read_only/>
  </div>;
}

Product.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default Product;
