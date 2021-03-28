import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PropField from 'metadata-react/DataField/PropField';
import ElmToolbar from './ElmToolbar';

function ElmProps({elm1, elm2, editor}) {
  const {fields} = elm1 ? elm1._metadata : {};
  return <div>
    <ElmToolbar editor={editor} elm={elm1} />
    {
      elm1 ? <div>
          <PropField _obj={elm1} _fld="info" _meta={fields.info} read_only/>
          <PropField _obj={elm1} _fld="inset" _meta={fields.inset} />
          <PropField _obj={elm1} _fld="clr" _meta={fields.clr} />
      </div>
        : <Typography color="primary">Элемент не выбран</Typography>
    }
  </div>;
}

ElmProps.propTypes = {
  elm1: PropTypes.object,
  elm2: PropTypes.object,
  editor: PropTypes.object,
};

export default ElmProps;
