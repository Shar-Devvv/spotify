async function main() {
  // Fetch songs list (if using info.json)
  let songs = [];
  try {
    const response = await fetch("/info.json"); // file in public/
    songs = await response.json();
  } catch (err) {
    console.error("Error loading info.json:", err);
  }

  let currentSong = new Audio();

  // Example: load first song
  if (songs.length > 0) {
    loadSong(songs[0].path);
  }

  function loadSong(path) {
    currentSong.src = path;   // path like /songs/dance/song.mp3
    currentSong.play();
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
}

main();
