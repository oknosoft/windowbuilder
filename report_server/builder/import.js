
const $p = require('../metadata');

const debug = require('debug')('wb:paper');

const paper = require('paper/dist/paper-core.js');
debug('required');

class Editor extends paper.PaperScope {

  constructor(){
    super();
    // Создаём экземпляр проекта Scheme
    this.create_scheme();
  }

  create_scheme() {
    const _canvas = paper.createCanvas(600, 600, 'png'); // собственно, канвас
    _canvas.style.backgroundColor = "#f9fbfa";
    this.setup(_canvas);
    new Scheme(_canvas, this);
  }
}
