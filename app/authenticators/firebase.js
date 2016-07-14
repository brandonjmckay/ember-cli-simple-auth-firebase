import Base from 'ember-simple-auth/authenticators/base';
import Firebase from 'firebase';
import config from '../config/environment';
const {
  RSVP,
  run
} = Ember;

const callback = function(error, authData) {
  run(()=> {
    if (error) {
      reject(error);
    } else {
      resolve(authData);
    }
  });
};

const resolvePromise = function(error, success) {
  run(()=> {
    if (error) {
      reject(error);
    } else {
      resolve(success);
    }
  });
};

export default Base.extend({
  firebase: null,

  init() {
    if (config.firebase && config.firebase.authDomain) {
      this.set('firebase', new Firebase(config.firebase.authDomain));
    } else {
      throw new Error("'firebase' not defined in environment");
    }

    this._super(...arguments);
  },

  restore(data) {
    return new RSVP.Promise((resolve, reject)=> {
      if (data.token) {
        this.get('firebase').authWithCustomToken(data.token, resolvePromise(error, success));

      } else {
        reject(new Error('Unable to restore Firebase session: no token found.'));
      }
    });
  },

  authenticate(options) {
    const firebase = this.get('firebase');

    if (options.provider === "password" || !options.provider) {
      const authentication = { email: options.email, password: options.password };

      return new RSVP.Promise((resolve, reject)=> {
        this.get('firebase').authWithPassword(authentication, resolvePromise(error, authData));
      });

    } else {
      return new RSVP.Promise((resolve, reject)=> {
        if (options.redirect) {
          firebase.authWithOAuthRedirect(options.provider, callback);
        } else {
          firebase.authWithOAuthPopup(options.provider, callback)
        }
      });
    }
  },

  invalidate(data) {
    return new RSVP.Promise((resolve, reject)=> {
      this.get('firebase').unauth();
      resolve(data);
    });
  }
});
