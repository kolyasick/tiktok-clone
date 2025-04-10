export function validateEmail(email: string, errors: { email: string | null }): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "";
    return false;
  }
  if (!emailPattern.test(email)) {
    errors.email = "";
    return false;
  }
  return true;
}

export function validatePassword(password: string, errors: { password: string | null }): boolean {
  if (!password || password.length < 6 || password.length > 15) {
    errors.password = "";
    return false;
  }
  return true;
}

export function validateName(name: string, errors: { name: string | null }): boolean {
  const namePattern = /^[a-zA-Z0-9]$/;
  if (!name || name.length < 3 || name.length > 10) {
    errors.name = "";
    return false;
  }

  if (!namePattern.test(name)) {
    errors.name = "";
    return false;
  }
  return true;
}
