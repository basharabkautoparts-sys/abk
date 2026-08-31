import { browser } from '$app/environment';

/**
 * Interface language — English and Arabic.
 *
 * Why it works this way on a static host: every page is prerendered as English,
 * which is what crawlers and the canonical URLs describe. Arabic is applied in
 * the browser on hydration, from a preference kept in `localStorage`. So there
 * is no second set of URLs to build, no `?lang=` for a static host to vary on,
 * and no risk of a half-translated page being indexed.
 *
 * What is translated is the *interface*. Part names, part numbers and
 * descriptions are catalogue rows typed by staff in the admin — they stay
 * exactly as entered, in whichever language they were written, because
 * machine-flipping a part description is how a customer orders the wrong part.
 */

export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
	en: 'English',
	ar: 'العربية'
};

/** Short label for the toggle itself, where space is tight. */
export const LANG_SHORT: Record<Lang, string> = {
	en: 'EN',
	ar: 'ع'
};

export const LANG_DIR: Record<Lang, 'ltr' | 'rtl'> = {
	en: 'ltr',
	ar: 'rtl'
};

const STORAGE_KEY = 'abk:lang';

/* ------------------------------------------------------------------ *
 * Dictionary
 *
 * English is the source of truth: it is what the prerendered HTML says, and
 * `t()` falls back to it for any key Arabic has not defined. Add a key to `en`
 * first, then translate — a missing translation degrades to English rather
 * than to a raw key on the page.
 * ------------------------------------------------------------------ */

