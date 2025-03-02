"use strict";

const EVENT_ONCE = {once: true};
const EVENT_CO = {capture: true, once: true};

const FREE_TIME = 5000; //ms

//do not change this without check the ArrayTypes
const AUDIOELEMENTS_MAX = 128;

const DEFAULT_AREALLDISABLE = false;
const DEFAULT_DELAY_FEEDBACKMAX = 16;
const DEFAULT_DELAY_FEEDBACKMIN = 4;
const DEFAULT_DELAY_TIMEMAX = 39;
const DEFAULT_DELAY_TIMEMIN = 3;
const DEFAULT_FADEIN = 2;
const DEFAULT_FADEOUT = 5;
const DEFAULT_FILTER_FREQMAX = 240;
const DEFAULT_FILTER_FREQMIN = 40;
const DEFAULT_FILTER_QMAX = 36;
const DEFAULT_FILTER_QMIN = 0;
const DEFAULT_FILTER_BANDPASS = true;
const DEFAULT_FILTER_HIGHPASS = true;
const DEFAULT_FILTER_LOWPASS = true;
const DEFAULT_FILTER_NOTCH = true;
const DEFAULT_PANNER_XMAX = 80;
const DEFAULT_PANNER_XMIN = 20;
const DEFAULT_PANNER_YMAX = 80;
const DEFAULT_PANNER_YMIN = 20;
const DEFAULT_PANNER_ZMAX = 50;
const DEFAULT_PANNER_ZMIN = 0;
const DEFAULT_PBRATE_MAX = 15;
const DEFAULT_PBRATE_MIN = 5;
//handreads of miliseconds
const DEFAULT_TIMEINTERVAL_MAX = 50;
const DEFAULT_TIMEINTERVAL_MIN = 8;
const DEFAULT_VOLUME = 0.8;

const LIMIT_MIN = 0;
const LIMIT_DELAY_FEEDBACKMAX = 17;
const LIMIT_DELAY_TIMEMAX = 49;
const LIMIT_FADES_MAX = 8;
const LIMIT_FILTER_FREQMAX = 248;
const LIMIT_FILTER_QMAX = 36;
const LIMIT_FILTER_EFFECTS = 4;
const LIMIT_PANNER_MAX = 100;
const LIMIT_PANNER_ZMAX = 50;
const LIMIT_PBRATE_MAX = 20;
//handreads of miliseconds
const LIMIT_TIMEINTERVAL_MAX = 18000;
const LIMIT_TIMEINTERVAL_MIN = 5;
const LIMIT_VOLUME_MAX = 1;     //100%
const LIMIT_VOLUME_MIN = 0.1;   //10%

const CARDINAL_MAX = 15;
const EVENTS_MAX_VALUE = 255;
const EVENTS_MIN_VALUE = 0;
const SetEvents = {
    cap: CARDINAL_MAX + 1,
    max: CARDINAL_MAX,
    len: 1,
    buf: (function () {
        var a = new Uint8Array(CARDINAL_MAX + 1);
        a[0] = 1;
        return a;
    }()),
    sum: 1,
    zeros: 0,
};

let context = null;
let Started = false;
let StartedId = 0;
const STARTEDID_MAX = 4294967295; // (2^32) - 1
const startedIdNext = function () {
    if (StartedId === STARTEDID_MAX) {
        StartedId = 0;
    } else {
        StartedId += 1;
    }
};

let DelayAreAllDisable = DEFAULT_AREALLDISABLE;
let DelayTimemax = DEFAULT_DELAY_TIMEMAX;
let DelayTimemin = DEFAULT_DELAY_TIMEMIN;
let DelayFeedbackmax = DEFAULT_DELAY_FEEDBACKMAX;
let DelayFeedbackmin = DEFAULT_DELAY_FEEDBACKMIN;
let FadeIn = DEFAULT_FADEIN;
let FadeOut = DEFAULT_FADEOUT;
let FilterAreAllDisable = DEFAULT_AREALLDISABLE;
let FilterFreqmax = DEFAULT_FILTER_FREQMAX;
let FilterFreqmin = DEFAULT_FILTER_FREQMIN;
let FilterQmax = DEFAULT_FILTER_QMAX;
let FilterQmin = DEFAULT_FILTER_QMIN;
let FilterBandpass = DEFAULT_FILTER_BANDPASS;
let FilterHighpass = DEFAULT_FILTER_HIGHPASS;
let FilterLowpass = DEFAULT_FILTER_LOWPASS;
let FilterNotch = DEFAULT_FILTER_NOTCH;
const FilterTypes = ["highpass","lowpass","bandpass","notch"];
let PannerAreAllDisable = DEFAULT_AREALLDISABLE;
let PannerXmax = DEFAULT_PANNER_XMAX;
let PannerXmin = DEFAULT_PANNER_XMIN;
let PannerYmax = DEFAULT_PANNER_YMAX;
let PannerYmin = DEFAULT_PANNER_YMIN;
let PannerZmax = DEFAULT_PANNER_ZMAX;
let PannerZmin = DEFAULT_PANNER_ZMIN;
let PbRateAreAllDisable = DEFAULT_AREALLDISABLE;
let PbRatemax = DEFAULT_PBRATE_MAX;
let PbRatemin = DEFAULT_PBRATE_MIN;
let CutREPAreAllDisable = DEFAULT_AREALLDISABLE;
let CutRSPAreAllDisable = DEFAULT_AREALLDISABLE;

//handreads of miliseconds
let TimeIntervalmax = DEFAULT_TIMEINTERVAL_MAX;
let TimeIntervalmin = DEFAULT_TIMEINTERVAL_MIN;
let TimeTemporalmax = DEFAULT_TIMEINTERVAL_MAX;
let TimeTemporalmin = DEFAULT_TIMEINTERVAL_MIN;

const SelectedAudios = {
    cap: AUDIOELEMENTS_MAX,
    len: 0,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
    all: false,
};

let AudioEventsSum = 0;
const AudioList = {
    /**@type{Array<AudioState>}*/
    buf: [],
    size: 0,
    len: 0,
    /**@type{(audio: AudioState) => undefined}*/
    push(audio) {
        if (AudioList.size === AudioList.len) {
            AudioList.buf.push(audio);
            AudioList.size += 1;
        } else {
            AudioList.buf[AudioList.len] = audio;
        }
        AudioList.len += 1;
    },
    /**@type{(i: number) => AudioState | undefined}*/
    get(i) {
        if (i < 0 || i >= AudioList.len) {
            return undefined;
        }
        return AudioList.buf[i];
    },
    /**@type{(audio: AudioState) => undefined}*/
    cleanAudio(audio) {
        //set defaults
        audio.events = 1;
        audio.delayDisabled = DelayAreAllDisable;
        audio.filterDisabled = FilterAreAllDisable;
        audio.pannerDisabled = PannerAreAllDisable;
        audio.pbrateDisabled = PbRateAreAllDisable;
        audio.rspDisabled = CutRSPAreAllDisable;
        audio.repDisabled = CutREPAreAllDisable;
        //clean
        URL.revokeObjectURL(audio.html.src);
    },

    /**@type{(audio: AudioState, i: number) => boolean}*/
    makeZombie(audio, i) {
        if (i < 0 || i >= AudioList.len) {
            return false;
        }
        if (i < AudioList.len-1) {
            AudioList.cleanAudio(audio);

            let t = AudioList.buf[i];
            AudioList.buf.copyWithin(i, i+1, AudioList.len);
            AudioList.buf[AudioList.len - 1] = t;
        }
        AudioList.len -= 1;
        return true;
    },
    /**@type{() => AudioState | undefined}*/
    getZombie() {
        if (AudioList.len < AudioList.size) {
            let t = AudioList.buf[AudioList.len];
            AudioList.len += 1;
            return t;
        }
    },
    /**@type{() => undefined}*/
    freeZombies() {
        if (AudioList.len < AudioList.size) {
            for (let i = AudioList.len; i < AudioList.size; i += 1) {
                let state = AudioList.buf[i];
                state.html.removeEventListener("timeupdate", AudioOntimeupdate);
                state.html = null;
            }
            AudioList.buf.length = AudioList.len;
            AudioList.size = AudioList.len;
        }
    }
};

let timeoutFree = 0;
const timeoutFreeFn = function () {
    if (timeoutFree !== 0) {
        AudioList.freeZombies();
        HtmlAudioZombies.replaceChildren();
        ZombiesCount = 0;
    }
};

//UTILS

/**
 * if expression is false throw an error
 * @type{(expression: boolean, msg: string | undefined) => undefined}*/
const assert = function (expression, msg) {
    //TODO ERROR NOTIFICATION
    //msg. This can break the app please reload
    if (!expression) {
        throw Error(msg);
    }
};

/**
 * @type {(min: number, max: number) => number}*/
const random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

//Html Elements

const HtmlAudioZombies = document.createDocumentFragment();
let ZombiesCount = 0;

const HtmlAudioTemplate = document.createElement("audio");
const HtmlAudioElementTemplate = (function () {
    /**@type{HTMLTemplateElement}*/
    const t = document.getElementById("t-audio-element");
    assert(t !== null, "#t-audio-element is not found");
    return t.content;
}());

