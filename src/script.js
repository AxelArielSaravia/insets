"use strict";
//do not change this without check all ArrayTypes and Arrays in the app
const AUDIOELEMENTS_MAX = 128;
const FREE_TIME = 5000; //ms

const EVENT_ONCE = {once: true};
const EVENT_CO = {capture: true, once: true};

const AUDIO_EVENT_MAX_VALUE = 120;
const AUDIO_EVENT_MIN_VALUE = 1;

const LIMIT_MIN = 0;
const LIMIT_DELAY_FEEDBACKMAX = 17;
const LIMIT_DELAY_TIMEMAX = 49;
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

const DEFAULT_AREALLDISABLE = false;
const DEFAULT_DELAY_FEEDBACKMAX = 16;
const DEFAULT_DELAY_FEEDBACKMIN = 4;
const DEFAULT_DELAY_TIMEMAX = 39;
const DEFAULT_DELAY_TIMEMIN = 3;
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
const DEFAULT_SETEVENTS_MAX = 5;

const FADEIN = 2; //20 miliesconds
const FADEOUT = 2;

const ANIMATION_ALERT = {
    keyframes: [{color: "red"}],
    timing: {
        duration: 300,
        iterations: 3,
        delay: 0,
        composite: "replace",
    }
};

const CSS_ANIMATION_SELECT = "--color-audio-text:var(--color-audio-select)";

const READER = new FileReader();

const STORAGE_CREP_DISABLE = "inset.crep.disabled";
const STORAGE_CRSP_DISABLE = "inset.crsp.disabled";
const STORAGE_DELAY_DISABLE = "inset.d.disabled";
const STORAGE_DELAY_TIMEMAX = "inset.d.tmax";
const STORAGE_DELAY_TIMEMIN = "inset.d.tmin";
const STORAGE_DELAY_FEEDBACKMAX = "inset.d.fmax";
const STORAGE_DELAY_FEEDBACKMIN = "inset.d.fmin";
const STORAGE_FILTER_DISABLE = "inset.f.disabled";
const STORAGE_FILTER_FREQMAX = "inset.f.fmax";
const STORAGE_FILTER_FREQMIN = "inset.f.fmin";
const STORAGE_FILTER_QMAX = "inset.f.qmax";
const STORAGE_FILTER_QMIN = "inset.f.qmin";
const STORAGE_FILTER_BANDPASS = "inset.f.bp";
const STORAGE_FILTER_HIGHPASS = "inset.f.hp";
const STORAGE_FILTER_LOWPASS = "inset.f.lp";
const STORAGE_FILTER_NOTCH = "inset.f.nt";
const STORAGE_PANNER_DISABLE = "inset.p.disabled";
const STORAGE_PANNER_XMAX = "inset.p.xmax";
const STORAGE_PANNER_XMIN = "inset.p.xmin";
const STORAGE_PANNER_YMAX = "inset.p.ymax";
const STORAGE_PANNER_YMIN = "inset.p.ymin";
const STORAGE_PANNER_ZMAX = "inset.p.zmax";
const STORAGE_PANNER_ZMIN = "inset.p.zmin";
const STORAGE_PBRATE_DISABLE = "inset.pbr.disabled";
const STORAGE_PBRATE_MAX = "inset.pbr.max";
const STORAGE_PBRATE_MIN = "inset.pbr.min";
const STORAGE_SETEVENTS_MAX = "inset.set.max";
const STORAGE_THEME = "inset.theme";
const STORAGE_TIME_MAX = "inset.t.max";
const STORAGE_TIME_MIN = "inset.t.min";
const STORAGE_VERSION = "inset.version";

const StorageKeys = [
    STORAGE_CREP_DISABLE,
    STORAGE_CRSP_DISABLE,
    STORAGE_DELAY_DISABLE,
    STORAGE_DELAY_TIMEMAX,
    STORAGE_DELAY_TIMEMIN,
    STORAGE_DELAY_FEEDBACKMAX,
    STORAGE_DELAY_FEEDBACKMIN,
    STORAGE_FILTER_DISABLE,
    STORAGE_FILTER_FREQMAX,
    STORAGE_FILTER_FREQMIN,
    STORAGE_FILTER_QMAX,
    STORAGE_FILTER_QMIN,
    STORAGE_FILTER_BANDPASS,
    STORAGE_FILTER_HIGHPASS,
    STORAGE_FILTER_LOWPASS,
    STORAGE_FILTER_NOTCH,
    STORAGE_PANNER_DISABLE,
    STORAGE_PANNER_XMAX,
    STORAGE_PANNER_XMIN,
    STORAGE_PANNER_YMAX,
    STORAGE_PANNER_YMIN,
    STORAGE_PANNER_ZMAX,
    STORAGE_PANNER_ZMIN,
    STORAGE_PBRATE_DISABLE,
    STORAGE_PBRATE_MAX,
    STORAGE_PBRATE_MIN,
    STORAGE_SETEVENTS_MAX,
    STORAGE_THEME,
    STORAGE_TIME_MAX,
    STORAGE_TIME_MIN,
    STORAGE_VERSION
];

const CARDINAL_MAX = 15;
const EVENTS_MAX_VALUE = 80;
const EVENTS_MIN_VALUE = 0;
const SetEvents = {
    cap: CARDINAL_MAX + 1,
    max: DEFAULT_SETEVENTS_MAX,
    len: 1,
    buf: (function () {
        var a = new Uint8Array(CARDINAL_MAX + 1);
        a[0] = 1;
        return a;
    }()),
    sum: 1,
    zeros: 0
};

let DelayAreAllDisable = DEFAULT_AREALLDISABLE;
let DelayTimemax = DEFAULT_DELAY_TIMEMAX;
let DelayTimemin = DEFAULT_DELAY_TIMEMIN;
let DelayFeedbackmax = DEFAULT_DELAY_FEEDBACKMAX;
let DelayFeedbackmin = DEFAULT_DELAY_FEEDBACKMIN;
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

let reduceMotion = false;

//400 miliseconds
const ANIMATION_DURATION = 40;
let animation = false;
let animationEnd = 0;

let context = null;

let Started = false;

let AudioEventsSum = 0;

/**NEVERT, EVER, CHANGE THIS*/
const EMPTY_AUDIO = {
    html: undefined,
    source: undefined,
    events: 1,
    playing: false,
    remove: false,
    volume: 0,
    duration: 0,
    endPoint: 0,
    endTime: 0,
    startPoint: 0,
    startTime: 0,
    delayDisabled: false,
    filterDisabled: false,
    pannerDisabled: false,
    pbrateDisabled: false,
    rspDisabled: false,
    repDisabled: false,
    pbrate: 1,
    fadeoutRunning: false,
    fadeoutStart: 0,
    input: undefined,
    output: undefined,
    filter: undefined,
    panner: undefined,
    delay: undefined,
    delayfeedback: undefined,
    delaygain: undefined
};

let AudioPanelIdx = -1;

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

//Html Elements

const AudiosSelected = {
    cap: AUDIOELEMENTS_MAX,
    len: 0,
    buf: new Uint8Array(AUDIOELEMENTS_MAX),
    all: false,
};

const Zombies = {
    /**@type{Array<AudioState>}*/
    buf: Array(AUDIOELEMENTS_MAX).fill(EMPTY_AUDIO),
    len: 0,
    observed: 0,
    available() {
        return (Zombies.len > 0 && Zombies.len > Zombies.observed);
    },
    /**@type{(audio: AudioState) => undefined}*/
    push(audio) {
        Zombies.buf[Zombies.len] = audio;
        Zombies.len += 1;
    },
    /**@type{(i: number) => AudioState | undefined}*/
    revive(i) {
        if (Zombies.len === 0) {
            return;
        }
        assert(0 <= i && i < Zombies.len, "ERROR: index out of range");

        let z = Zombies.buf[i];
        if (i < Zombies.len-1) {
            Zombies.buf.copyWithin(i, i+1, Zombies.len);
        }

        Zombies.buf[Zombies.len-1] = EMPTY_AUDIO;
        Zombies.len -= 1;
        return z;
    },
    indexFromHTML(html) {
        if (Zombies.len === 0) {
            return -1;
        }
        for (let i = 0; i < Zombies.len; i += 1) {
            if (Zombies.buf[i].html === html) {
                return i;
            }
        }
        return -1;
    },
    /**@type{() => AudioState | undefined}*/
    observe() {
        if (Zombies.len === 0 || Zombies.len === Zombies.observed) {
            return;
        }
        const z = Zombies.buf[Zombies.observed];
        Zombies.observed += 1;
        return z;
    },
    /**@type{() => undefined}*/
    free() {
        if (Zombies.len > 0) {
            Zombies.buf.fill(EMPTY_AUDIO, 0, Zombies.len);
            Zombies.len = 0;
        }
    }
};

const Audios = {
    /**@type{Array<AudioState>}*/
    buf: Array(AUDIOELEMENTS_MAX).fill(EMPTY_AUDIO),
    len: 0,
    /**@type{(audio: AudioState) => undefined}*/
    push(audio) {
        Audios.buf[Audios.len] = audio;
        Audios.len += 1;
        assert(Audios.len <= AUDIOELEMENTS_MAX);
    },
    /**@type{(i: number) => AudioState | undefined}*/
    get(i) {
        assert(0 <= i && i < Audios.len, "ERROR: index out of Audios range")
        return Audios.buf[i];
    },
    /**@type{(audio: AudioState) => undefined}*/
    cleanAudio(audio) {
        //set defaults
        audio.events = 1;
        audio.playing = false;
        audio.fadeoutRunning = false;
        audio.remove = false;
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
        audio.html.removeEventListener("ended", AudioOnended);
        URL.revokeObjectURL(audio.html.src);
    },
    /**@type{(i: number) => AudioState}*/
    remove(i) {
        assert(Audios.len > 0, "ERROR: You call makeZombie when Audios is 0")
        assert(0 <= i && i < Audios.len, "ERROR: index out of range");

        let audio = Audios.buf[i];
        if (i < Audios.len-1) {
            Audios.buf.copyWithin(i, i+1, Audios.len);
        }
        Audios.buf[Audios.len-1] = EMPTY_AUDIO;
        Audios.len -= 1;
        return audio;
    },
    clear() {
        Audios.buf.fill(EMPTY_AUDIO, 0, Audios.len);
        Audios.len = 0;
    }
};

const AudiosPlaying = {
    buf: Array(AUDIOELEMENTS_MAX).fill(EMPTY_AUDIO),
    html: Array(AUDIOELEMENTS_MAX),
    len: 0,
    push(audio, HtmlAudioElement) {
        AudiosPlaying.buf[AudiosPlaying.len] = audio;
        AudiosPlaying.html[AudiosPlaying.len] = HtmlAudioElement;
        AudiosPlaying.len += 1;
    },
    remove(i) {
        if (i < 0 || i >= AudiosPlaying.len) {
            return false;
        }
        if (i < AudiosPlaying.len - 1) {
            AudiosPlaying.buf.copyWithin(i, i+1, AudiosPlaying.len);
            AudiosPlaying.html.copyWithin(i, i+1, AudiosPlaying.len);
        }
        AudiosPlaying.buf[AudiosPlaying.len-1] = EMPTY_AUDIO;
        AudiosPlaying.html[AudiosPlaying.len-1] = HtmlAudioElementTemplate;
        AudiosPlaying.len -= 1;
        return true;
    },
    removeAudio(audio) {
        if (AudiosPlaying.len === 0) {
            return false;
        }
        let i = AudiosPlaying.buf.lastIndexOf(audio, AudiosPlaying.len-1);
        if (i === -1) {
            return false;
        }
        if (i < AudiosPlaying.len - 1) {
            AudiosPlaying.buf.copyWithin(i, i+1, AudiosPlaying.len);
            AudiosPlaying.html.copyWithin(i, i+1, AudiosPlaying.len);
        }

        AudiosPlaying.buf[AudiosPlaying.len-1] = EMPTY_AUDIO;
        AudiosPlaying.html[AudiosPlaying.len-1] = HtmlAudioElementTemplate;
        AudiosPlaying.len -= 1;
        return true;
    },
};

