
const {enm: {inserts_types}, cat: {inserts}, cch, doc: {calc_order}, current_user, job_prm, utils, EditorInvisible, ui: {dialogs}} = $p;

// доступные типы вставок
export const itypes = [inserts_types.glass, inserts_types.composite];

// доступные вставки
const ioptions = [];
const ilist = [];
const sublist = [];
const initFill = async () => {
  inserts.find_rows({insert_type: {in: itypes}, _top: 10e6}, (o) => {
    if(o.available) {
      ioptions.push(o);
    }
    if(o.insert_glass_type.empty() || o.insert_glass_type.is('Заполнение')) {
      ilist.push(o);
    }
    if(!o.insert_glass_type.empty()) {
      sublist.push(o);
    }
  });
  sublist.sort(utils.sort('name'));
  const {glasses_template: square, glasses_template_triangle: triangle} = job_prm.builder;
  if(square?.is_new()) {
    square.obj_delivery_state = 'Шаблон';
    await square.load();
  }
  if(triangle?.is_new()) {
    triangle.obj_delivery_state = 'Шаблон';
    await triangle.load();
  }
};

const findGlass = (characteristic) => {
  const {coordinates} = characteristic;
  for(const grow of coordinates) {
    if(itypes.includes(grow.inset.insert_type)) {
      return grow;
    }
  }
  const grow = coordinates.add({
    inset: inserts.find({insert_type: itypes[0], available: true, priority: 10}),
  });
  return grow;
};

const unloadEditor = (editor) => {
  const {project} = editor;
  if(project) {
    project._attr._loading = true;
    project._attr._removing = true;
    project.ox = null;
    project.clear();
  }
  editor.unload();
};

const normalize = {
  symbol: 'ₓ',
  regex: /-|_|\*|х|Х|X|x/g,
  regexM: /^(\d+)([a-zа-яё])/ui,
  map: [['ext', 'e×t'], ['lux', 'lu×'], ['mex', 'me×'], ['nix', 'ni×']],
  exec(str = '') {
    str = str.toLowerCase();
    for(const [s, t] of this.map) {
      while (str.includes(s)) {
        str = str.replace(s, t);
      }
    }
    str = str.replace(this.regex, this.symbol);
    for(const [s, t] of this.map) {
      while (str.includes(t)) {
        str = str.replace(t, s);
      }
    }
    return str;
  },
  test(strings, str) {
    return !strings && (this.regex.test(str) || this.regexM.test(str));
  },
  split(str = '') {
    return str.split(this.symbol);
  },
  number(str) {
    const parts = str.replace(/\s/g, '').split(/(\d+)/);
    for(const part of parts) {
      const num = part ? parseInt(part) : NaN;
      if(!isNaN(num)) {
        return num;
      }
    }
    return NaN;
  }
};

const importParams = [cch.properties.predefined('builder/mark_latin')];

const alert = (text) => {
  dialogs.alert({
    title: 'Импорт стеклопакетов',
    text,
  });
};