const HtmlApp = document.getElementById("app");
assert(HtmlApp !== null, "#app is not found");

const HtmlAppContainer = document.getElementById("app-container");
assert(HtmlAppContainer !== null, "#app-container is not found");

const HtmlAppConfig = document.getElementById("app-config");
assert(HtmlAppConfig !== null, "#app-config is not found");

const HtmlAppDrop = document.getElementById("app-drop");
assert(HtmlAppDrop !== null, "#app-drop is not found");

const HtmlAppMenu = document.getElementById("app-menu");
assert(HtmlAppMenu !== null, "#app-menu is not found");

const HtmlCSetmax = document.getElementById("c-set-max");
assert(HtmlCSetmax !== null, "#c-set-max is not found");

const HtmlCSets = document.getElementById("c-sets");
assert(HtmlCSets !== null, "#c-sets is not found");

const HtmlCTimemin = document.getElementById("c-time-min");
assert(HtmlCTimemin !== null, "#c-time-min is not found");
const HtmlCTimeminMM = HtmlCTimemin.children["mm"].children["value"];
const HtmlCTimeminSS = HtmlCTimemin.children["ss"].children["value"];
const HtmlCTimeminMS = HtmlCTimemin.children["ms"].children["value"];

const HtmlCTimeContainer = HtmlCTimemin.parentElement.parentElement;
assert(HtmlCTimeContainer !== null, "HtmlCTimeContainer is not found");

const HtmlCTimemax = document.getElementById("c-time-max");
assert(HtmlCTimemax !== null, "#c-time-max is not found");
const HtmlCTimemaxMM = HtmlCTimemax.children["mm"].children["value"];
const HtmlCTimemaxSS = HtmlCTimemax.children["ss"].children["value"];
const HtmlCTimemaxMS = HtmlCTimemax.children["ms"].children["value"];

const HtmlCFadein = document.getElementById("c-fadein");
assert(HtmlCFadein !== null, "#c-fadein is not found");

const HtmlCFadeout = document.getElementById("c-fadeout");
assert(HtmlCFadeout !== null, "#c-fadeout is not found");

const HtmlCDelayDA = document.getElementById("c-delay-da");
assert(HtmlCDelayDA !== null, "#c-delay-da is not found");

const HtmlCDelayTimemin = document.getElementById("c-delay-timemin");
assert(HtmlCDelayTimemin !== null, "#c-delay-timemin is not found");

const HtmlCDelayTimemax = document.getElementById("c-delay-timemax");
assert(HtmlCDelayTimemax !== null, "#c-delay-timemax is not found");

const HtmlCDelayFeedbackmin = document.getElementById("c-delay-feedbackmin");
assert(HtmlCDelayFeedbackmin !== null, "#c-delay-feedbackmin is not found");

const HtmlCDelayFeedbackmax = document.getElementById("c-delay-feedbackmax");
assert(HtmlCDelayFeedbackmax !== null, "#c-delay-feedbackmax is not found");

const HtmlCFilterDA = document.getElementById("c-filter-da");
assert(HtmlCFilterDA !== null, "#c-filter-da is not found");

const HtmlCFilterFreqmin = document.getElementById("c-filter-freqmin");
assert(HtmlCFilterFreqmin !== null, "#c-filter-freqmin is not found");

const HtmlCFilterFreqmax = document.getElementById("c-filter-freqmax");
assert(HtmlCFilterFreqmax !== null, "#c-filter-freqmax is not found");

const HtmlCFilterQmin = document.getElementById("c-filter-qmin");
assert(HtmlCFilterQmin !== null, "#c-filter-qmin is not found");

const HtmlCFilterQmax = document.getElementById("c-filter-qmax");
assert(HtmlCFilterQmax !== null, "#c-filter-qmax is not found");

const HtmlCFilterEffects = document.getElementById("c-filter-effects");
assert(HtmlCFilterEffects !== null, "#c-filter-effects is not found");

const HtmlCPannerDA = document.getElementById("c-panner-da");
assert(HtmlCPannerDA !== null, "#c-panner-da is not found");

const HtmlCPannerXmin = document.getElementById("c-panner-xmin");
assert(HtmlCPannerXmin !== null, "#c-panner-xmin is not found");

const HtmlCPannerXmax = document.getElementById("c-panner-xmax");
assert(HtmlCPannerXmax !== null, "#c-panner-xmax is not found");

const HtmlCPannerYmin = document.getElementById("c-panner-ymin");
assert(HtmlCPannerYmin !== null, "#c-panner-ymin is not found");

const HtmlCPannerYmax = document.getElementById("c-panner-ymax");
assert(HtmlCPannerYmax !== null, "#c-panner-ymax is not found");

const HtmlCPannerZmin = document.getElementById("c-panner-zmin");
assert(HtmlCPannerZmin !== null, "#c-panner-zmin is not found");

const HtmlCPannerZmax = document.getElementById("c-panner-zmax");
assert(HtmlCPannerZmax !== null, "#c-panner-zmax is not found");

const HtmlCPbrateDA = document.getElementById("c-pbrate-da");
assert(HtmlCPbrateDA !== null, "#c-pbrate-da is not found");

const HtmlCPbrateMin = document.getElementById("c-pbrate-min");
assert(HtmlCPbrateMin !== null, "#c-pbrate-min is not found");

const HtmlCPbrateMax = document.getElementById("c-pbrate-max");
assert(HtmlCPbrateMax !== null, "#c-pbrate-max is not found");

const HtmlCRSPDA = document.getElementById("c-rsp-da");
assert(HtmlCRSPDA !== null, "#c-rsp-da is not found");

const HtmlCREPDA = document.getElementById("c-rep-da");
assert(HtmlCREPDA !== null, "#c-rep-da is not found");

//Formats

/**
 * range to frequency value
 * @type{(x: number) => number}*/
const getFilterFreq = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_FILTER_FREQMAX,
        "filter frequency out of range"
    );
    if (x < 60) {
        x = x + 40;
    } else if (x < 150) {
        x = (x - 50) * 10;
    } else if (x < 240) {
        x = (x - 140) * 100;
    } else {
        x = (x - 230) * 1000;
    }
    return x;
};

/**
 * range to q value
 * @type{(x: number) => number}*/
const getFilterQ = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_FILTER_QMAX,
        "filter q out of range"
    );
    if (x < 18) {
        x = (x + 2) / 20;
    } else if (x < 28) {
        x = (x - 8) / 10;
    } else {
        x = x - 26;
    }
    return x;
};

/**
 * range to playback rate value
 * @type{(x: number) => number}*/
const getPlaybackRate = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_PBRATE_MAX,
        "playback rate out of range"
    );
    if (x < 10) {
        x = (x + 10) / 20;
    } else {
        x = x / 10;
    }
    return x;
};

/**
 * range to feedback value
 * @type{(x: number) => number}*/
const getDelayFeedback = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_DELAY_FEEDBACKMAX,
        "delay feedback out of range"
    );
    return (x + 1) * 5;
};

/**
 * range to time value
 * @type{(x: number) => number}*/
const getDelayTime = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_DELAY_TIMEMAX,
        "delay time out of range"
    );
    return (x + 1) / 10;
};

/**
 * range to panner value
 * @type{(x: number) => number}*/
const getPanner = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_PANNER_MAX,
        "panner out of range"
    );
    return x - 50;
};

/**
 * range to fade value
 * @type{(x: number) => number}*/
const getFade = function (x) {
    assert(LIMIT_MIN <= x && x <= LIMIT_PANNER_MAX,
        "fade out of range"
    );
    if (x !== 0) {
        x = (20 * x) + 60;
    }
    return x;
};


/** @type{(n: number) => string}*/
const timeIntervalFormat = function (n) {
    if (n < 10) {
        return "0" + String(n);
    }
    return String(n);
};

// Audio manipulation functions

/**
@type{(
    HtmlAudio: HTMLAudioElement,
    source: MediaElementAudioSourceNode
) => AudioState}*/
const audioCreateState = function (HtmlAudio, source) {
    const panner = context.createPanner();
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.distanceModel = "inverse";
    panner.maxDistance = 10000;
    panner.orientationX.value = 0;
    panner.orientationY.value = 1;
    panner.orientationZ.value = 0;
    panner.panningModel = "HRTF";
    panner.refDistance = 1;

    const filter = context.createBiquadFilter();
    filter.channelCountMode = "max";
    filter.channelInterpretation = "speakers";
    filter.detune.value = 0;
    filter.gain.value = 1;
    filter.type = "lowpass";

    const delay = context.createDelay(getDelayTime(LIMIT_DELAY_TIMEMAX));
    const delayfeedback = context.createGain();
    const delaygain = context.createGain();
    delay.channelCountMode = "max";
    delay.channelInterpretation = "speakers";
    delay.delayTime.value = 0;
    delay.connect(delayfeedback);
    delayfeedback.connect(delayfeedback);
    delayfeedback.connect(delaygain);

    const input = context.createGain();
    const output = context.createGain();
    input.gain.value = DEFAULT_VOLUME;

    source.connect(input);
    output.connect(context.destination);

    return {
        html: HtmlAudio,
        source: source,
        events: 1,
        playing: false,
        volume: 1,
        duration: HtmlAudio.duration, //seconds
        endPoint: HtmlAudio.duration, //seconds
        endTime: HtmlAudio.duration, //seconds
        startPoint: 0, //seconds
        startTime: 0, //seconds
        delayDisabled: DelayAreAllDisable,
        filterDisabled: FilterAreAllDisable,
        pannerDisabled: PannerAreAllDisable,
        pbrateDisabled: PbRateAreAllDisable,
        rspDisabled: CutRSPAreAllDisable,
        repDisabled: CutREPAreAllDisable,
        pbrate: 1,
        input: input,
        output: output,
        filter: filter,
        panner: panner,
        delay: delay,
        delayfeedback: delayfeedback,
        delaygain: delaygain,
    };
};

