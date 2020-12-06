import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';

class StulpFlapWnd extends React.Component {

  componentDidMount() {
    $p.dp.builder_pen.on({update: this.onDataChange});
  }

  componentWillUnmount() {
    $p.dp.builder_pen.off({update: this.onDataChange});
  }

  onDataChange = (obj, fields) => {
    if(obj === this.props.editor.tool._obj) {
      this.forceUpdate();
    }
  };

  render() {
    const {_obj} = this.props.editor.tool;
    return <div>
      <DataField _obj={_obj} _fld="inset" fullWidth/>
      <DataField _obj={_obj} _fld="furn1" fullWidth/>
      <DataField _obj={_obj} _fld="furn2" fullWidth/>
    </div>;
  }

}

StulpFlapWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default StulpFlapWnd;
