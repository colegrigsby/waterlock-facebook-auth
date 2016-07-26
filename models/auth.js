'use strict';

var _ = require('lodash');

exports.attributes = function(attr){
  var template = {
    facebookId: {
      type: 'float',
      unique: true
    }
  };

  _.merge(template, attr);
  _.merge(attr, template);
};
