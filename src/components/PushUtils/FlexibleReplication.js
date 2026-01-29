import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const {cat: {branches, abonents}, utils, ui} = $p;


export function FlexibleReplication({obj, handleOk, handleIfaceState, handleNavigate}) {

  const [index, setIndex] = React.useState(0);

  let currentBranch = sessionStorage.branch && sessionStorage.branch !== utils.blank.guid && branches.get(sessionStorage.branch);
  const babies = currentBranch ? currentBranch._children() : [];
  if(!currentBranch) {
    currentBranch = abonents.current;
    for(const item of branches) {
      if(!item.is_new()) {
        babies.push(item);
      }
    }
  }

  const currentRoute = obj.route.split(',').concat(obj.force_route.split(',')).map(ref => {
    if(obj.exclude_route.includes(ref)) {
      return null;
    }
    const v = branches.by_ref[ref] || abonents.by_ref[ref];
    return v && !v.empty() ? v : null;
  }).filter(v => v);

  const list = babies.filter(v => !currentRoute.includes(v)).sort(utils.sort('name'));
  const elist = currentRoute.filter(v => v !== currentBranch);

  const fin = () => {
    if(obj.obj_delivery_state.is('Черновик')) {
      obj.obj_delivery_state = 'Отозван';
    }
    obj._manager.emit_async('rows', obj, {'extra_fields': true});
    setIndex(index + 1);
  };
  const add = () => {
    ui.dialogs.input_value({
      title: 'Укажите отдел',
      type: 'cat.branches',
      _owner: {_meta: {choice_params: [{name: 'ref', path: list.map(v => v.ref)}]}},
      flat: true,
    })
      .then((branch) => {
        const {route} = obj;
        for(const {ref} of [branch, ...branch._parents()]) {
          const {force_route, exclude_route} = obj;
          if(!route.includes(ref) && !force_route.includes(ref) && currentBranch != ref) {
            obj.force_route = (force_route.length ? `${ref},` : ref) + force_route;
          }
          if(exclude_route.includes(ref)) {
            obj.exclude_route = exclude_route.replace(ref, '').replace(/,,/g, ',').replace(/(,$|^,)/, '');
          }
        }
        fin();
      })
      .catch(err => null);
  };
  const rm = () => {
    ui.dialogs.input_value({
      title: 'Укажите отдел',
      type: 'cat.branches',
      _owner: {_meta: {choice_params: [{name: 'ref', path: elist.map(v => v.ref)}]}},
      flat: true,
    })
      .then((branch) => {
        for(const {ref} of [branch, ...branch._children()]) {
          let {route, exclude_route, force_route} = obj;
          force_route = force_route.replace(ref, '').replace(/,,/g, ',').replace(/(,$|^,)/, '');
          if(!exclude_route.includes(ref)) {
            if(exclude_route.length) {
              exclude_route += ',';
            }
            exclude_route += ref;
          }
          if(obj.force_route != force_route) {
            obj.force_route = force_route;
          }
          if(obj.exclude_route != exclude_route) {
            obj.exclude_route = exclude_route;
          }
        }
        fin();
      })
      .catch(err => null);
  };

  return <>
    <Typography style={{minWidth: 640}}>{`Текущий маршрут: ${currentRoute.length ? currentRoute.map(v => v.name).join(', ') : 'Пустой'}`}</Typography>
    {!babies.length && <Typography color="error">У текущего отдела или абонента нет детей</Typography>}
    <div style={{marginBottom: 16}}/>
    <Button disabled={!list.length} onClick={add} color="primary">Добавить</Button>
    <Button disabled={!elist.length} onClick={rm} color="primary">Исключить</Button>
  </>;
}

