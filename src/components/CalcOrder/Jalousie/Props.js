import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Prop from './Prop';

function ProductProps({foroomApi, product, props, setProp}) {

  if(!product) {
    return <Typography variant="subtitle1" color="secondary">Не выбрано изделие</Typography>;
  }

  return <div>
    <Typography variant="subtitle1">Параметры</Typography>
    {product.params
      .filter(foroomApi.filter_params)
      .map((v, i) => <Prop key={`${product.id}-${i}`} prop={v} props={props} setProp={setProp(v.alias)}/>)}
  </div>;
}

ProductProps.propTypes = {
  foroomApi: PropTypes.object,
  product: PropTypes.object,
  props: PropTypes.object,
  setProp: PropTypes.func,
};

export default ProductProps;
