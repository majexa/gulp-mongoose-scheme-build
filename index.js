var gulp = require('gulp');
var through2 = require('through2');
var fs = require('fs');

var typesMap = {
  "date": "Date",
  "text": "String",
  "textarea": "String",
  "price": "Number",
  "select": "String"
};

module.exports = function (opt) {
  return through2.obj(function (file, enc, cb) {
    var name = file.path.replace(/.*\/(.+)\.json$/, '$1');
    var scheme = '';
    var fields = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    var field;
    for (var i = 0; i < fields.length; i++) {
      field = fields[i];
      scheme += '  ' + field.name + ': {\n';
      scheme += '    type: ' + (typesMap[field.type] || 'type map for "' + field.type + '" does not exists');
      if (field._default) {
        scheme += ',\n' + '    default: ' + field._default;
      }
      if (field.required) {
        scheme += ',\n' + '    required: true';
      }
      scheme += '\n  }';
      if (i != fields.length - 1) {
        scheme += ',';
      }
      scheme += '\n';
    }
    scheme = "const mongoose = require('mongoose');\n\n" +
      "module.exports = mongoose.Schema({\n" + scheme + "});\n";
    fs.writeFileSync(opt.schemasFolder + '/' + name + '.js', scheme);
    console.log('Model "' + name + '" has stored to ' + opt.schemasFolder + '/' + name + '.js');
  });
};