import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const {cat: {branches, abonents}, utils, ui} = $p;


export function FlexibleReplication({obj, handleOk, handleIfaceState, handleNavigate}) {

  const [index, setIndex] = React.useState(0);

  let branch = sessionStorage.branch && sessionStorage.branch !== utils.blank.guid && branches.get(sessionStorage.branch);
  const babies = branch ? branch._children() : [];
  if(!branch) {
    branch = abonents.current;
    for(const item of branches) {
      if(!item.is_new()) {
        babies.push(item);
      }
    }
  }

  const currentRoute = obj.route.split(',').concat(obj.force_route.split(',')).map(ref => {
    const v = branches.by_ref[ref] || abonents.by_ref[ref];
    return v && !v.empty() ? v : null;
  }).filter(v => v);

  const list = babies.filter(v => !currentRoute.includes(v)).sort(utils.sort('name'));
  const elist = currentRoute.filter(v => v !== branch);



  const fin = () => {
    if(obj.obj_delivery_state.is('Черновик')) {
      obj.obj_delivery_state = 'Отозван';
    }
  };
  const add = () => {
    ui.dialogs.input_value({
      title: 'Укажите отдел',
      type: 'cat.branches',
      _owner: {_meta: {choice_params: [{name: 'ref', path: list.map(v => v.ref)}]}},
      flat: true,
    })
      .then((branch) => {
        const {ref} = branch;
        const {force_route} = obj;
        const prefix = force_route.length ? `${ref},` : ref;
        obj.force_route = prefix + force_route;
        fin();
        setIndex(index + 1);
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
      .then(({ref}) => {
        let {route, exclude_route, force_route} = obj;
        route = route.replace(ref, '').replace(',,', ',').replace(/,$/, '');
        force_route = force_route.replace(ref, '').replace(',,', ',').replace(/,$/, '');
        if(!exclude_route.includes(ref)) {
          if(exclude_route.length) {
            exclude_route += ',';
          }
          exclude_route += ref;
        }
        if(obj.route != route) {
          obj.route = route;
        }
        if(obj.force_route != force_route) {
          obj.force_route = force_route;
        }
        if(obj.exclude_route != exclude_route) {
          obj.exclude_route = exclude_route;
        }
        fin();
        setIndex(index + 1);
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

