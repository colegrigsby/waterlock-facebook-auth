'use strict';

var jade = require( 'jade' );
var path = require( 'path' );

/**
 * Returns the email jade template as html for password reset
 * @param  {Token} token
 * @return {String} html
 */
exports.getHtmlEmail = function ( token ) {
    var config = require( './waterlock-local-auth' ).config;
    var authConfig = require( './waterlock-local-auth' ).authConfig;
    if ( typeof config === 'undefined' ) {
        throw new Error( 'No config file defined, try running [waterlock install config]' );
    }

    var resetUrl;
    if ( config.pluralizeEndpoints ) {
        resetUrl = config.baseUrl + '/auths/reset?token=' + token.token;
    } else {
        resetUrl = config.baseUrl + '/auth/reset?token=' + token.token;
    }


    var viewVars = authConfig.passwordReset.template.vars;
    viewVars.url = resetUrl;

    var templatePath = path.normalize( __dirname + '../../../' + authConfig.passwordReset.template.file );
    var html = jade.renderFile( templatePath, viewVars );

    return html;
};

/**
 * Returns the validation email jade template as html
 * @param  {Token} token
 * @return {String} html
 */
exports.getValidationEmail = function ( token ) {
    var config = require( './waterlock-local-auth' ).config;
    var authConfig = require( './waterlock-local-auth' ).authConfig;
    if ( typeof config === 'undefined' ) {
        throw new Error( 'No config file defined, try running [waterlock install config]' );
    }

    var resetUrl;
    if ( config.pluralizeEndpoints ) {
        resetUrl = config.baseUrl + '/auths/validate?token=' + token.token;
    } else {
        resetUrl = config.baseUrl + '/auth/validate?token=' + token.token;
    }


    var viewVars = authConfig.validateAccount.template.vars;
    viewVars.url = resetUrl;

    //TODO: Bad code smell here! Long chain of relative paths makes me uneasy....
    var templatePath = path.normalize( __dirname + '../../../' + authConfig.validateAccount.template.file );
    var html = jade.renderFile( templatePath, viewVars );

    return html;
};

/**
 * Callback for mailing operation
 * @param  {Object} error
 * @param  {Object} response
 */
exports.mailCallback = function ( error, info ) {
    if ( error ) {
        sails.log.error( "ERROR emailing!" );
        sails.log.error( error );
    } else {
        sails.log.info( 'Message sent: ' + info.response );
    }
};