let timeoutFree = undefined;
const timeoutFreeFn = function () {
    if (timeoutFree !== undefined) {
        Zombies.free();
        HtmlAudioZombies.replaceChildren();
        timeoutFree = undefined;
    }
};

/**@type{(min: number, max: number) => number}*/
const random = function (min, max) {
    return Math.trunc(Math.random() * (max - min + 1) + min);
};

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

/** @type{(n: number) => string}*/
const timeIntervalFormat = function (n) {
    if (n < 10) {
        return "0" + String(n);
    }
    return String(n);
};

/**
@type {(val: number) => string} */
const durationToTime = function (val) {
    val = Math.trunc(val);
    const sec = val % 60;
    const min = Math.trunc(val / 60) % 60;
    const hr = Math.trunc(val / 3600);
    let str = (hr > 0 ? hr + ":" : "");
    str += timeIntervalFormat(min) + ":" + timeIntervalFormat(sec);
    return str;
};

/**
 * val is in seconds
@type {(val: number) => string} */
const durationToShortTime = function (val) {
    return "00."+Math.trunc(val*10);
};

// Audio manipulation functions

/**
@type{(
    HtmlAudio: HTMLAudioElement,
    source: MediaElementAudioSourceNode
) => AudioState}*/
const audioCreate = function (HtmlAudio, source) {
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
    output.gain.value = 0;

    source.connect(input);
    output.connect(context.destination);

    return {
        html: HtmlAudio,
        source: source,
        events: 1,
        playing: false,
        remove: false,
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
        fadeoutRunning: false,
        fadeoutStart: 0,
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
        audio.panner.positionX.setValueAtTime(x, context.currentTime);
        audio.panner.positionY.setValueAtTime(y, context.currentTime);
        audio.panner.positionZ.setValueAtTime(z, context.currentTime);
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
        audio.filter.type = type;
        audio.filter.frequency.setValueAtTime(freq, context.currentTime);
        audio.filter.Q.setValueAtTime(q, context.currentTime);
        prev.connect(audio.filter);
        prev = audio.filter;
    }
    if (Math.random() < 0.5 && !audio.delayDisabled) {
        let delaytime = getDelayTime(random(DelayTimemin, DelayTimemax));
        let feedback = getDelayFeedback(random(
            DelayFeedbackmin,
            DelayFeedbackmax
        )) / 100;
        audio.delay.delayTime.setValueAtTime(
            delaytime,
            context.currentTime + delaytime
        );
        audio.delayfeedback.gain.setValueAtTime(feedback, context.currentTime);
        prev.connect(audio.delay);
        prev.connect(audio.delaygain);
        prev = audio.delaygain;
    }
    prev.connect(audio.output);
};

const RequestFadeout = {
    request: false,
    endTime: 0, //seconds
    /**@type{"replay" | "pause" | "clear"}*/
    action: "replay",
    clear() {
        RequestFadeout.request = false;
    },
    /**@type{(AudioList: {buf: Array<AudioState>, len: number}) => undefined}*/
    fromAudioList(AudioList) {
        const now = context.currentTime;
        for (let i = 0; i < AudioList.len; i += 1) {
            const audio = AudioList.buf[i];
            if (audio.playing && !audio.fadeoutRunning) {
                audioFadeout(audio, now);
            }
        }
    },
    /**@type{(AudioList: {buf: Uint8Array<Number>, len: number}) => undefined}*/
    fromAudiosSelected(AudiosSelected) {
        const now = context.currentTime;
        for (let i = 0; i < AudiosSelected.len; i += 1) {
            const j = AudiosSelected.buf[i];
            const audio = Audios.get(j);
            if (audio.playing && !audio.fadeoutRunning) {
                audioFadeout(audio, now);
            }
        }
    },
    toReplay(AudiosSelected) {
        RequestFadeout.request = true;
        RequestFadeout.endTime = (
            Math.trunc(context.currentTime * 100)
            + FADEOUT
        ) / 100;
        RequestFadeout.action = "replay";

        if (AudiosSelected.all) {
            RequestFadeout.fromAudioList(Audios);
        } else {
            RequestFadeout.fromAudiosSelected(AudiosSelected);
        }
    },
    toPause(AudiosPlaying) {
        RequestFadeout.request = true;
        RequestFadeout.endTime = (
            Math.trunc(context.currentTime * 100)
            + FADEOUT
        ) / 100;
        RequestFadeout.action = "pause";
        RequestFadeout.fromAudioList(AudiosPlaying);
    },
    toClear(AudiosPlaying) {
        RequestFadeout.request = true;
        RequestFadeout.endTime = (
            Math.trunc(context.currentTime * 100)
            + FADEOUT
        ) / 100;
        RequestFadeout.action = "clear";
        RequestFadeout.fromAudioList(AudiosPlaying);
    }
};

/**
 * @prop{AudioState} audio
 * @prop{number} now seconds
 * @return {undefined}
 */
const audioFadeout = function (audio, now) {
    audio.fadeoutRunning = true;
    audio.output.gain.cancelScheduledValues(now);
    audio.output.gain.setValueAtTime(audio.output.gain.value, now);
    audio.output.gain.linearRampToValueAtTime(
        0,
        (
            Math.trunc(now * 100)
            + (
                Math.trunc(audio.endPoint * 100)
                - Math.trunc(audio.html.currentTime * 100)
            )
        ) / 100
    );
};

let raf = undefined;
const currentTimeOnChange = function () {
    if (AudiosPlaying.len === 0) {
        cancelAnimationFrame(raf);
        return;
    }

    const now = context.currentTime;

    if (RequestFadeout.request && now >= RequestFadeout.endTime) {
        RequestFadeout.clear();
        if (RequestFadeout.action === "replay") {
            audiosSelectedPlay(AudiosSelected);

        //The audios must Pause or will be Clear
        } else if (RequestFadeout.action === "pause") {
            cancelAnimationFrame(raf);
            pauseAudioPanel(-1);
            while (AudiosPlaying.len - 1 > -1) {
                const HtmlAudioElement = AudiosPlaying.html[AudiosPlaying.len - 1];
                if (animation) {
                    HtmlAudioElement.setAttribute("style", "");
                }

                pause(
                    AudiosPlaying.buf[AudiosPlaying.len - 1],
                    HtmlAudioElement
                );
            }
            if (animation) {
                if (AudioPanelIdx > -1) {
                    HtmlPTitle.setAttribute("style", "");
                }
                animation = false;
            }
            return; //END
        } else if (RequestFadeout.action === "clear") {
            cancelAnimationFrame(raf);
            while (AudiosPlaying.len - 1 > -1) {
                AudiosPlaying.html[AudiosPlaying.len - 1].setAttribute("data-playing", "0");
                audioPause(AudiosPlaying.buf[AudiosPlaying.len - 1]);
                AudiosPlaying.remove(AudiosPlaying.len - 1);
            }
            clear();
            if (animation && now >= animationEnd) {
                if (AudioPanelIdx > -1) {
                    HtmlPTitle.setAttribute("style", "");
                }
                animation = false;
            }
            return; //END
        }
    }

    let selectedAudio;
    if (AudioPanelIdx > -1) {
        selectedAudio = Audios.get(AudioPanelIdx);
    }

    let i = AudiosPlaying.len-1;
    while (0 <= i) {
        let audio = AudiosPlaying.buf[i];
        let HtmlAudioElement = AudiosPlaying.html[i];
        if (!audio.playing || audio.html.paused || audio.html.ended) {
            HtmlAudioElement.setAttribute("data-playing", "0");
            audio.fadeoutRunning = false;
            AudiosPlaying.remove(i);

        } else if (audio.endPoint <= audio.html.currentTime) {
            if (audio.remove) {
                remove(audio, HtmlAudioElement);
            } else {
                if (AudioPanelIdx > -1) {
                    const selectedAudio = Audios.get(AudioPanelIdx);
                    if (selectedAudio === audio) {
                        pauseAudioPanel(-1);
                    }
                }
                pause(audio, HtmlAudioElement);
            }
        } else {

            if (animation
                && now >= animationEnd
                && HtmlAudioElement.getAttribute("style") !== ""
            ) {
                HtmlAudioElement.setAttribute("style", "");
            }

            if (AudioPanelIdx > -1 && audio === selectedAudio) {
                updateHtmlPanelCurrentTime(
                    audio.html.currentTime * 100 / audio.duration,
                    audio.html.currentTime,
                    audio.duration < 1
                );
            }

            //Trigger fadeout near endPoint
            if (!audio.fadeoutRunning
                && audio.html.currentTime >= audio.fadeoutStart
            ) {
                audioFadeout(audio, now);
            }
        }
        i -= 1;
    }
    if (animation && now >= animationEnd) {
        if (AudioPanelIdx > -1) {
            HtmlPTitle.setAttribute("style", "");
        }
        animation = false;
    }

    if (AudiosPlaying.len === 0) {
        cancelAnimationFrame(raf);
    } else {
        raf = requestAnimationFrame(currentTimeOnChange);
    }
};

const remove = function (audio, HtmlAudioElement) {
    Audios.cleanAudio(audio);
    Zombies.push(audio);

    //defaults
    HtmlAudioElement.setAttribute("data-playing", "0");
    HtmlAudioElement.setAttribute("data-selected", "0");
    HtmlAudioZombies.appendChild(HtmlAudioElement);

    if (timeoutFree !== undefined) {
        clearTimeout(timeoutFree)
    }
    timeoutFree = setTimeout(timeoutFreeFn,FREE_TIME);
};

const clear = function () {
    defaultSets();

    //set Panel
    if (AudioPanelIdx > -1) {
        assert(AudioPanelIdx < Audios.len);
        assert(HtmlAppContainer.childElementCount === Audios.len);
        HtmlAppContainer.children[AudioPanelIdx].setAttribute("data-selected", "0");
        AudioPanelIdx = -1;
        HtmlAppPanel.setAttribute("data-display", "0");
    }

    for (let i = 0; i < Audios.len; i += 1) {
        const audio = Audios.get(i);
        Audios.cleanAudio(audio);
        Zombies.push(audio);
    }
    Audios.clear();

    HtmlAudioZombies.append.apply(
        HtmlAudioZombies,
        HtmlAppContainer.children
    );
    AudioEventsSum = 0;


    if (timeoutFree !== undefined) {
        clearTimeout(timeoutFree);
    }
    timeoutFree = setTimeout(timeoutFreeFn, FREE_TIME);
};

/**@type{(audio: AudioState, HtmlAudioElement: HTMLElement) => undefined}*/
const play = function (audio, HtmlAudioElement) {
    HtmlAudioElement.setAttribute("data-playing", "1");
    //ensure that audioPlay is alway call after an audio Pause
    /*
     if (audio.playing) {
        audio.output.gain.cancelScheduledValues(now);
        audio.output.gain.setValueAtTime(0, now);
        audio.html.pause();
     }
    */

    if (!audio.pbrateDisabled) {
        let pbrate = getPlaybackRate(
            random(PbRatemin, PbRatemax)
        );
        audio.html.playbackRate = pbrate;
        audio.pbrate = pbrate;
    } else {
        audio.html.playbackRate = 1;
        audio.pbrate = 1;
    }

    audio.fadeoutRunning = false;
    audio.fadeoutStart = (
        Math.trunc(audio.endPoint * 100)
        - (FADEOUT * audio.pbrate)
    ) / 100;

    //duration is greater than 1 second
    if (audio.duration >= 1) {
        let rsp = audio.startTime;
        let rep = audio.endTime;
        let interval = 50;
        if (!audio.rspDisabled && !audio.repDisabled) {
            let d = Math.trunc(audio.duration * 100);
            let p = Math.trunc(rep * 100) - Math.trunc(rsp * 100);
            let min = 50;
            let max = Math.min(Math.max(min, p), d);
            interval = random(min, max);
        }
        if (!audio.rspDisabled) {
            rsp = (random(
                Math.trunc(audio.startTime * 100),
                Math.trunc(rep * 100) - interval
            ) / 100);
        }
        if (!audio.repDisabled) {
            rep = (random(
                Math.trunc(rsp * 100) + interval,
                Math.trunc(audio.endTime * 100)
            ) / 100);
        }
        audio.startPoint = rsp;
        audio.endPoint = rep;
    }

    audio.html.currentTime = audio.startPoint;
    audioRandomizeConnections(audio);

    audioPlay(audio, HtmlAudioElement);
};

