export function loadBookingsRequest() {
  return fetch("http://localhost:3000/bookings-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());
}

export function createBookingRequest(booking) {
  return fetch("http://localhost:3000/bookings-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  }).then((r) => r.json());
}

export function updateBookingRequest(booking) {
  return fetch("http://localhost:3000/bookings-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  }).then((r) => r.json());
}

export function deleteBookingRequest(id) {
  return fetch("http://localhost:3000/bookings-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  }).then((r) => r.json());
}
