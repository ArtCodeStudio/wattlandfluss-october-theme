var documentation = require('documentation');
var fs = require('fs');
var path = require('path');

var javascriptComponents = function () {
  var dir = path.resolve(__dirname + '/../assets/javascript/components');
  var files = fs.readdirSync(__dirname + '/../assets/javascript/components');
  files.forEach(function(file) {
    var file = dir + '/' + file;
    var destPath = path.resolve(__dirname + '/../content//javascript-components-docs');
    
    if(path.extname(file) === ".js") {
      documentation.build([file], {})
      .then(documentation.formats.md)
      .then(output => {
        var dest = destPath + '/' + path.basename(file).replace('.js', '.md');
        console.log(file, '\n=>', dest);
        fs.writeFileSync(dest, output);
      });
    }
  })
}

javascriptComponents();