export const execute = async ({obj, text, wnd, flipFormula, triangles, flipTriangles}) => {
  if(text.startsWith('{')) {
    return alert('Неверная строка для импорта');
  }
  if(!ioptions.length) {
    await initFill();
  }
  const irows = [];
  const iparams = new Map();
  const textRows = text.split('\n');
  if(textRows.length > 120) {
    return alert('За один такт, можно загрузить не более 100 стеклопакетов.\nРазбейте импорт на несколько заказов.');
  }
  for(const row of textRows) {
    const values = row.split('\t');
    let strings = 0;
    let numbers = 0;
    let newRow;
    values.forEach((raw, index) => {
      if(!irows.length && raw) {
        const prm = importParams.find(param => param.name.toLowerCase() == raw.toLowerCase());
        if(prm) {
          iparams.set(index, prm);
        }
      }
      const formula = normalize.test(strings, raw) ? normalize.exec(raw) : '';
      const n = formula ? NaN : normalize.number(raw);
      if(isNaN(n) || newRow && numbers >= 3) {
        if(!strings && !newRow) {
          newRow = {formula: formula?.replace(/\s/g, '') || '', note: []};
        }
        if(strings && raw) {
          const prm = iparams.get(index);
          if(prm) {
            newRow[prm.ref] = raw;
          }
          else {
            newRow.note.push(raw);
          }
        }
        strings++;
      }
      else if(newRow) {
        if(!numbers) {
          newRow.len = n;
        }
        else if(numbers === 1) {
          newRow.height = n;
        }
        else if(triangles) {
          newRow.third = n;
        }
        else if(!newRow.quantity) {
          newRow.quantity = n;
        }
        numbers++;
      }
    });

    if(newRow?.formula && triangles ? newRow.third : newRow.height) {
      if(!newRow.quantity) {
        newRow.quantity = 1;
      }
      newRow.formula = newRow.formula.toLowerCase();
      newRow.note = newRow.note.join('\xA0');
      if(flipFormula) {
        const parts = normalize.split(newRow.formula).reverse();
        newRow.formula = parts.join(normalize.symbol);
      }
      irows.push(newRow);
    }
  }
  if(irows.length) {
    wnd.progressOn();
    const newRows = [];
    const problems = new Set();
    for(const {formula, len, height, third, quantity, note, ...params} of irows) {
      const candidates = [];
      let clarification;
      for(const inset of ilist) {
        const article = normalize.exec(inset.article);
        const name = normalize.exec(inset.name);
        if(article === formula) {
          candidates.push({inset, weight: 10});
        }
        else if(name === formula) {
          candidates.push({inset, weight: 9});
        }
        else if(article.startsWith(formula)) {
          candidates.push({inset, weight: 6 - (article.length - formula.length)});
        }
        else if(name.startsWith(formula)) {
          candidates.push({inset, weight: 5 - (name.length - formula.length)});
        }
      }
      if(!candidates.length) {
        const parts = normalize.split(formula);
        const thickness = parts.reduce((sum, curr) => {
          const v = normalize.number(curr);
          return isNaN(v) ? sum : sum + v;
        }, 0);
        const layers = parts.length;
        // ищем вставку с подходящим числом слоёв
        for(const inset of ilist) {
          if(inset.insert_type.is('composite')) {
            let cl = 0;
            for(const row of inset.specification) {
              if(row.quantity && row.nom?.insert_type?.is('glass') &&
                row.nom?.insert_glass_type && !row.nom.insert_glass_type.empty()) {
                cl += 1;
              }
            }
            if(layers === cl) {
              let weight = inset.thickness() === thickness ? 5 : 6;
              candidates.push({inset, weight});
            }
          }
        }
        if(candidates.length) {
          const stub = {ilist, sublist};
          const error = new Set();
          clarification = parts.map((id, ind) => {
            const pre = sublist.find((curr) => curr.name.toLowerCase() === id || curr.article.toLowerCase() === id);
            if(pre) {
              return pre;
            }
            error.add(id);
            const th = normalize.number(id);
            const c2 = sublist.filter((curr) => {
              if(curr.thickness() === th) {
                const isFrame = curr.insert_glass_type.is('Рамка');
                return  ind % 2 ? isFrame : !isFrame;
              }
            });
            if(c2.length) {
              c2.sort((a, b) => b.priority - a.priority);
              return c2[0];
            }
            return sublist[0]._manager.get();
          });
          if(error.size) {
            Object.defineProperty(clarification, 'error', {value: Array.from(error)});
          }
        }
      }
      if(candidates.length) {
        candidates.sort((a, b) => b.weight - a.weight);
        const rowProd = await obj.create_product_row({create: true});
        newRows.push(rowProd);
        const tmp = utils._clone(job_prm.builder[`glasses_template${triangles ? '_triangle' : ''}`].toJSON());
        utils._mixin(rowProd.characteristic._set_loaded(), tmp, null, 'ref,name,calc_order,timestamp,_rev,specification,class_name,struct'.split(','), true);
        // параметры из колонок
        for(const param in params) {
          const prow = rowProd.characteristic.params.find({cnstr: 0, param});
          if(prow) {
            prow.value = params[param];
          }
        }
        const editor = new EditorInvisible();
        const project = editor.create_scheme();
        await project.load(rowProd.characteristic);
        const glassRow = findGlass(rowProd.characteristic);
        const glass = editor.elm(glassRow.elm);
        glass.set_inset(candidates[0].inset, false, true);
        // по прямому совпадению не получилось - пробуем по вставкам
        if(clarification) {
          let ind = 0;
          for(const sprow of project.ox.glass_specification) {
            if(sprow.elm === glassRow.elm) {
              const inset = clarification[ind];
              ind++;
              if(inset) {
                sprow.inset = inset;
              }
            }
          }
          if(clarification.error) {
            const inset = job_prm.builder.composite_formula_err;
            project.ox.glass_specification.add({elm: glassRow.elm, inset});
          }
          else {
            glass.default_params();
          }
        }
        const {bottom, right} = project.l_dimensions;
        bottom.sizes_wnd({wnd: bottom, size: len, name: 'auto'});
        if(third) {
          // получим координаты вершин треугольника по трём сторонам
          let [a, b, c] = [third, height, len];
          if(flipTriangles) {
            [a, b] = [b, a];
          }
          const x = (b*b + c*c - a*a) / (2 * c);
          if(b*b < x*x) {
            problems.add(`Невозможный треугольник ${c} ${a} ${b}`);
            unloadEditor(editor);
            continue;
          }
          const pt = new editor.Point({x, y: -Math.sqrt(b*b - x*x)});

          while (editor.eve._async?.move_points?.timer) {
            await utils.sleep(20);
          }

          // в шаблоне, 3 - низ, 4 - лево, 1 - право
          const {e} = project.activeLayer.getItem({elm: 3});
          const profile = project.activeLayer.getItem({elm: 1});
          b = profile.b;
          b.selected = true;
          const delta = e.add(pt).subtract(b);
          if(delta.length) {
            profile.move_points(delta);
          }
        }
        else {
          right.sizes_wnd({wnd: right, size: height, name: 'auto'});
        }
        while (editor.eve._async?.move_points?.timer) {
          await utils.sleep(20);
        }
        rowProd.quantity = project._dp.quantity = quantity;
        rowProd.note = project._dp.note = project.ox.note = note;
        const extra = {clarification, formula};
        if(clarification?.error) {
          extra.error = clarification.error;
        }
        project.ox.extra = extra;
        let i = 10;
        while (project._ch.length && i > 0) {
          project.redraw();
          i--;
        }
        await project.save_coordinates({svg: true});
        rowProd.characteristic.before_save({});
        rowProd.characteristic._modified = true;
        rowProd.s = rowProd.characteristic.s;
        unloadEditor(editor);
      }
      else {
        problems.add(formula);
      }
    }

    await utils.sleep(200);
    //obj._data.chrows.clear();
    wnd.progressOff();

    if(problems.size) {
      const formulas = Array.from(problems).join('\n');
      $p.record_log({class: 'formulas', obj: formulas});
      alert(`Не найдено соответствия для формул:\n ${formulas}`);
    }
    else {
      dialogs.confirm({
        title: 'Импорт стеклопакетов',
        text: `Загружено ${newRows.length} строк\nЗаписать изменения?`,
      })
        .then(async () => {
          wnd.progressOn();
          await obj.save();
          wnd.progressOff();
        })
        .catch(e => wnd.progressOff());
    }
  }
  else {
    alert('Не найдено подходящих строк для импорта');
  }
};
