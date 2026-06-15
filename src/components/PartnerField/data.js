import { createFilterOptions } from '@material-ui/lab/Autocomplete';

const {adapters: {pouch}, ui: {dialogs}, cat: {partners}, utils} = $p;

const filter = createFilterOptions({
  stringify(v) {
    return `${v.name}-${v.inn}`;
  }
});

export const filterOptions = (options, params) => {
  const filtered = filter(options, params);
  const {inputValue} = params;
  if ((inputValue?.length === 10 || inputValue?.length === 12) && inputValue.match(/^[0-9]*$/)) {
    if(!options.find(v => v.inn === inputValue)) {
      filtered.push({
        ref: inputValue,
        action: 'create',
        name: `Создать по ИНН "${inputValue}"`,
      });
    }
  }
  return filtered;
};

export const getOptions = (obj, fld, meta) => {
  const filter = {is_folder: false};
  if(meta?.choice_params?.length) {
    for(const {name, path} of meta.choice_params) {
      filter[name] = typeof path === 'string' ? obj[path] : path;
    }
  }
  else {
    filter.is_buyer = true;
  }


  return () => {
    const res = [];
    for(const o of partners) {
      if(utils._selection(o, filter)) {
        res.push(o);
      }
    }
    return res;
  };
};

export const handleSubmit = ({raw, obj}) => {
  // запрос на создание
  pouch.fetch(`/r/partners`, {
    method: 'PUT',
    body: JSON.stringify({
      raw,
      organization: obj.organization.ref,
      department: obj.department.ref,
    })}
  )
    .then((res) => res.json())
    .then((raw) => {
      if(raw.error) {
        throw raw.message;
      }
      partners.load_array([raw]);
      obj.partner = raw.ref;
    })
    .catch((err) => {
      dialogs.alert({
        title: 'Контрагент по ИНН',
        text: err?.message || err,
      });
    });
};
