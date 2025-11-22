// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Heart, 
  Brain, 
  Wallet, 
  Trophy, 
  Activity, 
  ShieldAlert, 
  Gamepad2, 
  Settings, 
  Check, 
  X, 
  RefreshCw, 
  Smile, 
  Clock,
  ChevronRight,
  Leaf,
  Droplets,
  Flame,
  AlertTriangle,
  Share2,
  Copy,
  TrendingUp,
  Star,
  Zap,
  Info 
} from 'lucide-react';

// --- UTILIDADES: ALMACENAMIENTO SEGURO Y PORTAPAPELES ---

const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("LocalStorage access denied, using memory fallback");
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("LocalStorage write denied");
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("LocalStorage remove denied");
    }
  }
};

const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(successful);
  } catch (err) {
    return Promise.resolve(false);
  }
};

// --- MOTOR DE DATOS Y CONTENIDO ---

const MILESTONES = {
  0: { title: "El comienzo", body: "A los 20 min: Tu presión arterial y pulso bajan a la normalidad. Tus manos y pies recuperan temperatura.", icon: Clock },
  1: { title: "Oxigenación", body: "A las 8-12 horas: Los niveles de monóxido de carbono en sangre bajan a la normalidad. El oxígeno sube.", icon: Wind },
  2: { title: "Sentidos despiertos", body: "48 horas: Se elimina el CO del cuerpo. El olfato y el gusto comienzan a normalizarse. Las terminaciones nerviosas se regeneran.", icon: Smile },
  3: { title: "El Pico", body: "72 horas: La nicotina se agota. Es el pico de abstinencia física, pero tus bronquios se relajan y respiras mejor.", icon: Flame },
  5: { title: "Limpieza profunda", body: "Días 5-8: Puede haber tos. Es señal de que tus pulmones están recuperando vitalidad y limpiando mucosidad.", icon: Droplets },
  14: { title: "Circulación", body: "2 Semanas: La circulación mejora significativamente. La función pulmonar aumenta. Caminar se vuelve más fácil.", icon: Activity },
  30: { title: "Corazón fuerte", body: "1 Mes: El riesgo de ataque cardíaco comienza a disminuir. Los cilios pulmonares empiezan a regenerarse.", icon: Heart },
  90: { title: "Estabilidad", body: "3 Meses: Función pulmonar aumenta hasta un 10%. La ansiedad y el estrés se reducen drásticamente al romperse el ciclo.", icon: Brain },
  180: { title: "Mantenimiento", body: "6 Meses: Eres más capaz de afrontar el estrés sin fumar. La congestión y fatiga han mejorado notablemente.", icon: ShieldAlert },
  270: { title: "Consolidación", body: "9 Meses: Los cilios han crecido, protegiéndote de infecciones. Tu energía general es mucho mayor.", icon: Trophy },
  365: { title: "LIBERTAD", body: "1 AÑO: ¡El Gran Hito! Tu riesgo de enfermedad coronaria es la mitad que el de un fumador. Has ahorrado una fortuna y ganado vida.", icon: Trophy },
};

const DAILY_CONTENT = [
  "La ansiedad es parte del proceso, pero puedes superarla. Es temporal.",
  "Cada día sin fumar hace que dejarlo sea más fácil.",
  "Tus pulmones te agradecen cada bocanada de aire limpio.",
  "El deseo es como una ola: sube, rompe y baja. Solo espera a que baje.",
  "Estás ahorrando dinero para algo especial. ¿Qué te comprarás?",
  "Tu ropa y tu cabello ya huelen a limpio, no a humo.",
  "Bebe agua helada. Ayuda a calmar la ansiedad oral.",
  "La nicotina es un estimulante, no un relajante. Fumar aumentaba tu estrés.",
  "Hoy eres más fuerte que ayer.",
  "Respira profundo. Siente cómo se expande tu pecho sin dolor.",
  "Estás recuperando el control de tu vida.",
  "Evita la 'Fantasía de Control'. No existe 'solo uno'.",
  "Tu piel se ve más luminosa y hidratada.",
  "Tus dientes y encías están sanando.",
  "Camina 10 minutos. El movimiento reduce el antojo.",
  "Mastica una zanahoria o chicle sin azúcar para la fijación oral.",
  "Felicítate. Lo que estás haciendo es increíblemente difícil y valioso.",
  "Identifica si tienes hambre, enojo, soledad o cansancio (HALT).",
  "Hoy tus células se están oxigenando mejor.",
  "Proteges a tu familia del humo de segunda mano."
];

