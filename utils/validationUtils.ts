export function validateEmail(email: string, errors: { email: string | null }): boolean {
  const { t } = useI18n();
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = t("emailRequired")
    return false;
  }
  if (!emailPattern.test(email)) {
    errors.email = t("invalidEmail");
    return false;
  }
  return true;
}

export function validatePassword(password: string, errors: { password: string | null }): boolean {
	const { t } = useI18n();
  if (!password || password.length < 6 || password.length > 15) {
    errors.password = t("passwordLength");
    return false;
  }
  return true;
}

export function validateName(name: string, errors: { name: string | null }): boolean {
	const { t } = useI18n();
	const namePattern = /^[a-zA-Z0-9]$/
  if (!name || name.length < 3 || name.length > 10) {
    errors.name = t("nameLength");
    return false;
  }

  if (!namePattern.test(name)) {
	errors.name = t("namePattern");
	return false;
  }
  return true;
}
