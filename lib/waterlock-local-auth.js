'use strict';

var path = require( 'path' );
var _ = require( 'lodash' );

exports.authType = 'local';

/**
 * [installPath description]
 * @type {[type]}
 */
exports.installPath = path.normalize( __dirname + '/../../../' );

/**
 * Conditionally export mail trasport data if
 * user has opted for password tokens i.e. password
 * resets
 */

// MAK not sure why they are reloading this since it should be pulled in in sails.config.waterlock!

var configPath = path.normalize( __dirname + '/../../../config/waterlock.js' );
var wlconfig = require( configPath ).waterlock;
var method = {};
if ( _.isArray( wlconfig.authMethod ) ) {
    method = _.findWhere( wlconfig.authMethod, { name: 'waterlock-local-auth' } );
} else {
    method = wlconfig.authMethod;
}

/**
 * the entire config
 */




exports.config = wlconfig;

/**
 * the config for this method
 */
exports.authConfig = method;

if ( _.isObject( method ) && !_.isUndefined( method.passwordReset ) &&
    method.passwordReset.tokens ) {
    var nodemailer = require( 'nodemailer' );
    var mail = method.passwordReset.mail;
    
    // MAK let's replace the creds with ones in local.js, if they exist
    if ( sails.config.waterlock.emailConfig ) {
        mail.options.auth.user = sails.config.waterlock.emailConfig.user || mail.options.auth.user;
        mail.options.auth.pass = sails.config.waterlock.emailConfig.pass || mail.options.auth.pass;
    }
    
    var transport = nodemailer.createTransport( mail.options );
    exports.transport = transport;
}

/**
 * [actions description]
 * @type {[type]}
 */
exports.actions = require( './controllers' );

/**
 * [model description]
 * @type {[type]}
 */
exports.model = require( './models' );

console.log("Exporting "+exports.model);