/**@type{(audio: AudioState, HtmlAudioElement: HTMLElement) => undefined}*/
const pause = function (audio, HtmlAudioElement) {
    HtmlAudioElement.setAttribute("data-playing", "0");
    AudiosPlaying.removeAudio(audio);
    if (AudiosPlaying.len === 0) {
        cancelAnimationFrame(raf);
    }
    audioPause(audio);
    return true;
};

/**@type{(i: number, audio: AudioState) => undefined}*/
const playAudioPanel = function (i, audio) {
    if (i === AudioPanelIdx) {
        if (audio.duration >= 1) {
            HtmlAppPanel.setAttribute("data-playing", "1");
            updateHtmlPanelRP(
                audio.startPoint * 100 / audio.duration,
                audio.endPoint * 100 / audio.duration
            );
        }
        updateHtmlPanelCurrentTime(
            audio.html.currentTime * 100 / audio.duration,
            audio.html.currentTime,
            audio.duration < 1
        );
    }
};

const pauseAudioPanel = function (i) {
    if (AudioPanelIdx > -1) {
        if (i === -1 || i === AudioPanelIdx) {
            const selectedAudio = Audios.get(AudioPanelIdx);
            HtmlAppPanel.setAttribute("data-playing", "0");
            if (selectedAudio.duration >= 1) {
                updateHtmlPanelRP(0, 100);
            }
            updateHtmlPanelCurrentTime(0, 0, selectedAudio.duration < 1);
        }
    }
};



const audioPlay = async function (audio, HtmlAudioElement) {
    //return a promise: rejected if playback cannot be started for any reason
    try {
        await audio.html.play();
        //audio.input.gain.setValueAtTime(1, now);
        audio.output.gain.setValueAtTime(0, context.currentTime);
        audio.output.gain.linearRampToValueAtTime(
            audio.volume / 10,
            (Math.trunc(context.currentTime * 100) + FADEIN) / 100
        );
        audio.html.volume = 1;

        if (!audio.playing) {
            const otherAudiosPause = (AudiosPlaying.len === 0);
            AudiosPlaying.push(audio, HtmlAudioElement);
            audio.playing = true;
            if (otherAudiosPause) {
                raf = requestAnimationFrame(currentTimeOnChange);
            }
        }
    } catch (err) {
        console.error(`Playback error for ${audio.html._name}:`, err);
        if (audio.playing) {
            pause(audio, HtmlAudioElement)
        }
    }

};


const audioPause = function (audio) {
    if (audio.playing) {
        const now = context.currentTime;
        audio.output.gain.cancelScheduledValues(now);
        audio.output.gain.setValueAtTime(0,now);

        audio.html.pause();
        audio.html.volume = 0;

        audio.delay.delayTime.cancelScheduledValues(now);
        audio.delay.delayTime.setValueAtTime(0, now);

        audio.playing = false;
        audio.fadeoutRunning = false;
        return true;
    }
    return false;
};

const audiosSelectedPlay = function (AudiosSelected) {
    animation = true;
    animationEnd = (
        Math.trunc(context.currentTime * 100)
        + ANIMATION_DURATION
    ) / 100;

    if (AudiosSelected.all) {
        if (AudioPanelIdx !== -1) {
            HtmlPTitle.setAttribute("style", CSS_ANIMATION_SELECT);
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const HtmlAudioElement = HtmlAppContainer.children[i];
            const audio = Audios.get(i);
            HtmlAudioElement.setAttribute("style", CSS_ANIMATION_SELECT);
            if (audio.fadeoutRunning && audio.playing) {
                audioPause(audio);
                audio.playing = true;
                play(audio, HtmlAudioElement);
            } else {
                play(audio, HtmlAudioElement);
            }
            playAudioPanel(i, audio);
        }
    } else {
        for (let k = 0; k < AudiosSelected.len; k += 1) {
            const i = AudiosSelected.buf[k];
            const audio = Audios.get(i);
            const HtmlAudioElement = HtmlAppContainer.children[i];
            HtmlAudioElement.setAttribute("style", CSS_ANIMATION_SELECT);
            if (AudioPanelIdx === i) {
                HtmlPTitle.setAttribute("style", CSS_ANIMATION_SELECT);
            }
            if (audio.fadeoutRunning && audio.playing) {
                audioPause(audio);
                audio.playing = true;
                play(audio, HtmlAudioElement);
            } else {
                play(audio, HtmlAudioElement);
            }
            playAudioPanel(i, audio);
        }
    }
};

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
        const AudioState = Audios.get(i);
        HtmlAudioElement.children["probability"].firstElementChild.textContent = (
            (AudioState.events / AudioEventsSum * 100).toFixed(2)
        );
    }
};


/**@type{(startval: number, endval: number) => undefined}*/
const updateHtmlPanelRP = function (startval, endval) {
    HtmlPStartPointBar.setAttribute("style", `--translate:${startval}%`);
    HtmlPEndPointBar.setAttribute("style", `--translate:${endval}%`);
};

/**@type{(pval: number, tval: number, isshort: boolean) => undefined}*/
const updateHtmlPanelCurrentTime = function (pval, tval, isshort) {
    HtmlPCurrentBar.setAttribute("style", `--translate:${pval}%`);
    if (isshort) {
        HtmlPCurrentText.textContent = durationToShortTime(tval);
    } else {
        HtmlPCurrentText.textContent = durationToTime(tval);
    }
};

const verifyHtmlCSets = function () {
    if (Audios.len <= SetEvents.max) {
        SetEvents.buf[SetEvents.len] = 1;

        const HtmlSet = HtmlCSets.children[SetEvents.len];
        HtmlSet.setAttribute("data-display", "1"); 
        HtmlSet.children[1].children["value"].textContent = "1";
        SetEvents.sum += 1;
        SetEvents.len += 1;
        updateHtmlCSets();
    }

};

const AudioOnended = function (e) {
    const HtmlAudio = e.currentTarget;
    for (let i = 0; i < Audios.len; i += 1) {
        const audio = Audios.buf[i];
        if (audio.html === HtmlAudio) {
            if (audio.playing) {
                pause(audio, HtmlAppContainer.children[i]);
                pauseAudioPanel(i);
            }
        }
    }
};

const ZombieAudioOncanplaythrough = function (e) {
    const HtmlAudio = e.currentTarget;
    const HtmlAudioElement = HtmlAudioZombies.children[0];
    const i = Zombies.indexFromHTML(HtmlAudio);
    assert(i !== -1, "ERROR: HtmlAudio not found");

    const audio = Zombies.revive(i);
    Zombies.observed -= 1;

    if (Zombies.observed === 0 && Zombies.len > 0) {
        if (timeoutFree !== undefined) {
            clearTimeout(timeoutFree);
        }
        timeoutFree = setTimeout(timeoutFreeFn, FREE_TIME);
    }

    audio.duration = HtmlAudio.duration;
    audio.endPoint = HtmlAudio.duration;
    audio.endTime = HtmlAudio.duration;

    //HtmlAudio.addEventListener("timeupdate", AudioOntimeupdate, true);
    HtmlAudio.addEventListener("ended", AudioOnended, true);

    //there is a new AudioEvent
    AudioEventsSum += 1;

    HtmlAudioElement._HtmlTitle.textContent = HtmlAudio._name;
    HtmlAudioElement._HtmlProbText.textContent = (
        (1 / AudioEventsSum * 100).toFixed(2)
    );
    HtmlAudioElement.setAttribute("data-playing", "0");
    HtmlAudioElement.setAttribute("data-selected", "0");


    updateHtmlAudioProbability();

    Audios.push(audio);
    HtmlAppContainer.appendChild(HtmlAudioElement);

    verifyHtmlCSets();

    if (AudioPanelIdx !== -1) {
        let audioSelected = Audios.get(AudioPanelIdx);
        //Throw Error
        assert(audioSelected !== undefined);
        updateHtmlPanelProbability(audioSelected.events);
    }
    if (Audios.len > 1) {
        HtmlAppPanel.setAttribute("data-scroll", "1");
        HtmlAppPanel.setAttribute("data-probability", "1");
    }
};

/**
 * @type{(e: Event) => undefined}*/
const AudioOncanplaythrough = function (e) {
    const HtmlAudio = e.currentTarget;
    const source = context.createMediaElementSource(HtmlAudio);
    const audio = audioCreate(HtmlAudio, source);
    const HtmlAudioElement = HtmlAudioElementTemplate.cloneNode(true);

    //HtmlAudio.addEventListener("timeupdate", AudioOntimeupdate, true);
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
    HtmlAudioElement.setAttribute("data-playing", "0");
    HtmlAudioElement.setAttribute("data-selected", "0");

    updateHtmlAudioProbability();

    HtmlAppContainer.appendChild(HtmlAudioElement);
    Audios.push(audio);

    verifyHtmlCSets();


    if (AudioPanelIdx !== -1) {
        let audioSelected = Audios.get(AudioPanelIdx);
        assert(audioSelected !== undefined);
        updateHtmlPanelProbability(audioSelected.events);
    }
    if (Audios.len > 1) {
        HtmlAppPanel.setAttribute("data-probability", "1");
        HtmlAppPanel.setAttribute("data-scroll", "1");
    }
};

/**
 * @type {(files: FileList) => undefined}*/
