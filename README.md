# Waterlock Facebook Auth

[![Build Status](http://img.shields.io/travis/waterlock/waterlock-facebook-auth.svg?style=flat)](https://travis-ci.org/waterlock/waterlock-facebook-auth) [![NPM version](http://img.shields.io/npm/v/waterlock-facebook-auth.svg?style=flat)](http://badge.fury.io/js/waterlock-facebook-auth) [![Dependency Status](http://img.shields.io/gemnasium/davidrivera/waterlock-facebook-auth.svg?style=flat)](https://gemnasium.com/davidrivera/waterlock-facebook-auth)

waterlock-facebook-auth is a module for [waterlock](http://waterlock.ninja/)
providing a facebook authentication method for users either based on username.

## Usage

```bash
npm install waterlock-facebook-auth
```

Set the following option in your `waterlock.js` config file

 - redirectUri is an optional property - use this if you want to override the computed redirectUri. This is useful for when you want to send an auth code to waterlock instead of having waterlock handle the entire auth flow for you. Useful for when you're developing an SPA which handles the authentication with something like Torii (EmberJs). See https://github.com/wayne-o/ember-waterlock-example - waterlock will validate the auth code with the provider and retrieve an access token which can be used to setup a session and return the JWT to your app
- doubleReqRedirect is a kind of dumb fix to an even dumber problem. It redirects the user to the given uri if two requests are made so close that facebook gives the same token twice
    - this often happens with a prefetch function that many browsers implement
- new user redirect redirects to a view and sends a data object with user and auth, so the user can edit their information before account creation
    - the data object is sent as a string, so parse it if you need to.

```js
authMethod: [
	{
		name: "waterlock-facebook-auth",
		appId: "your-app-id",
		appSecret: "your-app-secret",
		redirectUri: 'redirectUri',
		doubleReqRedirect: 'doubleReqRedirect',
		newUserRedirect: "new user view"
	}
]
```

Direct your user to `/auth/login?type=facebook` will initiate the oauth request. The callback uri is `/auth/facebook_oauth2` if successfuly authenticated a user record will be created if a user is not found one will be created using the [waterlines](https://github.com/balderdashy/waterline) `findOrCreate` method

If you are using sails blueprints and have pluralized your REST API you can configure waterlock to pluralize the auth endpoints by including pluralizeEndpoints=true in the waterlock.js file:

```js
module.exports.waterlock = {

  pluralizeEndpoints: true

}
```

### Grabbing Facebook field values

By default, Overplay/waterlock-facebook-auth stores the user's `facebookId` and `email` in the Auth model. In reality, Facebook returns more data than that.

To grab and store this, you will need to modify the add the fields in your `User.js` model...

```js
// api/models/User.js
module.exports = {
	attributes: require('waterlock').models.user.attributes({
		firstName: 'string',
		lastName: 'string',
		gender: 'string',
		timezone: 'number'
	})
}
```

...and then add a `fieldMap` object within the facebook authMethod in your `waterlock.js` config file which matches your model's fields to facebook's fields.

```js
authMethod: [
	{
		name: "waterlock-facebook-auth",
		appId: "your-app-id",
		appSecret: "your-app-secret",
		fieldMap: {
			// <model-field>: <facebook-field>,
			'firstName': 'first_name',
			'lastName': 'last_name',
			'gender': 'gender',
			'timezone': 'timezone'
		}
	}
]
```

#### Notes From Cole:
The flow of the module:
waterlock login api call with type=facebook --> facebook auth login --> gets fboauth --> confirms user's identity

To attach an existing user's account with their facebook, this module also works, but leaves their data the same.
It only modifies their auth to have a facebookId, this enables them to sign in with either

The user can withhold their email from the facebook login, so it is recommended to send them to the info page on signup


