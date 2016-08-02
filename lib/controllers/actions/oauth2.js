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
        if (error && typeof accessToken !== 'undefined') {
            waterlock.logger.debug(error);
            res.serverError(error); //bigger problem if this happens (probably with facebook)
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
            return res.serverError(error); //facebook error probably 
        } else {
            var _data = JSON.parse(body);

            if (_data.error) {
                waterlock.logger.debug(_data);
                //redirects to prevent server error page 
                return res.redirect(authConfig.doubleReqRedirect || "/")
            }
            else {
                var attr = {
                    facebookId: _data.id,
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
                    //just update the auth object plz dont replace it
                    //Connect existing account with user (add just the facebook id really)
                    waterlock.engine.attachAuthToUser({facebookId: attr.facebookId}, req.session.user, userFound);
                } else {


                    waterlock.Auth.findOne({facebookId: attr.facebookId})
                        .then(function (auth) {
                            if (auth) {
                                //user exists (can't use populate because its a loop to populate auth's user's auth
                                User.findOne(auth.user)
                                    .populate('auth')
                                    .then(function(user){
                                        return waterlock.cycle.loginSuccess(req, res, user);

                                    })

                            }
                            else {
                                //create new user
                                
                                if (authConfig.newUserRedirect) //lets user edit their info first 

                                    return res.ok(JSON.stringify({user: userObj, auth: attr, type: "facebook"}), authConfig.newUserRedirect)
                                
                                else { //just creates the user object 
                                    userObj['roles'] = [RoleCacheService.roleByName('user', '')]

                                    return waterlock.User.create(userObj)
                                        .then(function (user) {
                                            return waterlock.engine.attachAuthToUser(attr, user, userFound)
                                        })
                                }

                            }
                        })
                        .catch(function (err) {
                             sails.log.debug("F********** ", err)
                            res.serverError(err)
                        })


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
            waterlock.logger.debug(err);
            waterlock.cycle.loginFailure(req, res, null, {error: 'trouble creating model'});
        }

        waterlock.cycle.loginSuccess(req, res, user);
    }
};
