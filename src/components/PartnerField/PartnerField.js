import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {filterOptions, getOptions} from './data';
import DialogCreate from './DialogCreate';
import TextField from './TextField';

const {adapters: {pouch}, ui: {dialogs}, cat: {partners}, utils} = $p;

const getOptionLabel = (option) => option.name;

export default function PartnerField({obj, fld, meta, label, onChange, fullWidth=true, ...other}) {

  const [value, setValue] = React.useState(obj[fld]);
  if(!meta && obj && fld) {
    meta = obj._metadata(fld);
  }
  const renderInput = React.useMemo(() => {
    if(!label && label !== false && meta) {
      label = meta.synonym;
    }
    return function PartnerInput (params) {
      return <TextField label={label} fullWidth={fullWidth} {...params} />
    };
  }, [label]);

  const filter = React.useMemo(() => {
    const filter = {is_folder: false};
    if(meta?.choice_params?.length) {
      for(const {name, path} of meta.choice_params) {
        filter[name] = typeof path === 'string' ? obj[path] : path;
      }
    }
    else {
      filter.is_buyer = true;
    }
    return filter;
  }, [meta]);

  const [open, setOpen] = React.useState(null);
  const handleClose = () => {
    setOpen(null);
    setValue(obj[fld]);
  };

  const [options, setOptions] = React.useState(value.empty() ? [] : [value]);
  const onInputChange = (event, text, reason) => {
    if(reason === 'clear') {
      setOptions(value.empty() ? [] : [value]);
    }
    else if(text.length > 2) {
      const query = {
        selector: {
          $and: [
            {class_name: partners.class_name},
            ...Object.keys(filter).map(fld => ({[fld]: filter[fld]})),
            {search: text},
          ],
        },
        fields: ['ref', 'id', 'inn', 'name', 'is_supplier'],
        limit: 50,
      };
      pouch.fetch('/r/_find', {method: 'POST', body: JSON.stringify(query)})
        .then((res) => res.json())
        .then(({docs}) => {
          setOptions(docs);
        });
    }
  };

  const handleChange = (event, newValue, reason, details) => {
    if(newValue?.action === 'create') {
      event.preventDefault();
      event.stopPropagation();
      event.defaultMuiPrevented = true;
      // запрос информации по инн - если успешно, возвращает массив сырых описаний, иначе - описание ошибки
      pouch.fetch(`/r/partners/${newValue.ref}`)
        .then((res) => res.json())
        .then((raw) => {
          if(raw.error) {
            throw raw.message;
          }
          if(Array.isArray(raw)) {
            setOpen(raw);
          }
        })
        .catch((err) => {
          setValue(obj[fld]);
          dialogs.alert({
            title: 'Контрагент по ИНН',
            text: err?.message || err,
          });
        });
    }
    else {
      const partner = partners.get(newValue);
      (partner.is_new() ? partner.load() : Promise.resolve(partner))
        .then(partner => {
          obj[fld] = partner;
          setOptions([partner]);
          setValue(partner);
          onChange?.(partner);
        });
    }
  };

  const handleSubmit = () => {
    // запрос на создание
    /*
    pouch.fetch(`/r/partners`, {
        method: 'PUT',
        body: JSON.stringify({
          raw: open[0],
          organization: obj.organization.ref,
        })}
    )
      .then((res) => res.json())
      .then((raw) => {
        if(raw.error) {
          throw raw.message;
        }
        obj[fld] = raw.ref;
        value = obj[fld];
        if(value.is_new()) {
          value.name = raw.name;
        }
        if(obj.contract.empty() && raw.main_contract) {
          obj.contract = raw.main_contract;
          if(obj.contract.is_new()) {
            obj.contract.name = 'Основной';
          }
        }
        setValue(value);
      })
      .catch((err) => {
        setValue(obj[fld]);
        dialogs.alert({
          title: 'Контрагент по ИНН',
          text: err?.message || err,
        });
      });
    */
    dialogs.alert({
      title: 'Контрагент по ИНН',
      text: 'Создание контрагента отключено в настройках'
    })
      .catch(e => null)
      .then(() => setOpen(null));
  };

  return <>
    <Autocomplete
      options={options}
      onChange={handleChange}
      filterOptions={filterOptions}
      getOptionLabel={getOptionLabel}
      value={value}
      label={label}
      fullWidth={fullWidth}
      disableClearable={Boolean(meta.mandatory)}
      placeholder="введите ИНН или название"
      autoHighlight
      clearOnBlur
      renderInput={renderInput}
      onInputChange={onInputChange}
      {...other}
    />
    {open ? <DialogCreate
      raw={open}
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      obj={obj}
    /> : null}
  </>;
}

