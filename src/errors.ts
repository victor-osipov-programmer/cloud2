export class GeneralError extends Error {
    status;
    constructor(message, status) {
        super(message)
        this.status = status;
    }
}

export class LoginFailed extends GeneralError {
    constructor() {
        super('Login failed', 403)
    }
}

export class ForbiddenForYou extends GeneralError {
    constructor() {
        super('Forbidden for you', 403)
    }
}

export class NotFound extends GeneralError {
    constructor() {
        super('Not found', 404)
    }
}

export class ValidationError extends GeneralError {
    errors;
    constructor(errors) {
        super('Validation error', 422)
        this.errors = errors;
    }
}

export function Validator(body, errors = {}) {
    Object.setPrototypeOf(body, Object.prototype)

    this.validate = (key, type) => {
        const messages = {
            'required': `${key} is required`,
            'number': `${key} must be a number`
        }
        
        if (errors[key]?.some(el => el == messages['required'])) return;
        if (type == 'required' && !body.hasOwnProperty(key)) {
            if (!errors.hasOwnProperty(key)) {
                errors[key] = []
            }
            errors[key].push(messages[type])
        }
    }

    this.reportError = (next) => {
        if (Object.keys(errors).length !== 0) {
            next(new ValidationError(errors))
            return true;
        }
        
        return false;
    }
}