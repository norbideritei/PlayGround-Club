import {
	updateBookingRequest,
	deleteBookingRequest,
	createBookingRequest,
	loadBookingsRequest,
} from "./requests";
import { $, sleep, debounce } from "./utilities";

let allTeams = [];
let editId;

function readBookings() {
	return {
		promotion: document.getElementById("promotion").value,
		members: document.getElementById("members").value,
		name: document.getElementById("name").value,
		url: document.getElementById("url").value,
	};
}

function writeBooking({ promotion, members, name, url }) {
	document.getElementById("promotion").value = promotion;
	document.getElementById("members").value = members;
	document.getElementById("name").value = name;
	document.getElementById("url").value = url;
}

function getBookingsHTML(teams) {
	return teams
		.map(
			({ promotion, members, name, url, id }) => `
        <tr>
        <td>${promotion}</td>
        <td>${members}</td>
        <td>${name}</td>
        <td>${url}</td>
        <td>
          <a data-id="${id}" class="remove-btn">✖</a>
          <a data-id="${id}" class="edit-btn">&#9998;</a>
        </td>
        </tr>`
		)
		.join("");
}

function loadBookings() {
	return loadBookings().then((teams) => {
		allTeams = teams;
		displayBookings(teams);
		return teams;
	});
}

let oldDisplayTeams;

function displayBookings(teams) {
	if (oldDisplayTeams === teams) {
		return;
	}
	oldDisplayTeams = teams;
	document.querySelector("#teams tbody").innerHTML = getBookingsHTML(teams);
}

async function onSubmit(e) {
	e.preventDefault();
	const team = readBookings();
	let status = { success: false };
	if (editId) {
		team.id = editId;
		status = await updateBookingRequest(team);
		if (status.success) {
			allTeams = allTeams.map((t) => {
				if (t.id === team.id) {
					return {
						...t,
						...team,
					};
				}
				return t;
			});
		}
	} else {
		status = await createBookingRequest(team);
		if (status.success) {
			team.id = status.id;
			allTeams = [...allTeams, team];
		}
	}

	if (status.success) {
		displayBookings(allTeams);
		e.target.reset();
	}
}

function prepareEdit(id) {
	const team = allTeams.find((team) => team.id === id);
	editId = id;

	writeBooking(team);
}

function searchBooking(search) {
	return allTeams.filter((team) => {
		return team.promotion.indexOf(search) > -1;
	});
}

function initEvents() {
	const form = $("#editForm");
	form.addEventListener("submit", onSubmit);
	form.addEventListener("reset", (e) => {
		editId = undefined;
	});

	$("#search").addEventListener(
		"input",
		debounce(function (e) {
			const teams = searchBooking(e.target.value);
			displayBookings(teams);
			console.warn("search", e, this, this === e.target);
		}, 300)
	);

	$("#teams tbody").addEventListener("click", async (e) => {
		if (e.target.matches("a.remove-btn")) {
			const id = e.target.dataset.id;

			const status = await deleteBookingRequest(id);
			if (status.success) {
				loadBookings();
				// TODO don't load all teams...
			}
		} else if (e.target.matches("a.edit-btn")) {
			const id = e.target.dataset.id;
			prepareEdit(id);
		}
	});
}

$("#editForm").classList.add("loading-mask");

loadBookings().then(async () => {
	await sleep(200);
	$("#editForm").classList.remove("loading-mask");
});

initEvents();