const audioRandomizeConnections = function (audio) {
    audio.input.disconnect();
    audio.panner.disconnect();
    audio.filter.disconnect();
    audio.delaygain.disconnect();

    let prev = audio.input;

    if (!audio.pannerDisabled) {
        let x = getPanner(random(PannerYmin, PannerYmax)) / 10;
        let y = getPanner(random(PannerXmin, PannerXmax)) / 10;
        let z = -(random(PannerZmin, PannerZmax) / 10);
        console.info({x,y,z})
        audio.panner.positionX.value = x;
        audio.panner.positionY.value = y;
        audio.panner.positionY.value = z;
        prev.connect(audio.panner);
        prev = audio.panner;
    }
    if (Math.random() < 0.5 && !audio.filterDisabled) {
        let n = 0;
        if (FilterHighpass) {
            FilterTypes[n] = "highpass";
            n += 1;
        }
        if (FilterLowpass) {
            FilterTypes[n] = "lowpass";
            n += 1;
        }
        if (FilterBandpass) {
            FilterTypes[n] = "bandpass";
            n += 1;
        }
        if (FilterNotch) {
            FilterTypes[n] = "notch";
            n += 1;
        }
        let type = "";
        if (n === 1) {
            type = FilterTypes[0];
        } else {
            n = random(0, n-1);
            type = FilterTypes[n];
        }
        let q = 1;
        if (type !== "lowpass" && type !== "highpass") {
            q = getFilterQ(random(FilterQmin, FilterQmax));
        }
        let freq = getFilterFreq(random(FilterFreqmin, FilterFreqmax));

        console.info({type, freq, q});

        audio.filter.frequency.value = freq;
        audio.filter.type = type;
        audio.filter.Q.value = q;
        prev.connect(audio.filter);
        prev = audio.filter;
    }
    if (Math.random() < 0.5 && !audio.delayDisabled) {
        let delaytime = getDelayTime(random(DelayTimemin, DelayTimemax));
        let feedback = getDelayFeedback(random(
            DelayFeedbackmin,
            DelayFeedbackmax
        )) / 100;
        console.info({delaytime, feedback});
        audio.delay.delayTime.setValueAtTime(
            delaytime,
            context.currentTime + delaytime
        );
        audio.delayfeedback.gain.value = feedback;
        prev.connect(audio.delay);
        prev.connect(audio.delaygain);
        prev = audio.delaygain;
    }
    prev.connect(audio.output);
};

const audioPlay = function (audio) {
    if (!audio.pbrateDisabled) {
        let pbrate = getPlaybackRate(
            random(PbRatemin, PbRatemax)
        );
        console.info({pbrate});
        audio.html.playbackRate = pbrate;
    } else {
        audio.html.playbackRate = 1;
    }

    if (audio.duration >= 1) {
        let rsp = audio.startTime;
        let rep = audio.endTime;
        let interval = 0.5;
        if (!audio.rspDisabled && !audio.repDisabled) {
            let d = Math.round(audio.duration * 10);
            let p = Math.round((rep - rsp) * 10);
            let min = 5;
            let max = 0;
            if (p < 5) {
                max = min;
            } else if (p > d) {
                max = d;
            } else {
                max = p;
            }
            interval = random(min, max) / 10;
        }
        if (!audio.rspDisabled) {
            rsp = (
                random(audio.startTime * 10, (rep - interval) * 10)
                    / 10
            );
        }
        if (!audio.repDisabled) {
            rep = (
                random((rsp + interval) * 10, audio.endTime * 10)
                    / 10
            );
        }
        console.info({rsp, rep});
        audio.startPoint = rsp;
        audio.endPoint = rep;
        audio.html.endPoint = rep;
    }
    audio.html.currentTime = audio.startPoint;

    audioRandomizeConnections(audio);
    audio.html.play();
    audio.playing = true;
};

const audioPause = function (audio) {
    if (audio.playing) {
        audio.delay.delayTime.cancelScheduledValues(context.currentTime);
        audio.delay.delayTime.value = 0;
        audio.html.pause();
        audio.playing = false;
        return true;
    }
};

const audioRemove = function (audio, i) {
    audioPause(audio);
    if (!AudioList.makeZombie(audio, i)) {
        throw Error("ERROR: AudioList.makeZombie");
    }
};

/**@type{(i: number, action: string) => boolean}*/
const audioAction = function (i, action) {
    const state = AudioList.get(i);
    console.info({action,state});
    if (state === undefined) {
        return false;
    }
    if ("play" === action) {
        audioPlay(state);
        return true;
    } else if ("pause" === action) {
        audioPause(state);
        return true;
    } else if ("remove" === action) {
        AudioEventsSum -= state.events;
        audioRemove(state, i);
        return true;
    }
    return false;
}

/**
 * @type{(e: Event) => undefined}*/
const AudioOnerror = function (e) {
    const HtmlAudio = e.currentTarget;
    if (HtmlAudio.src) {
        URL.revokeObjectURL(HtmlAudio.src);
    }

    console.error(`ERROR: ${HtmlAudio.name} fails load`);
};

/**@type {(HtmlParent: HtmlElement, HtmlTarget: HTMLElement) => number}*/
const getHtmlChildIndex = function (HtmlParent, HtmlTarget) {
    let c = 0;
    for (let child of HtmlParent.children) {
        if (child === HtmlTarget) {
            return c;
        }
        c += 1;
    }
    c = -1;
    return c
};


const updateHtmlCSets = function () {
    let msg = "";
    for (let i = 0; i < SetEvents.len; i += 1) {
        const HtmlSet = HtmlCSets.children[i]; 
        if (SetEvents.buf[i] === 0) {
            msg = "-";
        } else {
            msg = (SetEvents.buf[i] / SetEvents.sum * 100).toFixed(1);
        }
        HtmlSet.children[2].children["value"].textContent = msg;
    }
};

const verifyHtmlCSets = function () {
    if (AudioList.len <= SetEvents.max) {
        SetEvents.buf[SetEvents.len] = 1;

        const HtmlSet = HtmlCSets.children[SetEvents.len];
        HtmlSet.setAttribute("data-display", "1"); 
        HtmlSet.children[1].children["value"].textContent = "1";
        SetEvents.sum += 1;
        SetEvents.len += 1;
        updateHtmlCSets();
    }

};

const ZombieAudioOncanplaythrough = function (e) {
    const HtmlAudio = e.currentTarget;
    const HtmlAudioElement = HtmlAudioZombies.children[0];
    HtmlAudioElement.appTitle.textContent = HtmlAudio.name;
    //there is a new AudioEvent
    AudioEventsSum += 1;

    verifyHtmlCSets();

    HtmlAppContainer.appendChild(HtmlAudioElement);

}

const HtmlAudioElementDefaults = function (HtmlAudioElement) {
    HtmlAudioElement.appDelay.checked = !DelayAreAllDisable;
    HtmlAudioElement.appFilter.checked = !FilterAreAllDisable;
    HtmlAudioElement.appPanner.checked = !PannerAreAllDisable;
    HtmlAudioElement.appPbrate.checked = !PbRateAreAllDisable;
    HtmlAudioElement.appRSP.checked = !CutRSPAreAllDisable;
    HtmlAudioElement.appREP.checked = !CutREPAreAllDisable;
}

/**
 * @type{(e: Event) => undefined}*/
const AudioOncanplaythrough = function (e) {
    const HtmlAudio = e.currentTarget;

    const source = context.createMediaElementSource(HtmlAudio);
    const state = audioCreateState(HtmlAudio, source);

    const HtmlAudioElement = (
        HtmlAudioElementTemplate
        .cloneNode(true)
        .firstElementChild
    );

    HtmlAudioElement.appTitle = (
        HtmlAudioElement.firstElementChild.children["title"]
    );
    HtmlAudioElement.appPlay = (
        HtmlAudioElement.firstElementChild.children["play"]
    );
    HtmlAudioElement.appVolume = (
        HtmlAudioElement.firstElementChild.children["volume"]
    );
    HtmlAudioElement.appRemove = (
        HtmlAudioElement.firstElementChild.children["remove"]
    );
    HtmlAudioElement.appDelay = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["delay"]
    );
    HtmlAudioElement.appFilter = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["filter"]
    );
    HtmlAudioElement.appPanner = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["panner"]
    );
    HtmlAudioElement.appPbrate = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["pbrate"]
    );
    HtmlAudioElement.appRSP = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["RSP"]
    );
    HtmlAudioElement.appREP = (
        HtmlAudioElement.lastElementChild.lastElementChild.elements["REP"]
    );

    HtmlAudio.endPoint = state.endPoint;
    HtmlAudioElement.appTitle.textContent = HtmlAudio.name;
    AudioList.push(state);

    HtmlAudioElementDefaults(HtmlAudioElement);

    //there is a new AudioEvent
    AudioEventsSum += 1;

    verifyHtmlCSets();

    HtmlAppContainer.appendChild(HtmlAudioElement);
};

