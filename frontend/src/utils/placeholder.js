// Shared "no image" placeholder — local SVG data URI, no external dependency.
// Replaces via.placeholder.com (which now refuses connections / ERR_CONNECTION_CLOSED).
export const placeholderImg = (w = 300, h = 400) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'%3E%3Crect width='${w}' height='${h}' fill='%231a1d2e'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23666' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E`;