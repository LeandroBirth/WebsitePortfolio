(() => {
  const { useState, useRef, useEffect, useCallback } = React;
  const TOPICS = {
    A1: ["Presentarsi e salutare", "Ordinare al ristorante", "La routine quotidiana", "La famiglia e gli amici", "I numeri e l'ora", "I colori e i vestiti", "Al supermercato", "Chiedere il prezzo", "Le stagioni e il tempo", "Il cibo e le bevande", "La casa e le stanze", "I giorni della settimana"],
    A2: ["Chiedere indicazioni stradali", "Fare la spesa al mercato", "Raccontare il fine settimana", "Dal dottore", "Prenotare un albergo", "Descrivere una persona", "I mezzi di trasporto", "Comprare un biglietto del treno", "Al ristorante: lamentarsi educatamente", "Parlare del tempo libero", "Fare acquisti in un negozio", "Raccontare una vacanza passata"],
    B1: ["Progetti per il futuro", "Parlare di un film o libro", "Esperienze di viaggio", "Cercare lavoro e il colloquio", "L'importanza dell'istruzione", "Le abitudini alimentari italiane", "Organizzare una festa", "Le tradizioni italiane", "Descrivere la propria citt\xE0", "Parlare di salute e benessere", "Confrontare culture diverse", "La tecnologia nella vita quotidiana"],
    B2: ["Discutere di problemi ambientali", "L'equilibrio tra lavoro e vita privata", "Situazioni ipotetiche (condizionale)", "Il sistema sanitario italiano", "Il ruolo dei social media", "La globalizzazione e le sue conseguenze", "L'immigrazione in Italia", "La cucina regionale e la sua storia", "Il cinema italiano neorealista", "Etica e intelligenza artificiale", "La crisi abitativa nelle grandi citt\xE0", "Il volontariato e l'impegno sociale"],
    C1: ["Arte astratta e movimenti artistici", "Sistemi politici a confronto", "Analisi di modi di dire e idiomi", "Ipotesi complesse con il congiuntivo", "La letteratura italiana contemporanea", "Questioni bioetiche", "La filosofia del linguaggio", "L'evoluzione della lingua italiana", "Retorica e persuasione nel discorso pubblico", "Il concetto di identit\xE0 culturale", "Analisi critica di un articolo di giornale", "La satira nella societ\xE0 italiana"]
  };
  const LBL = { A1: "Principiante", A2: "Elementare", B1: "Intermedio", B2: "Intermedio Sup.", C1: "Avanzato" };
  const EMJ = { A1: "\u{1F331}", A2: "\u{1F33F}", B1: "\u{1F333}", B2: "\u{1F525}", C1: "\u2B50" };
  const GEMINI_MODELS = [
    { id: "gemini-3.1-flash-lite", label: "3.1 Flash-Lite \u2713" },
    { id: "gemini-3.5-flash", label: "3.5 Flash" },
    { id: "gemini-2.5-flash-preview", label: "2.5 Flash Preview" },
    { id: "gemini-2.5-flash-lite", label: "2.5 Flash-Lite" }
  ];
  const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
  function sysPrompt(lv, tp) {
    return `Sei un insegnante di italiano esperto e caloroso. Studente livello ${lv} (${LBL[lv]}). Argomento: "${tp}".

REGOLE:
1. Parla ESCLUSIVAMENTE in italiano. MAI inglese.
2. Adatta vocabolario e complessit\xE0 al livello ${lv}.
3. A1/A2: frasi brevi, vocabolario base. B1/B2: frasi articolate, nuovi vocaboli. C1: linguaggio ricco, idiomi, congiuntivo.
4. NON usare mai emoji nella risposta.
5. REGOLA CRITICA su "teacher_reply": il campo "teacher_reply" deve contenere SOLO la risposta conversazionale naturale. NON menzionare MAI errori, correzioni, grammatica, pronuncia, o suggerimenti linguistici dentro "teacher_reply". Rispondi come in una conversazione vera, ignorando gli errori nel tuo discorso. Esempio: se lo studente dice "Io ho mangiato un mela", tu rispondi "Che buono! E cosa hai mangiato?" \u2014 senza dire "Attenzione, si dice una mela" nel teacher_reply.
6. Le correzioni grammaticali vanno ESCLUSIVAMENTE nel campo "correction_details" del JSON. Mai nel "teacher_reply".

Rispondi SOLO con JSON valido (no markdown, no backtick, no testo extra):
{"teacher_reply":"SOLO risposta conversazionale, MAI correzioni qui","had_error":true,"correction_details":{"original":"frase errata","corrected":"frase corretta","explanation":"spiegazione in italiano"},"vocabulary_words":["parola1","parola2"]}

Se lo studente NON ha fatto errori, usa had_error false e correction_details null.`;
  }
  function feedbackPrompt(history, lv) {
    const c = history.map((m) => `${m.role === "teacher" ? "Insegnante" : "Studente"}: ${m.text}`).join("\n");
    return `Analizza questa conversazione di italiano livello ${lv}:

${c}

Rispondi SOLO con JSON valido (no markdown, no backtick):
{"grammar_score":7,"vocabulary_score":6,"fluency_score":5,"overall_score":6,"strengths":["punto forte 1","punto forte 2"],"improvements":["miglioramento 1","miglioramento 2","miglioramento 3"],"summary":"Un paragrafo riassuntivo della performance."}`;
  }
  function parseError(msg, status) {
    const m = (msg || "").toLowerCase();
    if (status === 429 || /quota|rate.?limit|resource.?exhaust|too many/i.test(m)) {
      return {
        title: "Limite di utilizzo raggiunto \u{1F6D1}",
        message: "Hai superato il limite di richieste dell'API. Aspetta un minuto e riprova. Se il problema persiste, prova un modello diverso nelle impostazioni.",
        isRate: true
      };
    }
    if (status === 400 || /invalid|api.?key|authenticate/i.test(m)) {
      return {
        title: "Chiave API non valida \u26A0\uFE0F",
        message: "Controlla di aver copiato bene la chiave da Google AI Studio. Deve iniziare con 'AIza'.",
        isRate: false
      };
    }
    if (status === 403 || /permission|forbidden/i.test(m)) {
      return {
        title: "Accesso negato \u{1F512}",
        message: "La chiave non ha i permessi necessari. Vai su Google AI Studio e verifica che l'API Generative Language sia abilitata.",
        isRate: false
      };
    }
    if (/network|fetch|failed|timeout|abort/i.test(m)) {
      return {
        title: "Errore di rete \u{1F4E1}",
        message: "Impossibile raggiungere il server. Controlla la connessione internet e riprova.",
        isRate: false
      };
    }
    return {
      title: "Errore imprevisto",
      message: msg || "Si \xE8 verificato un errore. Riprova tra qualche istante.",
      isRate: false
    };
  }
  function Btn({ children, color, dk, tc = "white", onClick, disabled, small, full }) {
    const [pressed, setPressed] = useState(false);
    const h = small ? 3 : 4;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `btn3d ${small ? "small" : "normal"} ${full ? "full" : ""}`,
        onMouseDown: () => setPressed(true),
        onMouseUp: () => setPressed(false),
        onMouseLeave: () => setPressed(false),
        onTouchStart: () => setPressed(true),
        onTouchEnd: () => setPressed(false),
        onClick,
        disabled,
        style: {
          background: disabled ? void 0 : color,
          color: disabled ? void 0 : tc,
          cursor: disabled ? "not-allowed" : "pointer",
          transform: pressed && !disabled ? `translateY(${h}px)` : "translateY(0)",
          boxShadow: pressed || disabled ? "none" : `0 ${h}px 0 0 ${dk}`
        }
      },
      children
    );
  }
  function ScoreRing({ score, label, color }) {
    const r = 30;
    const circ = 2 * Math.PI * r;
    const offset = circ - score / 10 * circ;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("svg", { width: "72", height: "72", viewBox: "0 0 72 72" }, /* @__PURE__ */ React.createElement("circle", { cx: "36", cy: "36", r, fill: "none", stroke: "#E5E5EA", strokeWidth: "6" }), /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx: "36",
        cy: "36",
        r,
        fill: "none",
        stroke: color,
        strokeWidth: "6",
        strokeDasharray: circ,
        strokeDashoffset: offset,
        strokeLinecap: "round",
        transform: "rotate(-90 36 36)",
        style: { transition: "stroke-dashoffset 1s ease" }
      }
    ), /* @__PURE__ */ React.createElement(
      "text",
      {
        x: "36",
        y: "42",
        textAnchor: "middle",
        style: { fontSize: 20, fontWeight: 900, fill: "#2D2D2D", fontFamily: "'Nunito', sans-serif" }
      },
      score
    )), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontWeight: 800, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".05em" } }, label));
  }
  function App() {
    var _a, _b;
    const [apiKey, setApiKey] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [model, setModel] = useState(GEMINI_MODELS[0].id);
    const [level, setLevel] = useState("A1");
    const [topic, setTopic] = useState(TOPICS.A1[0]);
    const [msgs, setMsgs] = useState([]);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lessonOn, setLessonOn] = useState(false);
    const [lessonDone, setLessonDone] = useState(false);
    const [speechRate, setSpeechRate] = useState(1);
    const [vocab, setVocab] = useState([]);
    const [showVocab, setShowVocab] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSugs, setShowSugs] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const [error, setError] = useState(null);
    const [interim, setInterim] = useState("");
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [turns, setTurns] = useState(0);
    const [showSetup, setShowSetup] = useState(false);
    const chatEndRef = useRef(null);
    const recogRef = useRef(null);
    const historyRef = useRef([]);
    const scrollToBottom = useCallback(() => {
      setTimeout(() => {
        var _a2;
        (_a2 = chatEndRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, []);
    useEffect(() => {
      scrollToBottom();
    }, [msgs, suggestions, loading, error, scrollToBottom]);
    useEffect(() => {
      setTopic(TOPICS[level][0]);
    }, [level]);
    useEffect(() => {
      var _a2, _b2, _c;
      (_a2 = window.speechSynthesis) == null ? void 0 : _a2.getVoices();
      const fn = () => {
        var _a3;
        return (_a3 = window.speechSynthesis) == null ? void 0 : _a3.getVoices();
      };
      (_c = (_b2 = window.speechSynthesis) == null ? void 0 : _b2.addEventListener) == null ? void 0 : _c.call(_b2, "voiceschanged", fn);
      return () => {
        var _a3, _b3;
        return (_b3 = (_a3 = window.speechSynthesis) == null ? void 0 : _a3.removeEventListener) == null ? void 0 : _b3.call(_a3, "voiceschanged", fn);
      };
    }, []);
    const callGemini = useCallback(async (userMessage, systemPr) => {
      var _a2, _b2, _c, _d, _e, _f;
      const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`;
      const contents = [];
      if (systemPr) {
        contents.push({ role: "user", parts: [{ text: systemPr }] });
        contents.push({ role: "model", parts: [{ text: "Capito perfettamente. Risponder\xF2 esclusivamente in italiano utilizzando il formato JSON richiesto." }] });
      }
      historyRef.current.forEach((m) => {
        contents.push({
          role: m.role === "teacher" ? "model" : "user",
          parts: [{ text: m.text }]
        });
      });
      if (userMessage) {
        contents.push({ role: "user", parts: [{ text: userMessage }] });
      }
      let res;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
          })
        });
      } catch (networkErr) {
        throw parseError("Network fetch failed: " + networkErr.message);
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw parseError(((_a2 = errData == null ? void 0 : errData.error) == null ? void 0 : _a2.message) || `HTTP ${res.status}`, res.status);
      }
      const data = await res.json();
      const text = (_f = (_e = (_d = (_c = (_b2 = data == null ? void 0 : data.candidates) == null ? void 0 : _b2[0]) == null ? void 0 : _c.content) == null ? void 0 : _d.parts) == null ? void 0 : _e[0]) == null ? void 0 : _f.text;
      if (!text) throw parseError("Risposta vuota dall'API Gemini.");
      const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      try {
        return JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn("JSON parse failed, raw text:", text);
        throw parseError("L'API ha risposto in un formato non valido. Riprova.");
      }
    }, [apiKey, model]);
    const speakQueueRef = useRef([]);
    const speakActiveRef = useRef(false);
    const speakNextSentence = useCallback(() => {
      if (speakQueueRef.current.length === 0) {
        speakActiveRef.current = false;
        setSpeaking(false);
        setSpeakingId(null);
        return;
      }
      const { sentence, voice, rate: r, msgId } = speakQueueRef.current.shift();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = "it-IT";
      utterance.rate = r;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        setSpeaking(true);
        setSpeakingId(msgId);
      };
      utterance.onend = () => {
        setTimeout(() => speakNextSentence(), 80);
      };
      utterance.onerror = (e) => {
        console.warn("[TTS] Error on sentence:", e.error);
        setTimeout(() => speakNextSentence(), 80);
      };
      window.speechSynthesis.speak(utterance);
    }, []);
    const speak = useCallback((text, msgId) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      speakQueueRef.current = [];
      speakActiveRef.current = false;
      const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\*+/g, "").replace(/#+\s*/g, "").replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g, " ").trim();
      if (!cleanText) return;
      console.log("[TTS] Speaking:", JSON.stringify(cleanText));
      const sentences = cleanText.split(/(?<=[.!?;:])\s+|(?<=\b(?:Ciao|Buongiorno|Benvenuto|Allora|Bene|Ok|Bravo|Perfetto)[!,.])\s+/i).map((s) => s.trim()).filter((s) => s.length > 0);
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find((v) => v.lang === "it-IT" && v.localService) || voices.find((v) => v.lang === "it-IT") || voices.find((v) => v.lang.startsWith("it"));
      if (italianVoice) {
        console.log("[TTS] Voice:", italianVoice.name);
      }
      sentences.forEach((sentence) => {
        speakQueueRef.current.push({ sentence, voice: italianVoice, rate: speechRate, msgId });
      });
      speakActiveRef.current = true;
      setTimeout(() => speakNextSentence(), 150);
    }, [speechRate, speakNextSentence]);
    const stopSpeaking = () => {
      var _a2;
      (_a2 = window.speechSynthesis) == null ? void 0 : _a2.cancel();
      speakQueueRef.current = [];
      speakActiveRef.current = false;
      setSpeaking(false);
      setSpeakingId(null);
    };
    const handleUserMessage = useCallback(async (text) => {
      var _a2;
      if (!text || !confirmed) return;
      const userMsg = { id: Date.now(), role: "student", text };
      setMsgs((prev) => [...prev, userMsg]);
      historyRef.current.push({ role: "student", text });
      setLoading(true);
      setError(null);
      setShowSugs(false);
      setSuggestions([]);
      try {
        const result = await callGemini(text, sysPrompt(level, topic));
        const teacherMsg = {
          id: Date.now() + 1,
          role: "teacher",
          text: result.teacher_reply,
          correction: result.had_error ? result.correction_details : null
        };
        setMsgs((prev) => [...prev, teacherMsg]);
        historyRef.current.push({ role: "teacher", text: result.teacher_reply });
        setTurns((c) => c + 1);
        if ((_a2 = result.vocabulary_words) == null ? void 0 : _a2.length) {
          setVocab((prev) => [.../* @__PURE__ */ new Set([...prev, ...result.vocabulary_words])]);
        }
        if (result.had_error && result.correction_details) {
          setVocab((prev) => [.../* @__PURE__ */ new Set([...prev, "\u2713 " + result.correction_details.corrected])]);
        }
        speak(result.teacher_reply, teacherMsg.id);
      } catch (err) {
        setError(err.title ? err : parseError(err.message || String(err)));
      } finally {
        setLoading(false);
      }
    }, [confirmed, level, topic, callGemini, speak]);
    const handleMsgRef = useRef(handleUserMessage);
    useEffect(() => {
      handleMsgRef.current = handleUserMessage;
    }, [handleUserMessage]);
    const sentRef = useRef(false);
    const lastTranscriptRef = useRef("");
    const startListening = useCallback(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError(parseError("Riconoscimento vocale non supportato. Usa Chrome o Safari."));
        return;
      }
      stopSpeaking();
      sentRef.current = false;
      lastTranscriptRef.current = "";
      const recognition = new SpeechRecognition();
      recognition.lang = "it-IT";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        lastTranscriptRef.current = fullTranscript;
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult.isFinal && !sentRef.current) {
          sentRef.current = true;
          setInterim("");
          console.log("[STT] Final:", JSON.stringify(fullTranscript.trim()));
          handleMsgRef.current(fullTranscript.trim());
        } else if (!sentRef.current) {
          setInterim(fullTranscript);
        }
      };
      recognition.onerror = (e) => {
        setListening(false);
        setInterim("");
        if (e.error !== "aborted" && e.error !== "no-speech") {
          setError(parseError("Errore microfono: " + e.error));
        }
      };
      recognition.onend = () => {
        setListening(false);
        setInterim("");
        if (!sentRef.current && lastTranscriptRef.current.trim()) {
          sentRef.current = true;
          console.log("[STT] Fallback:", JSON.stringify(lastTranscriptRef.current.trim()));
          handleMsgRef.current(lastTranscriptRef.current.trim());
        }
      };
      recogRef.current = recognition;
      recognition.start();
      setListening(true);
    }, []);
    const stopListening = () => {
      setListening(false);
      setTimeout(() => {
        if (recogRef.current) {
          try {
            recogRef.current.stop();
          } catch (e) {
          }
        }
      }, 300);
    };
    const startLesson = async () => {
      var _a2;
      if (!confirmed) return;
      setMsgs([]);
      historyRef.current = [];
      setVocab([]);
      setFeedback(null);
      setShowFeedback(false);
      setLessonOn(true);
      setLessonDone(false);
      setLoading(true);
      setError(null);
      setTurns(0);
      setShowEndConfirm(false);
      setShowSetup(false);
      try {
        const openingPrompt = `Inizia la lezione sull'argomento "${topic}" per uno studente di livello ${level}. Presentati brevemente come insegnante e fai una prima domanda sull'argomento per avviare la conversazione. Poich\xE9 lo studente non ha ancora parlato, had_error deve essere false e correction_details deve essere null.`;
        const result = await callGemini(openingPrompt, sysPrompt(level, topic));
        const msg = {
          id: Date.now(),
          role: "teacher",
          text: result.teacher_reply,
          correction: null
        };
        setMsgs([msg]);
        historyRef.current.push({ role: "teacher", text: result.teacher_reply });
        if ((_a2 = result.vocabulary_words) == null ? void 0 : _a2.length) setVocab(result.vocabulary_words);
        speak(result.teacher_reply, msg.id);
      } catch (err) {
        setError(err.title ? err : parseError(err.message || String(err)));
        setLessonOn(false);
      } finally {
        setLoading(false);
      }
    };
    const endLesson = async () => {
      setShowEndConfirm(false);
      if (msgs.length < 2) {
        setLessonOn(false);
        setLessonDone(true);
        return;
      }
      setLoading(true);
      stopSpeaking();
      try {
        const result = await callGemini(feedbackPrompt(historyRef.current, level), null);
        setFeedback(result);
        setShowFeedback(true);
        setLessonOn(false);
        setLessonDone(true);
      } catch (err) {
        setError(err.title ? err : parseError(err.message || String(err)));
        setLessonOn(false);
        setLessonDone(true);
      } finally {
        setLoading(false);
      }
    };
    const resetLesson = () => {
      setMsgs([]);
      historyRef.current = [];
      setLessonOn(false);
      setLessonDone(false);
      setFeedback(null);
      setShowFeedback(false);
      setTurns(0);
      setError(null);
      setShowEndConfirm(false);
      stopSpeaking();
    };
    const getSuggestions = async () => {
      var _a2;
      if (!confirmed || !lessonOn) return;
      setLoading(true);
      try {
        const lastTeacher = ((_a2 = historyRef.current.filter((m) => m.role === "teacher").pop()) == null ? void 0 : _a2.text) || topic;
        const prompt = `Lo studente di livello ${level} \xE8 bloccato e non sa cosa rispondere. L'ultimo messaggio dell'insegnante era: "${lastTeacher}". L'argomento \xE8 "${topic}".
Genera 3 possibili risposte in italiano che lo studente potrebbe dare, adatte al livello ${level}.
Rispondi SOLO con JSON valido: {"suggestions":["risposta 1","risposta 2","risposta 3"]}`;
        const result = await callGemini(prompt, null);
        setSuggestions(result.suggestions || []);
        setShowSugs(true);
      } catch (err) {
        setError(err.title ? err : parseError(err.message || String(err)));
      } finally {
        setLoading(false);
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "app-shell" }, /* @__PURE__ */ React.createElement("header", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-left" }, /* @__PURE__ */ React.createElement("div", { className: "header-icon" }, "\u{1F1EE}\u{1F1F9}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "header-title" }, "Parla Italiano"), /* @__PURE__ */ React.createElement("div", { className: "header-sub" }, "Insegnante Virtuale"))), /* @__PURE__ */ React.createElement("div", { className: "header-right" }, lessonOn && /* @__PURE__ */ React.createElement("div", { className: "turn-badge" }, "\u{1F4AC} ", turns), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `vocab-btn ${showVocab ? "open" : "closed"}`,
        onClick: () => setShowVocab(!showVocab)
      },
      "\u{1F4DA}",
      vocab.length > 0 && /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "vocab-count-header",
          style: {
            background: showVocab ? "#FF6B35" : "white",
            color: showVocab ? "white" : "#FF6B35"
          }
        },
        vocab.length
      )
    ), confirmed && /* @__PURE__ */ React.createElement("div", { className: "api-badge" }, "\u2713"))), /* @__PURE__ */ React.createElement("div", { className: "body-wrap" }, !confirmed && /* @__PURE__ */ React.createElement("div", { className: "api-card" }, /* @__PURE__ */ React.createElement("div", { className: "api-card-head" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F511}"), /* @__PURE__ */ React.createElement("h3", null, "Chiave API Gemini")), /* @__PURE__ */ React.createElement("p", null, "Inserisci la tua chiave gratuita da", " ", /* @__PURE__ */ React.createElement("a", { href: "https://aistudio.google.com/apikey", target: "_blank", rel: "noopener" }, "Google AI Studio"), ". Resta nel browser \u2014 non viene inviata da nessuna parte."), /* @__PURE__ */ React.createElement("div", { className: "api-row", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "api-input",
        type: "password",
        value: apiKey,
        onChange: (e) => setApiKey(e.target.value),
        placeholder: "AIza...",
        onKeyDown: (e) => {
          if (e.key === "Enter" && apiKey.length > 10) setConfirmed(true);
        }
      }
    ), /* @__PURE__ */ React.createElement(
      Btn,
      {
        color: "#FF6B35",
        dk: "#E55A28",
        onClick: () => {
          if (apiKey.length > 10) setConfirmed(true);
        },
        disabled: apiKey.length <= 10
      },
      "Vai!"
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, fontWeight: 800, color: "#8E8E93", whiteSpace: "nowrap" } }, "Modello:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "setup-select",
        value: model,
        onChange: (e) => setModel(e.target.value),
        style: { fontSize: 12, padding: "6px 8px", flex: 1 }
      },
      GEMINI_MODELS.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.id }, m.label, " (", m.id, ")"))
    ))), confirmed && /* @__PURE__ */ React.createElement("div", { className: "controls-bar" }, /* @__PURE__ */ React.createElement("div", { className: "controls-row" }, !lessonOn && !lessonDone && /* @__PURE__ */ React.createElement("button", { className: "settings-toggle", onClick: () => setShowSetup(!showSetup) }, "\u2699\uFE0F ", showSetup ? "Nascondi" : "Livello"), /* @__PURE__ */ React.createElement(
      Btn,
      {
        color: speechRate === 1 ? "#FAFAFA" : "#FECA57",
        dk: speechRate === 1 ? "#E5E5EA" : "#E5B44E",
        tc: speechRate === 1 ? "#2D2D2D" : "#7A5E00",
        small: true,
        onClick: () => setSpeechRate(speechRate === 1 ? 0.7 : 1)
      },
      speechRate === 1 ? "\u{1F407} Normale" : "\u{1F422} Lento"
    ), /* @__PURE__ */ React.createElement("div", { className: "controls-right" }, !lessonOn && !lessonDone && /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B35", dk: "#E55A28", small: true, onClick: startLesson, disabled: loading }, "\u{1F3AC} Inizia"), lessonOn && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { color: "#7C5CFC", dk: "#6344E0", small: true, onClick: stopSpeaking }, "\u23F8\uFE0F"), /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B6B", dk: "#E55555", small: true, onClick: () => setShowEndConfirm(true), disabled: loading }, "\u{1F3C1} Termina")), lessonDone && /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B35", dk: "#E55A28", small: true, onClick: resetLesson }, "\u{1F504} Nuova"))), showSetup && !lessonOn && !lessonDone && /* @__PURE__ */ React.createElement("div", { className: "setup-panel" }, /* @__PURE__ */ React.createElement("div", { className: "setup-field level" }, /* @__PURE__ */ React.createElement("label", { className: "setup-label" }, "Livello"), /* @__PURE__ */ React.createElement("select", { className: "setup-select", value: level, onChange: (e) => setLevel(e.target.value) }, Object.keys(TOPICS).map((l) => /* @__PURE__ */ React.createElement("option", { key: l, value: l }, EMJ[l], " ", l, " \u2014 ", LBL[l])))), /* @__PURE__ */ React.createElement("div", { className: "setup-field topic" }, /* @__PURE__ */ React.createElement("label", { className: "setup-label" }, "Argomento"), /* @__PURE__ */ React.createElement("select", { className: "setup-select topic-select", value: topic, onChange: (e) => setTopic(e.target.value) }, TOPICS[level].map((t) => /* @__PURE__ */ React.createElement("option", { key: t, value: t }, t)))))), showEndConfirm && /* @__PURE__ */ React.createElement("div", { className: "end-confirm" }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 28 } }, "\u{1F3C1}"), /* @__PURE__ */ React.createElement("p", null, "Terminare la lezione e ricevere la valutazione?"), /* @__PURE__ */ React.createElement("div", { className: "end-confirm-btns" }, /* @__PURE__ */ React.createElement(Btn, { color: "#E5E5EA", dk: "#D1D1D6", tc: "#2D2D2D", small: true, onClick: () => setShowEndConfirm(false) }, "Continua"), /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B6B", dk: "#E55555", small: true, onClick: endLesson }, "S\xEC, Termina"))), /* @__PURE__ */ React.createElement("div", { className: "chat-scroll" }, msgs.length === 0 && !loading && /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { className: "empty-emoji" }, "\u{1F393}"), /* @__PURE__ */ React.createElement("p", { className: "empty-title" }, confirmed ? "Pronto per imparare? \u{1F680}" : "Inserisci la chiave API per iniziare"), confirmed && /* @__PURE__ */ React.createElement("p", { className: "empty-sub" }, "Scegli livello e argomento, poi premi Inizia")), msgs.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: `msg-row ${m.role}` }, m.role === "teacher" && /* @__PURE__ */ React.createElement("div", { className: "avatar teacher" }, "\u{1F469}\u200D\u{1F3EB}"), /* @__PURE__ */ React.createElement("div", { className: "msg-wrap" }, /* @__PURE__ */ React.createElement("div", { className: `bubble ${m.role}` }, speakingId === m.id && /* @__PURE__ */ React.createElement("div", { className: "wave-bars" }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: `wave-bar ${m.role}`,
        style: { animation: `waveBar .5s ${i * 0.08}s ease-in-out infinite` }
      }
    ))), m.text, m.role === "teacher" && /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => speak(m.text, m.id),
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          marginTop: 6,
          padding: "3px 8px",
          borderRadius: 8,
          border: "1.5px solid #E5E5EA",
          background: "#FAFAFA",
          fontSize: 11,
          fontWeight: 700,
          color: "#7C5CFC",
          cursor: "pointer",
          fontFamily: "inherit"
        }
      },
      "\u{1F50A} Riascolta"
    )), m.correction && /* @__PURE__ */ React.createElement("div", { className: "correction" }, /* @__PURE__ */ React.createElement("div", { className: "correction-title" }, "\u270F\uFE0F Correzione"), /* @__PURE__ */ React.createElement("div", { className: "correction-compare" }, /* @__PURE__ */ React.createElement("div", { className: "correction-col" }, /* @__PURE__ */ React.createElement("div", { className: "correction-label wrong" }, "Hai detto"), /* @__PURE__ */ React.createElement("div", { className: "correction-box wrong" }, m.correction.original)), /* @__PURE__ */ React.createElement("div", { className: "correction-col" }, /* @__PURE__ */ React.createElement("div", { className: "correction-label right" }, "Corretto"), /* @__PURE__ */ React.createElement("div", { className: "correction-box right" }, m.correction.corrected))), /* @__PURE__ */ React.createElement("div", { className: "correction-tip" }, "\u{1F4A1} ", m.correction.explanation))), m.role === "student" && /* @__PURE__ */ React.createElement("div", { className: "avatar student" }, "\u{1F9D1}\u200D\u{1F393}"))), showSugs && suggestions.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "sugs-card" }, /* @__PURE__ */ React.createElement("div", { className: "sugs-title" }, "\u{1F4A1} Suggerimenti"), suggestions.map((s, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: "sug-btn",
        onClick: () => {
          handleUserMessage(s);
          setShowSugs(false);
        }
      },
      s
    ))), interim && /* @__PURE__ */ React.createElement("div", { className: "interim-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "interim-bubble" }, interim, "...")), loading && /* @__PURE__ */ React.createElement("div", { className: "loading-row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar teacher" }, "\u{1F469}\u200D\u{1F3EB}"), /* @__PURE__ */ React.createElement("div", { className: "loading-bubble" }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: "loading-dot",
        style: { animation: `dotPulse .8s ${i * 0.2}s ease-in-out infinite` }
      }
    )))), error && /* @__PURE__ */ React.createElement("div", { className: `err-card ${error.isRate ? "rate" : "generic"}` }, /* @__PURE__ */ React.createElement("div", { className: "err-head" }, /* @__PURE__ */ React.createElement("span", { className: "err-title" }, error.title), /* @__PURE__ */ React.createElement("button", { className: "err-close", onClick: () => setError(null) }, "\u2715")), /* @__PURE__ */ React.createElement("p", { className: "err-msg" }, error.message), error.isRate && /* @__PURE__ */ React.createElement("div", { className: "err-actions" }, /* @__PURE__ */ React.createElement(
      Btn,
      {
        color: "#FECA57",
        dk: "#E5B44E",
        tc: "#7A5E00",
        small: true,
        onClick: () => window.open("https://aistudio.google.com/apikey", "_blank")
      },
      "Controlla Quota"
    ), /* @__PURE__ */ React.createElement(Btn, { color: "#E5E5EA", dk: "#D1D1D6", tc: "#2D2D2D", small: true, onClick: () => setError(null) }, "Chiudi"))), /* @__PURE__ */ React.createElement("div", { ref: chatEndRef })), lessonOn && !showEndConfirm && /* @__PURE__ */ React.createElement("div", { className: "bottom-bar" }, /* @__PURE__ */ React.createElement(Btn, { color: "white", dk: "#E5E5EA", tc: "#7C5CFC", small: true, onClick: getSuggestions, disabled: loading }, "\u2728 Bloccato"), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `mic-btn ${listening ? "active" : "idle"}`,
        onMouseDown: startListening,
        onMouseUp: stopListening,
        onTouchStart: (e) => {
          e.preventDefault();
          startListening();
        },
        onTouchEnd: stopListening,
        disabled: loading || speaking
      },
      listening && /* @__PURE__ */ React.createElement("div", { className: "mic-ring" }),
      /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2.5" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" }), /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 10v2a7 7 0 01-14 0v-2" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "19", x2: "12", y2: "23" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "23", x2: "16", y2: "23" }))
    ), /* @__PURE__ */ React.createElement(Btn, { color: "white", dk: "#E5E5EA", tc: "#FF6B6B", small: true, onClick: () => setShowEndConfirm(true), disabled: loading }, "\u{1F3C1} Fine"), /* @__PURE__ */ React.createElement("div", { className: "mic-hint" }, listening ? "\u{1F534} Sto ascoltando..." : "Tieni premuto per parlare")), lessonDone && !showFeedback && /* @__PURE__ */ React.createElement("div", { className: "done-banner" }, /* @__PURE__ */ React.createElement("p", { style: { fontSize: 26, marginBottom: 4 } }, "\u{1F389}"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, fontWeight: 800, marginBottom: 8 } }, "Lezione completata!"), /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B35", dk: "#E55A28", onClick: resetLesson }, "\u{1F504} Nuova Lezione")), showVocab && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "vocab-overlay", onClick: () => setShowVocab(false) }), /* @__PURE__ */ React.createElement("aside", { className: "vocab-panel" }, /* @__PURE__ */ React.createElement("div", { className: "vocab-header" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4DA} Vocaboli"), /* @__PURE__ */ React.createElement("button", { className: "vocab-close", onClick: () => setShowVocab(false) }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "vocab-list" }, vocab.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "vocab-empty" }, "Le parole appariranno qui \u{1F4D6}") : vocab.map((w, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `vocab-word ${w.startsWith("\u2713") ? "corrected" : "normal"}` }, w))))), showFeedback && feedback && /* @__PURE__ */ React.createElement("div", { className: "fb-overlay" }, /* @__PURE__ */ React.createElement("div", { className: "fb-card" }, /* @__PURE__ */ React.createElement("div", { className: "fb-header" }, /* @__PURE__ */ React.createElement("div", { className: "fb-emoji" }, "\u{1F3C6}"), /* @__PURE__ */ React.createElement("h2", { className: "fb-title" }, "La Tua Valutazione"), /* @__PURE__ */ React.createElement("p", { className: "fb-sub" }, level, " \u2014 ", topic)), /* @__PURE__ */ React.createElement("div", { className: "fb-rings" }, /* @__PURE__ */ React.createElement(ScoreRing, { score: feedback.grammar_score, label: "Grammatica", color: "#FF6B35" }), /* @__PURE__ */ React.createElement(ScoreRing, { score: feedback.vocabulary_score, label: "Vocabolario", color: "#7C5CFC" }), /* @__PURE__ */ React.createElement(ScoreRing, { score: feedback.fluency_score, label: "Fluidit\xE0", color: "#00D2D3" }), /* @__PURE__ */ React.createElement(ScoreRing, { score: feedback.overall_score, label: "Totale", color: "#FF6B6B" })), feedback.summary && /* @__PURE__ */ React.createElement("p", { className: "fb-summary" }, feedback.summary), ((_a = feedback.strengths) == null ? void 0 : _a.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "fb-section" }, /* @__PURE__ */ React.createElement("h4", { className: "fb-section-title strengths" }, "\u2705 Punti di Forza"), feedback.strengths.map((s, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "fb-item" }, "\u2022 ", s))), ((_b = feedback.improvements) == null ? void 0 : _b.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "fb-section", style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("h4", { className: "fb-section-title improvements" }, "\u{1F4C8} Da Migliorare"), feedback.improvements.map((s, i) => /* @__PURE__ */ React.createElement("p", { key: i, className: "fb-item" }, "\u2022 ", s))), /* @__PURE__ */ React.createElement(Btn, { color: "#FF6B35", dk: "#E55A28", onClick: () => setShowFeedback(false), full: true }, "Chiudi Valutazione")))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );
})();
