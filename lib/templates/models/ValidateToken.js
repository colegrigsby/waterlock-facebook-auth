'use strict';
/**
 * ValidateToken
 *
 * @module      :: Model
 * @description :: Describes a user's account validation token
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {

  attributes: require('waterlock').models.validateToken.attributes({
    
    /* e.g.
    nickname: 'string'
    */
    
  }),

  beforeCreate: require('waterlock').models.validateToken.beforeCreate,
  afterCreate: require('waterlock').models.validateToken.afterCreate
};
