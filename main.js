$( ".window" ).draggable({ handle: ".header" });

const backend = location.hostname === "localhost" 
			|| location.hostname === "127.0.0.1" ? 
		"ws://localhost:3000" : 
		"wss://drain-backend.yourfriend.lv";

const ws = new WebSocket(`${backend}/ws`);

const volumeBar = document.getElementById("volume");
const audioElement = document.getElementById("audio");
const controlElement = document.getElementById("control");
const listenerElement = document.getElementById("listeners");
const artistElement = document.getElementById("artist");
const titleElement = document.getElementById("title");

const progressElement = document.getElementById("progress");
const releasedClassElement = document.querySelector(".released");
const releasedElement = document.getElementById("released");
const playlistElement = document.getElementById("playlist");

let song;
let playlist;
let paused = true;

audioElement.volume = volumeBar.value/100;

if(localStorage.getItem("volume")) {
	audioElement.volume = localStorage.getItem("volume")/100;
	volumeBar.value = localStorage.getItem("volume");
}

volumeBar.addEventListener('click', function (e) {
    var value_clicked = e.offsetX * this.max / this.offsetWidth;
    this.value = value_clicked;
	audioElement.volume = value_clicked/100;

	localStorage.setItem("volume", value_clicked);
});

ws.addEventListener("message", async ev => {
	const data = JSON.parse(ev.data);

	if(data.type == "listeners") {
		if(data.count == 1) {
			listenerElement.innerText = "1 listener"
		} else {
			listenerElement.innerText = data.count + " listeners"
		}
	}

	if(data.type == "song") {
		audioElement.src = backend.replace("ws", "http") + "/" + data.song.file;

		audioElement.currentTime = data.playingFor / 1000;
		artistElement.innerText = data.song.artist;
		titleElement.innerText = data.song.title;
		
		if(song) {
			if(!paused) audioElement.play();

			document.getElementById(song.file).style.color = "";
		}

		song = data.song;

		document.getElementById(song.file).style.color = "yellow";
		
		if(song.date) {
			releasedClassElement.style.visibility = "visible";
			releasedElement.innerText = song.date;
		} else {
			releasedClassElement.style.visibility = "hidden";
		}
	}

	if(data.type == "timeUpdate") {
		const time = data.playingFor/1000;
		const diff = time - audioElement.currentTime;
		progressElement.value = data.playingFor/song.duration*100

		if(diff > 1.2) audioElement.currentTime = data.playingFor/1000;
	}

	if(data.type == "playlist") {
		playlist = data.playlist;
	
		playlist.forEach(song => {
			const songElement = document.createElement("li");
			
			songElement.innerText = song.artist + " - " + song.title;
			songElement.id = song.file;

			playlistElement.appendChild(songElement);
		})
	}
})

controlElement.addEventListener('click', () => {
	if(audioElement.paused) {
		audioElement.play();
		paused = false;
		controlElement.innerText = 'pause';
	} else {
		audioElement.pause()
		paused = true;
		controlElement.innerText = 'play';
	}
})
