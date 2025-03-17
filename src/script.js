"use strict";
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

//DEFAULT_VOLUME / 10 -> 1 100%
const DEFAULT_VOLUME = 10;

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
const LIMIT_VOLUME_MAX = 15;    //1.5 150%
const LIMIT_VOLUME_MIN = 1;     //0.1  10%

const AUDIO_EVENT_MAX_VALUE = 120;
const AUIDIO_EVENT_MIN_VALUE = 1;

const EVENT_ONCE = {once: true};
const EVENT_CO = {capture: true, once: true};

const FREE_TIME = 5000; //ms

const CARDINAL_MAX = 15;
const EVENTS_MAX_VALUE = 80;
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
    zeros: 0
};

const STARTEDID_MAX = Number.MAX_SAFE_INTEGER;
let context = null;
let Started = false;
let StartedId = 0;

const startedIdNext = function () {
    if (StartedId === STARTEDID_MAX) {
        StartedId = 0;
    } else {
        StartedId += 1;
    }
    return StartedId;
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

let AudioSelectedPrevIdx = -1;
let AudioSelectedIdx = -1;

const SelectedAudios = {
    cap: AUDIOELEMENTS_MAX,
    len: 0,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
    all: false,
};

let AudioEventsSum = 0;

const ZombieList = {
    /**@type{Array<AudioState>}*/
    buf: [],
    len: 0,
    seen: 0,
    available() {
        return (ZombieList.len > 0 && ZombieList.len > ZombieList.seen);
    },
    /**@type{(audio: AudioState) => undefined}*/
    push(audio) {
        ZombieList.buf.push(audio);
        ZombieList.len += 1;
    },
    /**@type{(i: number) => AudioState | undefined}*/
    revive(i) {
        if (ZombieList.len === 0) {
            return;
        }
        assert(0 <= i && i < ZombieList.len, "ERROR: index out of range");

        let z = ZombieList.buf[i];
        if (i < ZombieList.len-1) {
            ZombieList.buf.copyWithin(i, i+1, ZombieList.len);
        }

        ZombieList.buf.length -= 1;
        ZombieList.len -= 1;
        return z;
    },
    indexOf(html) {
        if (ZombieList.len === 0) {
            return -1;
        }
        for (let i = 0; i < ZombieList.len; i += 1) {
            if (ZombieList.buf[i].html === html) {
                return i;
            }
        }
        return -1;
    },
    see() {
        if (ZombieList.len === 0 || ZombieList.len === ZombieList.seen) {
            return;
        }
        const z = ZombieList.buf[ZombieList.seen];
        ZombieList.seen += 1;
        return z;
    },
    /**@type{() => undefined}*/
    free() {
        if (ZombieList.len > 0) {
            ZombieList.buf.length = 0;
            ZombieList.len = 0;
        }
    }
}

const AudioList = {
    /**@type{Array<AudioState>}*/
    buf: [],
    len: 0,
    /**@type{(audio: AudioState) => undefined}*/
    push(audio) {
        AudioList.buf.push(audio);
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
        audio.playing = false;
        audio.volume = DEFAULT_VOLUME;
        audio.startPoint = 0;
        audio.startTime = 0;
        audio.delayDisabled = DelayAreAllDisable;
        audio.filterDisabled = FilterAreAllDisable;
        audio.pannerDisabled = PannerAreAllDisable;
        audio.pbrateDisabled = PbRateAreAllDisable;
        audio.rspDisabled = CutRSPAreAllDisable;
        audio.repDisabled = CutREPAreAllDisable;
        audio.pbrate = 1;

        //clean
        audio.html.removeEventListener("timeupdate", AudioOntimeupdate);
        audio.html.removeEventListener("ended", AudioOnended);
        URL.revokeObjectURL(audio.html.src);
    },
    /**@type{(i: number) => boolean}*/
    makeZombie(i) {
        assert(0 <= i && i < AudioList.len, "ERROR: index out of range");

        let audio = AudioList.buf[i];
        if (i < AudioList.len-1) {
            const buf = AudioList.buf;
            for (let j = i; j < AudioList.len-1; j += 1) {
                buf[j] = buf[j+1];
                buf[j].html._index = j;
            }
            //AudioList.buf.copyWithin(i, i+1, AudioList.len);
        }
        AudioList.buf.length -= 1;
        AudioList.len -= 1;

        audio.html._zombie = true;

        AudioList.cleanAudio(audio);
        ZombieList.push(audio);
        return true;
    }
};

let timeoutFree = undefined;
const timeoutFreeFn = function () {
    if (timeoutFree !== undefined) {
        ZombieList.free();
        HtmlAudioZombies.replaceChildren();

        timeoutFree = undefined;
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

const HtmlAppPanel = document.getElementById("app-panel");
assert(HtmlAppPanel !== null, "#app-panel is not found");

const HtmlPTitle = document.getElementById("p-title");
assert(HtmlPTitle !== null, "#p-title is not found");

const HtmlPVolume = document.getElementById("p-volume");
assert(HtmlPVolume !== null, "#p-volume is not found");

const HtmlPVolumeInput = document.getElementById("p-volume-input");
assert(HtmlPVolumeInput !== null, "#p-volume-input is not found");

const HtmlPVolumeText = document.getElementById("p-volume-text");
assert(HtmlPVolumeText !== null, "#p-volume-text is not found");

const HtmlPProbValue = document.getElementById("p-probability-value");
assert(HtmlPProbValue !== null, "#p-probability-value is not found");

const HtmlPProbText = document.getElementById("p-probability-text");
assert(HtmlPProbText !== null, "#p-probability-text is not found");

const HtmlPEffects = document.getElementById("p-effects");
assert(HtmlPEffects !== null, "#p-effects is not found");

const HtmlPStartTimeText = document.getElementById("p-start-time-text");
assert(HtmlPStartTimeText !== null, "#p-start-time-text is not found");

const HtmlPStartTimeInput = document.getElementById("p-start-time-input");
assert(HtmlPStartTimeInput !== null, "#p-start-time-input is not found");

const HtmlPStartTimeBar = document.getElementById("p-start-time-bar");
assert(HtmlPStartTimeBar !== null, "#p-start-time-bar is not found");

const HtmlPEndTimeText = document.getElementById("p-end-time-text");
assert(HtmlPEndTimeText !== null, "#p-end-time-text is not found");

const HtmlPEndTimeInput = document.getElementById("p-end-time-input");
assert(HtmlPEndTimeInput !== null, "#p-end-time-input is not found");

const HtmlPEndTimeBar = document.getElementById("p-end-time-bar");
assert(HtmlPEndTimeBar !== null, "#p-end-time-bar is not found");

const HtmlPCurrentBar = document.getElementById("p-current-bar");
assert(HtmlPCurrentBar !== null, "#p-current-bar is not found");

const HtmlPCurrentText = document.getElementById("p-current-text");
assert(HtmlPCurrentText !== null, "#p-current-text is not found");

const HtmlPStartPointBar = document.getElementById("p-start-point-bar");
assert(HtmlPStartPointBar !== null, "#p-start-point-bar is not found");

const HtmlPEndPointBar = document.getElementById("p-end-point-bar");
assert(HtmlPEndPointBar !== null, "#p-end-point-bar is not found");

const HtmlPControls = document.getElementById("p-controls");
assert(HtmlPControls !== null, "#p-controls is not found");

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

const defaultSets = function () {
    for (let i = 1; i < SetEvents.len; i += 1) {
        const HtmlSet = HtmlCSets.children[i];
        HtmlSet.setAttribute("data-display", "0"); 
    }
    SetEvents.zeros = 0;
    SetEvents.sum = 1;
    SetEvents.len = 1;
};

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
    input.gain.value = DEFAULT_VOLUME / 10;

    source.connect(input);
    output.connect(context.destination);

    return {
        html: HtmlAudio,
        source: source,
        events: 1,
        playing: false,
        volume: DEFAULT_VOLUME,
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

    //duration is greater than 1 second
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
        audio.startPoint = rsp;
        audio.endPoint = rep;
        audio.html._endPoint = rep;
        console.info({rsp, rep});
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
    return false;
};

const audioRemove = function (audio, i) {
    audioPause(audio);
    if (!AudioList.makeZombie(i)) {
        throw Error("ERROR: AudioList.makeZombie");
    }
};

/**@type{(i: number, action: string) => boolean}*/
const audioAction = function (i, action) {
    assert(0 <= i && i < AudioList.len, "ERROR: out of range");

    const state = AudioList.get(i);
    if (state === undefined) {
        return false;
    }
    if ("play" === action) {
        audioPlay(state);
        if (i === AudioSelectedIdx) {
            if (state.duration >= 1) {
                updateHtmlPanelRP(
                    state.startPoint * 100 / state.duration,
                    state.endPoint * 100 / state.duration
                );
            }
            updateHtmlPanelCurrentTime(
                state.html.currentTime * 100 / state.duration,
                state.html.currentTime
            );
        }
        return true;
    } else if ("pause" === action) {
        audioPause(state);
        if (i === AudioSelectedIdx) {
            if (state.duration >= 1) {
                updateHtmlPanelRP(0, 100);
            }
            updateHtmlPanelCurrentTime(0, 0);
        }
        return true;
    } else if ("remove" === action) {
        AudioEventsSum -= state.events;
        audioRemove(state, i);
        return true;
    }
    return false;
}

/**@type{(e: Event) => undefined}*/
const AudioOnerror = function (e) {
    const HtmlAudio = e.currentTarget;
    if (HtmlAudio.src) {
        URL.revokeObjectURL(HtmlAudio.src);
    }

    console.error(`ERROR: ${HtmlAudio._name} fails load`);
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
    return -1
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

const updateHtmlAudioProbability = function () {
    if (HtmlAppContainer.childElementCount === 0) {
        return;
    }
    for (let i = 0; i < HtmlAppContainer.childElementCount; i += 1) {
        const HtmlAudioElement = HtmlAppContainer.children[i];
        const AudioState = AudioList.get(i);
        HtmlAudioElement.children["probability"].firstElementChild.textContent = (
            (AudioState.events / AudioEventsSum * 100).toFixed(2)
        );
    }
};

function isMinorThanTen(val) {
    if (val < 10) {
        return "0" + String(val);
    }
    return String(val);
}
/**
@type {(val: number) => string} */
function durationToTime(val) {
    val = Math.floor(val);
    const sec = val % 60;
    const min = Math.floor(val / 60) % 60;
    const hr = Math.floor(val / 3600);
    let str = (hr > 0 ? hr + ":" : "");
    str += isMinorThanTen(min) + ":" + isMinorThanTen(sec);
    return str;
}

/**
 * val is in seconds
@type {(val: number) => string} */
function durationToShortTime(val) {
    const miliseconds = Math.floor(val * 10) % 10;
    const sec = Math.floor(val) % 60;
    return (sec < 10 ? "0" : "") + sec + "." + miliseconds;
}

/**@type{(startval: number, endval: number) => undefined}*/
const updateHtmlPanelRP = function (startval, endval) {
    HtmlPStartPointBar.setAttribute("style", `--translate:${startval}%`);
    HtmlPEndPointBar.setAttribute("style", `--translate:${endval}%`);
};

/**@type{(pval: number, tval: number) => undefined}*/
const updateHtmlPanelCurrentTime = function (pval, tval) {
    HtmlPCurrentBar.setAttribute("style", `--translate:${pval}%`);
    HtmlPCurrentText.textContent = durationToTime(tval);
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

const getAudioStateIndex = function (HtmlAudio) {
    for (let i = 0; i < AudioList.len; i += 1) {
        if (HtmlAudio === AudioList.buf[i].html) {
            return i;
        }
    }
    return -1;
}

const ZombieAudioOncanplaythrough = function (e) {
    const HtmlAudio = e.currentTarget;
    const HtmlAudioElement = HtmlAudioZombies.children[0];
    const i = ZombieList.indexOf(HtmlAudio);
    assert(i !== -1, "ERROR: HtmlAudio not found");
    const state = ZombieList.revive(i);
    ZombieList.seen -= 1;

    state.duration = HtmlAudio.duration;
    state.endPoint = HtmlAudio.duration;
    state.endTime = HtmlAudio.duration;

    HtmlAudio._endPoint = HtmlAudio.duration;
    HtmlAudio._index = AudioList.len;

    HtmlAudio.addEventListener("timeupdate", AudioOntimeupdate, true);
    HtmlAudio.addEventListener("ended", AudioOnended, true);

    //there is a new AudioEvent
    AudioEventsSum += 1;

    HtmlAudioElement._HtmlTitle.textContent = HtmlAudio._name;
    HtmlAudioElement._HtmlProbText.textContent = (
        (1 / AudioEventsSum * 100).toFixed(2)
    );

    verifyHtmlCSets();
    updateHtmlAudioProbability();

    AudioList.push(state);
    HtmlAppContainer.appendChild(HtmlAudioElement);

    if (AudioSelectedIdx !== -1) {
        console.info({AudioSelectedIdx});
        let audioSelected = AudioList.get(AudioSelectedIdx);
        //Throw Error
        assert(audioSelected !== undefined);
        updateHtmlPanelProbability(audioSelected.events);
    }
};

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

    HtmlAudio._endPoint = HtmlAudio.duration;
    HtmlAudio._index = AudioList.len;

    HtmlAudio.addEventListener("timeupdate", AudioOntimeupdate, true);
    HtmlAudio.addEventListener("ended", AudioOnended, true);

    HtmlAudioElement._HtmlTitle = HtmlAudioElement.children["title"];
    HtmlAudioElement._HtmlProbText = (
        HtmlAudioElement
        .children["probability"]
        .firstElementChild
    );

    //there is a new AudioEvent
    AudioEventsSum += 1;

    HtmlAudioElement._HtmlTitle.insertAdjacentText("beforeend", HtmlAudio._name);
    HtmlAudioElement._HtmlProbText.insertAdjacentText(
        "beforeend",
        (1 / (AudioEventsSum) * 100).toFixed(2)
    );

    updateHtmlAudioProbability();
    verifyHtmlCSets();

    HtmlAppContainer.appendChild(HtmlAudioElement);
    AudioList.push(state);

    if (AudioSelectedIdx !== -1) {
        let audioSelected = AudioList.get(AudioSelectedIdx);
        assert(audioSelected !== undefined);
        updateHtmlPanelProbability(audioSelected.events);
    }
};

const AudioOntimeupdate = function (e) {
    const HtmlAudio = e.currentTarget;
    if (HtmlAudio._zombie) {
        HtmlAudio.removeEventListener("timeupdate", AudioOntimeupdate);
        HtmlAudio.removeEventListener("ended", AudioOnended);
        return;
    }
    if (!HtmlAudio.paused && !HtmlAudio.ended) {
        if(HtmlAudio._endPoint <= HtmlAudio.currentTime) {
            assert(AudioList.len === HtmlAppContainer.childElementCount);
            let i = HtmlAudio._index;
            HtmlAppContainer.children[i].setAttribute("data-playing", "0");
            if (i === AudioSelectedIdx) {
                HtmlAppPanel.setAttribute("data-playing", "0");
            }
            audioAction(i, "pause");
        } else {
            if (AudioSelectedIdx === HtmlAudio._index) {
                updateHtmlPanelCurrentTime(
                    HtmlAudio.currentTime * 100 / HtmlAudio.duration,
                    HtmlAudio.currentTime
                );
            }
        }
    }
};

const AudioOnended = function (e) {
    const HtmlAudio = e.currentTarget;
    if (HtmlAudio.paused || HtmlAudio.ended) {
        let i = getAudioStateIndex(HtmlAudio);
        HtmlAppContainer.children[i].setAttribute("data-playing", "0");
        if (i === AudioSelectedIdx) {
            HtmlAppPanel.setAttribute("data-playing", "0");
        }
        audioAction(i, "pause")
    }
}

/**
 * @type {(files: FileList) => undefined}*/
const addFiles = function (files) {
    if (AudioList.len === AUDIOELEMENTS_MAX) {
        //TODO: NOTIFICATION
        //Audio Elements are full
        return;
    }

    //TODO:
    //we can use Zombies in events
    //then we must finish any other process with zombies
    if (timeoutFree !== undefined) {
        clearTimeout(timeoutFree);
        timeoutFree = undefined;
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
        if (ZombieList.available()) {
            const ZombieState = ZombieList.see();
            assert(ZombieState !== undefined, "ERROR undefined state: ZombieList.see");

            const HtmlAudio = ZombieState.html;
            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio._name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio._type = file.type;
            HtmlAudio._zombie = false;

            HtmlAudio.addEventListener(
                "canplaythrough",
                ZombieAudioOncanplaythrough,
                EVENT_CO
            );
        } else {
            const HtmlAudio = HtmlAudioTemplate.cloneNode();
            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio.preservesPitch = false;
            HtmlAudio._name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio._type = file.type;
            HtmlAudio._endPoint = 0;
            HtmlAudio._index = 0;
            HtmlAudio._zombie = false;


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

        for (let i = 1; i < AudioList.len; i += 1) {
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
            let end = 0;
            if (SelectedAudios.all) {
                end = AudioList.len;
            } else {
                end = SelectedAudios.len;
            }
            for (let i = 0; i < end; i += 1) {
                audioAction(i, "play",)
                HtmlAppContainer.children[i].setAttribute("data-playing", "1");
            }
        }
        //we asume that there is no executeTimeout active
        executeTimeout = setTimeout(randomExecution, interval, id);
    } else {
        console.info("END");
        executeTimeout = undefined;
    }
}


// HTML functions and events

const switchTheme = function () {
    let theme = document.firstElementChild.getAttribute("data-theme");
    if (theme === "dark") {
        theme = "light"
    } else if (theme === "light") {
        theme = "dark";
    } else { //default
        theme = localStorage.getItem("theme");
        if (theme !== "dark" && theme !== "light") {
            if (window.matchMedia
                && window.matchMedia("(prefers-color-scheme: dark)").matches
            ) {
                theme = "dark";
            } else {
                theme = "light"
            }
        }
    }
    document.firstElementChild.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
};

/**@type{(events: number) => undefined}*/
const updateHtmlPanelProbability = function (events) {
    HtmlPProbValue.textContent = String(events);
    HtmlPProbText.textContent = (
        (events / AudioEventsSum * 100).toFixed(2)
    );

};

/**@type{(audioState: AudioState) => undefined}*/
const changeHtmlAppPanel = function (audioState) {
    HtmlPTitle.textContent = audioState.html._name;
    HtmlPVolumeInput.valueAsNumber = audioState.volume;
    HtmlPVolumeText.textContent = `${audioState.volume*10}%`;

    if (AudioSelectedIdx > 0) {
        HtmlPControls.setAttribute("data-prev", "1");
    } else {
        HtmlPControls.setAttribute("data-prev", "0");
    }
    if (AudioSelectedIdx < AudioList.len - 1) {
        HtmlPControls.setAttribute("data-prev", "1");
    } else {
        HtmlPControls.setAttribute("data-prev", "0");
    }

    updateHtmlPanelProbability(audioState.events);

    HtmlPEffects.children["delay"].firstElementChild.checked = !audioState.delayDisabled;
    HtmlPEffects.children["panner"].firstElementChild.checked = !audioState.pannerDisabled;
    HtmlPEffects.children["filter"].firstElementChild.checked = !audioState.filterDisabled;
    HtmlPEffects.children["pbrate"].firstElementChild.checked = !audioState.pbrateDisabled;
    HtmlPEffects.children["rsp"].firstElementChild.checked = !audioState.rspDisabled;
    HtmlPEffects.children["rep"].firstElementChild.checked = !audioState.repDisabled;

    HtmlPStartTimeText.textContent = durationToTime(audioState.startTime);
    HtmlPEndTimeText.textContent = durationToTime(audioState.endTime);

    HtmlPStartTimeInput.valueAsNumber = (
        audioState.startTime * 100 / audioState.duration
    );
    HtmlPEndTimeInput.valueAsNumber = (
        audioState.endTime * 100 / audioState.duration
    );
    HtmlPStartTimeBar.setAttribute(
        "style",
        `--translate:${audioState.startTime * 100 / audioState.duration}%`
    );
    HtmlPEndTimeBar.setAttribute(
        "style",
        `--translate:${audioState.endTime * 100 / audioState.duration}%`
    );

    if (audioState.playing) {
        HtmlAppPanel.setAttribute("data-playing", "1");
        updateHtmlPanelCurrentTime(
            audioState.html.currentTime * 100 / audioState.duration,
            audioState.html.currentTime
        );
        updateHtmlPanelRP(
            audioState.startPoint * 100 / audioState.duration,
            audioState.endPoint * 100 / audioState.duration
        );
    } else {
        HtmlAppPanel.setAttribute("data-playing", "0");
        updateHtmlPanelCurrentTime(0, 0);
        updateHtmlPanelRP(0, 100);
    }
};

/**@type{(effect: string, v: boolean) => undefined}*/
const changeHtmlAppPanelEffect = function (effect, v) {
    if (effect === "delay"
        || effect === "panner"
        || effect === "filter"
        || effect === "pbrate"
        || effect === "rsp"
        || effect === "rep"
    ) {
        HtmlPEffects.children[effect].firstElementChild.checked = v;
    }
}

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
    if ("theme-switcher" === target.name) {
        switchTheme();
    } else if ("set-reset" === target.name) {
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
        HtmlCDelayTimemin.children["delay-timemin"].valueAsNumber = (
            DEFAULT_DELAY_TIMEMIN
        );
        HtmlCDelayTimemin.lastElementChild.children["value"].textContent = (
            getDelayTime(DEFAULT_DELAY_TIMEMIN).toFixed(1)
        );
        HtmlCDelayTimemax.children["delay-timemax"].valueAsNumber = (
            LIMIT_DELAY_TIMEMAX - DEFAULT_DELAY_TIMEMAX
        );
        HtmlCDelayTimemax.lastElementChild.children["value"].textContent = (
            getDelayTime(DEFAULT_DELAY_TIMEMAX).toFixed(1)
        );
        HtmlCDelayFeedbackmin.children["delay-feedbackmin"].valueAsNumber = (
            DEFAULT_DELAY_FEEDBACKMIN
        );
        HtmlCDelayFeedbackmin.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DEFAULT_DELAY_FEEDBACKMIN)
        );
        HtmlCDelayFeedbackmax.children["delay-feedbackmax"].valueAsNumber = (
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
        HtmlCFilterFreqmin.children["filter-freqmin"].valueAsNumber = (
            DEFAULT_FILTER_FREQMIN
        );
        HtmlCFilterFreqmin.lastElementChild.children["value"].textContent = String(
            getFilterFreq(DEFAULT_FILTER_FREQMIN)
        );
        HtmlCFilterFreqmax.children["filter-freqmax"].valueAsNumber = (
            LIMIT_FILTER_FREQMAX - DEFAULT_FILTER_FREQMAX
        );
        HtmlCFilterFreqmax.lastElementChild.children["value"].textContent = String(
            getFilterFreq(DEFAULT_FILTER_FREQMAX)
        );
        HtmlCFilterQmin.children["filter-qmin"].valueAsNumber = DEFAULT_FILTER_QMIN;
        HtmlCFilterQmin.lastElementChild.children["value"].textContent = String(
            getFilterQ(DEFAULT_FILTER_QMIN)
        );
        HtmlCFilterQmax.children["filter-qmax"].valueAsNumber = (
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
        HtmlCPannerXmin.children["panner-xmin"].valueAsNumber = DEFAULT_PANNER_XMIN;
        HtmlCPannerXmin.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_XMIN)
        );
        HtmlCPannerXmax.children["panner-xmax"].valueAsNumber = (
            LIMIT_PANNER_MAX - DEFAULT_PANNER_XMAX
        );
        HtmlCPannerXmax.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_XMAX)
        );
        HtmlCPannerYmin.children["panner-ymin"].valueAsNumber = DEFAULT_PANNER_YMIN;
        HtmlCPannerYmin.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_YMIN)
        );
        HtmlCPannerYmax.children["panner-ymax"].valueAsNumber = (
            LIMIT_PANNER_MAX - DEFAULT_PANNER_YMAX
        );
        HtmlCPannerYmax.lastElementChild.children["value"].textContent = String(
            getPanner(DEFAULT_PANNER_YMAX)
        );
        HtmlCPannerZmin.children["panner-zmin"].valueAsNumber = DEFAULT_PANNER_ZMIN;
        HtmlCPannerZmin.lastElementChild.children["value"].textContent = String(
            DEFAULT_PANNER_ZMIN
        );
        HtmlCPannerZmax.children["panner-zmax"].valueAsNumber = (
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
        HtmlCPbrateMin.children["pbrate-min"].valueAsNumber = DEFAULT_PBRATE_MIN;
        HtmlCPbrateMin.lastElementChild.children["value"].textContent = (
            getPlaybackRate(DEFAULT_PBRATE_MIN).toFixed(2)
        );
        HtmlCPbrateMax.children["pbrate-max"].valueAsNumber = (
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
            const state = AudioList.get(i);
            state.delayDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("delay", !target.checked);
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
            const state = AudioList.get(i);
            state.filterDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("filter", !target.checked);
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
            const state = AudioList.get(i);
            state.pannerDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("panner", !target.checked);
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
            const state = AudioList.get(i);
            state.pbrateDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("pbrate", !target.checked);
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
            const state = AudioList.get(i);
            state.rspDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("rsp", !target.checked);
        }

    } else if ("rep-da" === target.name) {
        CutREPAreAllDisable = target.checked;
        if (AudioList.len < 0) {
            return;
        }
        for (let i = 0; i < AudioList.len; i += 1) {
            const state = AudioList.get(i);
            state.repDisabled = target.checked;
        }
        if (AudioSelectedIdx !== -1) {
            changeHtmlAppPanelEffect("rep", !target.checked);
        }
    }
};