const SOS_TIPS = [
  { title: "Técnica 4-7-8", text: "Inhala en 4s, retén 7s, exhala en 8s. Calma el sistema nervioso al instante." },
  { title: "Agua Helada", text: "Bebe un vaso de agua muy fría a sorbos pequeños. Cambia la sensación física." },
  { title: "Distracción DEADS", text: "D: Delay (Retrasa 10 min). E: Escape (Sal de la situación). A: Avoid (Evita). D: Distract (Distráete). S: Substitute (Sustituye)." },
  { title: "Cambio de Escenario", text: "Levántate y ve a otra habitación o sal afuera (sin fumar). Rompe el patrón." },
  { title: "Grounding 5-4-3-2-1", text: "Mira 5 cosas, toca 4, escucha 3, huele 2, saborea 1. Vuelve al presente." }
];

// --- COMPONENTES UI ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-lg border border-white/40 shadow-lg rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "" }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-200",
    secondary: "bg-white text-teal-700 hover:bg-teal-50 border border-teal-100",
    danger: "bg-rose-400 text-white hover:bg-rose-500",
    ghost: "bg-transparent shadow-none text-slate-600 hover:bg-white/50"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
};

// --- MINI JUEGOS ---

const BreathingGame = () => {
  const [phase, setPhase] = useState('inhale');
  const [text, setText] = useState('Inhala');
  
  useEffect(() => {
    const breatheCycle = () => {
      setPhase('inhale'); setText('Inhala (4s)');
      setTimeout(() => {
        setPhase('hold'); setText('Retén (7s)');
        setTimeout(() => {
          setPhase('exhale'); setText('Exhala (8s)');
          setTimeout(breatheCycle, 8000);
        }, 7000);
      }, 4000);
    };
    breatheCycle();
    return () => {};
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className={`relative flex items-center justify-center transition-all duration-[4000ms] ease-in-out
        ${phase === 'inhale' ? 'w-48 h-48 bg-teal-400/40' : phase === 'hold' ? 'w-48 h-48 bg-teal-500/60' : 'w-16 h-16 bg-teal-200/30'}
        rounded-full backdrop-blur-sm border-2 border-white/50 shadow-[0_0_40px_rgba(45,212,191,0.3)]`}
      >
        <span className="text-teal-900 font-bold text-lg z-10 transition-opacity duration-500">{text}</span>
      </div>
      <p className="mt-6 text-slate-600 text-sm">Sigue el ritmo para calmar tu ansiedad.</p>
    </div>
  );
};

const BubbleWrapGame = () => {
  const [bubbles, setBubbles] = useState(Array(25).fill(false));

  const popBubble = (index) => {
    if (!bubbles[index]) {
      const newBubbles = [...bubbles];
      newBubbles[index] = true;
      setBubbles(newBubbles);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(50); } catch(e) {}
      }
    }
  };

  const reset = () => setBubbles(Array(25).fill(false));

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-5 gap-3 p-4 bg-teal-900/5 rounded-2xl">
        {bubbles.map((popped, i) => (
          <button
            key={i}
            onClick={() => popBubble(i)}
            className={`w-10 h-10 rounded-full shadow-inner transition-all duration-200 border border-teal-200
              ${popped ? 'bg-teal-100 scale-90 shadow-none' : 'bg-teal-400 hover:bg-teal-300 scale-100 shadow-lg cursor-pointer'}`}
          />
        ))}
      </div>
      <Button onClick={reset} variant="secondary" className="mt-4 text-sm py-2">
        <RefreshCw size={16} /> Reiniciar Plástico
      </Button>
    </div>
  );
};

