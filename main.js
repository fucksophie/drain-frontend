$( ".window" ).draggable({ handle: ".header" });

const volumeBar = document.getElementById("volume");
const audioElement = document.getElementById("audio");
const controlElement = document.getElementById("control");

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

controlElement.addEventListener('click', () => {
	if(audioElement.paused) {
		audioElement.play();
		controlElement.innerText = 'pause';
	} else {
		audioElement.pause()
		controlElement.innerText = 'play';
	}
})

const backend = location.hostname === "localhost" 
			|| location.hostname === "127.0.0.1" ? 
		"ws://localhost:3000" : 
		"wss://drain-backend.yourfriend.lv";

const ws = new WebSocket(`${backend}/ws`);
const listenerElement = document.getElementById("listeners");
const artistElement = document.getElementById("artist");
const titleElement = document.getElementById("title");

const progressElement = document.getElementById("progress");
const releasedClassElement = document.querySelector(".released");
const releasedElement = document.getElementById("released");

let song;

ws.addEventListener("message", async ev => {
	const data = JSON.parse(ev.data);

	if(data.type == "listeners") listenerElement.innerText = data.count;

	if(data.type == "song") {
		audioElement.src = backend.replace("ws", "http")+"/"+data.song.file;
		audioElement.currentTime = data.playingFor/1000;
		artistElement.innerText = data.song.artist;
		titleElement.innerText = data.song.title;
		if(song) audioElement.play(); // doesn't autoplay if we replace the src

		song = data.song;
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

		if(diff > 1.2) {
			console.log("Out of sync!!")
			audioElement.currentTime = data.playingFor/1000;
		}
	}

	if(data.type == "window") {
		const windowElement = document.createElement('div');
		windowElement.style.width = data.width + "px";

		windowElement.style.height = data.height + "px";
		windowElement.className = "window";

		const headerElement = document.createElement('div');
		headerElement.className = "header";

		windowElement.appendChild(headerElement);
		const containerElement = document.createElement("container");

		containerElement.innerHTML = data.container;
		containerElement.className = "container";

		windowElement.appendChild(containerElement);
		document.body.appendChild(windowElement);

		$( ".window" ).draggable({ handle: ".header" });
	}
})