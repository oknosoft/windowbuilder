import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import GlassToolbar from './Toolbar/GlassToolbar';
import Bar from './Bar';
import ElmInsets from './ElmInsets';
import GlassComposite from './GlassComposite';
import Coordinates from './Coordinates';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';

/**
 * Виртуальное заполнение
 * @param grp {Array.<Filling>}
 * @return {Proxy.<Filling>}
 */
function glassGrp(grp) {
  return Array.isArray(grp) ? new Proxy(grp[0], {
    get(target, prop /*, receiver*/) {
      switch (prop){
      case 'info':
        return `№ ${grp.map(({elm}) => elm).join(', ')} (группа)`;
      case 'equals':
        return (elmnts) => elmnts.every(elm => grp.includes(elm)) && grp.every(elm => elmnts.includes(elm));
      case 'reflect_grp':
        return () => {
          const {glass_specification, _data} = target.ox;
          _data._loading = true;
          for(const glass of grp) {
            if(glass !== target) {
              glass_specification.clear({elm: glass.elm});
              glass_specification.find_rows({elm: target.elm}, ({_obj}) => {
                glass_specification.add({
                  elm: glass.elm,
                  inset: _obj.inset,
                  clr: _obj.clr,
                  dop: $p.utils._clone(_obj.dop),
                });
              });
            }
          }
          _data._loading = false;
          target.project.register_change(true);
        };
      default:
        return target[prop];
      }
    },
    set(target, prop, val /*, receiver*/) {
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
    this.state = {elm: glassGrp(props.elm), row: null};
    this.fields = props.fields || this.state.elm.__metadata(false).fields;
  }

  shouldComponentUpdate({elm}) {
    const {state} = this;
    let reset;
    if(Array.isArray(elm)) {
      if(!state.elm.equals(elm)) {
        reset = true;
      }
    }
    else if(state.elm != elm) {
      reset = true;
    }
    if(reset) {
      this.setState({elm: glassGrp(elm), row: null});
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

  set_row = (row) => {
    this.setState({row});
  };

  render() {
    const {state: {elm, row}, fields} = this;

    const {info, inset, ox} = elm;
    const props = elm.elm_props();
    const clr_group = $p.cat.clrs.selection_exclude_service(fields.clr, inset, ox);
    fields.clr.hide_composite = true;
    const is_composite = inset.insert_type === inset.insert_type._manager.Стеклопакет;

    return <>
      <GlassToolbar {...this.props} elm={elm} />
      <Bar>{`Заполнение ${info}`}</Bar>
      <PropField _obj={elm} _fld="inset" _meta={fields.inset} handleValueChange={() => this.set_row(null)}/>
      <FieldClr _obj={elm} _fld="clr" _meta={fields.clr} clr_group={clr_group}/>

      {props.length ? <>
        <Bar>Свойства</Bar>
        {props.map(({ref}, ind) => <PropField key={`ap-${ind}`} _obj={elm} _fld={ref} _meta={fields[ref]}/>)}
      </> : null}

      {is_composite ? <GlassComposite elm={elm} row={row} set_row={this.set_row}/> : null}

      <Coordinates elm={elm} fields={fields} read_only />
      <ElmInsets elm={elm}/>

    </>;
  }
}

GlassProps.propTypes = {
  elm: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  fields: PropTypes.object,
};
