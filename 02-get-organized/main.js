import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { Observable, BehaviorSubject, fromEvent } from 'https://cdn.jsdelivr.net/npm/rxjs@7.8.0/+esm'
import { generate_celestial_monikers } from "https://unpkg.com/celestial-moniker-generator/src/index.js"

import { updateList } from "./list.js"

const randomNumber = d3.randomInt(4, 12)

const list = d3.select('#the-list');

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