const AudioOntimeupdate = function (e) {
    const HtmlAudio = e.currentTarget;
    if (!HtmlAudio.paused && HtmlAudio.endPoint <= HtmlAudio.currentTime) {
        assert(AudioList.len === HtmlAppContainer.children.length);
        for (let i = 0; i < AudioList.len; i += 1) {
            if (AudioList.buf[i].html === HtmlAudio) {
                const HtmlAudioElement = HtmlAppContainer.children[i];
                HtmlAudioElement.setAttribute("data-playing", "0");
                audioPause(AudioList.buf[i]);
            }
        }
    }
};

/**
 * @type {(files: FileList) => undefined}*/
const addFiles = function (files) {
    if (AudioList.len === AUDIOELEMENTS_MAX) {
        //TODO: NOTIFICATION
        //Audio Elements are full
        return;
    }
    for (let file of files) {
        if (!file.type.startsWith("audio/")) {
            continue;
        }
        if (!HtmlAudioTemplate.canPlayType(file.type)) {
            console.warn(
                "WARNING:",
                `can not play audio type ${file.type} from ${file.name}`
            );
            //TODO NOTIFICATION
            //AUDIO is not playable
            continue;
        }
        if (ZombiesCount > 0) {
            ZombiesCount -= 1;

            const AudioState = AudioList.getZombie();
            assert(AudioState !== undefined, "ERROR undefined state: AudioList.getZombie");

            const HtmlAudio = AudioState.html;

            if (AudioList.len < AudioList.size) {
                clearTimeout(timeoutFree);
                timeoutFree = setTimeout(timeoutFreeFn, FREE_TIME);
            }

            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio.name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio.type = file.type;
            HtmlAudio.endPoint = 0;

            HtmlAudio.addEventListener("error", AudioOnerror, EVENT_CO);
            HtmlAudio.addEventListener(
                "canplaythrough",
                ZombieAudioOncanplaythrough,
                EVENT_CO
            );
        } else {
            const HtmlAudio = HtmlAudioTemplate.cloneNode();
            HtmlAudio.addEventListener("timeupdate", AudioOntimeupdate, true);

            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio.name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio.type = file.type;
            HtmlAudio.preservesPitch = false;
            HtmlAudio.endPoint = 0;

            HtmlAudio.addEventListener("error", AudioOnerror, EVENT_CO);
            HtmlAudio.addEventListener(
                "canplaythrough",
                AudioOncanplaythrough,
                EVENT_CO
            );
        }
    }
};


//Generative funtions

//Practical Vose's Alias Method
//from https://keithschwarz.com/darts-dice-coins
const AMAlias = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint32Array(AUDIOELEMENTS_MAX),
};
const AMProbs = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint32Array(AUDIOELEMENTS_MAX),
};
const AMSmalls = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
};
const AMLarges = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
};
const AMP = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint32Array(AUDIOELEMENTS_MAX)
};

/**@type{(events: {len: number, buf: Array<number>, sum: number}) => number}*/
const selectCardinal = function (events) {
    let cardinal = 0;
    const len = events.len;
    const randIdx = random(0, len-1);
    AMProbs.len = len;
    AMAlias.len = len;
    AMSmalls.len = 0;
    AMLarges.len = 0;
    AMP.len = 0;
    for (let i = 0; i < len; i += 1) {
        const res = events.buf[i] * len;
        if (res < events.sum) {
            AMSmalls.buf[AMSmalls.len] = i;
            AMSmalls.len += 1;
        } else {
            AMLarges.buf[AMLarges.len] = i;
            AMLarges.len += 1;
        }
        AMP.buf[AMP.len] = res;
        AMP.len += 1;
    }
    let s = 0;
    let l = 0;
    while (AMSmalls.len !== 0 && AMLarges.len !== 0) {
        s = AMSmalls.buf[AMSmalls.len-1];
        AMSmalls.len -= 1;
        l = AMLarges.buf[AMLarges.len-1];
        AMLarges.len -= 1;

        AMProbs.buf[s] = AMP.buf[s];
        AMAlias.buf[s] = l;
        AMP.buf[l] = (AMP.buf[l] + AMP.buf[s]) - events.sum;
        if (AMP.buf[l] < events.sum) {
            AMSmalls.buf[AMSmalls.len] = l;
            AMSmalls.len += 1;
        } else {
            AMLarges.buf[AMLarges.len] = l;
            AMLarges.len += 1;
        }
    }
    while (AMSmalls.len !== 0) {
        s = AMSmalls.buf[AMSmalls.len-1];
        AMProbs.buf[s] = events.sum;
        AMSmalls.len -= 1;
    }
    while (AMLarges.len !== 0) {
        l = AMLarges.buf[AMLarges.len-1];
        AMProbs.buf[l] = events.sum;
        AMLarges.len -= 1;
    }
    if (random(0, events.sum-1) < AMProbs.buf[randIdx]) {
        cardinal = randIdx;
    } else {
        cardinal = AMAlias.buf[randIdx];
    }
    return cardinal;
};

const randomAudioSelection = function (Keys, Sums, sum, w) {
    assert(Keys.len === Sums.len, `ERROR: Keys.len: ${Keys.len}, Sums.len: ${Sums.len}`);
    assert(w > 0, "ERROR on randomAudioSelection: the weight is negative");

    let e = 0;
    for (;;) {
        let selected = 0;
        let target = random(0, sum-1);
        if (Sums.len < 20) {
            for (let i = 0; i < Sums.len; i += 1) {
                if (target < Sums.buf[i]) {
                    selected = i;
                    break;
                }
            }
        } else {
            let startI = 0;
            let endI = Sums.len;
            while (startI <= endI) {
                const midI = Math.floor((startI + endI) / 2);
                if (Sums.buf[midI] < target) {
                    startI = midI + 1;
                } else {
                    if (midI === 0 || Sums.buf[midI-1] < target) {
                        selected = midI;
                        break;
                    }
                    endI = midI - 1;
                }
            }
        }
        SelectedAudios.buf[SelectedAudios.len] = Keys.buf[selected];
        SelectedAudios.len += 1;

        if (e === w-1) {
            break;
        }
        e += 1;

        //re initialize sums
        if (selected === 0) {
            sum = 0;
        } else {
            sum = Sums.buf[selected-1];
        }
        for (let i = selected; i < Sums.len-1; i += 1) {
            sum += Sums.buf[i+1] - Sums.buf[i];
            Sums.buf[i] = sum;
            Keys.buf[i] = Keys.buf[i+1];
        }
        Keys.len -= 1;
        Sums.len -= 1;
    }
    assert(w === SelectedAudios.len, `ERROR: weight: ${w}, SelectedAudios.len: ${SelectedAudios.len}`);
    return SelectedAudios;
};

const SelectionKeys = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
};

const SelectionSums = {
    len: 0,
    cap: AUDIOELEMENTS_MAX,
    buf: new Uint32Array(AUDIOELEMENTS_MAX),
};

const randomSetSelection = function () {
    if (SetEvents.len < 2) {
        return false;
    }
    const cardinal = selectCardinal(SetEvents);
    console.info("Cardinal", cardinal);

    if (cardinal <= 0) {
        return false;
    }

    let sum = 0;
    if (cardinal === AudioList.len) {
        SelectedAudios.all = true;
    } else {
        SelectedAudios.len = 0;
        SelectedAudios.all = false;

        SelectionKeys.len = AudioList.len;
        SelectionSums.len = AudioList.len;

        for (let i = 0; i < AudioList.len; i += 1) {
            sum += AudioList.buf[i].events;
            SelectionKeys.buf[i] = i;
            SelectionSums.buf[i] = sum;
        }
        randomAudioSelection(SelectionKeys, SelectionSums, sum, cardinal);
    }
    return true;
};

let executeTimeout = undefined;
/**@type{(id: number) => undefined}*/
const randomExecution = function (id) {
    if (Started && StartedId === id) {
        const interval = random(TimeIntervalmin, TimeIntervalmax) * 100;
        console.info("Next execution:", interval);
        console.info("AudioList", AudioList);
        if (randomSetSelection()) {
            if (SelectedAudios.all) {
                for (let i = 0; i < AudioList.len; i += 1) {
                    audioPlay(AudioList.buf[i]);
                    HtmlAppContainer.children[i].setAttribute("data-playing", "1");
                }
            } else {
                for (let i = 0; i < SelectedAudios.len; i += 1) {
                    audioPlay(AudioList.buf[i]);
                    HtmlAppContainer.children[i].setAttribute("data-playing", "1");
                }
            }
        }
        executeTimeout = setTimeout(randomExecution, interval, id);
    } else {
        console.info("END");
    }
}


// HTML functions and events
/**
 * @type {(t: number) => undefined}*/
