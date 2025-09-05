console.log(" Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    


    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
        <li> 
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20","")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <svg width="48" height="48" viewBox="0 0 48 48" role="img" aria-label="Play">
                    <polygon points="20,16 20,32 32,24" fill="#ffffff"/>
                </svg>
            </div> 
        </li>`;
    }

    // Attach click event to play song
    Array.from(songUl.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbum() {
    try {
        let cardContainer = document.querySelector(".cardContainer");

        // ✅ Default folders that must always load
        let folders = ["cs", "ncs"];

        // ✅ Auto-discover all folders inside /songs/
        let a = await fetch(`http://127.0.0.1:5500/songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");

        for (let index = 0; index < as.length; index++) {
            let folderName = as[index].href.split("/").filter(Boolean).pop();
            if (!folderName.includes(".")) { // ignore files, keep folders only
                if (!folders.includes(folderName)) {
                    folders.push(folderName);
                }
            }
        }

        // ✅ Now load cards for each folder
        for (let folder of folders) {
            try {
                let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                if (!res.ok) {
                    console.warn("Missing info.json for", folder);
                    continue;
                }
                let data = await res.json();

                cardContainer.innerHTML += `
                  <div class="card" data-folder="${folder}">
                    <div class="play">
                      <svg width="48" height="48" viewBox="0 0 48 48" role="img" aria-label="Play">
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
                console.error("Error in", folder, err.message);
            }
        }

        // ✅ Add click handlers for all cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async item => {
                let folder = item.currentTarget.dataset.folder;
                if (folder) {
                    console.log("Opening folder:", folder);
                    songs = await getSongs(`songs/${folder}`);
                    playMusic(songs[0]);
                }
            });
        });

    } catch (err) {
        console.error("Error loading albums:", err);
    }
}

async function main() {
    // Load default songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

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

    // Hamburg menu
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