const en = {
	// --- chrome ---
	'nav.home': 'Home',
	'nav.parts': 'All Parts',
	'nav.about': 'About',
	'nav.contact': 'Contact',
	'nav.admin': 'Admin',
	'nav.adminDashboard': 'Admin dashboard',
	'nav.toggleMenu': 'Toggle menu',
	'nav.language': 'Language',

	'action.inquire': 'Inquire',
	'action.call': 'Call',
	'action.whatsapp': 'WhatsApp',
	'action.inquireWhatsapp': 'Inquire on WhatsApp',
	'action.browseParts': 'Browse All Parts',
	'action.browseCatalogue': 'Browse catalogue',
	'action.viewAll': 'View all',
	'action.view': 'View',
	'action.clearFilters': 'Clear filters',
	'action.chatWhatsapp': 'Chat on WhatsApp',

	'search.placeholder': 'Search parts or part no…',
	'search.short': 'Name or part no…',
	'search.label': 'Search parts',
	'search.searching': 'Searching…',
	'search.noMatches': 'No parts match',
	'search.seeAll': 'See all results for',
	'search.parts': 'Parts',

	// --- home ---
	'home.stat.brands': 'Vehicle brands',
	'home.stat.categories': 'Part categories',
	'home.stat.export': 'Export shipping',
	'home.stat.global': 'Global',
	'home.stat.years': 'Years exporting',

	'home.coverage.eyebrow': 'Vehicle coverage',
	'home.coverage.heading': "Parts for Japan's most trusted brands",

	'home.category.eyebrow': 'Shop by category',
	'home.category.heading': 'Find the right part',
	'home.category.lead': 'From engine internals to body panels — browse our catalogue by system.',

	'home.gallery.label': 'Genuine parts in stock at A.B.K. Auto Parts',
	'home.latest.eyebrow': 'New arrivals',
	'home.latest.heading': 'Recently added',

	'home.why.heading': 'Why buy from ABK?',
	'home.why.1.title': 'Authenticity guaranteed',
	'home.why.1.text':
		'Every part is 100% genuine — sourced through trusted Japanese channels, never imitation.',
	'home.why.2.title': 'Reliable worldwide export',
	'home.why.2.text':
		'Professional packing and worldwide shipping so your parts arrive safely, on time.',
	'home.why.3.title': 'Expert support',
	'home.why.3.text':
		'Not sure of the part number? Send us your VIN or a photo on WhatsApp and we will confirm the fit.',
	'home.why.cta': 'About ABK',

	'home.cta.heading': "Can't find your part?",
	'home.cta.lead':
		'Send us the part number, VIN, or a photo and our team will source it for you and quote a price with export shipping.',

	// --- catalogue ---
	'parts.all': 'All Parts',
	'parts.search': 'Search',
	'parts.category': 'Category',
	'parts.brand': 'Brand',
	'parts.allCategories': 'All categories',
	'parts.allBrands': 'All brands',
	'parts.sort': 'Sort',
	'parts.sort.newest': 'Newest',
	'parts.sort.name': 'Name',
	'parts.sort.brand': 'Brand',
	'parts.available': 'available',
	'parts.for': 'for',
	'parts.none.heading': 'No parts found',
	'parts.none.lead': 'Try clearing filters or contact us — we source parts on request.',
	'parts.applySearch': 'Apply search',
	'parts.searchPrefix': 'Search',
	'parts.brandParts': 'Parts',
	'parts.item': 'item',
	'parts.items': 'items',

	// --- part detail ---
	'part.partNo': 'Part No.',
	'part.inStock': 'In stock',
	'part.backorder': 'On backorder',
	'part.backorderLong': 'Available on backorder',
	'part.quoteNote':
		'We quote per enquiry, including export shipping — message us for pricing and availability.',
	'part.description': 'Description',
	'part.related': 'Related parts',
	'part.availability': 'Availability',
	'part.oem': 'OEM / Ref',
	'part.condition': 'Condition',
	'part.viewImage': 'View image',
	'part.featured': 'Featured',

	// --- footer ---
	'footer.company': 'Company',
	'footer.parts': 'Parts',
	'footer.brands': 'Vehicle Brands',
	'footer.rights': 'All rights reserved.',

	// --- about ---
	'about.eyebrow': 'About us',
	'about.heading': 'Genuine Japanese parts, trusted worldwide',
	'about.who.heading': 'Who we are',
	'about.values.heading': 'What we stand for',
	'about.brands.heading': 'Vehicle brands we cover',
	'about.cta.parts': 'Browse parts',
	'about.cta.contact': 'Contact us',

	// --- contact ---
	'contact.eyebrow': 'Get in touch',
	'contact.heading': 'Contact ABK Auto Parts',
	'contact.lead':
		"Tell us the part you need — include the part number, VIN or a photo, and we'll confirm the fit and quote a price with export shipping.",
	'contact.method.whatsapp': 'WhatsApp',
	'contact.method.whatsappHint': 'Fastest reply — send a part number or photo',
	'contact.method.phone': 'Telephone',
	'contact.method.phoneHint': 'Call us during business hours',
	'contact.method.email': 'Email',
	'contact.method.emailHint': 'For quotes and export enquiries',
	'contact.hours': 'Business hours',
	'contact.location': 'Location',
	'contact.map.heading': 'Find us',
	'contact.map.directions': 'Open in Google Maps',
	'contact.ready.heading': 'Ready to order?',
	'contact.ready.lead': 'Chat with our team now on WhatsApp for the quickest response.',
	'contact.ready.cta': 'Message on WhatsApp',

	// --- features (config.ts carries the English; these mirror it) ---
	'feature.genuine.title': '100% Genuine',
	'feature.genuine.text': 'Authentic Japanese parts, sourced and verified — no imitations.',
	'feature.export.title': 'Global Export',
	'feature.export.text': 'Reliable worldwide shipping direct from Thailand.',
	'feature.quality.title': 'Premium Quality',
	'feature.quality.text': 'Trusted service and quality you can rely on, order after order.',

	// --- long-form copy the owner supplied ---
	'site.description':
		'A.B.K. Auto Parts Co., Ltd. supplies genuine parts for Toyota, Isuzu, Mitsubishi, Nissan, and other leading automotive brands. With over 25 years of export experience, we deliver quality you can trust and service you can rely on.',
	'site.slogan': 'Quality you can trust, service you can rely on.',
	'site.tagline': 'Genuine Japanese Parts'
} as const;

export type TranslationKey = keyof typeof en;

