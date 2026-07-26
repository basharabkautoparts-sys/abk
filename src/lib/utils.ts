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

/** Format a price for display. Null → "Contact for price". */
export function formatPrice(price: number | null | undefined, currency = 'THB'): string {
	if (price == null) return 'Contact for price';
	const symbol = currency === 'THB' ? '฿' : '';
	const formatted = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(price);
	return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`;
}

export function truncate(text: string, max = 160): string {
	if (text.length <= max) return text;
	return text.slice(0, max - 1).trimEnd() + '…';
}
