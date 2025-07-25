
ToolPen.move_linked = function move_linked(connective) {
  const nearests = connective.joined_nearests();
  const layers = new Set();
  const profiles = new Set();
  const connectives = new Set();

  function move_layer(profile, delta) {
    if(profiles.has(profile)) {
      return;
    }
    profiles.add(profile);
    const {d0, generatrix, layer} = profile;
    if(d0 || delta) {
      layers.add(layer);
      if(!delta) {
        delta = generatrix.getNormalAt(generatrix.length).multiply(-d0);
      }
      layer.translate(delta);
      delete layer._attr._bounds;
      let checkLayers = true;
      // если у профилей сдвинутого слоя есть соединители, двигаем соседние слои
      for (const sub of layer.profiles) {
        if(!profiles.has(sub)) {
          const nearest = sub.nearest(true);
          if(nearest && !connectives.has(nearest)) {
            checkLayers = false;
            connectives.add(nearest);
            nearest.translate(delta);
            for (const sub2 of nearest.joined_nearests()) {
              if(sub2 !== sub) {
                move_layer(sub2, delta);
              }
            }
          }
          else {
            profiles.add(sub);
          }
        }
      }
      if(checkLayers) {
        // если соединителей не нашлось, ищем пересечения
        const {bounds} = layer;
        for (const candidate of profile.project.contours) {
          if(!layers.has(candidate) && candidate.bounds.intersects(bounds)) {
            const intersected = candidate.bounds.intersect(bounds);
            const profile = candidate.profiles.find(({generatrix}) => {
              const center = generatrix.getPointAt(generatrix.length / 2);
              return bounds.contains(center);
            }) || candidate.profiles[0];
            move_layer(profile, delta);
            break;
          }
        }
      }
    }
  }

  function clear_joined(layer) {
    for (const sub of layer.contours) {
      clear_joined(sub);
    }
    for (const sub of layer.profiles) {
      const {_attr} = sub;
      _attr._rays?.clear();
      delete _attr.d0;
    }
  }

  for (const profile of nearests) {
    move_layer(profile);
  }
  connective.bind_nearests(nearests);
  for(const connective of connectives) {
    connective.bind_nearests();
  }

  for (const layer of layers) {
    clear_joined(layer);
  }
};
