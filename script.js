// import audioConfig from './config.js'
window.onload = () => {
  var isPused=false
  var interval
  
  var second =0
  var minute=0
  var hour=0
  
  var secondElement=document.getElementById('second')
  var minuteElement=document.getElementById('minute')
  var hourElement=document.getElementById('hour')

  const startTimer=()=>{
    console.log('Timer started')
    second =0
    minute=0
    hour=0
    isPused=false
    console.log(second,minute,hour)
    interval=setInterval(() => {
      if(!isPused){
        second=second+1
        if(second<10){
            secondElement.innerHTML="0"+second
        }else{
            secondElement.innerHTML=second
        }
  
        if(minute<10){
            minuteElement.innerHTML="0"+minute
        }else{
            minuteElement.innerHTML=minute
        }
        if(hour<10){
            hourElement.innerHTML="0"+hour
        }else{
            hourElement.innerHTML=hour
        }
        
        if(second===59){
            minute=minute+1
            second=0
        }
        if(minute===60){
            hour=hour+1
            minute=0
        }
      }
    }, 1000);
  }
  const pauseTimer=()=>{
    console.log('Timer paused')
    isPused=true
  }  
  const resumeTimer=()=>{
    console.log('Timer resume')
    isPused=false
  }

  
  
  
  
  const link = document.getElementById('link');
  const uploaded_link = document.getElementById('uploaded_link');
  const st = document.getElementById('st');
  const uploadVideo=(videoObj)=>{
    st.innerHTML="Uploading....."
    console.log('start uploading')
    axios.post('https://test.sparkdatabox.com/host.php',videoObj)
    .then(res=>{
      console.log('done')
      console.log(res.data.url)
      uploaded_link.style.display="block"
      link.href=res.data.url
      st.style.display='none'
    })
  }




  
  
  
  const warningEl = document.getElementById('warning');
  const videoElement = document.getElementById('videoElement');
  const captureBtn = document.getElementById('captureBtn');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const download = document.getElementById('download');
  const puseBtn =document.getElementById('puseBtn')
  const resumeBtn =document.getElementById('resumeBtn')
  
  if('getDisplayMedia' in navigator.mediaDevices) warningEl.style.display = 'none';

  let blobs;
  let blob;
  let rec;
  let stream;
  let voiceStream;
  let desktopStream;
  
  const mergeAudioStreams = (desktopStream, voiceStream) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    let hasDesktop = false;
    let hasVoice = false;
    if (desktopStream && desktopStream.getAudioTracks().length > 0) {
      // If you don't want to share Audio from the desktop it should still work with just the voice.
      const source1 = context.createMediaStreamSource(desktopStream);
      const desktopGain = context.createGain();
      desktopGain.gain.value = 0.7;
      source1.connect(desktopGain).connect(destination);
      hasDesktop = true;
    }
    
    if (voiceStream && voiceStream.getAudioTracks().length > 0) {
      const source2 = context.createMediaStreamSource(voiceStream);
      const voiceGain = context.createGain();
      voiceGain.gain.value = 0.7;
      source2.connect(voiceGain).connect(destination);
      hasVoice = true;
    }
      
    return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
  };

  captureBtn.onclick = async () => {
    download.style.display = 'none';
    const audio = true
    const mic =true
    // const audio = audioConfig.speakerAudio
    // const mic = audioConfig.microphoneAudio
    
    desktopStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio: audio });
    
    if (mic === true) {
      voiceStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: mic });
    }
  
    const tracks = [
      ...desktopStream.getVideoTracks(), 
      ...mergeAudioStreams(desktopStream, voiceStream)
    ];
    
    console.log('Tracks to add to stream', tracks);
    stream = new MediaStream(tracks);
    console.log('Stream', stream)
    videoElement.srcObject = stream;
    videoElement.muted = true;
      
    blobs = [];
  
    rec = new MediaRecorder(stream, {mimeType: 'video/webm; codecs=vp8,opus'});
    rec.ondataavailable = (e) => blobs.push(e.data);
    rec.onstop = async () => {
      
      //blobs.push(MediaRecorder.requestData());
      blob = new Blob(blobs, {type: 'video/mp4'});
      let url = window.URL.createObjectURL(blob);
      var  videoObj=new FormData()
      videoObj.append('video',blob)
      uploadVideo(videoObj)
      // download.href = url;
      // download.download = 'test.mp4';
      // download.style.display = 'block';
      // download.click()
    };
    startBtn.disabled = false;
    captureBtn.disabled = true;

    startBtn.click()
    puseBtn.style.display="block"
  };
  download.onclick=()=>{
    download.style.display="none"
    second =0
    minute=0
    hour=0
    secondElement.innerHTMl=second
    minuteElement.innerHTMl=minute
    hourElement.innerHTMl=hour
  }
  startBtn.onclick = async() => {
    console.log('record started')
    startBtn.disabled = true;
    stopBtn.disabled = false;
    stopBtn.style.display="block"
    rec.start();
    startTimer()
  };

  stopBtn.onclick = () => {
    console.log('record eject')
    captureBtn.disabled = false;
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    rec.stop();
    clearInterval(interval)
    
    stream.getTracks().forEach(s=>s.stop())
    videoElement.srcObject = null
    stream = null;
    stopBtn.style.display="none"
    puseBtn.style.display="none"
    resumeBtn.style.display="none"
  };
  puseBtn.onclick=()=>{
    console.log('pause record')
    rec.pause();
    puseBtn.style.display="none"
    resumeBtn.style.display="block"
    pauseTimer()
  }
  resumeBtn.onclick=()=>{
    console.log('resume record')
    rec.resume()
    resumeBtn.style.display="none"
    puseBtn.style.display="block"
    resumeTimer()
  }
};