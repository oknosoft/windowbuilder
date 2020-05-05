
import React from 'react';
import Typography from '@material-ui/core/Typography';
import TabularSection from 'metadata-react/TabularSection';

class SelectProd extends React.Component {

  constructor(props, context) {
    super(props, context);

    $p.cat.scheme_settings.find_rows({obj: 'dp.buyers_order.production'}, (scheme) => {
      if(scheme.name.endsWith('select_prod')) {
        this.scheme = scheme;
      }
    });
  }

  rowSelection() {
    const {production} = this.props.dp;
    return {
      showCheckbox: true,
      enableShiftSelect: true,
      selectBy: {
        keys: {
          rowKey: 'row',
          markKey: 'use',
          values: production.find_rows({use: true}).map(r => r.row),
        }
      }
    }
  }

  render() {
    const {dp} = this.props;

    return this.scheme ?
      <TabularSection
        _obj={dp}
        _tabular="production"
        scheme={this.scheme}
        rowSelection={this.rowSelection()}
        denyAddDel
        hideToolbar
      />
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "dp.buyers_order.production", name: "production.select_prod"}`}
      </Typography>;
  }
}



export default SelectProd;
