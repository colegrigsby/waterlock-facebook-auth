'use strict';

var _ = require('lodash');

var authConfig = require('../../waterlock-facebook-auth').authConfig;
var fb = require('../../waterlock-facebook-auth').fb;


/**
 * Oauth action
 */
module.exports = function (req, res) {
    fb.confirmIdentity(req.query.code, accessTokenResponse);


    /**
     * [accessTokenResponse description]
     * @param  {[type]} error                  [description]
     * @param  {[type]} accessToken       [description]
     */
    function accessTokenResponse(error, accessToken) {
        sails.log.debug("token response!")
        if (error && typeof accessToken !== 'undefined') {
            waterlock.logger.debug(error);
            res.serverError();
        }
        else {
            fb.getMe(userInfoResponse);
        }
    }

    /**
     * [userInfoResponse description]
     * @param  {[type]} error    [description]
     * @param  {[type]} data     [description]
     * @param  {[type]} response [description]
     * @return {[type]}          [description]
     */
    function userInfoResponse(error, response, body) {
        if (error) {
            waterlock.logger.debug(error);
            return res.serverError();
        } else {
            var _data = JSON.parse(body);

            if (_data.error) {
                waterlock.logger.debug(_data);

                return res.serverError(_data.error);


            }
            else {
                var attr = {
                    facebookId: _data.id,
                    name: _data.name,
                    username: _data.name.replace(' ', ''),
                    email: _data.email
                };

                var fieldMap = authConfig.fieldMap || {};
                var userObj = {}

                _.each(fieldMap, function (val, key) {
                    if (!_.isUndefined(_data[val])) {
                        userObj[key] = _data[val];
                    }
                });



                //In order for this to update the user instead of attr,
                //create user with fieldMapAttributes, attach auth to user
                if (req.session.authenticated) {
                    sails.log.debug("auth already")
                    //just update the auth object plz dont replace it
                    //Connect existing account with user (add just the facebook id really
                    waterlock.engine.attachAuthToUser({facebookId: attr.facebookId}, req.session.user, userFound);
                } else {


                    waterlock.Auth.findOne({facebookId: attr.facebookId}).populate('user')
                        .then(function (auth) {
                            if (auth) {
                                //user exists
                                return waterlock.cycle.loginSuccess(req, res, auth.user);

                            }
                            else {
                                //create new user
                                userObj['roles'] = [RoleCacheService.roleByName('user', '')]

                                return waterlock.User.create(userObj)
                                    .then(function (user) {
                                        return waterlock.engine.attachAuthToUser(attr, user, userFound)
                                    })

                            }
                        })
                        .catch(function (err) {
                             sails.log.debug("FUCKKK ", err)
                            res.serverError(err)
                        })


                    //new account with facebook id
                    //roles etc
                    //HANDLE undefined email hahahaha fuck
                    //waterlock.engine.findOrCreateAuth({facebookId: attr.facebookId}, attr, userFound);
                }
            }
        }
    }

    /**
     * [userFound description]
     * @param  {[type]} err  [description]
     * @param  {[type]} user [description]
     * @return {[type]}      [description]
     */
    function userFound(err, user) {
        if (err) {
            // ensure you're using username instead of email
            waterlock.logger.debug(err);
            waterlock.cycle.loginFailure(req, res, null, {error: 'trouble creating model'});
        }

        waterlock.cycle.loginSuccess(req, res, user);
    }
};