const HtmlCTimemaxUpdate = function (t) {
    HtmlCTimemaxMM.textContent = timeIntervalFormat(Math.floor(t / 600));
    HtmlCTimemaxSS.textContent = timeIntervalFormat(Math.floor(t / 10) % 60);
    HtmlCTimemaxMS.textContent = String(t % 10);
};

/**
 * @type {(t: number) => undefined}*/
const HtmlCTimeminUpdate = function (t) {
    HtmlCTimeminMM.textContent = timeIntervalFormat(Math.floor(t / 600));
    HtmlCTimeminSS.textContent = timeIntervalFormat(Math.floor(t / 10) % 60);
    HtmlCTimeminMS.textContent = String(t % 10);
};

const HtmlCTimeChanged = function () {
    if (TimeTemporalmax === TimeIntervalmax
        && TimeTemporalmin === TimeIntervalmin
    ) {
        HtmlCTimeContainer.setAttribute("data-changed", "0");
    } else {
        HtmlCTimeContainer.setAttribute("data-changed", "1");
    }
};

/**
 * @type{(target: HtmlElement) => undefined}*/
const HtmlCTimeAlert = function (target) {
    if (target.getAttribute("data-alert") === "1") {
        target.setAttribute("data-alert", "2");
    } else {
        target.setAttribute("data-alert", "1");
    }
};

/**
 * HtmlAppConfig onclick reset buttons
 * @type{(e: MouseEvent) => undefined}*/
