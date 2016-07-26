'use strict';

/**
 * attributes for token model
 * @param  {object} attributes user defined attributes
 * @return {object} template merged with attributes
 */
exports.attributes = function(attributes){
  var _ = require('lodash');

  var template = {
    token: 'text',
    owner: {
      model: 'auth'
    }
  };

  return _.merge(template, attributes);
};

/**
 * used to generate a reset token along with it's time to expiry
 * @param  {object}   values
 * @param  {Function} cb
 */
exports.beforeCreate = function(values, cb){
  var jwt = require('jwt-simple');
  var config = require('../waterlock-local-auth').config;
  var issued = Date.now();
  var uuid = require('node-uuid');
  var moment = require('moment')();
  var expiration = moment.add(2, 'days');

  var token = jwt.encode({
    iss: values.owner,
    sub: 'account validate',
    aud: config.jsonWebTokens.audience,
    exp: expiration,
    nbf: issued,
    iat: issued,
    jti: uuid.v1()
  }, config.jsonWebTokens.secret);

  values.token = token;

  cb();
};


//TODO this should not do the emailing, IMHO. Feels like MVC break.
//Maybe a sweeper service that gets notified of a new token action to take?
/**
 * used to fire off a reset password email if tokens are enabled
 * @param  {object}   token
 * @param  {Function} cb
 */
exports.afterCreate = function(token, cb){
  var config = require('../waterlock-local-auth').authConfig;

  if(config.passwordReset.tokens){

    var utils = require('../utils');
    var html = utils.getValidationEmail(token);


    //TODO: This should not have html email in the plaintext!
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.passwordReset.mail.from, // sender address
        subject: config.passwordReset.mail.subjectValidate || "Please confirm your email!", // Subject line
        text: html, // plaintext body
        html: html // html body
    };

    Auth.findOne(token.owner).exec(function(err, u){
      mailOptions.to = u.email;
      var transport = require('../waterlock-local-auth').transport;
      transport.sendMail(mailOptions, utils.mailCallback);
    });
  }

  cb();
};