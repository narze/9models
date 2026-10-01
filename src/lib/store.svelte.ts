import { browser } from '$app/environment';
import { emptySlots, parseSaved, setSlot, type Slots } from './grid';

const KEY = 'my9models';

class My9 {
	slots = $state<Slots>(emptySlots());
	caption = $state('');
	count = $derived(this.slots.filter(Boolean).length);

	constructor() {
		if (!browser) return;
		try {
			const saved = parseSaved(localStorage.getItem(KEY));
			if (saved) {
				this.slots = saved.slots;
				this.caption = saved.caption;
			}
		} catch {
			/* storage unavailable */
		}
	}

	set(index: number, name: string | null) {
		this.slots = setSlot(this.slots, index, name);
		this.save();
	}

	clear() {
		this.slots = emptySlots();
		this.caption = '';
		this.save();
	}

	save() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify({ slots: this.slots, cap: this.caption }));
		} catch {
			/* storage unavailable */
		}
	}
}

export const my9 = new My9();