const HtmlAppConfigOnclick = function (e) {
    const target = e.target;
    if ("set-reset" === target.name) {
        SetEvents.zeros = 0;
        SetEvents.max = SetEvents.cap - 1;
        if (SetEvents.len <= AudioList.len) {
            if (AudioList.len > SetEvents.max + 1) {
                SetEvents.len = SetEvents.max + 1;
            } else {
                SetEvents.len = AudioList.len + 1;
            }
        }
        SetEvents.sum = SetEvents.len;
        for (let i = 0; i < SetEvents.len; i += 1) {
            SetEvents.buf[i] = 1;
            const HtmlSet = HtmlCSets.children[i]; 
            HtmlSet.setAttribute("data-display", "1");
            HtmlSet.children[1].children["value"].textContent = "1";
            HtmlSet.children[2].children["value"].textContent = (
                (SetEvents.buf[i] / SetEvents.sum * 100).toFixed(1)
            );
        }
        HtmlCSetmax.value = String(SetEvents.max); 
    } else if ("set-left" === target.name) {
        const HtmlSet = target.parentElement.parentElement;
        if (1 === SetEvents.sum) {
            //TODO: notification, must be at least 1 event
            console.info("MUST BE AT LEAST 1 EVENT");
            return;
        }
        let i = getHtmlChildIndex(HtmlCSets, HtmlSet);
        assert(i !== -1, "ERROR gerHtmlChildIndex: there is no HtmlChild on the HtmlParent");
        assert(i < SetEvents.len);
        if (EVENTS_MIN_VALUE === SetEvents.buf[i]) {
            console.info("MIN VALUE FOUND");
            //TODO: notification, min value found
            return;
        }
        if (EVENTS_MIN_VALUE === SetEvents.buf[i] - 1) {
            SetEvents.zeros += 1;
        }
        SetEvents.buf[i] -= 1;
        SetEvents.sum -= 1;
        target.nextElementSibling.textContent = String(SetEvents.buf[i]);
        updateHtmlCSets();

    } else if ("set-right" === target.name) {
        const HtmlSet = target.parentElement.parentElement;
        let i = getHtmlChildIndex(HtmlCSets, HtmlSet);
        assert(i !== -1, "ERROR gerHtmlChildIndex: there is no HtmlChild on the HtmlParent");
        assert(i < SetEvents.len);
        if (EVENTS_MAX_VALUE === SetEvents.buf[i]) {
            console.info("MAX VALUE FOUND");
            //TODO: notification, max value found
            return;
        }
        if (EVENTS_MIN_VALUE === SetEvents.buf[i]) {
            SetEvents.zeros -= 1;
        }
        SetEvents.buf[i] += 1;
        SetEvents.sum += 1;
        target.previousElementSibling.textContent = String(SetEvents.buf[i]);
        updateHtmlCSets();

    } else if ("time-reset" === target.name) {
        TimeIntervalmax = DEFAULT_TIMEINTERVAL_MAX;
        TimeIntervalmin = DEFAULT_TIMEINTERVAL_MIN;
        TimeTemporalmax = DEFAULT_TIMEINTERVAL_MAX;
        TimeTemporalmin = DEFAULT_TIMEINTERVAL_MIN;
        HtmlCTimemaxUpdate(DEFAULT_TIMEINTERVAL_MAX);
        HtmlCTimeminUpdate(DEFAULT_TIMEINTERVAL_MIN);
        HtmlCTimeContainer.setAttribute("data-changed", "0");

    } else if ("time-cancel" === target.name) {
        HtmlCTimeminUpdate(TimeIntervalmin);
        HtmlCTimemaxUpdate(TimeIntervalmax);
        TimeTemporalmin = TimeIntervalmin;
        TimeTemporalmax = TimeIntervalmax;

        HtmlCTimeContainer.setAttribute("data-changed", "0");

    } else if ("time-apply" === target.name) {
        TimeIntervalmin = TimeTemporalmin;
        TimeIntervalmax = TimeTemporalmax;

        HtmlCTimeContainer.setAttribute("data-changed", "0");

    } else if ("time-max-mm-up" === target.name) {
        //adds 1 minute (600 hundreads of miliseconds)
        if (TimeTemporalmax + 600 > LIMIT_TIMEINTERVAL_MAX) {
            return;
        }

        HtmlCTimemaxMM.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmax + 600) / 600)
        );
        TimeTemporalmax += 600;
        HtmlCTimeChanged();

    } else if ("time-max-mm-down" === target.name) {
        //subtract 1 minute (600 hundreads of miliseconds)
        if (TimeTemporalmax - 600 < TimeTemporalmin) {
            HtmlCTimemaxUpdate(TimeTemporalmin);
            TimeTemporalmax = TimeTemporalmin;
            HtmlCTimeAlert(HtmlCTimemin);
        } else {
            HtmlCTimemaxMM.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmax - 600) / 600)
            );
            TimeTemporalmax -= 600;
        }
        HtmlCTimeChanged();

    } else if ("time-max-ss-up" === target.name) {
        //adds 1 second (10 hundreads of miliseconds)
        if (TimeTemporalmax + 10 > LIMIT_TIMEINTERVAL_MAX) {
            return;
        }
        HtmlCTimemaxMM.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmax + 10) / 600)
        );
        HtmlCTimemaxSS.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmax + 10) / 10) % 60
        );
        TimeTemporalmax += 10;
        HtmlCTimeChanged();

    } else if ("time-max-ss-down" === target.name) {
        e.preventDefault();
        //adds 1 second (10 hundreads of miliseconds)
        if (TimeTemporalmax - 10 < TimeTemporalmin) {
            HtmlCTimemaxUpdate(TimeTemporalmin);
            TimeTemporalmax = TimeTemporalmin;
            HtmlCTimeAlert(HtmlCTimemin);
        } else {
            HtmlCTimemaxMM.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmax - 10) / 600)
            );
            HtmlCTimemaxSS.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmax - 10) / 10) % 60
            );
            TimeTemporalmax -= 10;
        }
        HtmlCTimeChanged();

    } else if ("time-max-ms-up" === target.name) {
        //adds 1 hms (1 hundreads of miliseconds)
        if (TimeTemporalmax + 1 > LIMIT_TIMEINTERVAL_MAX) {
            return;
        }
        HtmlCTimemaxUpdate(TimeTemporalmax+1);
        TimeTemporalmax += 1;
        HtmlCTimeChanged();


    } else if ("time-max-ms-down" === target.name) {
        //subtract 1 hms (1 hundreads of miliseconds)
        if (TimeTemporalmax - 1 >= TimeTemporalmin) {
            HtmlCTimemaxUpdate(TimeTemporalmax-1);
            TimeTemporalmax -= 1;
            HtmlCTimeChanged();
        } else {
            HtmlCTimeAlert(HtmlCTimemin);
        }

    } else if ("time-min-mm-up" === target.name) {
        //adds 1 minute (600 hundreads of miliseconds)
        if (TimeTemporalmin + 600 > TimeTemporalmax) {
            HtmlCTimeminUpdate(TimeTemporalmax);
            TimeTemporalmin = TimeTemporalmax;
            HtmlCTimeAlert(HtmlCTimemax);
        } else {
            HtmlCTimeminMM.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmin + 600) / 600)
            );
            TimeTemporalmin += 600;
        }
        HtmlCTimeChanged();

    } else if ("time-min-mm-down" === target.name) {
        //subtract 1 minute (600 hundreads of miliseconds)
        if (TimeTemporalmin - 600 < LIMIT_TIMEINTERVAL_MIN) {
            return;
        }
        HtmlCTimeminMM.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmin - 600) / 600)
        );
        TimeTemporalmin -= 600;
        HtmlCTimeChanged();

    } else if ("time-min-ss-up" === target.name) {
        //adds 1 second (10 hundreads of miliseconds)
        if (TimeTemporalmin + 10 > TimeTemporalmax) {
            HtmlCTimeminUpdate(TimeTemporalmax);
            TimeTemporalmin = TimeTemporalmax;
            HtmlCTimeAlert(HtmlCTimemax);
        } else {
            HtmlCTimeminMM.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmin + 10) / 600)
            );
            HtmlCTimeminSS.textContent = timeIntervalFormat(
                Math.floor((TimeTemporalmin + 10) / 10) % 60
            );
            TimeTemporalmin += 10;
        }
        HtmlCTimeChanged();


    } else if ("time-min-ss-down" === target.name) {
        //adds 1 second (10 hundreads of miliseconds)
        if (TimeTemporalmin - 10 < LIMIT_TIMEINTERVAL_MIN) {
            return;
        }
        HtmlCTimeminMM.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmin - 10) / 600)
        );
        HtmlCTimeminSS.textContent = timeIntervalFormat(
            Math.floor((TimeTemporalmin - 10) / 10) % 60
        );
        TimeTemporalmin -= 10;
        HtmlCTimeChanged();

    } else if ("time-min-ms-up" === target.name) {
        //adds 1 hms (1 hundreads of miliseconds)
        if (TimeTemporalmin + 1 <= TimeTemporalmax) {
            HtmlCTimeminUpdate(TimeTemporalmin+1);
            TimeTemporalmin += 1;
            HtmlCTimeChanged();
        } else {
            HtmlCTimeAlert(HtmlCTimemax);
        }

    } else if ("time-min-ms-down" === target.name) {
        //subtract 1 hms (1 hundreads of miliseconds)
        if (TimeTemporalmin - 1 < LIMIT_TIMEINTERVAL_MIN) {
            return;
        }
        HtmlCTimeminUpdate(TimeTemporalmin-1);
        TimeTemporalmin -= 1;
        HtmlCTimeChanged();

    } else if ("fades-reset" === target.name) {
        HtmlCFadein.firstElementChild.valueAsNumber = DEFAULT_FADEIN;
        HtmlCFadein.lastElementChild.children["value"].textContent = String(
            getFade(DEFAULT_FADEIN)
        );
        HtmlCFadeout.firstElementChild.valueAsNumber = DEFAULT_FADEOUT;
        HtmlCFadeout.lastElementChild.children["value"].textContent = String(
            getFade(DEFAULT_FADEOUT)
        );
        FadeIn = DEFAULT_FADEIN;
        FadeOut = DEFAULT_FADEOUT;

    } else if ("delay-reset" === target.name) {
        HtmlCDelayTimemin.firstElementChild.valueAsNumber = (
            DEFAULT_DELAY_TIMEMIN
        );
        HtmlCDelayTimemin.lastElementChild.children["value"].textContent = (
            getDelayTime(DEFAULT_DELAY_TIMEMIN).toFixed(1)
        );
        HtmlCDelayTimemax.firstElementChild.valueAsNumber = (
            LIMIT_DELAY_TIMEMAX - DEFAULT_DELAY_TIMEMAX
        );
        HtmlCDelayTimemax.lastElementChild.children["value"].textContent = (
            getDelayTime(DEFAULT_DELAY_TIMEMAX).toFixed(1)
        );
        HtmlCDelayFeedbackmin.firstElementChild.valueAsNumber = (
            DEFAULT_DELAY_FEEDBACKMIN
        );
        HtmlCDelayFeedbackmin.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DEFAULT_DELAY_FEEDBACKMIN)
        );
        HtmlCDelayFeedbackmax.firstElementChild.valueAsNumber = (
            LIMIT_DELAY_FEEDBACKMAX - DEFAULT_DELAY_FEEDBACKMAX
        );
        HtmlCDelayFeedbackmax.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DEFAULT_DELAY_FEEDBACKMAX)
        );
        DelayTimemax = DEFAULT_DELAY_TIMEMAX;
        DelayTimemin = DEFAULT_DELAY_TIMEMIN;
        DelayFeedbackmax = DEFAULT_DELAY_FEEDBACKMAX;
        DelayFeedbackmin = DEFAULT_DELAY_FEEDBACKMIN;

    } else if ("filter-reset" === target.name) {
        HtmlCFilterFreqmin.firstElementChild.valueAsNumber = (
            DEFAULT_FILTER_FREQMIN
        );
        HtmlCFilterFreqmin.lastElementChild.children["value"].textContent = String(
            getFilterFreq(DEFAULT_FILTER_FREQMIN)
        );
        HtmlCFilterFreqmax.firstElementChild.valueAsNumber = (
            LIMIT_FILTER_FREQMAX - DEFAULT_FILTER_FREQMAX
        );
        HtmlCFilterFreqmax.lastElementChild.children["value"].textContent = String(
            getFilterFreq(DEFAULT_FILTER_FREQMAX)
        );
        HtmlCFilterQmin.firstElementChild.valueAsNumber = DEFAULT_FILTER_QMIN;
        HtmlCFilterQmin.lastElementChild.children["value"].textContent = String(
            getFilterQ(DEFAULT_FILTER_QMIN)
        );
        HtmlCFilterQmax.firstElementChild.valueAsNumber = (
            LIMIT_FILTER_QMAX - DEFAULT_FILTER_QMAX
        );
        HtmlCFilterQmax.lastElementChild.children["value"].textContent = String(
            getFilterQ(DEFAULT_FILTER_QMAX)
        );
        let elements = HtmlCFilterEffects.elements;
        elements["filter-bandpass"].checked = DEFAULT_FILTER_BANDPASS;
        elements["filter-highpass"].checked = DEFAULT_FILTER_HIGHPASS;
        elements["filter-lowpass"].checked = DEFAULT_FILTER_LOWPASS;
        elements["filter-notch"].checked = DEFAULT_FILTER_NOTCH;

        FilterFreqmax = DEFAULT_FILTER_FREQMAX;
        FilterFreqmin = DEFAULT_FILTER_FREQMIN;
        FilterQmax = DEFAULT_FILTER_QMAX;
        FilterQmin = DEFAULT_FILTER_QMIN;
        FilterBandpass = DEFAULT_FILTER_BANDPASS;
        FilterHighpass = DEFAULT_FILTER_HIGHPASS;
        FilterLowpass = DEFAULT_FILTER_LOWPASS;
        FilterNotch = DEFAULT_FILTER_NOTCH;

    } else if ("panner-reset" === target.name) {
        HtmlCPannerXmin.firstElementChild.valueAsNumber = DEFAULT_PANNER_XMIN;
        HtmlCPannerXmin.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_XMIN)
        );
        HtmlCPannerXmax.firstElementChild.valueAsNumber = (
            LIMIT_PANNER_MAX - DEFAULT_PANNER_XMAX
        );
        HtmlCPannerXmax.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_XMAX)
        );
        HtmlCPannerYmin.firstElementChild.valueAsNumber = DEFAULT_PANNER_YMIN;
        HtmlCPannerYmin.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_YMIN)
        );
        HtmlCPannerYmax.firstElementChild.valueAsNumber = (
            LIMIT_PANNER_MAX - DEFAULT_PANNER_YMAX
        );
        HtmlCPannerYmax.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_YMAX)
        );
        HtmlCPannerZmin.firstElementChild.valueAsNumber = DEFAULT_PANNER_ZMIN;
        HtmlCPannerZmin.lastElementChild.children["value"].textContent = String(
            DEFAULT_PANNER_ZMIN
        );
        HtmlCPannerZmax.firstElementChild.valueAsNumber = (
            LIMIT_PANNER_ZMAX - DEFAULT_PANNER_ZMAX
        );
        HtmlCPannerZmax.lastElementChild.children["value"].textContent = String(
            DEFAULT_PANNER_ZMAX
        );
        PannerXmax = DEFAULT_PANNER_XMAX;
        PannerXmin = DEFAULT_PANNER_XMIN;
        PannerYmax = DEFAULT_PANNER_YMAX;
        PannerYmin = DEFAULT_PANNER_YMIN;
        PannerZmax = DEFAULT_PANNER_ZMAX;
        PannerZmin = DEFAULT_PANNER_ZMIN;

    } else if ("pbrate-reset" === target.name) {
        HtmlCPbrateMin.firstElementChild.valueAsNumber = DEFAULT_PBRATE_MIN;
        HtmlCPbrateMin.lastElementChild.children["value"].textContent = (
            getPlaybackRate(DEFAULT_PBRATE_MIN).toFixed(2)
        );
        HtmlCPbrateMax.firstElementChild.valueAsNumber = (
            LIMIT_PBRATE_MAX - DEFAULT_PBRATE_MAX
        );
        HtmlCPbrateMax.lastElementChild.children["value"].textContent = (
            getPlaybackRate(DEFAULT_PBRATE_MAX).toFixed(2)
        );
        PbRatemin = DEFAULT_PBRATE_MIN;
        PbRatemax = DEFAULT_PBRATE_MAX;
    }
};

/**
 * @type{(e: InputEvent) => undefined}*/
