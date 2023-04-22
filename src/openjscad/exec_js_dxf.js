/**
 * ### Осуществляет экспорт в dxf
 * Created by Evgeniy Malyarov on 24.11.2017.
 */

export function exec_dxf (scheme, Drawing) {

  let d = new Drawing();

  const {contours, bounds, ox} = scheme;
  const glasses = scheme.selected_glasses();
  const h = bounds.height + bounds.y;

  // имя будущего файла
  let name = ox.prod_name(true).replace(/\//,'-');
  name = name.substring(0, name.indexOf('/'));

  function export_path(src) {
    const path = src.path.clone(false);
    let prev;
    path.flatten(0.6);
    path.curves.forEach(({point1, point2}, index) => {
      if(!prev){
        prev = point1;
      }
      if(index == path.curves.length - 1){
        point2 = path.curves[0].point1;
      }
      else if(prev.getDistance(point2) < 2){
          return;
      }
      d.drawLine(prev.x, h - prev.y, point2.x, h - point2.y);
      prev = point2;
    });
  }

  function export_contour(layer) {
    d.addLayer(`l_${layer.cnstr}`, Drawing.ACI.LAYER, 'CONTINUOUS');
    d.setActiveLayer(`l_${layer.cnstr}`);

    for(const profile of layer.profiles) {
      export_path(profile);
    }
  }

  function iterate_contours(contour) {
    const { contours } = contour;

    export_contour(contour);

    if (contours.length) {
      contours.forEach(iterate_contours);
    }
  }

  function export_glass(glass, withLay) {
    // добавляем слой для заполнения
    d.addLayer(`g_${glass.elm}`, Drawing.ACI.LAYER, 'CONTINUOUS');
    d.setActiveLayer(`g_${glass.elm}`);

    export_path(glass);

    // разрывы
    for(const tearing of glass.layer.tearings) {
      if(tearing.path.height && tearing.path.width) {
        export_path({path: tearing.profile_path});
      }
    }


    if (withLay) {
      // добавляем слой для раскладки
      d.addLayer(`lay_${glass.elm}`, Drawing.ACI.LAYER, 'CONTINUOUS');
      d.setActiveLayer(`lay_${glass.elm}`);

      for (const impost of glass.imposts) {
        export_path(impost);
      }
    }
  }

  if(glasses.length){
    export_glass(glasses[0], true);
    name += '-' + glasses[0].elm.pad(2);
  }
  else{
    // экспортируем контуры
    contours.forEach(iterate_contours);

    // экспортируем заполнения с раскладкой
    for (const glass of scheme.glasses) {
      export_glass(glass, true);
    }
  }


  const outputData = new Blob([d.toDxfString().replace(/\n/g, '\r\n')], {type : 'application/dxf'});
  $p.wsql.alasql.utils.saveAs(outputData, `${name}.dxf`);

}
