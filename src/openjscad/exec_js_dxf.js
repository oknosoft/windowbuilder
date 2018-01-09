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
  name = name.substr(0, name.indexOf('/'));

  function export_path(src) {
    const path = src.path.clone(false);
    let prev;
    path.flatten(0.5);
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

    // for(const glass of layer.glasses(false, true)) {
    //   export_path(glass);
    // }

    for(const profile of layer.profiles) {
      export_path(profile);
    }
  }

  if(glasses.length){
    export_path(glasses[0]);
    name += '-' + glasses[0].elm.pad(2);
  }
  else{
    contours.forEach(export_contour);
  }


  const outputData = new Blob([d.toDxfString().replace(/\n/g, '\r\n')], {type : 'application/dxf'});
  $p.wsql.alasql.utils.saveAs(outputData, `${name}.dxf`);

}
