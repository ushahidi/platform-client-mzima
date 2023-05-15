import { ErrorMessageMapping } from '../intefaces';

export const formErrorMessages: ErrorMessageMapping = {
  name: {
    required: 'Name is Required',
  },
  email: {
    required: 'Email is Required',
    pattern: 'Invalid email format',
  },
  password: {
    required: 'Password is Required',
    minlength: 'Password is too short',
    maxlength: 'Password is too long',
  },
};
