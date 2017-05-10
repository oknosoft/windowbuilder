
const $p = require('../metadata');

const debug = require('debug')('wb:paper');

const paper = require('paper/dist/paper-core.js');
debug('required');

class Editor extends paper.PaperScope {

  constructor(format = 'png'){
    super();
    // Создаём экземпляр проекта Scheme
    this.create_scheme(format);
  }

  create_scheme(format = 'png') {
    const _canvas = paper.createCanvas(600, 600, format); // собственно, канвас
    _canvas.style.backgroundColor = "#f9fbfa";
    this.setup(_canvas);
    new Scheme(_canvas, this);
  }
};
$p.Editor = Editor;