const HtmlAppConfigOninput = function (e) {
    const target = e.target;
    if ("set-max" === target.name) {
        const value = Number(target.value);
        if (value === SetEvents.max) {
            return;
        }
        assert(0 < value && value < SetEvents.cap);
        let max = 0;
        if (value < SetEvents.max) {
            if (AudioList.len < SetEvents.max) {
                max = AudioList.len;
            } else {
                max = SetEvents.max;
            }
            for (let i = value + 1; i < max + 1; i += 1) {
                const HtmlSet = HtmlCSets.children[i]; 
                HtmlSet.setAttribute("data-display", "0"); 
                SetEvents.sum -= SetEvents.buf[i];
            }
            if (value < max) {
                SetEvents.len -= max - value; 
            }
        } else {
            if (AudioList.len < value) {
                max = AudioList.len;
            } else {
                max = value;
            }
            for (let i = SetEvents.max + 1; i < max + 1; i += 1) {
                const HtmlSet = HtmlCSets.children[i]; 
                HtmlSet.setAttribute("data-display", "1"); 
                HtmlSet.children[1].children["value"].textContent = "1";
                SetEvents.buf[i] = 1;
            }
            if (SetEvents.max < max) {
                SetEvents.len += max - SetEvents.max; 
                SetEvents.sum += max - SetEvents.max;
            }
        }
        SetEvents.max = value;
        updateHtmlCSets();

    } else if ("fadein" === target.name) {
        FadeIn = target.valueAsNumber;
        HtmlCFadein.lastElementChild.children["value"].textContent = String(
            getFade(target.valueAsNumber)
        );

    } else if ("fadeout" === target.name) {
        FadeOut = target.valueAsNumber;
        HtmlCFadeout.lastElementChild.children["value"].textContent = String(
            getFade(target.valueAsNumber)
        );

    } else if ("delay-da" === target.name) {
        DelayAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.delayDisabled = target.checked;
            HtmlAudioElement.appDelay.checked = !target.checked;
        }

    } else if ("delay-timemin" === target.name) {
        if (target.valueAsNumber > DelayTimemax) {
            target.valueAsNumber = DelayTimemax;
        }
        DelayTimemin = target.valueAsNumber;
        HtmlCDelayTimemin.lastElementChild.children["value"].textContent = (
            getDelayTime(DelayTimemin).toFixed(1)
        );

    } else if ("delay-timemax" === target.name) {
        if (DelayTimemin > LIMIT_DELAY_TIMEMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_DELAY_TIMEMAX - DelayTimemin;
        }
        DelayTimemax = LIMIT_DELAY_TIMEMAX - target.valueAsNumber;
        HtmlCDelayTimemax.lastElementChild.children["value"].textContent = (
            getDelayTime(DelayTimemax).toFixed(1)
        );

    } else if ("delay-feedbackmin" === target.name) {
        if (target.valueAsNumber > DelayFeedbackmax) {
            target.valueAsNumber = DelayFeedbackmax;
        }
        DelayFeedbackmin = target.valueAsNumber;
        HtmlCDelayFeedbackmin.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DelayFeedbackmin)
        );

    } else if ("delay-feedbackmax" === target.name) {
        if (DelayFeedbackmin > LIMIT_DELAY_FEEDBACKMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_DELAY_FEEDBACKMAX - DelayFeedbackmin;
        }
        DelayFeedbackmax = LIMIT_DELAY_FEEDBACKMAX - target.valueAsNumber;
        HtmlCDelayFeedbackmax.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DelayFeedbackmax)
        );

    } else if ("filter-da" === target.name) {
        FilterAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.filterDisabled = target.checked;
            HtmlAudioElement.appFilter.checked = !target.checked;
        }

    } else if ("filter-freqmin" === target.name) {
        if (target.valueAsNumber > FilterFreqmax) {
            target.valueAsNumber = FilterFreqmax;
        }
        FilterFreqmin = target.valueAsNumber;
        HtmlCFilterFreqmin.lastElementChild.children["value"].textContent = String(
            getFilterFreq(FilterFreqmin)
        );

    } else if ("filter-freqmax" === target.name) {
        if (FilterFreqmin > LIMIT_FILTER_FREQMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_FILTER_FREQMAX - FilterFreqmin;
        }
        FilterFreqmax = LIMIT_FILTER_FREQMAX - target.valueAsNumber;
        HtmlCFilterFreqmax.lastElementChild.children["value"].textContent = String(
            getFilterFreq(FilterFreqmax)
        );

    } else if ("filter-qmin" === target.name) {
        if (target.valueAsNumber > FilterQmax) {
            target.valueAsNumber = FilterQmax;
        }
        FilterQmin = target.valueAsNumber;
        HtmlCFilterQmin.lastElementChild.children["value"].textContent = String(
            getFilterQ(FilterQmin)
        );

    } else if ("filter-qmax" === target.name) {
        if (FilterQmin > LIMIT_FILTER_QMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_FILTER_QMAX - FilterQmin;
        }
        FilterQmax = LIMIT_FILTER_QMAX - target.valueAsNumber;
        HtmlCFilterQmax.lastElementChild.children["value"].textContent = String(
            getFilterQ(FilterQmax)
        );

    } else if ("filter-highpass" === target.name) {
        if (FilterHighpass
            && !FilterLowpass
            && !FilterBandpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterHighpass = target.checked;

    } else if ("filter-lowpass" === target.name) {
        if (FilterLowpass
            && !FilterHighpass
            && !FilterBandpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterLowpass = target.checked;

    } else if ("filter-bandpass" === target.name) {
        if (FilterBandpass
            && !FilterLowpass
            && !FilterHighpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterBandpass = target.checked;

    } else if ("filter-notch" === target.name) {
        if (FilterNotch
            && !FilterLowpass
            && !FilterBandpass
            && !FilterHighpass
        ) {
            target.checked = true;
        }
        FilterNotch = target.checked;

    } else if ("panner-da" === target.name) {
        PannerAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.pannerDisabled = target.checked;
            HtmlAudioElement.appPanner.checked = !target.checked;
        }

    } else if ("panner-xmin" === target.name) {
        if (target.valueAsNumber > PannerXmax) {
            target.valueAsNumber = PannerXmax;
        }
        PannerXmin = target.valueAsNumber;
        HtmlCPannerXmin.lastElementChild.children["value"].textContent = String(
            getPanner(PannerXmin)
        );

    } else if ("panner-xmax" === target.name) {
        if (PannerXmin > LIMIT_PANNER_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_MAX - PannerXmin;
        }
        PannerXmax = LIMIT_PANNER_MAX - target.valueAsNumber;
        HtmlCPannerXmax.lastElementChild.children["value"].textContent = String(
            getPanner(PannerXmax)
        );

    } else if ("panner-ymin" === target.name) {
        if (target.valueAsNumber > PannerYmax) {
            target.valueAsNumber = PannerYmax;
        }
        PannerYmin = target.valueAsNumber;
        HtmlCPannerYmin.lastElementChild.children["value"].textContent = String(
            getPanner(PannerYmin)
        );

    } else if ("panner-ymax" === target.name) {
        if (PannerYmin > LIMIT_PANNER_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_MAX - PannerYmin;
        }
        PannerYmax = LIMIT_PANNER_MAX - target.valueAsNumber;
        HtmlCPannerYmax.lastElementChild.children["value"].textContent = String(
            getPanner(PannerYmax)
        );

    } else if ("panner-zmin" === target.name) {
        if (target.valueAsNumber > PannerZmax) {
            target.valueAsNumber = PannerZmax;
        }
        PannerZmin = target.valueAsNumber;
        HtmlCPannerZmin.lastElementChild.children["value"].textContent = String(PannerZmin);

    } else if ("panner-zmax" === target.name) {
        if (PannerZmin > LIMIT_PANNER_ZMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_ZMAX - PannerZmin;
        }
        PannerZmax = LIMIT_PANNER_ZMAX - target.valueAsNumber;
        HtmlCPannerZmax.lastElementChild.children["value"].textContent = String(PannerZmax);

    } else if ("pbrate-da" === target.name) {
        PbRateAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.pbrateDisabled = target.checked;
            HtmlAudioElement.appPbrate.checked = !target.checked;
        }

    } else if ("pbrate-min" === target.name) {
        if (target.valueAsNumber > PbRatemax) {
            target.valueAsNumber = PbRatemax;
        }
        PbRatemin = target.valueAsNumber;
        HtmlCPbrateMin.lastElementChild.children["value"].textContent = (
            getPlaybackRate(PbRatemin).toFixed(2)
        );

    } else if ("pbrate-max" === target.name) {
        if (PbRatemin > LIMIT_PBRATE_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PBRATE_MAX - PbRatemin;
        }
        PbRatemax = LIMIT_PBRATE_MAX - target.valueAsNumber;
        HtmlCPbrateMax.lastElementChild.children["value"].textContent = (
            getPlaybackRate(PbRatemax).toFixed(2)
        );

    } else if ("rsp-da" === target.name) {
        CutRSPAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.rspDisabled = target.checked;
            HtmlAudioElement.appRSP.checked = !target.checked;
        }

    } else if ("rep-da" === target.name) {
        CutREPAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const state = AudioList.get(i);
            state.repDisabled = target.checked;
            HtmlAudioElement.appREP.checked = !target.checked;
        }
    }
};

