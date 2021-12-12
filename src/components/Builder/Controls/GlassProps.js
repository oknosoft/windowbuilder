import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import Bar from './Bar';
import GlassComposite from './GlassComposite';
import Coordinates from './Coordinates';

/**
 * Виртуальное заполнение
 * @param grp {Array.<Filling>}
 * @return {Proxy.<Filling>}
 */
function glassGrp(grp) {
  return Array.isArray(grp) ? new Proxy(grp[0], {
    get(target, prop, receiver) {
      switch (prop){
      case 'info':
        return `№ ${grp.map(({elm}) => elm).join(', ')} (группа)`;
      case 'equals':
        return (elmnts) => elmnts.every(elm => grp.includes(elm)) && grp.every(elm => elmnts.includes(elm));
      case 'hide_coordinates':
        return true;
      default:
        return target[prop];
      }
    },
    set(target, prop, val, receiver) {
      switch (prop){
      case 'info':
        break;
      default:
        target[prop] = val;
      }
      return true;
    }
  }) : grp;
}

export default class GlassProps extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {elm: glassGrp(props.elm)};
    this.fields = props.fields || this.state.elm.__metadata(false).fields;
  }

  shouldComponentUpdate({elm}) {
    const {state} = this;
    if(Array.isArray(elm)) {
      if(!state.elm.equals(elm)) {
        this.setState({elm: glassGrp(elm)});
        return false;
      }
    }
    else if(state.elm != elm) {
      this.setState({elm: glassGrp(elm)});
      return false;
    }
    return true;
  }

  componentDidMount() {
    const {elm} = this.state;
    elm?.project?._scope?.eve.on('coordinates_calculated', this.coordinates_calculated);
  }

  componentWillUnmount() {
    const {elm} = this.state;
    elm?.project?._scope?.eve.off('coordinates_calculated', this.coordinates_calculated);
  }

  coordinates_calculated = (/*_obj, fld*/) => {
    this.forceUpdate();
  };

  render() {
    const {state: {elm}, fields} = this;

    const {info, inset: {insert_type}, hide_coordinates} = elm;
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

      {!hide_coordinates && <Coordinates elm={elm} fields={fields} read_only />}

    </>;
  }
}

GlassProps.propTypes = {
  elm: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  fields: PropTypes.object,
};
