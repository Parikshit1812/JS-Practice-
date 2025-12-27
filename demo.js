function isRequired(value) {
	if (value === null || value === undefined) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (Array.isArray(value)) return value.length > 0;
	return true;
}

function isEmail(value) {
	if (typeof value !== 'string') return false;
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(value.trim());
}

function isMinLength(value, len) {
	if (typeof value !== 'string') return false;
	return value.trim().length >= len;
}

function isPhone(value) {
	if (typeof value !== 'string') return false;
	const digits = value.replace(/[^0-9]/g, '');
	return digits.length >= 10 && digits.length <= 15;
}

function isStrongPassword(value) {
	if (typeof value !== 'string') return false;
	const s = value;
	if (s.length < 8) return false;
	const hasLower = /[a-z]/.test(s);
	const hasUpper = /[A-Z]/.test(s);
	const hasDigit = /[0-9]/.test(s);
	const hasSymbol = /[^A-Za-z0-9]/.test(s);
	return hasLower && hasUpper && hasDigit && hasSymbol;
}

function runValidator(value, validator) {
	if (typeof validator === 'function') {
		return validator(value) ? null : 'invalid';
	}

	if (typeof validator === 'string') {
		switch (validator) {
			case 'required':
				return isRequired(value) ? null : 'required';
			case 'email':
				return isEmail(value) ? null : 'invalid_email';
			case 'phone':
				return isPhone(value) ? null : 'invalid_phone';
			case 'strongPassword':
				return isStrongPassword(value) ? null : 'weak_password';
			default:
				return null;
		}
	}

	if (typeof validator === 'object' && validator !== null) {
		if (validator.name === 'minLength') {
			return isMinLength(value, validator.arg) ? null : `min_length_${validator.arg}`;
		}
	}

	return null;
}

function validateObject(obj, schema) {
	const errors = {};
	let valid = true;

	for (const key of Object.keys(schema)) {
		const validators = schema[key] || [];
		const value = obj[key];
		const fieldErrors = [];

		for (const v of validators) {
			const res = runValidator(value, v);
			if (res) fieldErrors.push(res);
		}

		if (fieldErrors.length) {
			errors[key] = fieldErrors;
			valid = false;
		}
	}

	return { valid, errors };
}

const demoSchema = {
	name: ['required'],
	email: ['required', 'email'],
	phone: ['phone'],
	password: ['required', { name: 'minLength', arg: 8 }, 'strongPassword']
};

const validInput = {
	name: 'Alice Example',
	email: 'alice@example.com',
	phone: '+1 (555) 123-4567',
	password: 'Secur3$Pass!'
};

const invalidInput = {
	name: ' ',
	email: 'not-an-email',
	phone: '123',
	password: 'weak'
};

if (require.main === module) {
	console.log('Valid input test:');
	console.log(validateObject(validInput, demoSchema));

	console.log('\nInvalid input test:');
	console.log(validateObject(invalidInput, demoSchema));
}

module.exports = {
	isRequired,
	isEmail,
	isMinLength,
	isPhone,
	isStrongPassword,
	validateObject
};

