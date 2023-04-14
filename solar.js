import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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

export function solarSystemPlot(
	orbits,
	selector,
	{
		seed = 0.42,
		width = 400,
		height = 400,
		simulate = false,
		showLabels = true,
		animate = false,
		updateMilliseconds = 50,
		minSpeed = 2,
		maxSpeed = 4,
		margin = { top: 50, right: 80, bottom: 50, left: 50 },
		nudge = { x: 0.3, y: -0.25 }
	} = {}
) {
	
	let planetPositions = randomizePlanetPositions(orbits, seed);

	const maxRadius = d3.max(orbits.map((d) => d.radius));

	const scaleX = d3
		.scaleLinear()
		.domain([ -maxRadius, maxRadius ])
		.range([ -width / 2, width / 2 ]);

	const scaleY = d3
		.scaleLinear()
		.domain([ -maxRadius, maxRadius ])
		.range([ -height / 2, height / 2 ]);

  document.querySelector(selector).innerHTML = "";

	const domSvg = d3.select(selector)

	const svg = domSvg
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr(
			"transform",
			`translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`
		);

	function adjustX(val) {
		return val + nudge.x;
	}

	function adjustY(val) {
		return val + nudge.y;
	}

	const orbitRings = svg
		.selectAll("circle.orbit")
		.data(orbits)
		.enter()
		.append("circle")
		.attr("class", "orbit")
		.attr("r", (d) => scaleX(d.radius))
		.attr("cx", 0)
		.attr("cy", 0);

	const planets = svg
		.selectAll("circle.planet")
		.data(planetPositions)
		.enter()
		.append("circle")
		.attr("class", "planet")
		.attr("r", 6)
		.attr("cx", (d) => scaleX(d.x))
		.attr("cy", (d) => scaleY(d.y));

	const labels = svg
		.selectAll("text.planet-label")
		.data(planetPositions)
		.enter()
		.append("text")
		.text((d) => d.planet)
		.attr("x", (d) => scaleX(adjustX(d.x)))
		.attr("y", (d) => scaleY(adjustY(d.y)))
		.attr("visibility", showLabels ? "visible" : "hidden")
		.attr("class", "planet-label")
		.attr("text-anchor", "start");

	if (simulate) {
		function ticked() {
			labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
		}

		const simulation = d3
			.forceSimulation(planetPositions)
			.force("collision", d3.forceCollide(12)) // Prevents label overlap
			.force("x", d3.forceX((d) => scaleX(adjustX(d.x))).strength(0.1))
			.force("y", d3.forceY((d) => scaleY(adjustY(d.y))).strength(0.1))
			.on("tick", ticked);
	}

	if (animate) {
		function generateRandomSpeeds(planetNames) {
			const speeds = {};
			planetNames.forEach((planet) => {
				speeds[ planet ] = Math.random() * (maxSpeed - minSpeed) + minSpeed;
			});

			return speeds;
		}

		let planetSpeeds = generateRandomSpeeds(
			planetPositions.map((d) => d.planet)
		);

		function updatePlanetPositions(orbits, elapsedTime) {
			const updatedPositions = orbits.map((orbit) => {
				const speed = planetSpeeds[ orbit.planet ] || 1;
				const angle = (elapsedTime * speed * Math.PI) / 180;
				const x = orbit.radius * Math.cos(angle);
				const y = orbit.radius * Math.sin(angle);
				return { ...orbit, x, y };
			});

			return updatedPositions;
		}

		function updateVisualization() {
			const elapsedTime = Date.now() / 1000;
			planetPositions = updatePlanetPositions(orbits, elapsedTime);

			planets
				.data(planetPositions)
				.attr("cx", (d) => scaleX(d.x))
				.attr("cy", (d) => scaleY(d.y));
			
			if (showLabels) {
				labels
					.data(planetPositions)
					.attr("x", (d) => scaleX(adjustX(d.x)))
					.attr("y", (d) => scaleY(adjustY(d.y)))
			}
			
		}

		d3.interval(() => {
			updateVisualization();
		}, updateMilliseconds);
	}

	return domSvg;
}