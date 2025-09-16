/**
 * Редактор каркаса витража
 *
 * @module tool_vitrazh
 *
 * Created by Evgeniy Malyarov on 21.11.2020.
 */

// http://localhost:3000/builder/b0b0fcf0-d593-11eb-8d4e-01b541f37852
import ToolWnd from '../../components/Builder/ToolWnds/VitrazhWnd';

export default function tool_vitrazh ({Editor, dp: {builder_lay_impost}}) {

  const {ToolElement} = Editor;

  class ToolVitrazh extends ToolElement {

    constructor() {
      super();
      Object.assign(this, {
        options: {name: 'vitrazh'},
        dp: null,
      });
      this.on({
        activate: this.on_activate,
        deactivate: this.on_deactivate,
      });
    }

    on_activate() {
      super.on_activate('cursor-text-select');
      const {options, project, _scope} = this;
      _scope.tb_left && _scope.tb_left.select(options.name);
      if(!project._attr._vitrazh) {
        const obj = builder_lay_impost.create();
        obj.init_vitrazh(project, Editor);
      }
      this.dp = project._attr._vitrazh;
    }

    on_deactivate() {
      this.dp = null;
    }

    minHeight() {
      const {dp} = this;
      const byY = dp.sizes.find_rows({elm: 0});
      let y = 0;
      for(let j = 0; j < byY.length; j++) {
        for(let q= 1; q <= byY[j].quantity; q++) {
          y += (byY[j].sz || 0);
        }
      }
      if(dp.h < y) {
        dp.h = y;
      }
    }

    createProfiles() {
      this.minHeight();
      const {project, dp: {h, align_by_x, align_by_y, sizes}} = this;
      const {activeLayer} = project;
      activeLayer.clear(true);
      if(!h) {
        return;
      }
      // стойки
      const byX = sizes.find_rows({elm: 1, sz: {gt: 0}});
      const xMap = new Map();
      const profiles = [];
      const left = align_by_x.is('left');
      let attr;
      if(byX.length) {
        // стойки
        if(left) {
          attr = {e: [0, -h], b: [0, 0]};
        }
        else {
          attr = {e: [0, 0], b: [0, -h]};
        }
        const profile = activeLayer.createProfile(attr);
        profiles.push(profile);
        xMap.set(0, profile);

        const sign = left ? 1 : -1;
        let x = 0;
        for(let i = 0; i < byX.length; i++) {
          if(byX[i].sz) {
            for(let q= 1; q <= byX[i].quantity; q++) {
              x += sign * byX[i].sz;
              attr = left ? {b: [x, -h], e: [x, 0]} : {b: [x, 0], e: [x, -h]};
              const profile = activeLayer.createProfile(attr);
              profiles.push(profile);
              xMap.set(x, profile);
            }
          }
        }

        // ригели
        const byY = sizes.find_rows({elm: 0});
        const yMap = new Map();
        if(byY.length) {
          const bottom = align_by_y.is('bottom');
          const keys = Array.from(xMap.keys());
          for(let i = 1; i < keys.length; i++) {
            const cnns = {
              b: {profile: xMap.get(keys[i - 1])},
              e: {profile: xMap.get(keys[i])}
            };

            let y = 0;
            let prevCy = null;
            for(let j = 0; j < byY.length; j++) {
              for(let q= 1; q <= byY[j].quantity; q++) {
                y += (byY[j].sz || 0);
                const cy = bottom ? -y : (-h + y);
                if(cy > 0 || cy < -h) {
                  continue;
                }
                if(prevCy === null) {
                  prevCy = cy;
                }
                else {
                  if(prevCy === cy) {
                    continue;
                  }
                  prevCy = cy;
                }
                let profile;
                if(bottom && cy > -100) {
                  profile = activeLayer.createProfile({
                    b: [cnns.e.profile.b.x, cy],
                    e: [cnns.b.profile.b.x, cy],
                    cnns: {b: cnns.e, e: cnns.b}
                  });
                }
                else {
                  profile = activeLayer.createProfile({
                    b: [cnns.b.profile.b.x, cy],
                    e: [cnns.e.profile.b.x, cy],
                    cnns
                  });
                }

                profiles.push(profile);
                if(left && i === byX.length || !left && i === 1) {
                  yMap.set(cy, profile);
                }
              }
            }
          }
        }
        activeLayer.on_sys_changed(true);
        project.redraw();
        activeLayer.on_sys_changed(true);
        project.redraw();
        project.zoom_fit();
      }

    }

  }

  ToolVitrazh.ToolWnd = ToolWnd;
  Editor.ToolVitrazh = ToolVitrazh;
}