const HtmlAppMenuOnclick = function (e) {
    const target = e.target;
    if ("start" === target.name) {
        let dataStart = target.getAttribute("data-start");
        if (dataStart === "0") {
            Started = true;
            StartedId = startedIdNext(); 
            randomExecution(StartedId);
            target.setAttribute("data-start", "1");
        } else {
            Started = false;
            if (undefined !== executeTimeout) {
                clearTimeout(executeTimeout);
                executeTimeout = undefined;
            }
            for (let i = 0; i < AudioList.len; i += 1) {
                audioPause(AudioList.buf[i]);
                HtmlAppContainer.children[i].setAttribute("data-playing", "0");
            }
            target.setAttribute("data-start", "0");
        }
    } else if ("clear" === target.name) {
        if (AudioList.len === 0) {
            return;
        }

        for (let i = 1; i < SetEvents.len; i += 1) {
            const HtmlSet = HtmlCSets.children[i];
            HtmlSet.setAttribute("data-display", "0"); 
        }
        SetEvents.zeros = 0;
        SetEvents.sum = 1;
        SetEvents.len = 1;

        for (let audio of AudioList.buf) {
            audioPause(audio);
            AudioList.cleanAudio(audio)
        }
        AudioList.len = 0;
        HtmlAudioZombies.append.apply(
            HtmlAudioZombies,
            HtmlAppContainer.children
        );
        clearTimeout(timeoutFree);
        timeoutFree = setTimeout(timeoutFreeFn,FREE_TIME);

    } else if ("file" === target.name) {
        target.value = "";
    } else if ("config" === target.name) {
        if (target.checked) {
            HtmlAppConfig.setAttribute("data-show", "1");
        } else {
            HtmlAppConfig.setAttribute("data-show", "0");
        }
    }
};

const HtmlAppMenuOninput = function (e) {
    const target = e.target;
    if (target.name === "file") {
        addFiles(target.files);
    }
};


const HtmlAppContainerOnclick = function (e) {
    const target = e.target;
    if ("play" === target.name) {
        const HtmlAudioElement = target.parentElement.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        console.info("audio #",i);
        if (HtmlAudioElement.getAttribute("data-playing") === "0") {
            HtmlAudioElement.setAttribute("data-playing", "1");
            audioAction(i, "play");
        } else {
            HtmlAudioElement.setAttribute("data-playing", "0");
            audioAction(i, "pause");
        }
    } else if ("remove" === target.name) {
        const HtmlAudioElement = target.parentElement.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        audioAction(i, "remove");
        HtmlAudioZombies.appendChild(HtmlAudioElement);
        ZombiesCount += 1;

        if (AudioList.len < SetEvents.max) {
            const HtmlSet = HtmlCSets.children[SetEvents.len-1];
            HtmlSet.setAttribute("data-display", "0"); 
            if (0 === SetEvents.buf[SetEvents.len-1]) {
                SetEvents.zeros -= 1;
            } else {
                SetEvents.sum -= SetEvents.buf[SetEvents.len-1];
            }
            SetEvents.len -= 1;

            updateHtmlCSets();
        }

        //defaults
        HtmlAudioElement.setAttribute("data-playing", "0");
        HtmlAudioElementDefaults(HtmlAudioElement);

        clearTimeout(timeoutFree)
        timeoutFree = setTimeout(timeoutFreeFn,FREE_TIME);
    }
};

const HtmlAppContainerOninput = function (e) {
    const target = e.target;
    if ("volume" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(
            HtmlAppContainer,
            HtmlAudioElement
        );
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on volume");

        if (target.valueAsNumber < LIMIT_VOLUME_MIN) {
            target.valueAsNumber = LIMIT_VOLUME_MIN;
            state.input.gain.value = LIMIT_VOLUME_MIN;
        } else if (target.valueAsNumber  > LIMIT_VOLUME_MAX) {
            target.valueAsNumber = LIMIT_VOLUME_MAX;
            state.input.gain.value = LIMIT_VOLUME_MAX;
        } else {
            state.input.gain.value = target.valueAsNumber;
        }

    } else if ("delay" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on delay input");

        state.delayDisabled = !target.checked;
        if (DelayAreAllDisable && target.checked) {
            DelayAreAllDisable = false;
            HtmlCDelayDA.checked = false;
        }

    } else if ("filter" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on filter input");

        state.filterDisabled = !target.checked;
        if (FilterAreAllDisable && target.checked) {
            FilterAreAllDisable = false;
            HtmlCFilterDA.checked = false;
        }

    } else if ("panner" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on panner input");

        state.pannerDisabled = !target.checked;
        if (PannerAreAllDisable && target.checked) {
            PannerAreAllDisable = false;
            HtmlCPannerDA.checked = false;
        }

    } else if ("pbrate" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on pbrate input");

        state.pbrateDisabled = !target.checked;
        if (PbRateAreAllDisable && target.checked) {
            PbRateAreAllDisable = false;
            HtmlCPbrateDA.checked = false;
        }

    } else if ("RSP" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on rsp input");

        state.rspDisabled = !target.checked;
        if (CutRSPAreAllDisable && target.checked) {
            CutRSPAreAllDisable = false;
            HtmlCRSPDA.checked = false;
        }

    } else if ("REP" === target.name) {
        const HtmlAudioElement = (
            target
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        );
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        const state = AudioList.get(i);
        assert(state !== undefined, "ERROR undefined state: on rep input");
        state.repDisabled = !target.checked;
        if (CutREPAreAllDisable && target.checked) {
            CutREPAreAllDisable = false;
            HtmlCREPDA.checked = false;
        }
    }
};

const BodyOnkeyup = function (e) {
    const target = e.target;
    if (e.key === "s") {
        HtmlAppMenu
            .firstElementChild
            .firstElementChild
            .click();
    } else if (e.key === "a") {
        HtmlAppMenu
            .children[1]
            .firstElementChild
            .firstElementChild
            .click();
    } else if (e.key === "d") {
        HtmlAppMenu
            .children[2]
            .firstElementChild
            .click();
    }
};

const initBodyOnkeydown = function (e) {
    const target = e.target;
    if ("button" !== target.localName
        && "a" !== target.localName
        && "Enter" === e.key
    ) {
        const HtmlPresOpen = document.getElementById("presentation-open");
        HtmlPresOpen.click();
    }
};

//INITS

/** @type{(v: string) => boolean}*/
const checkAppVersion = function (v) {
    let res = true;
    if (localStorage.getItem("version") !== v) {
        localStorage.clear();
        localStorage.setItem("version", v);
        res = false;
    }
    return res;
};

const HtmlPresOpenOnclick = function () {
    document.body.removeEventListener("keydown", initBodyOnkeydown);

    const HtmlMain = document.getElementById("main");
    assert(HtmlMain !== null, "#main is not found");
    HtmlMain.setAttribute("data-app", "1");

    //init context
    context = new AudioContext({
        latencyHint: "playback",
        sampleRate: 44100
    });
    context?.resume();
    if (context.listener.positionX) {
        context.listener.positionX.value = 0;
        context.listener.positionY.value = 0;
        context.listener.positionZ.value = 1;
        context.listener.forwardZ.value = -5;
    } else {
        context.listener.setPosition(0, 0, 1);
        context.listener.setOrientation(0, 0, -5, 0 ,1, 0);
    }

    return openApp();
};

const openApp = function () {
    document.body.addEventListener("keyup", BodyOnkeyup, true);

    //Drag and Drop
    HtmlApp.addEventListener("dragenter", function () {
        HtmlAppDrop.removeAttribute("data-css-hidden");
    }, true);

    HtmlAppDrop.addEventListener("dragleave", function () {
        HtmlAppDrop.setAttribute("data-css-hidden", "");
    }, true);


    HtmlAppDrop.addEventListener("dragover", function (e) {
        e.preventDefault();
    }, true);

    HtmlAppDrop.addEventListener("drop", function (e) {
        e.preventDefault();
        HtmlAppDrop.setAttribute("data-css-hidden", "");
        addFiles(e.dataTransfer.files);
    }, true);

    HtmlAppMenu.addEventListener("click", HtmlAppMenuOnclick, false);
    HtmlAppMenu.addEventListener("input", HtmlAppMenuOninput, false);

    HtmlAppConfig.addEventListener("click", HtmlAppConfigOnclick, false);
    HtmlAppConfig.addEventListener("input", HtmlAppConfigOninput, false);

    HtmlAppContainer.addEventListener("click", HtmlAppContainerOnclick, false);
    HtmlAppContainer.addEventListener("input", HtmlAppContainerOninput, false);
};

const main = function () {
    //CheckAudioContext
    const HtmlPresLoading = document.getElementById("presentation-loading");
    assert(HtmlPresLoading !== null, "#presentation-loading is not found");

    const HtmlPresError = document.getElementById("presentation-error");
    assert(HtmlPresError !== null, "#presentation-error is not found");

    const HtmlPresOpen = document.getElementById("presentation-open");
    assert(HtmlPresOpen !== null, "#presentation-open is not found");


    if (undefined === AudioContext) {
        HtmlPresLoading.setAttribute("data-css-hidden", "");
        HtmlPresError.removeAttribute("data-css-hidden");
    } else {
        //open
        HtmlPresLoading.setAttribute("data-css-hidden", "");
        HtmlPresOpen.removeAttribute("data-css-hidden");

        HtmlPresOpen.addEventListener("click", HtmlPresOpenOnclick, EVENT_CO);
        document.body.addEventListener("keydown", initBodyOnkeydown, true);
    }

};
main();
