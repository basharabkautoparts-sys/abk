/** URL-safe slug from an arbitrary string. */
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

export function truncate(text: string, max = 160): string {
	if (text.length <= max) return text;
	return text.slice(0, max - 1).trimEnd() + '…';
}