const HtmlAppMenuOnclick = function (e) {
    const target = e.target;
    const name = target.getAttribute("name");
    if ("start" === name) {
        let dataStart = target.getAttribute("data-start");
        if (dataStart === "0") {
            Started = true;
            randomExecution(startedIdNext());
            target.setAttribute("data-start", "1");
        } else {
            Started = false;
            if (undefined !== executeTimeout) {
                clearTimeout(executeTimeout);
                executeTimeout = undefined;
            }
            for (let i = 0; i < AudioList.len; i += 1) {
                audioAction(i, "pause");
                HtmlAppContainer.children[i].setAttribute("data-playing", "0");
            }
            target.setAttribute("data-start", "0");
        }
    } else if ("clear" === name) {
        if (AudioList.len === 0) {
            return;
        }

        defaultSets();

        for (let audio of AudioList.buf) {
            audioPause(audio);
            AudioList.cleanAudio(audio);
            ZombieList.push(audio);
        }
        AudioList.buf.length = 0;
        AudioList.len = 0;

        AudioEventsSum = 0;

        //TODO
        //REMOVE THIS
        //SELECTED
        AudioSelectedIdx = -1;
        HtmlAppPanel.setAttribute("data-display", "0");

        HtmlAudioZombies.append.apply(
            HtmlAudioZombies,
            HtmlAppContainer.children
        );
        clearTimeout(timeoutFree);
        timeoutFree = setTimeout(timeoutFreeFn,FREE_TIME);

    } else if ("file" === name) {
        target.value = "";
    } else if ("config" === name) {
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
    const name = target.getAttribute("name");
    console.info({target})
    if ("play" === name) {
        const HtmlAudioElement = target.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        if (HtmlAudioElement.getAttribute("data-playing") === "0") {
            HtmlAudioElement.setAttribute("data-playing", "1");
            if (i === AudioSelectedIdx) {
                HtmlAppPanel.setAttribute("data-playing", "1");
            }
            audioAction(i, "play");
            console.info("play: audio #",i);
        } else {
            HtmlAudioElement.setAttribute("data-playing", "0");
            if (i === AudioSelectedIdx) {
                HtmlAppPanel.setAttribute("data-playing", "0");
            }
            audioAction(i, "pause");
            console.info("pause: audio #",i);
        }
    } else if ("remove" === name) {
        const HtmlAudioElement = target.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        console.info("remove: audio #",i);

        audioAction(i, "remove");
        HtmlAudioZombies.appendChild(HtmlAudioElement);

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

        //TODO
        if (i === AudioSelectedIdx || AudioList.len === 0) {
            //SELECTED
            AudioSelectedIdx = -1;
            HtmlAppPanel.setAttribute("data-display", "0");
        } else if (AudioSelectedIdx !== -1) {
            console.info({AudioSelectedIdx});
            const audioSelected = AudioList.get(AudioSelectedIdx);
            //Throw ERROR
            assert(audioSelected !== undefined);
            updateHtmlPanelProbability(audioSelected.events);
        }

        //updateHtmlAudioProbability();

        //defaults
        HtmlAudioElement.setAttribute("data-playing", "0");
        HtmlAudioElement.setAttribute("data-selected", "0");

        clearTimeout(timeoutFree)
        timeoutFree = setTimeout(timeoutFreeFn,FREE_TIME);
    } else if ("title" === name
        || "pin" === name
        || "audio" === name
        || "probability" === name
    ) {
        let HTMLAudioElement = target;
        if ("audio" !== name) {
            HTMLAudioElement = target.parentElement;
        }
        if (HTMLAudioElement.getAttribute("data-selected") === "0") {
            let i = getHtmlChildIndex(HtmlAppContainer, HTMLAudioElement);
            assert(i !== -1, "ERROR: index do not exist");
            assert(i < AudioList.len, "ERROR: the index is out of AudioList");

            if (AudioSelectedIdx !== -1) {
                console.info({AudioSelectedIdx});
                //SOME TIMES THROW ERROR
                HtmlAppContainer.children[AudioSelectedIdx].setAttribute(
                    "data-selected",
                    "0"
                );
            } else {
                HtmlAppPanel.setAttribute("data-display", "1");
            }
            HTMLAudioElement.setAttribute("data-selected", "1");
            //SELECTED
            AudioSelectedIdx = i;

            console.info({AudioSelectedIdx});
            changeHtmlAppPanel(AudioList.get(i));
        } else {
            HTMLAudioElement.setAttribute("data-selected", "0");
            HtmlAppPanel.setAttribute("data-display", "0");
            //SELECTED
            AudioSelectedIdx = -1;
        }
    }
};


const HtmlAppPanelOnclick = function (e) {
    assert(AudioSelectedIdx !== -1, "ERROR: Panel Bad Open");

    const target = e.target;
    if ("p-left" === target.name) {
        if (AudioList.len === 1) {
            return;
        }

        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        if (state.events === AUIDIO_EVENT_MIN_VALUE) {
            return;
        }
        state.events -= 1;
        AudioEventsSum -= 1;

        updateHtmlAudioProbability();
        updateHtmlPanelProbability(state.events);

    } else if ("p-right" === target.name) {
        if (AudioList.len === 1) {
            return;
        }
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        if (state.events === AUDIO_EVENT_MAX_VALUE) {
            return;
        }
        state.events += 1;
        AudioEventsSum += 1;

        updateHtmlAudioProbability();
        updateHtmlPanelProbability(state.events);
    } else if ("play" === target.name) {
        const HtmlAudioElement = HtmlAppContainer.children[AudioSelectedIdx];
        if (HtmlAudioElement.getAttribute("data-playing") === "0") {
            HtmlAudioElement.setAttribute("data-playing", "1");
            HtmlAppPanel.setAttribute("data-playing", "1");
            audioAction(AudioSelectedIdx, "play");
            console.info("play: audio #", AudioSelectedIdx);
        } else {
            HtmlAudioElement.setAttribute("data-playing", "0");
            HtmlAppPanel.setAttribute("data-playing", "0");
            audioAction(AudioSelectedIdx, "pause");
            console.info("pause: audio #",AudioSelectedIdx);
        }
    } else if ("close" === target.name) {
        const HTMLAudioElement = HtmlAppContainer.children[AudioSelectedIdx];
        HTMLAudioElement.setAttribute("data-selected", "0");
        HtmlAppPanel.setAttribute("data-display", "0");
        //SELECTED
        AudioSelectedIdx = -1;

    } else if ("prev" === target.name) {
        if (AudioList.len < 2) {
            target.parentElement.setAttribute("data-prev", "0");
            return;
        }
        HtmlAppContainer.children[AudioSelectedIdx].setAttribute("data-selected", "0");
        if (AudioSelectedIdx < 1) {
            AudioSelectedIdx = AudioList.len - 1;
        } else {
            AudioSelectedIdx -= 1;
        }
        const audioState = AudioList.get(AudioSelectedIdx);
        assert(audioState !== undefined, "ERROR: AudioList.get not found audio")
        HtmlAppContainer.children[AudioSelectedIdx].setAttribute("data-selected", "1");
        changeHtmlAppPanel(audioState);
    } else if ("next" === target.name) {
        if (AudioList.len < 2) {
            target.parentElement.setAttribute("data-next", "0");
            return;
        }
        HtmlAppContainer.children[AudioSelectedIdx].setAttribute("data-selected", "0");
        if (AudioSelectedIdx === AudioList.len - 1) {
            AudioSelectedIdx = 0;
        } else {
            AudioSelectedIdx += 1;
        }
        const audioState = AudioList.get(AudioSelectedIdx);
        assert(audioState !== undefined, "ERROR: AudioList.get not found audio")
        HtmlAppContainer.children[AudioSelectedIdx].setAttribute("data-selected", "1");
        changeHtmlAppPanel(audioState);
    }
};

const HtmlAppPanelOninput = function (e) {
    assert(AudioSelectedIdx !== -1, "ERROR: Panel Bad Open");

    const target = e.target;
    if ("volume-input" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        if (target.valueAsNumber < LIMIT_VOLUME_MIN) {
            target.valueAsNumber = LIMIT_VOLUME_MIN;
        } else if (target.valueAsNumber > LIMIT_VOLUME_MAX) {
            target.valueAsNumber = LIMIT_VOLUME_MAX;
        } else {
            state.input.gain.value = target.valueAsNumber / 10;
            state.volume = target.valueAsNumber;
            target.nextElementSibling.textContent = `${state.volume * 10}%`;
        }

    } else if ("delay" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.delayDisabled = !target.checked;
        if (DelayAreAllDisable && target.checked) {
            DelayAreAllDisable = false;
            HtmlCDelayDA.checked = false;
        }

    } else if ("filter" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.filterDisabled = !target.checked;
        if (FilterAreAllDisable && target.checked) {
            FilterAreAllDisable = false;
            HtmlCFilterDA.checked = false;
        }

    } else if ("panner" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.pannerDisabled = !target.checked;
        if (PannerAreAllDisable && target.checked) {
            PannerAreAllDisable = false;
            HtmlCPannerDA.checked = false;
        }

    } else if ("pbrate" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.pbrateDisabled = !target.checked;
        if (PbRateAreAllDisable && target.checked) {
            PbRateAreAllDisable = false;
            HtmlCPbrateDA.checked = false;
        }

    } else if ("rsp" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.rspDisabled = !target.checked;
        if (CutRSPAreAllDisable && target.checked) {
            CutRSPAreAllDisable = false;
            HtmlCRSPDA.checked = false;
        }

    } else if ("rep" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        state.repDisabled = !target.checked;
        if (CutREPAreAllDisable && target.checked) {
            CutREPAreAllDisable = false;
            HtmlCREPDA.checked = false;
        }

    } else if ("start-time-input" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        let startTime = (state.duration * target.valueAsNumber) / 100;
        let translate = target.value;

        if (startTime + 0.5 >= state.endTime) {
            startTime = state.endTime - 0.5
            let value = ((state.endTime - 0.5) * 100) / state.duration;
            translate = String(value);
            target.valueAsNumber = value;

        }
        state.startTime = startTime;
        HtmlPStartTimeBar.setAttribute("style", "--translate:"+translate+"%");
        HtmlPStartTimeText.textContent = durationToTime(String(startTime));

    } else if ("end-time-input" === target.name) {
        const state = AudioList.get(AudioSelectedIdx);
        assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");
        let endTime = (state.duration * target.valueAsNumber) / 100;
        let translate = target.value;
        if (state.startTime >= endTime - 0.5) {
            endTime = state.startTime + 0.5;
            let value = ((state.startTime + 0.5) * 100) / state.duration;
            translate = String(value);
            target.valueAsNumber = value;
        }

        state.endTime = endTime;
        HtmlPEndTimeBar.setAttribute("style", "--translate:"+translate+"%");
        HtmlPEndTimeText.textContent = durationToTime(String(endTime));
    }
}

const BodyOnkeyup = function (e) {
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

    HtmlApp?.parentElement.firstElementChild.remove();
    HtmlApp.removeAttribute("data-css-hidden");

    //init context
    context = new AudioContext({
        latencyHint: "playback",
        sampleRate: 44100
    });
    context?.resume();
    if (context.listener.positionX !== undefined) {
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
const HtmlVolumeOnwheel = function (e) {
    const name = e.target.getAttribute("name");
    let input; e.target.parentElement.children["volume-input"];
    if (name === "volume-input" || name === "volume-text") {
        //can throw Error
        input = e.target.parentElement.children["volume-input"];
    } else if (name === "volume") {
        //can throw Error
        input = e.target.children["volume-input"];
    } else {
        return;
    }

    const state = AudioList.get(AudioSelectedIdx);
    assert(state !== undefined, "ERROR undefined state: AudioList.get on AudioSelectedIdx");

    if (e.deltaY > 0) {
        if (state.volume - 1 < LIMIT_VOLUME_MIN) {
            return;
        }
        state.volume -= 1;
    } else {
        if (state.volume + 1 > LIMIT_VOLUME_MAX) {
            return;
        }
        state.volume += 1;
    }
    input.valueAsNumber = state.volume;
    input.nextElementSibling.textContent = `${state.volume * 10}%`;
    state.input.gain.value = state.volume / 10;
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

    HtmlAppPanel.addEventListener("input", HtmlAppPanelOninput, false);
    HtmlAppPanel.addEventListener("click", HtmlAppPanelOnclick, false);
    HtmlPVolume.addEventListener("wheel", HtmlVolumeOnwheel, false);
};

const main = function () {
    //CheckAudioContext
    //
    const HtmlPresError = document.getElementById("presentation-error");
    assert(HtmlPresError !== null, "#presentation-error is not found", false);

    const HtmlPresOpen = document.getElementById("presentation-open");
    assert(HtmlPresOpen !== null, "#presentation-open is not found", false);

    const HtmlThemeSwitcher = document.getElementById("theme-switcher")
    assert(HtmlThemeSwitcher !== null, "#theme-switcher is not found", false);

    if (undefined === AudioContext) {
        HtmlPresOpen.setAttribute("data-css-hidden", "");
        HtmlPresError.removeAttribute("data-css-hidden");
    } else {
        //open
        HtmlPresOpen.addEventListener("click", HtmlPresOpenOnclick, EVENT_CO);
        document.body.addEventListener("keydown", initBodyOnkeydown, true);
    }

    switchTheme();
    HtmlThemeSwitcher.addEventListener("click", switchTheme, true);

};
main();
