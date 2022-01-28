import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';

class StulpFlapWnd extends React.Component {

  state = {index: 0};

  componentDidMount() {
    $p.dp.builder_pen.on({update: this.onDataChange});
  }

  componentWillUnmount() {
    $p.dp.builder_pen.off({update: this.onDataChange});
  }

  onDataChange = (obj /*, fields */) => {
    if(obj === this.props.editor.tool._obj) {
      this.setState({index: this.state.index + 1});
    }
  };

  render() {
    const {_obj} = this.props.editor.tool;
    const {index} = this.state;
    return <div>
      <DataField _obj={_obj} _fld="inset" fullWidth/>
      <DataField _obj={_obj} _fld="furn1" index={index} fullWidth/>
      <DataField _obj={_obj} _fld="furn2" index={index} fullWidth/>
    </div>;
  }

}

StulpFlapWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default StulpFlapWnd;
