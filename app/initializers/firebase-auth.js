import FirebaseAuthenticator from '../authenticators/firebase';

export default {
	before: 'ember-simple-auth',
	name: 'firebase-auth',

	initialize(container/*, app*/) {
		container.register('authenticator:firebase', FirebaseAuthenticator);
	}
}