const ar: Partial<Record<TranslationKey, string>> = {
	'nav.home': 'الرئيسية',
	'nav.parts': 'جميع القطع',
	'nav.about': 'من نحن',
	'nav.contact': 'اتصل بنا',
	'nav.admin': 'الإدارة',
	'nav.adminDashboard': 'لوحة الإدارة',
	'nav.toggleMenu': 'فتح القائمة',
	'nav.language': 'اللغة',

	'action.inquire': 'استفسار',
	'action.call': 'اتصال',
	'action.whatsapp': 'واتساب',
	'action.inquireWhatsapp': 'استفسر عبر واتساب',
	'action.browseParts': 'تصفح جميع القطع',
	'action.browseCatalogue': 'تصفح الكتالوج',
	'action.viewAll': 'عرض الكل',
	'action.view': 'عرض',
	'action.clearFilters': 'مسح عوامل التصفية',
	'action.chatWhatsapp': 'تحدث عبر واتساب',

	'search.placeholder': 'ابحث عن قطعة أو رقم القطعة…',
	'search.short': 'الاسم أو رقم القطعة…',
	'search.label': 'البحث عن القطع',
	'search.searching': 'جارٍ البحث…',
	'search.noMatches': 'لا توجد قطع مطابقة',
	'search.seeAll': 'عرض كل النتائج لـ',
	'search.parts': 'القطع',

	'home.stat.brands': 'ماركات المركبات',
	'home.stat.categories': 'فئات القطع',
	'home.stat.export': 'الشحن للتصدير',
	'home.stat.global': 'عالمي',
	'home.stat.years': 'سنة في التصدير',

	'home.coverage.eyebrow': 'الماركات المتوفرة',
	'home.coverage.heading': 'قطع غيار لأكثر الماركات اليابانية موثوقية',

	'home.category.eyebrow': 'تسوق حسب الفئة',
	'home.category.heading': 'اعثر على القطعة المناسبة',
	'home.category.lead': 'من أجزاء المحرك إلى ألواح الهيكل — تصفح الكتالوج حسب النظام.',

	'home.gallery.label': 'قطع غيار أصلية متوفرة لدى A.B.K. Auto Parts',
	'home.latest.eyebrow': 'وصل حديثاً',
	'home.latest.heading': 'أضيفت مؤخراً',

	'home.why.heading': 'لماذا تشتري من ABK؟',
	'home.why.1.title': 'أصالة مضمونة',
	'home.why.1.text': 'كل قطعة أصلية ١٠٠٪ — من مصادر يابانية موثوقة، وليست تقليداً أبداً.',
	'home.why.2.title': 'تصدير موثوق حول العالم',
	'home.why.2.text': 'تغليف احترافي وشحن عالمي حتى تصل قطعك بأمان وفي الوقت المحدد.',
	'home.why.3.title': 'دعم متخصص',
	'home.why.3.text':
		'لست متأكداً من رقم القطعة؟ أرسل لنا رقم الهيكل أو صورة عبر واتساب وسنؤكد لك المطابقة.',
	'home.why.cta': 'عن ABK',

	'home.cta.heading': 'لم تجد قطعتك؟',
	'home.cta.lead':
		'أرسل لنا رقم القطعة أو رقم الهيكل أو صورة، وسيقوم فريقنا بتوفيرها لك مع عرض سعر يشمل الشحن للتصدير.',

	'parts.all': 'جميع القطع',
	'parts.search': 'بحث',
	'parts.category': 'الفئة',
	'parts.brand': 'الماركة',
	'parts.allCategories': 'كل الفئات',
	'parts.allBrands': 'كل الماركات',
	'parts.sort': 'ترتيب',
	'parts.sort.newest': 'الأحدث',
	'parts.sort.name': 'الاسم',
	'parts.sort.brand': 'الماركة',
	'parts.available': 'متوفرة',
	'parts.for': 'لـ',
	'parts.none.heading': 'لا توجد قطع',
	'parts.none.lead': 'جرّب مسح عوامل التصفية أو تواصل معنا — نوفّر القطع عند الطلب.',
	'parts.applySearch': 'تطبيق البحث',
	'parts.searchPrefix': 'بحث',
	'parts.brandParts': 'قطع',
	'parts.item': 'قطعة',
	'parts.items': 'قطعة',

	'part.partNo': 'رقم القطعة',
	'part.inStock': 'متوفر',
	'part.backorder': 'حسب الطلب',
	'part.backorderLong': 'متاح حسب الطلب',
	'part.quoteNote': 'نُسعّر حسب كل طلب، شاملاً الشحن للتصدير — راسلنا لمعرفة السعر والتوفر.',
	'part.description': 'الوصف',
	'part.related': 'قطع ذات صلة',
	'part.availability': 'التوفر',
	'part.oem': 'رقم الشركة المصنّعة',
	'part.condition': 'الحالة',
	'part.viewImage': 'عرض الصورة',
	'part.featured': 'مميّز',

	'footer.company': 'الشركة',
	'footer.parts': 'القطع',
	'footer.brands': 'ماركات المركبات',
	'footer.rights': 'جميع الحقوق محفوظة.',

	'about.eyebrow': 'من نحن',
	'about.heading': 'قطع غيار يابانية أصلية، موثوقة عالمياً',
	'about.who.heading': 'من نحن',
	'about.values.heading': 'ما نلتزم به',
	'about.brands.heading': 'الماركات التي نغطيها',
	'about.cta.parts': 'تصفح القطع',
	'about.cta.contact': 'تواصل معنا',

	'contact.eyebrow': 'تواصل معنا',
	'contact.heading': 'اتصل بـ ABK Auto Parts',
	'contact.lead':
		'أخبرنا بالقطعة التي تحتاجها — أرفق رقم القطعة أو رقم الهيكل أو صورة، وسنؤكد المطابقة ونرسل عرض سعر يشمل الشحن للتصدير.',
	'contact.method.whatsapp': 'واتساب',
	'contact.method.whatsappHint': 'أسرع رد — أرسل رقم القطعة أو صورة',
	'contact.method.phone': 'الهاتف',
	'contact.method.phoneHint': 'اتصل بنا خلال ساعات العمل',
	'contact.method.email': 'البريد الإلكتروني',
	'contact.method.emailHint': 'لعروض الأسعار واستفسارات التصدير',
	'contact.hours': 'ساعات العمل',
	'contact.location': 'الموقع',
	'contact.map.heading': 'موقعنا',
	'contact.map.directions': 'افتح في خرائط جوجل',
	'contact.ready.heading': 'جاهز للطلب؟',
	'contact.ready.lead': 'تحدث مع فريقنا الآن عبر واتساب للحصول على أسرع رد.',
	'contact.ready.cta': 'راسلنا على واتساب',

	'feature.genuine.title': 'أصلية ١٠٠٪',
	'feature.genuine.text': 'قطع يابانية أصلية، من مصادر موثوقة ومفحوصة — بلا تقليد.',
	'feature.export.title': 'تصدير عالمي',
	'feature.export.text': 'شحن موثوق إلى جميع أنحاء العالم مباشرة من تايلاند.',
	'feature.quality.title': 'جودة ممتازة',
	'feature.quality.text': 'خدمة موثوقة وجودة تعتمد عليها، طلباً بعد طلب.',

	'site.description':
		'تورّد شركة A.B.K. Auto Parts Co., Ltd. قطع غيار أصلية لتويوتا وإيسوزو وميتسوبيشي ونيسان وغيرها من كبرى ماركات السيارات. وبخبرة تتجاوز ٢٥ عاماً في التصدير، نقدّم جودة تثق بها وخدمة تعتمد عليها.',
	'site.slogan': 'جودة تثق بها، وخدمة تعتمد عليها.',
	'site.tagline': 'قطع غيار يابانية أصلية'
};