const MemoryGame = () => {
  const ICONS = [Wind, Heart, Brain, Wallet, Trophy, Smile];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const duplicated = [...ICONS, ...ICONS];
    const shuffled = duplicated.sort(() => Math.random() - 0.5).map((icon, id) => ({ id, icon }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
  };

  const handleChoice = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setSolved([...solved, first, second]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => handleChoice(index)}
              className={`w-14 h-14 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-500 transform ${isFlipped ? 'rotate-y-180 bg-white border-teal-400 border-2' : 'bg-teal-500'}`}
            >
              {isFlipped ? <Icon className="text-teal-600 w-6 h-6" /> : <div className="text-white font-bold">?</div>}
            </div>
          );
        })}
      </div>
      {solved.length === cards.length && cards.length > 0 && (
         <p className="mt-4 text-teal-700 font-bold animate-bounce">¡Completado! 🎉</p>
      )}
      <Button onClick={shuffleCards} variant="secondary" className="mt-4 text-sm py-2">
        <RefreshCw size={16} /> Reiniciar
      </Button>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function QuitApp() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [userData, setUserData] = useState(null);
  const [now, setNow] = useState(new Date());
  const [showResetModal, setShowResetModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  useEffect(() => {
    const savedData = safeStorage.getItem('quitAppData');
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch(e) {
        console.error("Data corrupt", e);
      }
    }
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStats = () => {
    if (!userData) return {};
    const quitDate = new Date(userData.quitDate);
    const diffMs = now - quitDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
    
    const cigsNotSmoked = (diffMs / (1000 * 60 * 60 * 24)) * userData.cigsPerDay;
    const moneySaved = (cigsNotSmoked / 20) * userData.costPerPack;
    
    const yearProgress = Math.min((diffDays / 365) * 100, 100);

    return { diffDays, diffHrs, diffMins, cigsNotSmoked, moneySaved, yearProgress };
  };

  // --- LÓGICA DE SALUD PREDICTIVA ---
  const getNextBenefit = (currentDay) => {
    const nextDay = currentDay + 1;
    
    if (MILESTONES[nextDay]) {
      return { 
        isMilestone: true, 
        title: MILESTONES[nextDay].title, 
        body: MILESTONES[nextDay].body,
        day: nextDay,
        icon: Zap
      };
    }

    let benefit = { type: "General", text: "Tu cuerpo sigue sanando y desintoxicándose a nivel celular." };

    if (nextDay === 1) benefit = { type: "Cardiovascular", text: "Mañana, tu riesgo de ataque al corazón ya habrá comenzado a disminuir." };
    else if (nextDay === 2) benefit = { type: "Sensorial", text: "Mañana, tus terminaciones nerviosas empezarán a regenerarse. Recuperarás olfato y gusto." };
    else if (nextDay === 3) benefit = { type: "Respiratorio", text: "Mañana, tus bronquios se relajarán. Respirar será más fácil y tendrás más energía." };
    else if (nextDay === 4) benefit = { type: "Mental", text: "Mañana superarás el pico de abstinencia. La ansiedad física empezará a bajar." };
    else if (nextDay <= 7) benefit = { type: "Pulmonar", text: "Mañana, tus pulmones continuarán su limpieza profunda de mucosidad acumulada." };
    else if (nextDay <= 14) benefit = { type: "Circulatorio", text: "Mañana, tu circulación sanguínea habrá mejorado, oxigenando mejor tus encías y piel." };
    else if (nextDay <= 21) benefit = { type: "Mental", text: "Mañana estarás libre de dependencia física. El reto será solo mental." };
    else if (nextDay <= 30) benefit = { type: "Inmunológico", text: "Mañana, tus cilios pulmonares habrán crecido más, protegiéndote mejor de infecciones." };
    else if (nextDay <= 60) benefit = { type: "Vitalidad", text: "Mañana, tu suministro de oxígeno al cerebro será óptimo, reduciendo la fatiga." };
    else if (nextDay <= 90) benefit = { type: "Físico", text: "Mañana, tu función pulmonar podría ser hasta un 10% mejor que cuando empezaste." };
    else if (nextDay <= 180) benefit = { type: "Emocional", text: "Mañana notarás que manejas el estrés mucho mejor sin la necesidad química de nicotina." };
    else benefit = { type: "Salud Integral", text: "Mañana, tu riesgo de enfermedades crónicas será menor que hoy." };

    return { 
      isMilestone: false, 
      title: `Beneficio ${benefit.type}`, 
      body: benefit.text,
      day: nextDay,
      icon: TrendingUp
    };
  };

  const stats = getStats();
  const nextBenefit = userData ? getNextBenefit(stats.diffDays) : null;

  const handleSaveSetup = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      quitDate: new Date().toISOString(), 
      cigsPerDay: Number(formData.get('cigs')),
      costPerPack: Number(formData.get('cost'))
    };
    
    const dateInput = formData.get('date');
    if (dateInput) data.quitDate = new Date(dateInput).toISOString();

    safeStorage.setItem('quitAppData', JSON.stringify(data));
    setUserData(data);
  };

  const confirmReset = () => {
    safeStorage.removeItem('quitAppData');
    setUserData(null);
    setActiveTab('dashboard');
    setShowResetModal(false);
  };

  const handleShare = async () => {
    const text = `¡He recuperado mi libertad! 🍃\n\nLlevo ${stats.diffDays} días, ${stats.diffHrs} horas sin fumar.\nHe evitado ${stats.cigsNotSmoked.toFixed(0)} cigarrillos y ahorrado $${stats.moneySaved.toFixed(0)}.\n\n#AirePuro #SinHumo`;
    setShareText(text);

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi progreso', text: text });
        return;
      } catch (err) {
        console.log('Share API failed/cancelled, trying clipboard');
      }
    }

    const success = await copyToClipboard(text);
    if (success) {
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 3000);
    } else {
      setShowShareModal(true);
    }
  };

  // --- VIEWS ---

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <Card className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-teal-600 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-teal-800">Tu Santuario</h1>
            <p className="text-slate-500">Comienza tu viaje hacia una vida libre de humo.</p>
          </div>
          <form onSubmit={handleSaveSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cigarrillos por día</label>
              <input required name="cigs" type="number" className="w-full p-3 rounded-xl bg-white/50 border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Ej. 15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Costo por cajetilla</label>
              <input required name="cost" type="number" step="0.01" className="w-full p-3 rounded-xl bg-white/50 border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Ej. 120" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha de último cigarrillo</label>
              <input required name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} className="w-full p-3 rounded-xl bg-white/50 border border-teal-200 focus:ring-2 focus:ring-teal-400 outline-none" />
            </div>
            <Button className="w-full">Comenzar Nueva Vida</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 font-sans text-slate-800 pb-24 md:pb-0 md:pt-0 selection:bg-teal-200">
      
      {/* HEADER */}
      <div className="hidden md:flex justify-between items-center p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
          <Leaf className="text-teal-500" /> Aire Puro
        </h1>
        <div className="flex gap-4">
           {['dashboard', 'journey', 'sos', 'games'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-teal-600 text-white' : 'text-teal-700 hover:bg-white/50'}`}
             >
               {tab === 'journey' ? 'Mi Viaje' : tab}
             </button>
           ))}
           <button onClick={() => setActiveTab('settings')} className="p-2 text-teal-700 hover:bg-white/50 rounded-lg"><Settings size={20}/></button>
        </div>
      </div>

      {/* CONTENT */}
      <main className="p-4 max-w-md mx-auto md:max-w-2xl pt-8 md:pt-4">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-200">
                <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${stats.yearProgress}%` }}></div>
              </div>
              <div className="absolute top-4 right-4 z-10">
                 <button 
                    onClick={handleShare} 
                    className="p-2 bg-white/80 hover:bg-white text-teal-700 rounded-full transition-colors shadow-sm flex items-center gap-1" 
                    title="Compartir logro"
                 >
                    <Share2 size={18} />
                 </button>
              </div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Tiempo Libre de Humo</p>
              <div className="flex justify-center items-baseline gap-2 text-teal-800">
                <span className="text-6xl font-bold tracking-tight">{stats.diffDays}</span>
                <span className="text-xl font-medium">días</span>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-slate-600 text-sm">
                <span>{stats.diffHrs} hrs</span>
                <span>{stats.diffMins} min</span>
              </div>
            </Card>

            {/* --- TARJETA DE BENEFICIO DE MAÑANA --- */}
            {nextBenefit && (
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100 rounded-full opacity-50 blur-xl"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                   <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500 mt-1 ring-1 ring-emerald-100">
                      {React.createElement(nextBenefit.icon, { size: 24 })}
                   </div>
                   <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1 flex items-center gap-1">
                        Tu próxima victoria <span className="opacity-60">• Día {nextBenefit.day}</span>
                      </h3>
                      <p className="font-bold text-slate-800 text-lg leading-tight mb-2">
                        {nextBenefit.title}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {nextBenefit.body}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                         <Star size={12} fill="currentColor" className="text-emerald-500"/> 
                         ¡Solo aguanta 24 horas más!
                      </div>
                   </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card className="flex flex-col items-center justify-center p-4">
                <Wallet className="text-teal-500 mb-2 w-8 h-8" />
                <span className="text-2xl font-bold text-slate-700">${stats.moneySaved.toFixed(0)}</span>
                <span className="text-xs text-slate-500">Ahorrados</span>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4">
                <Wind className="text-cyan-500 mb-2 w-8 h-8" />
                <span className="text-2xl font-bold text-slate-700">{stats.cigsNotSmoked.toFixed(0)}</span>
                <span className="text-xs text-slate-500">No fumados</span>
              </Card>
            </div>

            <Card>
              <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                <Activity size={18}/> Salud Pulmonar
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Monóxido de Carbono eliminado</span>
                    <span className="font-bold text-teal-600">{Math.min(stats.diffDays * 30, 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(stats.diffDays * 30, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 items-center">
                    <span>Recuperación Cardíaca</span>
                    <span className="font-bold text-teal-600">{stats.yearProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full" style={{ width: `${stats.yearProgress}%` }}></div>
                  </div>
                  <div className="mt-1 flex items-start gap-1 text-[10px] text-slate-500">
                    <Info size={12} className="mt-0.5 shrink-0" />
                    <span>Progreso hacia el año sin fumar, cuando el riesgo cardíaco cae al 50%.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-teal-50 rounded-xl text-sm text-teal-800 italic border border-teal-100 flex gap-2">
                <span className="font-bold not-italic text-teal-600 shrink-0">Día {stats.diffDays}:</span>
                "{DAILY_CONTENT[stats.diffDays % DAILY_CONTENT.length]}"
              </div>
            </Card>
          </div>
        )}

        {/* JOURNEY */}
        {activeTab === 'journey' && (
          <div className="space-y-4 animate-fade-in pb-20">
            <h2 className="text-xl font-bold text-teal-800 mb-4">Tu Camino de Recuperación</h2>
            {Array.from({ length: 15 }).map((_, i) => {
              const dayNum = Math.max(0, stats.diffDays - 2) + i;
              const isUnlocked = dayNum <= stats.diffDays;
              const milestone = MILESTONES[dayNum];
              
              if (milestone) {
                const Icon = milestone.icon;
                return (
                  <Card key={dayNum} className={`transform transition-all ${isUnlocked ? 'border-teal-400/50' : 'opacity-60 grayscale'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${isUnlocked ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-slate-800">{milestone.title}</h3>
                          {isUnlocked && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-bold">Día {dayNum}</span>}
                        </div>
                        <p className="text-sm text-slate-600">{milestone.body}</p>
                      </div>
                    </div>
                  </Card>
                );
              }

              return (
                <div key={dayNum} className={`p-4 rounded-2xl border ${dayNum === stats.diffDays ? 'bg-white border-teal-400 shadow-md' : 'bg-white/40 border-white/20'} flex items-center justify-between`}>
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isUnlocked ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                       {dayNum}
                     </div>
                     <p className={`text-sm ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                       {isUnlocked ? DAILY_CONTENT[dayNum % DAILY_CONTENT.length] : "Sigue adelante para desbloquear este día."}
                     </p>
                   </div>
                   {isUnlocked && <Check size={16} className="text-teal-500" />}
                </div>
              );
            })}
          </div>
        )}

        {/* SOS */}
        {activeTab === 'sos' && (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center mb-4">
               <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-2" />
               <h2 className="text-2xl font-bold text-slate-700">Botiquín Anti-Ansiedad</h2>
               <p className="text-slate-500 text-sm">Estrategias rápidas para momentos difíciles.</p>
             </div>
             <div className="space-y-4">
               {SOS_TIPS.map((tip, idx) => (
                 <details key={idx} className="group bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-sm cursor-pointer">
                   <summary className="p-4 font-semibold text-slate-700 flex justify-between items-center list-none group-hover:bg-white/50 transition-colors">
                     {tip.title}
                     <ChevronRight className="text-teal-400 transform group-open:rotate-90 transition-transform" />
                   </summary>
                   <div className="px-4 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-2">
                     {tip.text}
                   </div>
                 </details>
               ))}
             </div>
             <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100">
               <h3 className="font-bold text-rose-800 mb-2">¿A punto de recaer?</h3>
               <p className="text-sm text-rose-700 mb-4">Recuerda la regla de los 10 minutos: espera 10 minutos antes de ceder. El antojo suele pasar en menos de 5.</p>
               <Button onClick={() => setActiveTab('games')} variant="primary" className="w-full bg-rose-400 hover:bg-rose-500 border-none shadow-none">
                 Ir a Zona de Distracción
               </Button>
             </Card>
          </div>
        )}

        {/* GAMES */}
        {activeTab === 'games' && (
          <div className="space-y-6 animate-fade-in pb-20">
            <h2 className="text-xl font-bold text-teal-800 mb-4 text-center">Zona Zen & Distracción</h2>
            <div className="space-y-8">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="text-teal-500" />
                  <h3 className="font-bold text-slate-700">Respiración 4-7-8</h3>
                </div>
                <BreathingGame />
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-6 h-6 rounded-full border-2 border-teal-500"></div>
                   <h3 className="font-bold text-slate-700">Bubble Wrap Virtual</h3>
                </div>
                <BubbleWrapGame />
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-4">
                   <Brain className="text-teal-500" />
                   <h3 className="font-bold text-slate-700">Memory Match</h3>
                </div>
                <MemoryGame />
              </Card>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
           <div className="space-y-6 animate-fade-in">
             <Card>
               <h2 className="font-bold text-lg mb-4">Ajustes</h2>
               <div className="space-y-2 text-sm text-slate-600 mb-6">
                 <p>Cigarrillos/día: <span className="font-semibold">{userData.cigsPerDay}</span></p>
                 <p>Costo paquete: <span className="font-semibold">${userData.costPerPack}</span></p>
                 <p>Fecha inicio: <span className="font-semibold">{new Date(userData.quitDate).toLocaleDateString()}</span></p>
               </div>
               <Button onClick={() => setShowResetModal(true)} variant="danger" className="w-full">
                 Reiniciar Progreso
               </Button>
             </Card>
           </div>
        )}

      </main>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-teal-100 flex justify-around py-3 px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <Activity size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Progreso</span>
        </button>
        <button onClick={() => setActiveTab('journey')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'journey' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <Trophy size={24} strokeWidth={activeTab === 'journey' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Viaje</span>
        </button>
        <div className="relative -top-6">
          <button onClick={() => setActiveTab('sos')} className="bg-teal-500 text-white p-4 rounded-full shadow-xl shadow-teal-200 hover:bg-teal-600 transition-colors">
            <ShieldAlert size={28} fill="white" stroke="none" />
          </button>
        </div>
        <button onClick={() => setActiveTab('games')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'games' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <Gamepad2 size={24} strokeWidth={activeTab === 'games' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Zen</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}>
          <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Ajustes</span>
        </button>
      </nav>

      {/* MODALES Y TOAST */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)}>
        <div className="text-center">
           <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-slate-800 mb-2">¿Reiniciar todo?</h3>
           <p className="text-sm text-slate-500 mb-6">Perderás tu fecha de inicio y todos tus logros. Esta acción no se puede deshacer.</p>
           <div className="flex gap-3">
             <Button onClick={() => setShowResetModal(false)} variant="secondary" className="flex-1">Cancelar</Button>
             <Button onClick={confirmReset} variant="danger" className="flex-1">Sí, reiniciar</Button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)}>
        <div className="text-center">
           <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Copy className="w-6 h-6 text-teal-600" />
           </div>
           <h3 className="text-lg font-bold text-slate-800 mb-2">Copia tu logro</h3>
           <p className="text-sm text-slate-500 mb-4">No pudimos copiar automáticamente. Copia este texto y compártelo:</p>
           <textarea 
             readOnly 
             value={shareText} 
             className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
           />
           <Button onClick={() => setShowShareModal(false)} className="w-full">Entendido</Button>
        </div>
      </Modal>

      {/* TOAST */}
      {showCopiedToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-[60] animate-fade-in-up flex items-center gap-2 whitespace-nowrap">
          <Check size={16} className="text-emerald-400"/> ¡Copiado al portapapeles!
        </div>
      )}

    </div>
  );
}
