import React from 'react';
import PropTypes from 'prop-types';
import Bar from '../Controls/Bar';
import PropField from 'metadata-react/DataField/PropField';

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
    const {_obj, options} = this.props.editor.tool;
    const {index} = this.state;
    return <>
      <Bar>{options.title || options.wnd?.caption}</Bar>
      <PropField _obj={_obj} _fld="inset"/>
      <PropField _obj={_obj} _fld="furn1" index={index}/>
      <PropField _obj={_obj} _fld="furn2" index={index}/>
    </>;
  }

}

StulpFlapWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};

export default StulpFlapWnd;
