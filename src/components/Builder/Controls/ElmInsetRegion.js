import React from 'react';
import PropTypes from 'prop-types';
import DataGrid from 'react-data-grid';
const {EditorBase} = DataGrid.editors;

export default class RegionEditor extends EditorBase {

  constructor(props, context) {
    super(props, context);
    const {value} = props;
    this.state = {value, initialValue: parseInt(value, 10)};
  }

  getValue() {
    const {props: {rowData}, state: {value, initialValue}} = this;
    let region = parseFloat(value.replace(',', '.'));
    if(rowData.inset.region) {
      if(!region) {
        region = initialValue || rowData.inset.region;
      }
    }
    else {
      region = 0;
    }
    return {region};
  }

  handleChange = ({target}) => {
    const {value} = target;
    if(!value || !isNaN(parseInt(value, 10))) {
      this.setState({value});
    }
  };

  render() {
    const {props: {rowData}, state: {value}} = this;
    const {region} = rowData.inset;
    return <input value={value} onChange={this.handleChange} readOnly={region === 0}/>;
  }
}

RegionEditor.propTypes = {
  value: PropTypes.any,
  rowData: PropTypes.object.isRequired,
};
