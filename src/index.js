import {
  updateBookingRequest,
  deleteBookingRequest,
  createBookingRequest,
  loadBookingsRequest,
} from "./requests";
import { $, sleep, debounce } from "./utilities";

let allBookings = [];
let editId;

function readBooking() {
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

function getBookingsHTML(bookings) {
  return bookings
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
  return loadBookingsRequest().then((bookings) => {
    allBookings = bookings;
    displayBookings(bookings);
    return bookings;
  });
}

let oldDisplayBookings;

function displayBookings(bookings) {
  if (oldDisplayBookings === bookings) {
    return;
  }
  oldDisplayBookings = bookings;
  document.querySelector("#bookings tbody").innerHTML =
    getBookingsHTML(bookings);
}

async function onSubmit(e) {
  e.preventDefault();
  const booking = readBooking();
  let status = { success: false };
  if (editId) {
    booking.id = editId;
    status = await updateBookingRequest(booking);
    if (status.success) {
      allBookings = allBookings.map((t) => {
        if (t.id === booking.id) {
          return {
            ...t,
            ...booking,
          };
        }
        return t;
      });
    }
  } else {
    status = await createBookingRequest(booking);
    if (status.success) {
      booking.id = status.id;
      allBookings = [...allBookings, booking];
    }
  }

  if (status.success) {
    displayBookings(allBookings);
    e.target.reset();
  }
}

function prepareEdit(id) {
  const booking = allBookings.find((booking) => booking.id === id);
  editId = id;

  writeBooking(booking);
}

function searchBookings(search) {
  return allBookings.filter((booking) => {
    return booking.promotion.indexOf(search) > -1;
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
    debounce((e) => {
      const bookings = searchBookings(e.target.value);
      displayBookings(bookings);
    }, 300)
  );

  $("#bookings tbody").addEventListener("click", async (e) => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;

      const status = await deleteBookingRequest(id);
      if (status.success) {
        loadBookings();
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
