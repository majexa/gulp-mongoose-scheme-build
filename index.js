var gulp = require('gulp');
var through2 = require('through2');
var fs = require('fs');

var typesMap = {
  "date": "Date",
  "text": "String",
  "textarea": "String",
  "price": "Number",
  "select": "String",
  "file": "String",
  "hidden": "mongoose.Types.ObjectId"
};

module.exports = function (opt) {
  return through2.obj(function (file, enc, cb) {
    var name = file.path.replace(/.*\/(.+)\.json$/, '$1');
    var scheme = '';
    var fields = JSON.parse(fs.readFileSync(file.path, 'utf8'));
    var field;
    for (var i = 0; i < fields.length; i++) {
      field = fields[i];
      if (field._virtual) {
        continue;
      }
      if (!field.name) {
        throw new Error('field.name is required');
      }
      scheme += '  ' + field.name + ': ';
      if (field._brackets) scheme += '[';
      scheme += '{\n';
      if (field._type) {
        scheme += '    type: ' + field._type;
        if (!field._ref) {
          throw new Error('no ref');
        }
        scheme += ',\n';
        scheme += "    ref: '" + field._ref + "'";
      } else {
        if (!typesMap[field.type]) {
          throw new Error('type map for "' + field.type + '" does not exists');
        }
        scheme += '    type: ' + (typesMap[field.type]);
      }
      if (field._default) {
        scheme += ',\n' + '    default: ' + field._default;
      }
      if (field.required) {
        scheme += ',\n' + '    required: true';
      }
      scheme += '\n  }';
      if (field._brackets) scheme += ']';
      if (i != fields.length - 1) {
        scheme += ',';
      }
      scheme += '\n';
    }
    scheme = "const mongoose = require('mongoose');\n\n" +
      "module.exports = mongoose.Schema({\n" + scheme + "});\n";

    var mkdirp = require('mkdirp');
    mkdirp(opt.schemasFolder, function (err) {
      if (err) console.error(err)
      else {
        fs.writeFileSync(opt.schemasFolder + '/' + name + '.js', scheme);
        console.log('Model "' + name + '" has stored to ' + opt.schemasFolder + '/' + name + '.js');
      }
      cb();
    });
  });
};