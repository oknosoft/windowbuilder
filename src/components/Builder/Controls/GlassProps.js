import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import Bar from './Bar';
import GlassComposite from './GlassComposite';
import Coordinates from './Coordinates';

export default class GlassProps extends React.Component {

  componentDidMount() {
    const {elm} = this.props;
    elm?.project?._scope?.eve.on('coordinates_calculated', this.coordinates_calculated);
  }

  componentWillUnmount() {
    const {elm} = this.props;
    elm?.project?._scope?.eve.off('coordinates_calculated', this.coordinates_calculated);
  }

  coordinates_calculated = (/*_obj, fld*/) => {
    this.forceUpdate();
  };

  render() {
    const {elm, fields} = this.props;

    const {info, inset: {insert_type}} = elm;
    const props = elm.elm_props();

    return <>
      <Bar>{`Заполнение ${info}`}</Bar>
      <PropField _obj={elm} _fld="inset" _meta={fields.inset}/>
      <PropField _obj={elm} _fld="clr" _meta={fields.clr}/>

      {props.length ? <>
        <Bar>Свойства</Bar>
        {props.map(({ref}, ind) => <PropField key={`ap-${ind}`} _obj={elm} _fld={ref} _meta={fields[ref]}/>)}
      </> : null}

      {insert_type === insert_type._manager.Стеклопакет ? <GlassComposite elm={elm}/> : null}

      <Coordinates elm={elm} fields={fields} read_only />

    </>;
  }
}

GlassProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
