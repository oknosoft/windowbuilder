import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Tip from 'windowbuilder-forms/dist/Common/Tip';
import Prop from './Prop';
import SelectSizes from './SelectSizes';

function ProductProps({foroomApi, product, props, calc_order, setProp}) {

  const [sizesOpen, setOpen] = React.useState(false);
  const [sz_product, setProduct] = React.useState(null);

  if(!product) {
    return <Typography variant="subtitle1" color="secondary">Не выбрано изделие</Typography>;
  }

  const params = product.params.filter(foroomApi.filter_params);

  return <>
    <Toolbar disableGutters>
      <Typography variant="subtitle1" style={{flex: 1}}>Параметры</Typography>
      <Tip title="Выбор размеров">
        <IconButton onClick={() => setOpen(true)}>
          <AspectRatioIcon />
        </IconButton>
      </Tip>
    </Toolbar>
    {params.map((v, i) => <Prop key={`${product.id}-${i}`} prop={v} props={props} setProp={setProp(v.alias)}/>)}
    {sizesOpen && <SelectSizes
      product={product}
      sz_product={sz_product}
      params={params}
      handleClose={() => setOpen(false)}
      setProduct={setProduct}
      obj={calc_order}
    />}
  </>;
}

ProductProps.propTypes = {
  foroomApi: PropTypes.object,
  product: PropTypes.object,
  props: PropTypes.object,
  calc_order: PropTypes.object,
  setProp: PropTypes.func,
};

export default ProductProps;