const addFiles = function (files) {
    if (Audios.len === AUDIOELEMENTS_MAX) {
        console.warn("WARNING: the maximum capacity of audios is full");
        //TODO: NOTIFICATION
        return;
    }

    //TODO:
    //we can use Zombies in events
    //then we must finish any other process with zombies
    if (timeoutFree !== undefined) {
        clearTimeout(timeoutFree);
        timeoutFree = undefined;
    }

    let end = files.length;
    if (Audios.len + files.length >= AUDIOELEMENTS_MAX) {
        end = AUDIOELEMENTS_MAX - Audios.len;
        console.warn("WARNING: the maximum capacity of audios is full");
    }
    for (let i = 0; i < end; i += 1) {
        let file = files[i];
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
        if (Zombies.available()) {
            const ZombieState = Zombies.observe();
            assert(ZombieState !== undefined, "ERROR undefined state: Zombies.see");

            const HtmlAudio = ZombieState.html;
            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio.volume = 0;
            HtmlAudio._name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio._type = file.type;

            HtmlAudio.addEventListener(
                "canplaythrough",
                ZombieAudioOncanplaythrough,
                EVENT_CO
            );

        } else {
            const HtmlAudio = HtmlAudioTemplate.cloneNode();
            HtmlAudio.src = URL.createObjectURL(file);
            HtmlAudio.preservesPitch = false;
            HtmlAudio.volume = 0;
            HtmlAudio._name = file.name.slice(0, file.name.lastIndexOf("."));
            HtmlAudio._type = file.type;

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
                const midI = Math.trunc((startI + endI) / 2);
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
        AudiosSelected.buf[AudiosSelected.len] = Keys.buf[selected];
        AudiosSelected.len += 1;

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
    assert(w === AudiosSelected.len, `ERROR: weight: ${w}, AudiosSelected.len: ${AudiosSelected.len}`);
    return AudiosSelected;
};

/**@type{() => number}*/
const randomSetSelection = function () {
    if (SetEvents.len < 2) {
        return 0;
    }
    const cardinal = selectCardinal(SetEvents);
    if (cardinal > 0) {
        let sum = 0;
        if (cardinal === Audios.len) {
            AudiosSelected.all = true;
        } else {
            AudiosSelected.len = 0;
            AudiosSelected.all = false;

            SelectionKeys.len = Audios.len;
            SelectionSums.len = Audios.len;

            for (let i = 0; i < Audios.len; i += 1) {
                sum += Audios.buf[i].events;
                SelectionKeys.buf[i] = i;
                SelectionSums.buf[i] = sum;
            }
            randomAudioSelection(SelectionKeys, SelectionSums, sum, cardinal);
        }
    }
    return cardinal;
};

const logRandomExecution = function (cardinal, interval, AudiosSelected) {
    if (cardinal === 0) {
        console.info(
            "Cardinal:", cardinal,
            "\nAudios: none",
            "\nNext execution:", interval,
        );
    } else if (AudiosSelected.all) {
        console.info(
            "Cardinal:", cardinal,
            "\nAudios: all",
            "\nNext execution:", interval,
        );
    } else {
        console.info(
            "Cardinal:", cardinal,
            "\nAudios:", AudiosSelected.buf.subarray(0, AudiosSelected.len),
            "\nNext execution:", interval,
        );
    }
};
let executeTimeout = undefined;
const randomExecution = function () {
    if (Started) {
        const interval = random(TimeIntervalmin, TimeIntervalmax) * 100;
        const cardinal = randomSetSelection();
        if (cardinal !== 0) {
            if (AudiosPlaying.len === 0) {
                audiosSelectedPlay(AudiosSelected);
            } else {
                RequestFadeout.toReplay(AudiosSelected);
            }
        }
        logRandomExecution(cardinal, interval, AudiosSelected);
        //we asume that there is no executeTimeout active
        executeTimeout = setTimeout(randomExecution, interval);
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
        theme = localStorage.getItem(STORAGE_THEME);
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
    localStorage.setItem(STORAGE_THEME, theme);
};

/**@type{(events: number) => undefined}*/
const updateHtmlPanelProbability = function (events) {
    HtmlPProbValue.textContent = String(events);
    HtmlPProbText.textContent = `${
        (events / AudioEventsSum * 100).toFixed(2)
    }%`;
};
/**@type{(value: number) => undefined}*/
const updateHtmlCRadios = function (value) {
        let max = 0;
        if (value < SetEvents.max) {
            if (Audios.len < SetEvents.max) {
                max = Audios.len;
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
            if (Audios.len < value) {
                max = Audios.len;
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
};

/**@type{(audio: AudioState) => undefined}*/
const changeHtmlAppPanel = function (audio) {
    HtmlPTitle.textContent = audio.html._name;
    HtmlPVolumeInput.valueAsNumber = audio.volume;
    HtmlPVolumeText.textContent = `${audio.volume*10}%`;

    updateHtmlPanelProbability(audio.events);

    HtmlPEffects.children["delay"].firstElementChild.checked = !audio.delayDisabled;
    HtmlPEffects.children["panner"].firstElementChild.checked = !audio.pannerDisabled;
    HtmlPEffects.children["filter"].firstElementChild.checked = !audio.filterDisabled;
    HtmlPEffects.children["pbrate"].firstElementChild.checked = !audio.pbrateDisabled;
    HtmlPEffects.children["rsp"].firstElementChild.checked = !audio.rspDisabled;
    HtmlPEffects.children["rep"].firstElementChild.checked = !audio.repDisabled;

    if (audio.duration > 1) {
        HtmlAppPanel.setAttribute("data-short", "0");
        HtmlPStartTimeText.textContent = durationToTime(audio.startTime);
        HtmlPEndTimeText.textContent = durationToTime(audio.endTime);
        HtmlPStartTimeInput.valueAsNumber = (
            audio.startTime * 100 / audio.duration
        );
        HtmlPEndTimeInput.valueAsNumber = (
            audio.endTime * 100 / audio.duration
        );
        HtmlPStartTimeBar.setAttribute(
            "style",
            `--translate:${audio.startTime * 100 / audio.duration}%`
        );
        HtmlPEndTimeBar.setAttribute(
            "style",
            `--translate:${audio.endTime * 100 / audio.duration}%`
        );
    } else {
        HtmlAppPanel.setAttribute("data-short", "1");
        HtmlPStartTimeText.textContent = durationToShortTime(0);
        HtmlPEndTimeText.textContent = durationToShortTime(audio.duration);
        HtmlPStartTimeInput.valueAsNumber = 0;
        HtmlPEndTimeInput.valueAsNumber = audio.duration;
        HtmlPStartTimeBar.setAttribute("style", `--translate:${0}%`);
        HtmlPEndTimeBar.setAttribute("style", `--translate:${audio.duration}%`);
    }

    if (audio.playing) {
        HtmlAppPanel.setAttribute("data-playing", "1");
        updateHtmlPanelCurrentTime(
            audio.html.currentTime * 100 / audio.duration,
            audio.html.currentTime,
            audio.duration < 1
        );
        if  (audio.duration < 1) {
            updateHtmlPanelRP(0, 100);
        } else {
            updateHtmlPanelRP(
                audio.startPoint * 100 / audio.duration,
                audio.endPoint * 100 / audio.duration
            );
        }
    } else {
        HtmlAppPanel.setAttribute("data-playing", "0");
        updateHtmlPanelCurrentTime(0, 0, audio.duration < 1);
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

    } else if ("import" === target.name) {
        target.value = "";

    }else if ("export" === target.name) {
        let encodedJSON = "data:application/json;charset=utf-8,%7B";
        let i = 0;
        let key = "";
        for (;;) {
            if (i === StorageKeys.length) {
                encodedJSON += "%7D";
                break;
            }
            key = StorageKeys[i];
            encodedJSON += `%22${key}%22%3A%22${localStorage.getItem(key)}%22`;
            if (i < StorageKeys.length -1) {
                encodedJSON += "%2C";
            }
            i += 1;
        }
        target.href = encodedJSON;

    } else if ("set-reset" === target.name) {
        SetEvents.zeros = 0;
        SetEvents.max = DEFAULT_SETEVENTS_MAX;
        if (SetEvents.len <= Audios.len) {
            if (Audios.len > SetEvents.max + 1) {
                SetEvents.len = SetEvents.max + 1;
            } else {
                SetEvents.len = Audios.len + 1;
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
        HtmlCMaxElements.textContent = String(SetEvents.max);
        localStorage.setItem(STORAGE_SETEVENTS_MAX, )

    } else if ("set-left" === target.name) {
        const HtmlSet = target.parentElement.parentElement;
        if (1 === SetEvents.sum) {
            //TODO: notification, must be at least 1 event
            console.warn("MUST BE AT LEAST 1 EVENT");
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
        localStorage.setItem(STORAGE_TIME_MIN, String(DEFAULT_TIMEINTERVAL_MIN));
        localStorage.setItem(STORAGE_TIME_MAX, String(DEFAULT_TIMEINTERVAL_MAX));
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

        localStorage.setItem(STORAGE_TIME_MIN, String(TimeIntervalmin));
        localStorage.setItem(STORAGE_TIME_MAX, String(TimeIntervalmax));
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
            if (!reduceMotion) {
                HtmlCTimemin.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
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
            if (!reduceMotion) {

                HtmlCTimemin.
                HtmlCTimemin.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
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
            if (!reduceMotion) {
                HtmlCTimemin.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
        }

    } else if ("time-min-mm-up" === target.name) {
        //adds 1 minute (600 hundreads of miliseconds)
        if (TimeTemporalmin + 600 > TimeTemporalmax) {
            HtmlCTimeminUpdate(TimeTemporalmax);
            TimeTemporalmin = TimeTemporalmax;
            if (!reduceMotion) {
                HtmlCTimemax.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
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
            if (!reduceMotion) {
                HtmlCTimemax.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
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
            if (!reduceMotion) {
                HtmlCTimemax.animate(
                    ANIMATION_ALERT.keyframes,
                    ANIMATION_ALERT.timing
                );
            }
        }

    } else if ("time-min-ms-down" === target.name) {
        //subtract 1 hms (1 hundreads of miliseconds)
        if (TimeTemporalmin - 1 < LIMIT_TIMEINTERVAL_MIN) {
            return;
        }
        HtmlCTimeminUpdate(TimeTemporalmin-1);
        TimeTemporalmin -= 1;
        HtmlCTimeChanged();

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

        localStorage.setItem(STORAGE_DELAY_TIMEMAX, String(DEFAULT_DELAY_TIMEMAX));
        localStorage.setItem(STORAGE_DELAY_TIMEMIN, String(DEFAULT_DELAY_TIMEMIN));
        localStorage.setItem(STORAGE_DELAY_FEEDBACKMAX, String(DEFAULT_DELAY_FEEDBACKMAX));
        localStorage.setItem(STORAGE_DELAY_FEEDBACKMIN, String(DEFAULT_DELAY_FEEDBACKMIN));
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

        localStorage.setItem(STORAGE_FILTER_FREQMAX, String(DEFAULT_FILTER_FREQMAX));
        localStorage.setItem(STORAGE_FILTER_FREQMIN, String(DEFAULT_FILTER_FREQMIN));
        localStorage.setItem(STORAGE_FILTER_QMAX, String(DEFAULT_FILTER_QMAX));
        localStorage.setItem(STORAGE_FILTER_QMIN, String(DEFAULT_FILTER_QMIN));
        localStorage.setItem(
            STORAGE_FILTER_BANDPASS,
            String(Number(DEFAULT_FILTER_BANDPASS))
        );
        localStorage.setItem(
            STORAGE_FILTER_HIGHPASS,
            String(Number(DEFAULT_FILTER_HIGHPASS))
        );
        localStorage.setItem(
            STORAGE_FILTER_LOWPASS,
            String(Number(DEFAULT_FILTER_LOWPASS))
        );
        localStorage.setItem(STORAGE_FILTER_NOTCH, DEFAULT_FILTER_NOTCH);
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
        localStorage.setItem(STORAGE_PANNER_XMIN, String(DEFAULT_PANNER_XMIN));
        localStorage.setItem(STORAGE_PANNER_XMAX, String(DEFAULT_PANNER_XMAX));
        localStorage.setItem(STORAGE_PANNER_YMIN, String(DEFAULT_PANNER_YMIN));
        localStorage.setItem(STORAGE_PANNER_YMAX, String(DEFAULT_PANNER_YMAX));
        localStorage.setItem(STORAGE_PANNER_ZMIN, String(DEFAULT_PANNER_ZMIN));
        localStorage.setItem(STORAGE_PANNER_ZMAX, String(DEFAULT_PANNER_ZMAX));
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
        localStorage.setItem(STORAGE_PBRATE_MIN, String(DEFAULT_PBRATE_MIN));
        localStorage.setItem(STORAGE_PBRATE_MAX, String(DEFAULT_PBRATE_MAX));
        PbRatemin = DEFAULT_PBRATE_MIN;
        PbRatemax = DEFAULT_PBRATE_MAX;
    }
};


/**
 * @type{(e: InputEvent) => undefined}*/
const HtmlAppConfigOninput = function (e) {
    const target = e.target;
    if ("import" === target.name) {
        if (target.files?.[0] === undefined) {
            return;
        }
        READER.readAsText(target.files[0]);

    } else if ("elements-checkbox" === target.name) {
        if (HtmlCSetDetails.getAttribute("data-elements") === "0") {
            HtmlCSetDetails.setAttribute("data-elements", "1");
        } else {
            HtmlCSetDetails.setAttribute("data-elements", "0");
        }
    } else if ("elements-radio" === target.name) {
        const value = Number(target.value);
        assert(0 < value && value < SetEvents.cap);
        if (value === SetEvents.max) {
            return;
        }
        updateHtmlCRadios(value);

        HtmlCMaxElements.textContent = target.value;
        HtmlCSetDetails.setAttribute("data-elements", "0");

        localStorage.setItem(STORAGE_SETEVENTS_MAX, target.value);

    } else if ("delay-da" === target.name) {
        DelayAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_DELAY_DISABLE,
            String(Number(DelayAreAllDisable))
        );

        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.delayDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
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
        localStorage.setItem(STORAGE_DELAY_TIMEMIN, String(DelayTimemin));

    } else if ("delay-timemax" === target.name) {
        if (DelayTimemin > LIMIT_DELAY_TIMEMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_DELAY_TIMEMAX - DelayTimemin;
        }
        DelayTimemax = LIMIT_DELAY_TIMEMAX - target.valueAsNumber;
        HtmlCDelayTimemax.lastElementChild.children["value"].textContent = (
            getDelayTime(DelayTimemax).toFixed(1)
        );
        localStorage.setItem(STORAGE_DELAY_TIMEMAX, String(DelayTimemax));

    } else if ("delay-feedbackmin" === target.name) {
        if (target.valueAsNumber > DelayFeedbackmax) {
            target.valueAsNumber = DelayFeedbackmax;
        }
        DelayFeedbackmin = target.valueAsNumber;
        HtmlCDelayFeedbackmin.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DelayFeedbackmin)
        );
        localStorage.setItem(STORAGE_DELAY_FEEDBACKMIN, String(DelayFeedbackmin));

    } else if ("delay-feedbackmax" === target.name) {
        if (DelayFeedbackmin > LIMIT_DELAY_FEEDBACKMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_DELAY_FEEDBACKMAX - DelayFeedbackmin;
        }
        DelayFeedbackmax = LIMIT_DELAY_FEEDBACKMAX - target.valueAsNumber;
        HtmlCDelayFeedbackmax.lastElementChild.children["value"].textContent = String(
            getDelayFeedback(DelayFeedbackmax)
        );
        localStorage.setItem(STORAGE_DELAY_FEEDBACKMAX, String(DelayFeedbackmax));

    } else if ("filter-da" === target.name) {
        FilterAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_FILTER_DISABLE,
            String(Number(FilterAreAllDisable))
        );
        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.filterDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
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
        localStorage.setItem(STORAGE_FILTER_FREQMIN, String(FilterFreqmin));

    } else if ("filter-freqmax" === target.name) {
        if (FilterFreqmin > LIMIT_FILTER_FREQMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_FILTER_FREQMAX - FilterFreqmin;
        }
        FilterFreqmax = LIMIT_FILTER_FREQMAX - target.valueAsNumber;
        HtmlCFilterFreqmax.lastElementChild.children["value"].textContent = String(
            getFilterFreq(FilterFreqmax)
        );
        localStorage.setItem(STORAGE_FILTER_FREQMAX, String(FilterFreqmax));

    } else if ("filter-qmin" === target.name) {
        if (target.valueAsNumber > FilterQmax) {
            target.valueAsNumber = FilterQmax;
        }
        FilterQmin = target.valueAsNumber;
        HtmlCFilterQmin.lastElementChild.children["value"].textContent = String(
            getFilterQ(FilterQmin)
        );
        localStorage.setItem(STORAGE_FILTER_QMIN, String(FilterQmin));

    } else if ("filter-qmax" === target.name) {
        if (FilterQmin > LIMIT_FILTER_QMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_FILTER_QMAX - FilterQmin;
        }
        FilterQmax = LIMIT_FILTER_QMAX - target.valueAsNumber;
        HtmlCFilterQmax.lastElementChild.children["value"].textContent = String(
            getFilterQ(FilterQmax)
        );
        localStorage.setItem(STORAGE_FILTER_QMAX, String(FilterQmax));

    } else if ("filter-highpass" === target.name) {
        if (FilterHighpass
            && !FilterLowpass
            && !FilterBandpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterHighpass = target.checked;
        localStorage.setItem(
            STORAGE_FILTER_HIGHPASS,
            String(Number(FilterHighpass))
        );

    } else if ("filter-lowpass" === target.name) {
        if (FilterLowpass
            && !FilterHighpass
            && !FilterBandpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterLowpass = target.checked;
        localStorage.setItem(
            STORAGE_FILTER_LOWPASS,
            String(Number(FilterLowpass))
        );

    } else if ("filter-bandpass" === target.name) {
        if (FilterBandpass
            && !FilterLowpass
            && !FilterHighpass
            && !FilterNotch
        ) {
            target.checked = true;
        }
        FilterBandpass = target.checked;
        localStorage.setItem(
            STORAGE_FILTER_BANDPASS,
            String(Number(FilterBandpass))
        );

    } else if ("filter-notch" === target.name) {
        if (FilterNotch
            && !FilterLowpass
            && !FilterBandpass
            && !FilterHighpass
        ) {
            target.checked = true;
        }
        FilterNotch = target.checked;
        localStorage.setItem(
            STORAGE_FILTER_NOTCH,
            String(Number(FilterNotch))
        );

    } else if ("panner-da" === target.name) {
        PannerAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_PANNER_DISABLE,
            String(Number(PannerAreAllDisable))
        );
        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.pannerDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
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
        localStorage.setItem(STORAGE_PANNER_XMIN, String(PannerXmin));

    } else if ("panner-xmax" === target.name) {
        if (PannerXmin > LIMIT_PANNER_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_MAX - PannerXmin;
        }
        PannerXmax = LIMIT_PANNER_MAX - target.valueAsNumber;
        HtmlCPannerXmax.lastElementChild.children["value"].textContent = String(
            getPanner(PannerXmax)
        );
        localStorage.setItem(STORAGE_PANNER_XMAX, String(PannerXmax));

    } else if ("panner-ymin" === target.name) {
        if (target.valueAsNumber > PannerYmax) {
            target.valueAsNumber = PannerYmax;
        }
        PannerYmin = target.valueAsNumber;
        HtmlCPannerYmin.lastElementChild.children["value"].textContent = String(
            getPanner(PannerYmin)
        );
        localStorage.setItem(STORAGE_PANNER_YMIN, String(PannerYmin));

    } else if ("panner-ymax" === target.name) {
        if (PannerYmin > LIMIT_PANNER_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_MAX - PannerYmin;
        }
        PannerYmax = LIMIT_PANNER_MAX - target.valueAsNumber;
        HtmlCPannerYmax.lastElementChild.children["value"].textContent = String(
            getPanner(PannerYmax)
        );
        localStorage.setItem(STORAGE_PANNER_YMAX, String(PannerYmax));

    } else if ("panner-zmin" === target.name) {
        if (target.valueAsNumber > PannerZmax) {
            target.valueAsNumber = PannerZmax;
        }
        PannerZmin = target.valueAsNumber;
        HtmlCPannerZmin.lastElementChild.children["value"].textContent = String(PannerZmin);
        localStorage.setItem(STORAGE_PANNER_ZMIN, String(PannerZmin));

    } else if ("panner-zmax" === target.name) {
        if (PannerZmin > LIMIT_PANNER_ZMAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PANNER_ZMAX - PannerZmin;
        }
        PannerZmax = LIMIT_PANNER_ZMAX - target.valueAsNumber;
        HtmlCPannerZmax.lastElementChild.children["value"].textContent = String(PannerZmax);
        localStorage.setItem(STORAGE_PANNER_ZMAX, String(PannerZmax));


    } else if ("pbrate-da" === target.name) {
        PbRateAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_PBRATE_DISABLE,
            String(Number(PbRateAreAllDisable))
        );
        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.pbrateDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
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
        localStorage.setItem(STORAGE_PBRATE_MIN, String(PbRatemin));

    } else if ("pbrate-max" === target.name) {
        if (PbRatemin > LIMIT_PBRATE_MAX - target.valueAsNumber) {
            target.valueAsNumber = LIMIT_PBRATE_MAX - PbRatemin;
        }
        PbRatemax = LIMIT_PBRATE_MAX - target.valueAsNumber;
        HtmlCPbrateMax.lastElementChild.children["value"].textContent = (
            getPlaybackRate(PbRatemax).toFixed(2)
        );
        localStorage.setItem(STORAGE_PBRATE_MAX, String(PbRatemax));

    } else if ("rsp-da" === target.name) {
        CutRSPAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_CRSP_DISABLE,
            String(Number(CutRSPAreAllDisable))
        );
        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.rspDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
            changeHtmlAppPanelEffect("rsp", !target.checked);
        }

    } else if ("rep-da" === target.name) {
        CutREPAreAllDisable = target.checked;
        localStorage.setItem(
            STORAGE_CREP_DISABLE,
            String(Number(CutREPAreAllDisable))
        );
        if (Audios.len < 0) {
            return;
        }
        for (let i = 0; i < Audios.len; i += 1) {
            const audio = Audios.get(i);
            audio.repDisabled = target.checked;
        }
        if (AudioPanelIdx !== -1) {
            changeHtmlAppPanelEffect("rep", !target.checked);
        }
    }
};

const HtmlAppMenuOnclick = function (e) {
    const target = e.target;
    const name = target.getAttribute("name");
    if ("start" === name) {
        if (Started) {
            Started = false;
            if (undefined !== executeTimeout) {
                clearTimeout(executeTimeout);
                executeTimeout = undefined;
            }
            if (AudiosPlaying.len > 0) {
                RequestFadeout.toPause(AudiosPlaying);
            }
            target.setAttribute("data-start", "0");
        } else {
            Started = true;
            randomExecution();
            target.setAttribute("data-start", "1");
        }
    } else if ("clear" === name) {
        if (Audios.len === 0) {
            return;
        }
        if (AudiosPlaying.len > 0) {
            RequestFadeout.toClear(AudiosPlaying);
        } else {
            clear();
        }
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
    if ("play" === name) {
        const HtmlAudioElement = target.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        assert(i > -1, "ERROR: There is a HtmlAudio that is not found in HtmlAppContainer");
        assert(i < Audios.len, "ERROR: The HtmlAudio index is out of range in Audios");
        const audio = Audios.get(i);
        if (audio.playing) {
            if (!audio.fadeoutRunning) {
                audio.endPoint = (
                    Math.trunc(audio.html.currentTime * 100)
                    + FADEOUT
                ) / 100;
                audioFadeout(audio, context.currentTime);
            }
        } else {
            play(audio, HtmlAudioElement);
            playAudioPanel(i, audio)
        }
    } else if ("remove" === name) {
        const HtmlAudioElement = target.parentElement;
        let i = getHtmlChildIndex(HtmlAppContainer, HtmlAudioElement);
        assert(i !== -1, "ERROR: There is a HtmlAudio that is not found in HtmlAppContainer");
        assert(i < Audios.len, "ERROR: The HtmlAudio index is out of range in Audios");

        const audio = Audios.get(i);
        audio.remove = true;

        Audios.remove(i);
        HtmlAudioElement.remove();

        if (audio.playing) {
            if (!audio.fadeoutRunning) {
                audio.endPoint = (
                    Math.trunc(audio.html.currentTime * 100)
                    + FADEOUT
                ) / 100;
                audioFadeout(audio, context.currentTime);
            }
        } else {
            remove(audio, HtmlAudioElement);
        }

        AudioEventsSum -= audio.events;
        assert(AudioEventsSum > -1, "ERROR: AudioEventsSum is less than 0");

        if (i === AudioPanelIdx) {
            //SELECTED
            AudioPanelIdx = -1;
            HtmlAppPanel.setAttribute("data-display", "0");
        }
        if (Audios.len > 0) {
            if (AudioPanelIdx !== -1) {
                if (i < AudioPanelIdx) {
                    AudioPanelIdx -= 1;
                }
                const selectedAudio = Audios.get(AudioPanelIdx);
                assert(selectedAudio !== undefined, "ERROR: AudioPanelIdx do not exist");
                updateHtmlPanelProbability(selectedAudio.events);
            }

            updateHtmlAudioProbability();

            if (Audios.len < 2) {
                HtmlAppPanel.setAttribute("data-scroll", "0");
                HtmlAppPanel.setAttribute("data-probability", "0");
            }
        }

        if (Audios.len < SetEvents.max) {
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
            assert(i !== -1, "ERROR: There is a HtmlAudio that is not found in HtmlAppContainer");
            assert(i < Audios.len, "ERROR: The HtmlAudio index is out of range in Audios");

            if (AudioPanelIdx !== -1) {
                //SOME TIMES THROW ERROR
                HtmlAppContainer.children[AudioPanelIdx].setAttribute(
                    "data-selected",
                    "0"
                );
            } else {
                HtmlAppPanel.setAttribute("data-display", "1");
            }
            HTMLAudioElement.setAttribute("data-selected", "1");
            //SELECTED
            AudioPanelIdx = i;

            changeHtmlAppPanel(Audios.get(i));

        } else {
            HTMLAudioElement.setAttribute("data-selected", "0");
            HtmlAppPanel.setAttribute("data-display", "0");
            //SELECTED
            AudioPanelIdx = -1;
        }
    }
};


const HtmlAppPanelOnclick = function (e) {
    assert(0 <= AudioPanelIdx && AudioPanelIdx < Audios.len);
    assert(Audios.len === HtmlAppContainer.children.length);

    const target = e.target;
    if ("p-left" === target.name) {
        if (Audios.len === 1) {
            return;
        }
        const audio = Audios.get(AudioPanelIdx);
        if (audio.events === AUDIO_EVENT_MIN_VALUE) {
            return;
        }
        audio.events -= 1;
        AudioEventsSum -= 1;

        updateHtmlAudioProbability();
        updateHtmlPanelProbability(audio.events);

    } else if ("p-right" === target.name) {
        if (Audios.len === 1) {
            return;
        }
        const audio = Audios.get(AudioPanelIdx);
        if (audio.events === AUDIO_EVENT_MAX_VALUE) {
            return;
        }
        audio.events += 1;
        AudioEventsSum += 1;

        updateHtmlAudioProbability();
        updateHtmlPanelProbability(audio.events);

    } else if ("play" === target.name) {
        const HtmlAudioElement = HtmlAppContainer.children[AudioPanelIdx];
        const audio = Audios.get(AudioPanelIdx);
        if (audio.playing) {
            if (!audio.fadeoutRunning) {
                audio.endPoint = (
                    Math.trunc(audio.html.currentTime * 100)
                    + FADEOUT
                ) / 100;
                audioFadeout(audio, context.currentTime);
            }
        } else {
            play(audio, HtmlAudioElement);
            playAudioPanel(AudioPanelIdx, audio);
        }
    } else if ("close" === target.name) {
        const HTMLAudioElement = HtmlAppContainer.children[AudioPanelIdx];
        HTMLAudioElement.setAttribute("data-selected", "0");
        HtmlAppPanel.setAttribute("data-display", "0");
        //SELECTED
        AudioPanelIdx = -1;

    } else if ("prev" === target.name) {
        HtmlAppContainer.children[AudioPanelIdx].setAttribute("data-selected", "0");
        if (AudioPanelIdx < 1) {
            AudioPanelIdx = Audios.len - 1;
        } else {
            AudioPanelIdx -= 1;
        }
        HtmlAppContainer.children[AudioPanelIdx].setAttribute("data-selected", "1");
        const audio = Audios.get(AudioPanelIdx);
        changeHtmlAppPanel(audio);
    } else if ("next" === target.name) {
        HtmlAppContainer.children[AudioPanelIdx].setAttribute("data-selected", "0");
        if (AudioPanelIdx === Audios.len - 1) {
            AudioPanelIdx = 0;
        } else {
            AudioPanelIdx += 1;
        }
        HtmlAppContainer.children[AudioPanelIdx].setAttribute("data-selected", "1");
        const audio = Audios.get(AudioPanelIdx);
        changeHtmlAppPanel(audio);
    }
};

const HtmlAppPanelOninput = function (e) {
    assert(AudioPanelIdx !== -1, "ERROR: Panel Bad Open");

    const target = e.target;
    if ("volume-input" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        if (target.valueAsNumber < LIMIT_VOLUME_MIN) {
            target.valueAsNumber = LIMIT_VOLUME_MIN;
        } else if (target.valueAsNumber > LIMIT_VOLUME_MAX) {
            target.valueAsNumber = LIMIT_VOLUME_MAX;
        } else {
            audio.input.gain.value = target.valueAsNumber / 10;
            audio.volume = target.valueAsNumber;
            target.nextElementSibling.textContent = `${audio.volume * 10}%`;
        }

    } else if ("delay" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.delayDisabled = !target.checked;
        if (DelayAreAllDisable && target.checked) {
            DelayAreAllDisable = false;
            HtmlCDelayDA.checked = false;
        }

    } else if ("filter" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.filterDisabled = !target.checked;
        if (FilterAreAllDisable && target.checked) {
            FilterAreAllDisable = false;
            HtmlCFilterDA.checked = false;
        }

    } else if ("panner" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.pannerDisabled = !target.checked;
        if (PannerAreAllDisable && target.checked) {
            PannerAreAllDisable = false;
            HtmlCPannerDA.checked = false;
        }

    } else if ("pbrate" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.pbrateDisabled = !target.checked;
        if (PbRateAreAllDisable && target.checked) {
            PbRateAreAllDisable = false;
            HtmlCPbrateDA.checked = false;
        }

    } else if ("rsp" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.rspDisabled = !target.checked;
        if (CutRSPAreAllDisable && target.checked) {
            CutRSPAreAllDisable = false;
            HtmlCRSPDA.checked = false;
        }

    } else if ("rep" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        audio.repDisabled = !target.checked;
        if (CutREPAreAllDisable && target.checked) {
            CutREPAreAllDisable = false;
            HtmlCREPDA.checked = false;
        }

    } else if ("start-time-input" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        let startTime = (audio.duration * target.valueAsNumber) / 100;
        let translate = target.value;

        if (startTime + 0.5 >= audio.endTime) {
            startTime = audio.endTime - 0.5
            let value = ((audio.endTime - 0.5) * 100) / audio.duration;
            translate = String(value);
            target.valueAsNumber = value;

        }
        audio.startTime = startTime;
        HtmlPStartTimeBar.setAttribute("style", "--translate:"+translate+"%");
        HtmlPStartTimeText.textContent = durationToTime(String(startTime));

    } else if ("end-time-input" === target.name) {
        const audio = Audios.get(AudioPanelIdx);
        assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");
        let endTime = (audio.duration * target.valueAsNumber) / 100;
        let translate = target.value;
        if (audio.startTime >= endTime - 0.5) {
            endTime = audio.startTime + 0.5;
            let value = ((audio.startTime + 0.5) * 100) / audio.duration;
            translate = String(value);
            target.valueAsNumber = value;
        }

        audio.endTime = endTime;
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
    let input = e.target.parentElement.children["volume-input"];
    if (name === "volume-input" || name === "volume-text") {
        //can throw Error
        input = e.target.parentElement.children["volume-input"];
    } else if (name === "volume") {
        //can throw Error
        input = e.target.children["volume-input"];
    } else {
        return;
    }

    const audio = Audios.get(AudioPanelIdx);
    assert(audio !== undefined, "ERROR undefined audio: Audios.get on AudioPanelIdx");

    if (e.deltaY > 0) {
        if (audio.volume - 1 < LIMIT_VOLUME_MIN) {
            return;
        }
        audio.volume -= 1;
    } else {
        if (audio.volume + 1 > LIMIT_VOLUME_MAX) {
            return;
        }
        audio.volume += 1;
    }
    input.valueAsNumber = audio.volume;
    input.nextElementSibling.textContent = `${audio.volume * 10}%`;
    audio.input.gain.value = audio.volume / 10;
};

const setHtmlAppConfiguration = function () {
    HtmlCDelayDA.checked = DelayAreAllDisable;
    HtmlCDelayTimemin.children["delay-timemin"].valueAsNumber = DelayTimemin;
    HtmlCDelayTimemin.lastElementChild.children["value"].textContent = (
        getDelayTime(DelayTimemin).toFixed(1)
    );
    HtmlCDelayTimemax.children["delay-timemax"].valueAsNumber = (
        LIMIT_DELAY_TIMEMAX - DelayTimemax
    );
    HtmlCDelayTimemax.lastElementChild.children["value"].textContent = (
        getDelayTime(DelayTimemax).toFixed(1)
    );
    HtmlCDelayFeedbackmin.children["delay-feedbackmin"].valueAsNumber = (
        DelayFeedbackmin
    );
    HtmlCDelayFeedbackmin.lastElementChild.children["value"].textContent = String(
        getDelayFeedback(DelayFeedbackmin)
    );
    HtmlCDelayFeedbackmax.children["delay-feedbackmax"].valueAsNumber = (
        LIMIT_DELAY_FEEDBACKMAX - DelayFeedbackmax
    );
    HtmlCDelayFeedbackmax.lastElementChild.children["value"].textContent = String(
        getDelayFeedback(DelayFeedbackmax)
    );

    HtmlCFilterDA.checked = FilterAreAllDisable;
    HtmlCFilterFreqmin.children["filter-freqmin"].valueAsNumber = (
        FilterFreqmin
    );
    HtmlCFilterFreqmin.lastElementChild.children["value"].textContent = String(
        getFilterFreq(FilterFreqmin)
    );
    HtmlCFilterFreqmax.children["filter-freqmax"].valueAsNumber = (
        LIMIT_FILTER_FREQMAX - FilterFreqmax
    );
    HtmlCFilterFreqmax.lastElementChild.children["value"].textContent = String(
        getFilterFreq(FilterFreqmax)
    );
    HtmlCFilterQmin.children["filter-qmin"].valueAsNumber = FilterQmin;
    HtmlCFilterQmin.lastElementChild.children["value"].textContent = String(
        getFilterQ(FilterQmin)
    );
    HtmlCFilterQmax.children["filter-qmax"].valueAsNumber = (
        LIMIT_FILTER_QMAX - FilterQmax
    );
    HtmlCFilterQmax.lastElementChild.children["value"].textContent = String(
        getFilterQ(FilterQmax)
    );
    let elements = HtmlCFilterEffects.elements;
    elements["filter-bandpass"].checked = FilterBandpass;
    elements["filter-highpass"].checked = FilterHighpass;
    elements["filter-lowpass"].checked = FilterLowpass;
    elements["filter-notch"].checked = FilterNotch;

    HtmlCPannerDA.checked = PannerAreAllDisable;
    HtmlCPannerXmin.children["panner-xmin"].valueAsNumber = PannerXmin;
    HtmlCPannerXmin.lastElementChild.children["value"].textContent = String(
        getPanner(PannerXmin)
    );
    HtmlCPannerXmax.children["panner-xmax"].valueAsNumber = (
        LIMIT_PANNER_MAX - PannerXmax
    );
    HtmlCPannerXmax.lastElementChild.children["value"].textContent = String(
        getPanner(PannerXmax)
    );
    HtmlCPannerYmin.children["panner-ymin"].valueAsNumber = PannerYmin;
    HtmlCPannerYmin.lastElementChild.children["value"].textContent = String(
        getPanner(PannerYmin)
    );
    HtmlCPannerYmax.children["panner-ymax"].valueAsNumber = (
        LIMIT_PANNER_MAX - PannerYmax
    );
    HtmlCPannerYmax.lastElementChild.children["value"].textContent = String(
        getPanner(PannerYmax)
    );
    HtmlCPannerZmin.children["panner-zmin"].valueAsNumber = PannerZmin;
    HtmlCPannerZmin.lastElementChild.children["value"].textContent = String(
        PannerZmin
    );
    HtmlCPannerZmax.children["panner-zmax"].valueAsNumber = (
        LIMIT_PANNER_ZMAX - PannerZmax
    );
    HtmlCPannerZmax.lastElementChild.children["value"].textContent = String(
        PannerZmax
    );

    HtmlCPbrateDA.checked = PbRateAreAllDisable;
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

    HtmlCRSPDA.checked = CutRSPAreAllDisable;
    HtmlCREPDA.checked = CutREPAreAllDisable;

    HtmlCTimemaxUpdate(TimeIntervalmax);
    HtmlCTimeminUpdate(TimeIntervalmin);

    for (let i = 0; i < Audios.len; i += 1) {
        const audio = Audios.get(i);
        audio.delayDisabled = DelayAreAllDisable;
        audio.filterDisabled = FilterAreAllDisable;
        audio.pannerDisabled = PannerAreAllDisable;
        audio.pbrateDisabled = PbRateAreAllDisable;
        audio.rspDisabled = CutRSPAreAllDisable;
        audio.repDisabled = CutREPAreAllDisable;
    }
    if (AudiosSelected !== -1) {
        changeHtmlAppPanelEffect("delay", !DelayAreAllDisable);
        changeHtmlAppPanelEffect("filter", !FilterAreAllDisable);
        changeHtmlAppPanelEffect("panner", !PannerAreAllDisable);
        changeHtmlAppPanelEffect("pbrate", !PbRateAreAllDisable);
        changeHtmlAppPanelEffect("rsp", !CutRSPAreAllDisable);
        changeHtmlAppPanelEffect("rep", !CutREPAreAllDisable);
    }
};

/**@type{(appVersion: string) => undefined}*/
const localStorageInit = function (appVersion) {
    const s = localStorage;
    if (s[STORAGE_VERSION] !== appVersion) {
        s.setItem(STORAGE_VERSION, appVersion);

        //clean old configurations
        const localSKeys = Object.keys(s);
        for (let key of localSKeys) {
            if (!key.startsWith("inset.", 0)) {
                s.removeItem(key);
            }
        }
    }
    let t = "";
    t = s[STORAGE_CREP_DISABLE];
    if (t === "0" || t === "1") {
        CutREPAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_CREP_DISABLE, String(Number(CutREPAreAllDisable)));
    }
    t = s[STORAGE_CRSP_DISABLE];
    if (t === "0" || t === "1") {
        CutRSPAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_CRSP_DISABLE, String(Number(CutRSPAreAllDisable)));
    }

    t = s[STORAGE_DELAY_DISABLE];
    if (t === "0" || t === "1") {
        DelayAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_DELAY_DISABLE, String(Number(DelayAreAllDisable)));
    }

    let maxs = s[STORAGE_DELAY_TIMEMAX];
    let mins = s[STORAGE_DELAY_TIMEMIN];
    let maxn = Number(maxs);
    let minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_DELAY_TIMEMAX) {
        DelayTimemax = maxn;
        DelayTimemin = minn;
    } else {
        s.setItem(STORAGE_DELAY_TIMEMAX, String(DelayTimemax));
        s.setItem(STORAGE_DELAY_TIMEMIN, String(DelayTimemin));
    }

    maxs = s[STORAGE_DELAY_FEEDBACKMAX];
    mins = s[STORAGE_DELAY_FEEDBACKMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_DELAY_FEEDBACKMAX) {
        DelayTimemax = maxn;
        DelayTimemin = minn;
    } else {
        s.setItem(STORAGE_DELAY_FEEDBACKMAX, String(DelayFeedbackmax));
        s.setItem(STORAGE_DELAY_FEEDBACKMIN, String(DelayFeedbackmin));
    }

    t = s[STORAGE_FILTER_DISABLE];
    if (t === "0" || t === "1") {
        FilterAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_FILTER_DISABLE, String(Number(FilterAreAllDisable)));
    }

    maxs = s[STORAGE_FILTER_FREQMAX];
    mins = s[STORAGE_FILTER_FREQMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_FILTER_FREQMAX) {
        FilterFreqmax = maxn;
        FilterFreqmin = minn;
    } else {
        s.setItem(STORAGE_FILTER_FREQMAX, String(FilterFreqmax));
        s.setItem(STORAGE_FILTER_FREQMIN, String(FilterFreqmin));
    }

    maxs = s[STORAGE_FILTER_QMAX];
    mins = s[STORAGE_FILTER_QMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_FILTER_QMAX) {
        FilterQmax = maxn;
        FilterQmin = minn;
    } else {
        s.setItem(STORAGE_FILTER_QMAX, String(FilterQmax));
        s.setItem(STORAGE_FILTER_QMIN, String(FilterQmin));
    }

    t = s[STORAGE_FILTER_BANDPASS];
    if (t === "0" || t === "1") {
        FilterBandpass = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_FILTER_BANDPASS, String(Number(FilterBandpass)));
    }
    t = s[STORAGE_FILTER_HIGHPASS];
    if (t === "0" || t === "1") {
        FilterHighpass = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_FILTER_HIGHPASS, String(Number(FilterHighpass)));
    }
    t = s[STORAGE_FILTER_LOWPASS];
    if (t === "0" || t === "1") {
        FilterLowpass = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_FILTER_LOWPASS, String(Number(FilterLowpass)));
    }
    t = s[STORAGE_FILTER_NOTCH];
    if (t === "0" || t === "1") {
        FilterNotch = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_FILTER_NOTCH, String(Number(FilterNotch)));
    }


    t = s[STORAGE_PANNER_DISABLE];
    if (t === "0" || t === "1") {
        PannerAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_PANNER_DISABLE, String(Number(PannerAreAllDisable)));
    }

    maxs = s[STORAGE_PANNER_XMAX];
    mins = s[STORAGE_PANNER_XMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
        PannerXmax = maxn;
        PannerXmin = minn;
    } else {
        s.setItem(STORAGE_PANNER_XMAX, String(PannerXmax));
        s.setItem(STORAGE_PANNER_XMIN, String(PannerXmin));
    }

    maxs = s[STORAGE_PANNER_YMAX];
    mins = s[STORAGE_PANNER_YMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
        PannerYmax = maxn;
        PannerYmin = minn;
    } else {
        s.setItem(STORAGE_PANNER_YMAX, String(PannerYmax));
        s.setItem(STORAGE_PANNER_YMIN, String(PannerYmin));
    }

    maxs = s[STORAGE_PANNER_ZMAX];
    mins = s[STORAGE_PANNER_ZMIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_ZMAX) {
        PannerZmax = maxn;
        PannerZmin = minn;
    } else {
        s.setItem(STORAGE_PANNER_ZMAX, String(PannerZmax));
        s.setItem(STORAGE_PANNER_ZMIN, String(PannerZmin));
    }

    t = s[STORAGE_PBRATE_DISABLE];
    if (t === "0" || t === "1") {
        PbRateAreAllDisable = Boolean(Number(t));
    } else {
        s.setItem(STORAGE_PBRATE_DISABLE, String(Number(PbRateAreAllDisable)));
    }

    maxs = s[STORAGE_PBRATE_MAX];
    mins = s[STORAGE_PBRATE_MIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
        PbRatemax = maxn;
        PbRatemin = minn;
    } else {
        s.setItem(STORAGE_PBRATE_MAX, String(PbRatemax));
        s.setItem(STORAGE_PBRATE_MIN, String(PbRatemin));
    }

    maxs = s[STORAGE_TIME_MAX];
    mins = s[STORAGE_TIME_MIN];
    maxn = Number(maxs);
    minn = Number(mins);
    if (LIMIT_TIMEINTERVAL_MIN <= minn
        && minn <= maxn
        && maxn <= LIMIT_TIMEINTERVAL_MAX
    ) {
        TimeIntervalmax = maxn;
        TimeIntervalmin = minn;
        TimeTemporalmax = maxn;
        TimeTemporalmin = minn;
    } else {
        s.setItem(STORAGE_TIME_MAX, String(TimeIntervalmax));
        s.setItem(STORAGE_TIME_MIN, String(TimeIntervalmin));
    }

    maxs = s[STORAGE_SETEVENTS_MAX];
    maxn = Number(maxs);
    if (1 <= maxn && maxn <= CARDINAL_MAX) {
        SetEvents.max = maxn;
        HtmlCMaxElements.textContent = maxs;
        HtmlCSetRadios.children[maxn-1].firstElementChild.checked = true;
    } else {
        s.setItem(STORAGE_SETEVENTS_MAX, String(SetEvents.max));
    }
};

