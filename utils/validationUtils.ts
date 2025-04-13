export function validateEmail(
  email: string,
  errors: { email: string | null }
): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = "Email is required";
    return false;
  }
  if (!emailPattern.test(email)) {
    errors.email = "Please enter a valid email address";
    return false;
  }
  return true;
}

export function validatePassword(
  password: string,
  errors: { password: string | null }
): boolean {
  if (!password) {
    errors.password = "Password is required";
    return false;
  }
  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    return false;
  }
  if (password.length > 15) {
    errors.password = "Password cannot exceed 15 characters";
    return false;
  }
  return true;
}

export function validateName(
  name: string,
  errors: { name: string | null }
): boolean {
  const namePattern = /^[a-zA-Z0-9]+$/;
  if (!name) {
    errors.name = "Name is required";
    return false;
  }
  if (name.length < 3) {
    errors.name = "Name must be at least 3 characters";
    return false;
  }
  if (name.length > 10) {
    errors.name = "Name cannot exceed 10 characters";
    return false;
  }
  if (!namePattern.test(name)) {
    errors.name = "Name can only contain letters and numbers";
    return false;
  }
  return true;
}
