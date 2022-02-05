$( ".window" ).draggable({ handle: ".header" });

const volumeBar = document.getElementById("volume");
const audioElement = document.getElementById("audio");
const controlElement = document.getElementById("control");
const titleElement = document.getElementById("title");

window.paused = true;

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
		paused = false;
		controlElement.innerText = 'pause';
	} else {
		audioElement.pause()
		paused = true;
		controlElement.innerText = 'play';
	}
})
