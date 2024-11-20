
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
		errors.email = "Invalid email address";
		return false;
	}
	return true;
}

export function validatePassword(
	password: string,
	errors: { password: string | null }
): boolean {
	if (!password || password.length < 6 || password.length > 15) {
		errors.password = "Password must be 6-15 characters";
		return false;
	}
	return true;
}

export function validateName(name: string, errors: { name: string | null }): boolean {
	if (!name || name.length < 3 || name.length > 10) {
		errors.name = "Name must be 3-10 characters";
		return false
	}
	return true
}
