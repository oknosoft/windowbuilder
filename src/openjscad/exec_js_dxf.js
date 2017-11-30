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

  function export_contour(layer) {
    d.addLayer(`l_${layer.cnstr}`, Drawing.ACI.LAYER, 'CONTINOUS');
    d.setActiveLayer(`l_${layer.cnstr}`);
    for(const profile of layer.profiles) {
      const path = [];
      let start;
      profile._attr._corns.forEach(({x, y}) => {
        path.push([x, h - y]);
        if(!start){
          start = {x, y};
        }
      });
      path.push([start.x, h - start.y]);
      d.drawPolyline(path);
    }
    // for(const glass of layer.glasses(false, true)) {
    //   layers+= glass.elm;
    // }
    //layer.contours.forEach(export_contour);
  }

  if(glasses.length){
    const glPath = glasses[0].path.clone(false);
    glPath.flatten(0.5);
    const path = [];
    let prev;
    let start;
    glPath.segments.forEach(({point}) => {
      if(prev && prev.getDistance(point) < 2){
        return;
      }
      prev = point;
      if(!start){
        start = point;
      }
      path.push([point.x, h - point.y]);
    });
    path.push([start.x, h - start.y]);
    d.drawPolyline(path);
    name += '-' + glasses[0].elm.pad(2);
  }
  else{
    contours.forEach(export_contour);
  }


  const outputData = new Blob([d.toDxfString()], {type : 'application/dxf'});
  $p.wsql.alasql.utils.saveAs(outputData, `${name}.dxf`);

}