const DICTIONARIES: Record<Lang, Partial<Record<TranslationKey, string>>> = { en, ar };

/* ------------------------------------------------------------------ */

function isLang(value: unknown): value is Lang {
	return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export const i18n: { lang: Lang } = $state({ lang: 'en' });

/** The current reading direction — `dir` on <html>, and anything keyed off it. */
export function dir(): 'ltr' | 'rtl' {
	return LANG_DIR[i18n.lang];
}

/**
 * Translate a key. Reads `i18n.lang`, so any component calling it re-renders
 * when the language changes — no store subscription, no page reload.
 */
export function t(key: TranslationKey): string {
	return DICTIONARIES[i18n.lang][key] ?? en[key];
}

function apply(lang: Lang): void {
	if (!browser) return;
	const el = document.documentElement;
	el.lang = lang;
	el.dir = LANG_DIR[lang];
}

export function setLang(lang: Lang): void {
	if (!isLang(lang) || lang === i18n.lang) return;
	i18n.lang = lang;
	apply(lang);
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, lang);
	} catch {
		// Private mode, or storage disabled. The choice still applies to this
		// page view; it just will not be remembered.
	}
}

/**
 * Restore the saved language on hydration. The prerendered HTML is always
 * English, so this is what makes an Arabic visitor's second page load look the
 * way they left it. Called once, from the root layout's `onMount`.
 */
export function initLang(): void {
	if (!browser) return;
	let saved: string | null = null;
	try {
		saved = localStorage.getItem(STORAGE_KEY);
	} catch {
		saved = null;
	}
	if (isLang(saved)) {
		i18n.lang = saved;
		apply(saved);
		return;
	}
	// No stored choice: offer Arabic to a browser that asks for it, but never
	// overwrite a deliberate one.
	const preferred = navigator.languages?.find((l) => l.toLowerCase().startsWith('ar'));
	if (preferred) setLang('ar');
}
