export function formatDate(dateInput: string | Date, short?: boolean): string {
	const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput

	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")

	if (short) {
		return `${hours}:${minutes}`
	} else {
		return `${month}-${day} ${hours}:${minutes}`
	}
}
