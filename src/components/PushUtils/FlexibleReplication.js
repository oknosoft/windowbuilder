
export function FlexibleReplication({branch, babies, obj, utils, ui, handleIfaceState}) {
  const {React, Button} = ui;
  const [index, setIndex] = React.useState(0);
  const {_manager} = branch;
  const branches = obj.route.split(',').map(ref => {
    const v = _manager.get(ref);
    return v && !v.empty() ? v : null;
  }).filter(v => v);
  const list = babies.filter(v => !branches.includes(v)).sort(utils.sort('name'));
  const elist = branches.filter(v => v !== branch);
  const fin = () => {
    if(obj.obj_delivery_state.is('Черновик')) {
      obj.obj_delivery_state = 'Отозван';
    }
  };
  const add = () => {
    ui.dialogs.input_value({
      title: 'Укажите отдел',
      list,
    })
      .then((ref) => {
        const prefix = obj.route.length ? `${ref},` : ref;
        obj.route = prefix + obj.route;
        fin();
        setIndex(index + 1);
      })
      .catch(err => null);
  };
  const rm = () => {
    ui.dialogs.input_value({
      title: 'Укажите отдел',
      list: elist,
    })
      .then((ref) => {
        let route = obj.route.replace(ref, '').replace(',,', ',').replace(/,$/, '');
        obj.route = route;
        fin();
        setIndex(index + 1);
      })
      .catch(err => null);
  };

  return [
      React.createElement('div', {
        key: 'div',
        style: {marginBottom: 16, minWidth: 640}
        },
        `Текущий маршрут: ${branches.map(v => v.name).join(', ')}`
      ),
      React.createElement(Button, {
        key: 'b1',
        disabled: !list.length,
        onClick: add,
        color: 'primary'
      },
        `Добавить`
      ),
    React.createElement(Button, {
        key: 'b2',
        disabled: !elist.length,
        onClick: rm,
        color: 'primary'
      },
      `Исключить`
    ),
    ];
}

