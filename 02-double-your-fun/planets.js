import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const seed = 0.42
const showLabels = true
const planetRadius = 6
const width = 400, height = 400
const margin = { top: 50, right: 50, bottom: 50, left: 50 }

export function initializeSystem(system) {

	const orbitRings = system
		.selectAll("circle.orbit")
		.data([])
		.enter()
		.append("circle")
		.attr("class", "orbit")
		.attr("r", (d) => scaleX(d.radius))
		.attr("cx", 0)
		.attr("cy", 0);

	const planets = system
		.selectAll("circle.planet")
		.data([])
		.enter()
		.append("circle")
		.attr("class", "planet")
		.attr("r", planetRadius)
		.attr("cx", (d) => scaleX(d.x))
		.attr("cy", (d) => scaleY(d.y));

	const labels = system
		.selectAll("text.planet-label")
		.data([])
		.enter()
		.append("text")
		.text((d) => d.planet)
		.attr("x", (d) => scaleX(d.x))
		.attr("y", (d) => scaleY(d.y))
		.attr("visibility", showLabels ? "visible" : "hidden")
		.attr("class", "planet-label")
}


export function randomizePlanetPositions(orbits, seed = 0.42) {
	const randomPositions = [];

	const sampleOne = d3.randomUniform.source(d3.randomLcg(seed));

	for (const orbit of orbits) {
		const angle = sampleOne()() * 2 * Math.PI;
		const x = orbit.radius * Math.cos(angle);
		const y = orbit.radius * Math.sin(angle);

		randomPositions.push({ x: x, y: y, planet: orbit.planet });
	}

	return randomPositions;
}

export function generateOrbits(planets, radii = null) {
	if (radii === null) {
		radii = Array.from({ length: planets.length }, (_, i) => i + 1);
	}

	const orbits = [];

	for (let i = 0; i < radii.length; i++) {
		orbits.push({ planet: planets[ i ], radius: radii[ i ] });
	}

	return orbits;
}

export function updateOrbits(system, planets, button) {

	const newOrbits = generateOrbits(planets)

	let newPlanetPositions = randomizePlanetPositions(newOrbits, seed);

	const maxRadius = d3.max(newOrbits.map((d) => d.radius));

	const scaleX = d3
		.scaleLinear()
		.domain([ -maxRadius, maxRadius ])
		.range([ -width / 2, width / 2 ]);

	const scaleY = d3
		.scaleLinear()
		.domain([ -maxRadius, maxRadius ])
		.range([ -height / 2, height / 2 ]);

	const sharedTransition = d3.transition()
		.duration(1000)
		.on('end', () => {
			button.disabled = false
		})

	// Update orbitRings
	const orbitUpdate = system.selectAll("circle.orbit")
		.data(newOrbits);

	const orbitEnter = orbitUpdate.enter()
		.append("circle")
		.attr("class", "orbit")
		.attr("r", 0)
		.attr("cx", 0)
		.attr("cy", 0);

	const orbitMerge = orbitEnter.merge(orbitUpdate);

	orbitMerge.transition(sharedTransition)
		.attr("r", (d) => scaleX(d.radius));

	orbitUpdate.exit()
		.transition(sharedTransition)
		.attr("r", 0)
		.remove();

	// Update planets
	const planetUpdate = system.selectAll("circle.planet")
		.data(newPlanetPositions);

	const planetEnter = planetUpdate.enter()
		.append("circle")
		.attr("class", "planet")
		.attr("r", 0)
		.attr("cx", (d) => scaleX(d.x))
		.attr("cy", (d) => scaleY(d.y));

	const planetMerge = planetEnter.merge(planetUpdate);

	planetMerge.transition(sharedTransition)
		.attr("r", planetRadius)
		.attr("cx", (d) => scaleX(d.x))
		.attr("cy", (d) => scaleY(d.y));

	planetUpdate.exit()
		.transition(sharedTransition)
		.attr("r", 0)
		.remove();

	const labelUpdate = system.selectAll("text.planet-label")
		.data([]);

	// Remove old labels immediately
	labelUpdate.exit()
		.remove();

	const labelEnter = labelUpdate
		.data(newPlanetPositions)
		.enter()
		.append("text")
		.text((d) => d.planet)
		.attr("x", (d) => scaleX(d.x))
		.attr("y", (d) => scaleY(d.y))
		.attr("visibility", "hidden") // Make the new labels initially hidden
		.attr("class", "planet-label");

	// const labelMerge = labelEnter.merge(labelUpdate);

	// Delay the appearance of the new labels until the end of the transition
	labelEnter.transition(sharedTransition)
		.delay(1000) // Adjust this value to match the transition duration
		.attr("x", (d) => scaleX(d.x))
		.attr("y", (d) => scaleY(d.y))
		.attr("visibility", showLabels ? "visible" : "hidden")

}