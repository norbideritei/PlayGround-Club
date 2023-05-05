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
    lname: document.getElementById("lname").value,
    fname: document.getElementById("fname").value,
    phone: document.getElementById("phone").value,
    peg: document.getElementById("peg").value,
  };
}

function writeBooking({ lname, fname, phone, peg }) {
  document.getElementById("lname").value = lname;
  document.getElementById("fname").value = fname;
  document.getElementById("phone").value = phone;
  document.getElementById("peg").value = peg;
}

function getBookingsHTML(bookings) {
  return bookings
    .map(
      ({ lname, fname, phone, peg, id }) => `
        <tr>
        <td>${lname}</td>
        <td>${fname}</td>
        <td>${phone}</td>
        <td>${peg}</td>
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
    return booking.lname.indexOf(search) > -1;
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