const loadConfigFile = function () {
    const text = READER.result;
    //can throw error
    const json = JSON.parse(text);
    let t = json[STORAGE_CRSP_DISABLE];
    if (t === "0" || t === "1") {
        localStorage.setItem(STORAGE_CRSP_DISABLE, t);
        CutRSPAreAllDisable = Boolean(Number(t));
    }
    t = json[STORAGE_CREP_DISABLE];
    if (t === "0" || t === "1") {
        localStorage.setItem(STORAGE_CREP_DISABLE, t);
        CutREPAreAllDisable = Boolean(Number(t));
    }

    t = json[STORAGE_DELAY_DISABLE];
    if (t === "0" || t === "1") {
        DelayAreAllDisable = Boolean(Number(t));
        localStorage.setItem(STORAGE_DELAY_DISABLE, t);
    }

    let maxn = 0;
    let minn = 0;
    let maxs = json[STORAGE_DELAY_TIMEMAX];
    let mins = json[STORAGE_DELAY_TIMEMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_DELAY_TIMEMAX) {
            DelayTimemax = maxn;
            DelayTimemin = minn;
            localStorage.setItem(STORAGE_DELAY_TIMEMAX, maxs);
            localStorage.setItem(STORAGE_DELAY_TIMEMIN, mins);
        }
    }

    maxs = json[STORAGE_DELAY_FEEDBACKMAX];
    mins = json[STORAGE_DELAY_FEEDBACKMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_DELAY_FEEDBACKMAX) {
            DelayTimemax = maxn;
            DelayTimemin = minn;
            localStorage.setItem(STORAGE_DELAY_FEEDBACKMAX, maxs);
            localStorage.setItem(STORAGE_DELAY_FEEDBACKMIN, mins);
        }
    }

    t = json[STORAGE_FILTER_DISABLE];
    if (t === "0" || t === "1") {
        FilterAreAllDisable = Boolean(Number(t));
        localStorage.setItem(STORAGE_FILTER_DISABLE, t);
    }

    maxs = json[STORAGE_FILTER_FREQMAX];
    mins = json[STORAGE_FILTER_FREQMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_FILTER_FREQMAX) {
            FilterFreqmax = maxn;
            FilterFreqmin = minn;
            localStorage.setItem(STORAGE_FILTER_FREQMAX, maxs);
            localStorage.setItem(STORAGE_FILTER_FREQMIN, mins);
        }
    }

    maxs = json[STORAGE_FILTER_QMAX];
    mins = json[STORAGE_FILTER_QMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_FILTER_QMAX) {
            FilterQmax = maxn;
            FilterQmin = minn;
            localStorage.setItem(STORAGE_FILTER_QMAX, maxs);
            localStorage.setItem(STORAGE_FILTER_QMIN, mins);
        }
    }
    t = json[STORAGE_FILTER_BANDPASS];
    if (t === "0" || t === "1") {
        FilterBandpass = Boolean(Number(t));
        localStorage.setItem(STORAGE_FILTER_BANDPASS, t);
    }
    t = json[STORAGE_FILTER_HIGHPASS];
    if (t === "0" || t === "1") {
        FilterHighpass = Boolean(Number(t));
        localStorage.setItem(STORAGE_FILTER_HIGHPASS, t);
    }
    t = json[STORAGE_FILTER_LOWPASS];
    if (t === "0" || t === "1") {
        FilterLowpass = Boolean(Number(t));
        localStorage.setItem(STORAGE_FILTER_LOWPASS, t);
    }
    t = json[STORAGE_FILTER_NOTCH];
    if (t === "0" || t === "1") {
        FilterNotch = Boolean(Number(t));
        localStorage.setItem(STORAGE_FILTER_NOTCH, t);
    }

    t = json[STORAGE_PANNER_DISABLE];
    if (t === "0" || t === "1") {
        PannerAreAllDisable = Boolean(Number(t));
        localStorage.setItem(STORAGE_PANNER_DISABLE, t);
    }
    maxs = json[STORAGE_PANNER_XMAX];
    mins = json[STORAGE_PANNER_XMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
            PannerXmax = maxn;
            PannerXmin = minn;
            localStorage.setItem(STORAGE_PANNER_XMAX, maxs);
            localStorage.setItem(STORAGE_PANNER_XMIN, mins);
        }
    }

    maxs = json[STORAGE_PANNER_YMAX];
    mins = json[STORAGE_PANNER_YMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
            PannerYmax = maxn;
            PannerYmin = minn;
            localStorage.setItem(STORAGE_PANNER_YMAX, maxs);
            localStorage.setItem(STORAGE_PANNER_YMIN, mins);
        }
    }

    maxs = json[STORAGE_PANNER_ZMAX];
    mins = json[STORAGE_PANNER_ZMIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_ZMAX) {
            PannerZmax = maxn;
            PannerZmin = minn;
            localStorage.setItem(STORAGE_PANNER_ZMAX, maxs);
            localStorage.setItem(STORAGE_PANNER_ZMIN, mins);
        }
    }

    t = json[STORAGE_PBRATE_DISABLE];
    if (t === "0" || t === "1") {
        PbRateAreAllDisable = Boolean(Number(t));
        localStorage.setItem(STORAGE_PBRATE_DISABLE, t);
    }
    maxs = json[STORAGE_PBRATE_MAX];
    mins = json[STORAGE_PBRATE_MIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_MIN <= minn && minn <= maxn && maxn <= LIMIT_PANNER_MAX) {
            PbRatemax = maxn;
            PbRatemin = minn;
            localStorage.setItem(STORAGE_PBRATE_MAX, maxs);
            localStorage.setItem(STORAGE_PBRATE_MIN, mins);
        }
    }
    maxs = json[STORAGE_TIME_MAX];
    mins = json[STORAGE_TIME_MIN];
    if (maxs !== undefined && mins !== undefined) {
        maxn = Number(maxs);
        minn = Number(mins);
        if (LIMIT_TIMEINTERVAL_MIN <= minn
            && minn <= maxn
            && maxn <= LIMIT_TIMEINTERVAL_MAX
        ) {
            TimeIntervalmax = maxn;
            TimeIntervalmin = minn;
            TimeTemporalmin = minn;
            TimeTemporalmax = maxn;
            localStorage.setItem(STORAGE_TIME_MAX, maxs);
            localStorage.setItem(STORAGE_TIME_MIN, mins);
        }
    }

    maxs = json[STORAGE_SETEVENTS_MAX];
    maxn = Number(maxs);
    if (1 <= maxn && maxn <= CARDINAL_MAX && maxn !== SetEvents.max) {
        updateHtmlCRadios(maxn);
        HtmlCSetRadios.children[maxn-1].firstElementChild.checked = true;
        HtmlCMaxElements.textContent = maxs;
        localStorage.setItem(STORAGE_SETEVENTS_MAX, maxs);
    }

    setHtmlAppConfiguration();
};

