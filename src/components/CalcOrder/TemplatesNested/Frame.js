import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';

import SelectOrder from './SelectOrder';
import SelectFigure from 'wb-forms/dist/CalcOrder/Templates/SelectFigure';


const {cat: {templates}, job_prm} = $p;
const _obj = templates._select_template;
const {templates_nested} = job_prm.builder;

function TemplatesFrame(props) {
  const [order, setOrder] = React.useState(_obj.calc_order); /* eslint-disable-line */
  const orderChange = (order) => {
    setOrder(order);
  };
  const handleFin = () => {
    if(_obj.base_block.empty() || _obj.base_block.calc_order !== _obj.calc_order) {
      return alert('Не выбрано изделие-шаблон');
    }
    props.handleOk(true);
  };
  return <>
    <SelectOrder _obj={_obj} onChange={orderChange} templates_nested={templates_nested} />
    <div style={{paddingTop: 8}}>
      <SelectFigure handleNext={handleFin} />
    </div>
    <DialogActions>
      <Button
        variant="contained"
        disabled
      >Назад</Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFin}
      >Ок</Button>
      <div style={{flex: 1}}></div>
    </DialogActions>
  </>;
}

TemplatesFrame.propTypes = {
  handleOk: PropTypes.func.isRequired,
};

export default TemplatesFrame;
