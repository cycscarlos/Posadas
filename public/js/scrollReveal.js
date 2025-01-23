//: SCROLL REVEAL ANIMATION */
const sr = ScrollReveal({
  distance: "160px",
  duration: 2800,
  // reset: true,
});

sr.reveal(
  `.title`,
  {
    origin: "top",
    interval: 150,
  }
);

sr.reveal(
  `.sub-title`,
  {
    origin: "left",
    interval: 200,
  }
);
