export function updateList(list, planets) {
	const items = list.selectAll('li')
		.data(planets);

	items.enter().append('li')
		.text(d => d)
		.merge(items)
		.text(d => d);

	items.exit().remove();
}
