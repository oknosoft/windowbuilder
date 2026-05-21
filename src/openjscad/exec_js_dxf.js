/**
 * ### Осуществляет экспорт в dxf
 * Created by Evgeniy Malyarov on 24.11.2017.
 */

const rectPoints = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
export function exec_dxf (scheme, Drawing) {

  let d = new Drawing();

  const {contours, bounds, ox, _scope: {CompoundPath, Path}} = scheme;
  const glasses = scheme.selected_glasses();
  const h = bounds.height + bounds.y;

  // имя будущего файла
  let name = ox.prod_name(true).replace(/\//,'-');
  name = name.substring(0, name.indexOf('/'));

  function export_path(src) {
    const {closed, curves} = src.path;
    let prev;
    const controlPoints = [];
    if(src.path.hasHandles()) {
      for(const curve of curves) {
        let {point1, point2} = curve;
        if(!prev){
          prev = point1;
          controlPoints.push([prev.x, h - prev.y]);
        }
        if(curve.hasHandles()) {
          for(let time = 0.1; time <= 1; time += 0.1) {
            const loc = curve.getLocationAtTime(time);
            controlPoints.push([loc.point.x, h - loc.point.y]);
          }
        }
        else {
          controlPoints.push([point2.x, h - point2.y]);
        }
        prev = point2;
      }
      const {length} = controlPoints;
      if(closed && (controlPoints[length - 1][0] !== controlPoints[0][0] || controlPoints[length - 1][1] !== controlPoints[0][1])){
        controlPoints[length - 1].push([controlPoints[0][0], controlPoints[0][1]]);
      }
      d.drawSpline(controlPoints);
    }
    else if(curves.length > 1) {
      for(const {point1, point2} of curves) {
        if(!prev){
          prev = point1;
          controlPoints.push([prev.x, h - prev.y]);
        }
        controlPoints.push([point2.x, h - point2.y]);
        prev = point2;
      }
      d.drawPolyline(controlPoints, closed);
    }
    else {
      let {point1, point2} = curves[0];
      d.drawLine(point1.x, h - point1.y, point2.x, h - point2.y);
    }
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
    const {elm, path, layer, imposts} = glass;
    // добавляем слой для заполнения
    d.addLayer(`g_${elm}`, Drawing.ACI.LAYER, 'CONTINUOUS');
    d.setActiveLayer(`g_${elm}`);

    export_path({path});

    // разрывы
    for(const tearing of layer.tearings) {
      if(tearing.path.height && tearing.path.width) {
        export_path({path: tearing.profile_path});
      }
    }

    // визуализация
    for(const item of layer.l_visualization.by_spec.children) {
      if(item instanceof CompoundPath) {
        const {bounds, children, data} = item;
        if(rectPoints.every(point => path.contains(bounds[point]))) {
          if(data.primitive === 'circle') {
            const {size, center} = item.bounds;
            d.drawCircle(center.x.round(1), (h - center.y).round(1), ((size.width + size.height) / 4).round(1));
          }
          else {
            for(const path of children) {
              export_path({path});
            }
          }
        }
      }
    }

    // раскладки
    if (withLay && imposts.length) {
      // добавляем слой для раскладки
      d.addLayer(`lay_${elm}`, Drawing.ACI.LAYER, 'CONTINUOUS');
      d.setActiveLayer(`lay_${elm}`);

      for (const impost of imposts) {
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
