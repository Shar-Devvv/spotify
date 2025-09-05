console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds -> mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Load songs from JSON
async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`${folder}/info.json`);
    let data = await res.json();
    songs = data.tracks || [];

    // Populate sidebar song list
    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
        <li> 
            <img class="invert" src="img/music.svg" alt="music">
            <div class="info">
                <div>${song}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <polygon points="6,4 20,12 6,20" fill="#fff"/>
                </svg>
            </div> 
        </li>`;
    }

    // Attach play handler
    Array.from(songUl.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

// Play music
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// Show albums by auto-scanning /songs/
async function displayAlbum() {
    let cardContainer = document.querySelector(".cardContainer");

    try {
        let res = await fetch(`/songs/`);  // fetch folder listing
        let html = await res.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let links = div.getElementsByTagName("a");

        let folders = [];
        for (let link of links) {
            let folderName = link.href.split("/").filter(Boolean).pop();
            if (folderName && !folderName.includes(".")) {
                folders.push(folderName);
            }
        }

        for (let folder of folders) {
            try {
                let albumRes = await fetch(`songs/${folder}/info.json`);
                if (!albumRes.ok) continue;
                let data = await albumRes.json();

                cardContainer.innerHTML += `
                  <div class="card" data-folder="songs/${folder}">
                    <div class="play">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="22" fill="#22c55e"/>
                        <polygon points="21,17 21,31 31,24" fill="#000"/>
                      </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpeg" alt="${data.title}" onerror="this.src='default.jpg'">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                  </div>
                `;
            } catch (err) {
                console.warn(`Skipping folder ${folder}:`, err.message);
            }
        }

        // Add click handlers for album cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                songs = await getSongs(folder);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    } catch (err) {
        console.error("Error loading albums:", err);
    }
}

async function main() {
    // Try to load first album automatically
    try {
        let res = await fetch(`/songs/`);
        let html = await res.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let links = div.getElementsByTagName("a");

        let firstFolder = null;
        for (let link of links) {
            let folderName = link.href.split("/").filter(Boolean).pop();
            if (folderName && !folderName.includes(".")) {
                firstFolder = folderName;
                break;
            }
        }

        if (firstFolder) {
            await getSongs(`songs/${firstFolder}`);
            if (songs.length > 0) playMusic(songs[0], true);
        }
    } catch (err) {
        console.error("No albums found:", err);
    }

    // Show albums
    displayAlbum();

    // Play / pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger
    document.querySelector(".hamburg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Next & previous
    next.addEventListener("click", () => {
        let currentTrack = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentTrack);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    previous.addEventListener("click", () => {
        let currentTrack = currentSong.src.split("/").slice(-1)[0];
        let index = songs.indexOf(currentTrack);
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Volume control
    document.querySelector("#volumebar").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".Volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector("#volumebar").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector("#volumebar").value = 10;
        }
    });
}
main();
