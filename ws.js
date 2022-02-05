const backend = location.hostname === "localhost" 
			|| location.hostname === "127.0.0.1" ? 
		"ws://localhost:3000" : 
		"wss://drain-backend.yourfriend.lv";

const ws = new WebSocket(`${backend}/ws`);

const listenerElement = document.getElementById("listeners");
const artistElement = document.getElementById("artist");
const progressElement = document.getElementById("progress");
const playlistElement = document.getElementById("playlist");
const releasedElement = document.getElementById("released");

const releasedClassElement = document.querySelector(".released");

let song;
let playlist;

ws.addEventListener("message", async ev => {
	const data = JSON.parse(ev.data);

	if(data.type == "listeners") listenerElement.innerText = data.count === 1 ? "1 listener" : data.count + " listeners"; 

	if(data.type == "song") {
		audioElement.src = backend.replace("ws", "http") + "/" + data.song.file;

		artistElement.innerText = data.song.artist;
		titleElement.innerText = data.song.title;
		
		audioElement.currentTime = data.playingFor / 1000;
		
		if(song) {
			if(!window.paused) audioElement.play();

			document.getElementById(song.file).style.color = "";
		}

		song = data.song;

		document.getElementById(song.file).style.color = "#dcdcdc";
		
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