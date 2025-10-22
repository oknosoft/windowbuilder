
import React from 'react';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';

//import withStyles from 'metadata-react/DataField/styles';

function GlassSeparately({_obj, _fld, prop, elm}) {

  const [index, setIndex] = React.useState(0);

  if(!prop) {
    prop = _obj.param;
  }
  if(!_fld) {
    _fld = prop.ref;
  }
  const handleChange = ({target}) => {
    _obj[_fld] = target.checked;
    setIndex(index + 1);
  };

  const checked = _obj[_fld];
  const label = prop.name;
  let sub = null;
  if(elm) {
    const {layer} = _obj;
    const {_ox, prm_ox} = layer;
    const rootChecked = prop.extract_pvalue({ox: prm_ox || _ox, cnstr: 0, layer});
    sub = <Typography color={rootChecked === checked ? 'primary' : 'secondary'} variant="caption" component="span">{` (${rootChecked === checked ? 'как в изделии' : 'изменено'})`}</Typography>;
  }
  else {
    _obj._raw.ts.find_rows({param: prop}, (row) => {
      if(row.cnstr) {
        sub = <Typography
          color="secondary"
          variant="caption"
          component="span"
          title="Сбросить"
          onClick={(ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            $p.ui.dialogs.confirm({
              title: 'Заполнения отдельно',
              text: 'Установить признак "Заполнения отдельно" для всех элементов, как в изделии?',
              timeout: 10000,
            })
              .then(() => {
                const rm = [];
                _obj._raw.ts.find_rows({param: prop}, (row) => {
                  if (row.cnstr) {
                    rm.push(row);
                  }
                });
                for(const row of rm) {
                  _obj._raw.ts.del(row);
                }
                setIndex(index + 1);
              })
              .catch(err => null);
          }}
        >{` (есть переопределения)`}</Typography>;
        return false;
      }
    });

  }

  return <FormControlLabel
    control={
      <Switch
        checked = {checked}
        color = "primary"
        onChange = {handleChange}
      />
    }
    label={<>
      <Typography color="primary" component="span">{label}</Typography>
      {sub}
    </>}
    title={label}
  />;
}

export default GlassSeparately;
