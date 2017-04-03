const traceur = require('traceur');
require('traceur-source-maps').install(traceur);
traceur.require.makeDefault(filePath => !~filePath.indexOf('node_modules'));

