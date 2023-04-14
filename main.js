import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Observable, BehaviorSubject, fromEvent } from 'https://cdn.jsdelivr.net/npm/rxjs@7.8.0/+esm'
import { generate_celestial_monikers } from "https://unpkg.com/celestial-moniker-generator/src/index.js"

import { initializeSystem, updateOrbits } from "./planets.js"
import { updateList } from "./list.js"

const randomNumber = d3.randomInt(4, 12)

const list = d3.select('#the-list');

const width = 400, height = 400
const margin = { top: 50, right: 80, bottom: 50, left: 50 }

const system = d3.select("#the-orbits")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr(
		"transform", `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`
	);

initializeSystem(system)

const button = document.querySelector('#the-button');
const buttonClickObservable = fromEvent(button, 'click');
buttonClickObservable.subscribe(event => {
	const newPlanetNames = generate_celestial_monikers(randomNumber())
	planetNamesSubject.next(newPlanetNames);
});

const planetNamesSubject = new BehaviorSubject([]);
const planetNamesObservable = planetNamesSubject.asObservable();
planetNamesObservable.subscribe(planets => {
	button.disabled = true;
	updateList(list, planets);
	updateOrbits(system, planets, button);
});

// start the warping!
const newPlanetNames = generate_celestial_monikers(randomNumber())
planetNamesSubject.next(newPlanetNames)