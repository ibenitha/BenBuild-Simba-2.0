export function getAuthErrorMessage(message?: string) {
  if (!message) {
    return 'Something went wrong. Please try again.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Check your email and confirm your account before signing in.';
  }

  if (normalized.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  if (normalized.includes('password should be at least')) {
    return 'Password must be at least 6 characters.';
  }

  if (normalized.includes('unable to validate email address')) {
    return 'Enter a valid email address.';
  }

  if (normalized.includes('expired') || (normalized.includes('invalid') && normalized.includes('link'))) {
    return 'This link is no longer valid. Request a new one and try again.';
  }

  if (normalized.includes('network')) {
    return 'Network error. Check your connection and try again.';
  }

  if (normalized.includes('rate limit')) {
    return 'Too many attempts. Please wait a bit and try again.';
  }

  if (normalized.includes('database error')) {
    return 'We are having trouble connecting to our services. Please try again later.';
  }

  return message;
}