const openApp = function () {
    setHtmlAppConfiguration();

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

    const prefersReduceMotion = window.matchMedia("(prefers-reduced-motion)");
    reduceMotion = prefersReduceMotion.matches;
    prefersReduceMotion.addEventListener("change", function (e) {
        reduceMotion = e.matches;
    });

    READER.addEventListener("load", loadConfigFile, true);
};

const main = function () {
    //CheckAudioContext
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

    localStorageInit("dev-a-2025-04");
};

window.addEventListener("DOMContentLoaded", function () {
    window.HtmlAudioZombies = document.createDocumentFragment();
    window.HtmlAudioTemplate = document.createElement("audio");

    window.HtmlAudioElementTemplate = (function () {
        /**@type{HTMLTemplateElement}*/
        const t = document.getElementById("t-audio-element");
        assert(t !== null, "#t-audio-element is not found");
        return t.content.firstElementChild;
    }());

    window.HtmlApp = document.getElementById("app");
    assert(HtmlApp !== null, "#app is not found");

    window.HtmlAppContainer = document.getElementById("app-container");
    assert(HtmlAppContainer !== null, "#app-container is not found");

    window.HtmlAppConfig = document.getElementById("app-config");
    assert(HtmlAppConfig !== null, "#app-config is not found");

    window.HtmlAppDrop = document.getElementById("app-drop");
    assert(HtmlAppDrop !== null, "#app-drop is not found");

    window.HtmlAppMenu = document.getElementById("app-menu");
    assert(HtmlAppMenu !== null, "#app-menu is not found");

    window.HtmlAppPanel = document.getElementById("app-panel");
    assert(HtmlAppPanel !== null, "#app-panel is not found");

    window.HtmlPTitle = document.getElementById("p-title");
    assert(HtmlPTitle !== null, "#p-title is not found");

    window.HtmlPVolume = document.getElementById("p-volume");
    assert(HtmlPVolume !== null, "#p-volume is not found");

    window.HtmlPVolumeInput = document.getElementById("p-volume-input");
    assert(HtmlPVolumeInput !== null, "#p-volume-input is not found");

    window.HtmlPVolumeText = document.getElementById("p-volume-text");
    assert(HtmlPVolumeText !== null, "#p-volume-text is not found");

    window.HtmlPProbValue = document.getElementById("p-probability-value");
    assert(HtmlPProbValue !== null, "#p-probability-value is not found");

    window.HtmlPProbText = document.getElementById("p-probability-text");
    assert(HtmlPProbText !== null, "#p-probability-text is not found");

    window.HtmlPEffects = document.getElementById("p-effects");
    assert(HtmlPEffects !== null, "#p-effects is not found");

    window.HtmlPStartTimeText = document.getElementById("p-start-time-text");
    assert(HtmlPStartTimeText !== null, "#p-start-time-text is not found");

    window.HtmlPStartTimeInput = document.getElementById("p-start-time-input");
    assert(HtmlPStartTimeInput !== null, "#p-start-time-input is not found");

    window.HtmlPStartTimeBar = document.getElementById("p-start-time-bar");
    assert(HtmlPStartTimeBar !== null, "#p-start-time-bar is not found");

    window.HtmlPEndTimeText = document.getElementById("p-end-time-text");
    assert(HtmlPEndTimeText !== null, "#p-end-time-text is not found");

    window.HtmlPEndTimeInput = document.getElementById("p-end-time-input");
    assert(HtmlPEndTimeInput !== null, "#p-end-time-input is not found");

    window.HtmlPEndTimeBar = document.getElementById("p-end-time-bar");
    assert(HtmlPEndTimeBar !== null, "#p-end-time-bar is not found");

    window.HtmlPCurrentBar = document.getElementById("p-current-bar");
    assert(HtmlPCurrentBar !== null, "#p-current-bar is not found");

    window.HtmlPCurrentText = document.getElementById("p-current-text");
    assert(HtmlPCurrentText !== null, "#p-current-text is not found");

    window.HtmlPStartPointBar = document.getElementById("p-start-point-bar");
    assert(HtmlPStartPointBar !== null, "#p-start-point-bar is not found");

    window.HtmlPEndPointBar = document.getElementById("p-end-point-bar");
    assert(HtmlPEndPointBar !== null, "#p-end-point-bar is not found");

    window.HtmlCSetDetails = document.getElementById("c-set-details");
    assert(HtmlCSetDetails !== null, "#c-set-details is not found");

    window.HtmlCMaxElements = document.getElementById("c-max-elements");
    assert(HtmlCMaxElements !== null, "#c-max-elements is not found");

    window.HtmlCSetRadios = document.getElementById("c-set-radios");
    assert(HtmlCSetRadios !== null, "#c-set-radios is not found");

    window.HtmlCSets = document.getElementById("c-sets");
    assert(HtmlCSets !== null, "#c-sets is not found");

    window.HtmlCTimemin = document.getElementById("c-time-min");
    assert(HtmlCTimemin !== null, "#c-time-min is not found");
    window.HtmlCTimeminMM = HtmlCTimemin.children["mm"].children["value"];
    window.HtmlCTimeminSS = HtmlCTimemin.children["ss"].children["value"];
    window.HtmlCTimeminMS = HtmlCTimemin.children["ms"].children["value"];

    window.HtmlCTimeContainer = HtmlCTimemin.parentElement.parentElement;
    assert(HtmlCTimeContainer !== null, "HtmlCTimeContainer is not found");

    window.HtmlCTimemax = document.getElementById("c-time-max");
    assert(HtmlCTimemax !== null, "#c-time-max is not found");
    window.HtmlCTimemaxMM = HtmlCTimemax.children["mm"].children["value"];
    window.HtmlCTimemaxSS = HtmlCTimemax.children["ss"].children["value"];
    window.HtmlCTimemaxMS = HtmlCTimemax.children["ms"].children["value"];

    window.HtmlCDelayDA = document.getElementById("c-delay-da");
    assert(HtmlCDelayDA !== null, "#c-delay-da is not found");

    window.HtmlCDelayTimemin = document.getElementById("c-delay-timemin");
    assert(HtmlCDelayTimemin !== null, "#c-delay-timemin is not found");

    window.HtmlCDelayTimemax = document.getElementById("c-delay-timemax");
    assert(HtmlCDelayTimemax !== null, "#c-delay-timemax is not found");

    window.HtmlCDelayFeedbackmin = document.getElementById("c-delay-feedbackmin");
    assert(HtmlCDelayFeedbackmin !== null, "#c-delay-feedbackmin is not found");

    window.HtmlCDelayFeedbackmax = document.getElementById("c-delay-feedbackmax");
    assert(HtmlCDelayFeedbackmax !== null, "#c-delay-feedbackmax is not found");

    window.HtmlCFilterDA = document.getElementById("c-filter-da");
    assert(HtmlCFilterDA !== null, "#c-filter-da is not found");

    window.HtmlCFilterFreqmin = document.getElementById("c-filter-freqmin");
    assert(HtmlCFilterFreqmin !== null, "#c-filter-freqmin is not found");

    window.HtmlCFilterFreqmax = document.getElementById("c-filter-freqmax");
    assert(HtmlCFilterFreqmax !== null, "#c-filter-freqmax is not found");

    window.HtmlCFilterQmin = document.getElementById("c-filter-qmin");
    assert(HtmlCFilterQmin !== null, "#c-filter-qmin is not found");

    window.HtmlCFilterQmax = document.getElementById("c-filter-qmax");
    assert(HtmlCFilterQmax !== null, "#c-filter-qmax is not found");

    window.HtmlCFilterEffects = document.getElementById("c-filter-effects");
    assert(HtmlCFilterEffects !== null, "#c-filter-effects is not found");

    window.HtmlCPannerDA = document.getElementById("c-panner-da");
    assert(HtmlCPannerDA !== null, "#c-panner-da is not found");

    window.HtmlCPannerXmin = document.getElementById("c-panner-xmin");
    assert(HtmlCPannerXmin !== null, "#c-panner-xmin is not found");

    window.HtmlCPannerXmax = document.getElementById("c-panner-xmax");
    assert(HtmlCPannerXmax !== null, "#c-panner-xmax is not found");

    window.HtmlCPannerYmin = document.getElementById("c-panner-ymin");
    assert(HtmlCPannerYmin !== null, "#c-panner-ymin is not found");

    window.HtmlCPannerYmax = document.getElementById("c-panner-ymax");
    assert(HtmlCPannerYmax !== null, "#c-panner-ymax is not found");

    window.HtmlCPannerZmin = document.getElementById("c-panner-zmin");
    assert(HtmlCPannerZmin !== null, "#c-panner-zmin is not found");

    window.HtmlCPannerZmax = document.getElementById("c-panner-zmax");
    assert(HtmlCPannerZmax !== null, "#c-panner-zmax is not found");

    window.HtmlCPbrateDA = document.getElementById("c-pbrate-da");
    assert(HtmlCPbrateDA !== null, "#c-pbrate-da is not found");

    window.HtmlCPbrateMin = document.getElementById("c-pbrate-min");
    assert(HtmlCPbrateMin !== null, "#c-pbrate-min is not found");

    window.HtmlCPbrateMax = document.getElementById("c-pbrate-max");
    assert(HtmlCPbrateMax !== null, "#c-pbrate-max is not found");

    window.HtmlCRSPDA = document.getElementById("c-rsp-da");
    assert(HtmlCRSPDA !== null, "#c-rsp-da is not found");

    window.HtmlCREPDA = document.getElementById("c-rep-da");
    assert(HtmlCREPDA !== null, "#c-rep-da is not found");

    AudiosPlaying.html.fill(HtmlAudioElementTemplate);

    main();
});
