async function main() {
  let currentSong = new Audio();
  let songs = [];

  // Example: load "cs" category by default
  await loadCategory("cs");

  // Function to load category (cs, ncs, punjabi, etc.)
  async function loadCategory(category) {
    try {
      const response = await fetch(`/songs/${category}/info.json`);
      songs = await response.json();

      if (songs.length > 0) {
        loadSong(songs[0].path); // load first song in category
      }
    } catch (err) {
      console.error(`Error loading ${category} info.json:`, err);
    }
  }

  function loadSong(path) {
    currentSong.src = path;   // Example: /songs/cs/BorntoShine.mp3
    currentSong.play().catch(err => {
      console.warn("Autoplay blocked, user interaction required:", err);
    });
  }

  // Volume toggle
  document.querySelector(".Volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector("#volumebar").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.5;
      document.querySelector("#volumebar").value = 50;
    }
  });

  // Example: switch category buttons (if you add in HTML)
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category; // ex: data-category="ncs"
      loadCategory(category);
    });
  });
}

main();
