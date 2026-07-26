const { useState, useEffect, useRef } = React;

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.backgroundDroneNode = null;
    this.backgroundGainNode = null;
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext initialized');
    }
    return this.audioContext;
  }

  toggleMute() {
    if (!this.audioContext) return;

    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.audioContext.suspend();
    } else {
      this.audioContext.resume();
    }

    return this.isMuted;
  }

  playBackgroundDrone() {
    const ctx = this.initAudioContext();

    if (this.backgroundDroneNode) {
      this.stopBackgroundDrone();
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(45, ctx.currentTime);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(48, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    this.backgroundDroneNode = { osc1, osc2, filter };
    this.backgroundGainNode = gainNode;
  }

  stopBackgroundDrone() {
    if (this.backgroundDroneNode) {
      try {
        this.backgroundDroneNode.osc1.stop();
        this.backgroundDroneNode.osc2.stop();
      } catch (e) {
      }
      this.backgroundDroneNode = null;
      this.backgroundGainNode = null;
    }
  }

  playClickSound() {
    const ctx = this.initAudioContext();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  playErrorSound() {
    const ctx = this.initAudioContext();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  playSuccessSound() {
    const ctx = this.initAudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.6);
  }
}

const audioSystem = new AudioSystem();

function EscapeRoomGame() {
  const [gameState, setGameState] = useState({
    inventory: [],
    selectedItems: [],
    mugMoved: false,
    flashlightActive: true,
    flashlightPos: { x: 5, y: 5 },
    drawerUnlocked: false,
    safeUnlocked: false,
    phoneUnlocked: false,
    timer: 300,
    corruptCopEventTriggered: false,
    isHiding: false,
    wrongAttempts: 0,
    activeView: 'main',
    accusationResult: null,
    fragmentAFound: false,
    fragmentBFound: false,
    photoReconstructed: false,
    floorboardChecked: false,
    deskEngravingFound: false,
    logbookRead: false
  });

  const [showToast, setShowToast] = useState(null);
  const [drawerCode, setDrawerCode] = useState(['', '', '']);
  const [phoneCode, setPhoneCode] = useState(['', '', '', '']);
  const [hideTimer, setHideTimer] = useState(3);
  const [showHidePrompt, setShowHidePrompt] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const workspaceRef = useRef(null);

  const handleStartGame = () => {
    setGameStarted(true);
    audioSystem.playBackgroundDrone();
  };

  const handleToggleMute = () => {
    const newMuteState = audioSystem.toggleMute();
    setIsMuted(newMuteState);
    audioSystem.playClickSound();
  };

  useEffect(() => {
    if (gameState.activeView === 'victory' || gameState.activeView === 'game_over') {
      audioSystem.stopBackgroundDrone();
    }
  }, [gameState.activeView]);

  useEffect(() => {
    if (gameState.activeView === 'victory' || gameState.activeView === 'game_over') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const newTimer = prev.timer - (prev.isHiding ? 2 : 1);

        if (newTimer === 120 && !prev.corruptCopEventTriggered) {
          setShowHidePrompt(true);
          setHideTimer(3);
          return { ...prev, timer: newTimer, corruptCopEventTriggered: true };
        }

        if (newTimer <= 0) {
          clearInterval(interval);
          audioSystem.stopBackgroundDrone();
          return { ...prev, timer: 0, activeView: 'game_over', accusationResult: 'timeout' };
        }

        return { ...prev, timer: newTimer };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.activeView, gameState.isHiding]);

  useEffect(() => {
    if (!showHidePrompt || hideTimer <= 0) return;

    const timeout = setTimeout(() => {
      setHideTimer(prev => {
        if (prev <= 1) {
          setShowHidePrompt(false);
          setGameState(prev => ({ ...prev, activeView: 'game_over', accusationResult: 'caught' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [showHidePrompt, hideTimer]);

  const handleMouseMove = (e) => {
    if (!gameState.flashlightActive || gameState.activeView !== 'main') return;

    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setGameState(prev => ({ ...prev, flashlightPos: { x, y } }));
  };

  const handleTouchMove = (e) => {
    if (!gameState.flashlightActive || gameState.activeView !== 'main') return;

    const touch = e.touches[0];
    const rect = workspaceRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setGameState(prev => ({ ...prev, flashlightPos: { x, y } }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToastMessage = (message, duration = 3000) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), duration);
  };

  const handleMugClick = () => {
    audioSystem.playClickSound();
    if (!gameState.mugMoved) {
      setGameState(prev => ({ ...prev, mugMoved: true }));
      showToastMessage('☕ Moved the mug aside. Found a sticky note: "Emergency Backup PIN: 9999" (Hmm...)');
    }
  };

  const handleFragmentAClick = () => {
    audioSystem.playClickSound();
    if (!gameState.fragmentAFound) {
      setGameState(prev => ({
        ...prev,
        fragmentAFound: true,
        inventory: [...prev.inventory, 'torn_photo_left']
      }));
      showToastMessage('📷 Found: Torn Photo Fragment A');
    }
  };

  const handleDeskEngravingClick = () => {
    audioSystem.playClickSound();
    if (!gameState.deskEngravingFound) {
      setGameState(prev => ({ ...prev, deskEngravingFound: true }));
      showToastMessage('🔍 Faint engraving on desk: "Find the missing halves."');
    }
  };

  const handleFloorboardClick = () => {
    audioSystem.playClickSound();
    if (!gameState.floorboardChecked) {
      setGameState(prev => ({
        ...prev,
        floorboardChecked: true,
        inventory: [...prev.inventory, 'torn_photo_right']
      }));
      showToastMessage('📷 Found: Torn Photo Fragment B under loose floorboard!');
    }
  };

  const handleCombineEvidence = () => {
    audioSystem.playClickSound();
    if (gameState.selectedItems.length !== 2) {
      showToastMessage('⚠️ Select exactly 2 evidence items to combine');
      return;
    }

    const hasLeft = gameState.selectedItems.includes('torn_photo_left');
    const hasRight = gameState.selectedItems.includes('torn_photo_right');

    if (hasLeft && hasRight) {
      audioSystem.playSuccessSound();
      setGameState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== 'torn_photo_left' && i !== 'torn_photo_right').concat('reconstructed_photo'),
        selectedItems: [],
        photoReconstructed: true
      }));
      showToastMessage('✨ Combined fragments! Reconstructed Crime Photo shows timestamp: 04:20 AM', 5000);
    } else {
      audioSystem.playErrorSound();
      showToastMessage('❌ These items cannot be combined');
      setGameState(prev => ({ ...prev, selectedItems: [] }));
    }
  };

  const toggleInventorySelection = (item) => {
    audioSystem.playClickSound();
    setGameState(prev => {
      const isSelected = prev.selectedItems.includes(item);
      if (isSelected) {
        return { ...prev, selectedItems: prev.selectedItems.filter(i => i !== item) };
      } else if (prev.selectedItems.length < 2) {
        return { ...prev, selectedItems: [...prev.selectedItems, item] };
      }
      return prev;
    });
  };

  const handleDrawerClick = () => {
    audioSystem.playClickSound();
    setGameState(prev => ({ ...prev, activeView: 'drawer_zoom' }));
  };

  const checkDrawerCode = () => {
    const code = drawerCode.join('');
    if (code === '420') {
      audioSystem.playSuccessSound();
      setGameState(prev => ({ ...prev, drawerUnlocked: true }));
      showToastMessage('🔓 Drawer unlocked! Found: Victim\'s Encrypted Phone & Cryptic Logbook', 4000);
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          inventory: [...prev.inventory, 'encrypted_phone', 'logbook']
        }));
      }, 1000);
    } else if (code.length === 3) {
      audioSystem.playErrorSound();
      showToastMessage('❌ Wrong combination!');
      setDrawerCode(['', '', '']);
      document.getElementById('drawer-code-0')?.focus();
    }
  };

  const handlePhoneClick = () => {
    audioSystem.playClickSound();
    if (gameState.inventory.includes('encrypted_phone')) {
      setGameState(prev => ({ ...prev, activeView: 'phone_zoom' }));
      setPhoneCode(['', '', '', '']);
    } else {
      showToastMessage('📱 The phone is locked inside the drawer');
    }
  };

  const checkPhoneCode = () => {
    const code = phoneCode.join('');

    if (code === '9999') {
      audioSystem.playErrorSound();
      setGameState(prev => ({ ...prev, timer: Math.max(0, prev.timer - 60) }));
      setPhoneCode(['', '', '', '']);
      showToastMessage('⚠️ WRONG! Red herring trap! -60 seconds penalty!', 4000);
      document.querySelector('.mobile-frame')?.classList.add('animate-shake');
      setTimeout(() => {
        document.querySelector('.mobile-frame')?.classList.remove('animate-shake');
      }, 500);
      document.getElementById('phone-code-0')?.focus();
      return;
    }

    if (code === '1608') {
      audioSystem.playSuccessSound();
      setGameState(prev => ({ ...prev, phoneUnlocked: true, activeView: 'suspect_lineup' }));
      showToastMessage('✅ Phone unlocked! Analyzing evidence...', 3000);
    } else if (code.length === 4) {
      audioSystem.playErrorSound();
      setGameState(prev => ({ ...prev, wrongAttempts: prev.wrongAttempts + 1 }));
      setPhoneCode(['', '', '', '']);
      showToastMessage('❌ Incorrect PIN');
      document.getElementById('phone-code-0')?.focus();
    }
  };

  const handleHide = () => {
    audioSystem.playClickSound();
    setShowHidePrompt(false);
    setGameState(prev => ({ ...prev, isHiding: true }));

    setTimeout(() => {
      setGameState(prev => ({ ...prev, isHiding: false }));
      showToastMessage('✅ Safe! The corrupt cop left. Continue investigating!', 4000);
    }, 10000);
  };

  const handleAccusation = (suspect) => {
    audioSystem.playClickSound();
    if (suspect === 'elena') {
      audioSystem.playSuccessSound();
      audioSystem.stopBackgroundDrone();
      setGameState(prev => ({ ...prev, activeView: 'victory', accusationResult: 'correct' }));
    } else {
      audioSystem.playErrorSound();
      audioSystem.stopBackgroundDrone();
      setGameState(prev => ({ ...prev, activeView: 'game_over', accusationResult: 'wrong' }));
    }
  };

  const handleLogbookClick = () => {
    audioSystem.playClickSound();
    setGameState(prev => ({ ...prev, logbookRead: true }));
    showToastMessage('📖 Logbook: "The killer deleted everything except my birth coordinates: 24°N, 67°E"', 6000);
  };

  const handlePhotoClick = () => {
    audioSystem.playClickSound();
    showToastMessage('📷 Crime Photo: Timestamp shows 04:20 AM. Location coordinates visible in corner.', 5000);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 select-none touch-manipulation">
        <div className="mobile-frame w-full max-w-md h-[844px] bg-zinc-900 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-6">🕵️</div>
              <h1 className="text-3xl font-bold text-amber-500 mb-4">Midnight Murder Mystery</h1>
              <p className="text-zinc-400 mb-8">Detective's Desk Investigation</p>
              <button
                onClick={handleStartGame}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105"
              >
                🎮 Start Game
              </button>
              <p className="text-zinc-500 text-sm mt-6">
                Use headphones for the best experience
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 select-none touch-manipulation">
      <div className="mobile-frame w-full max-w-md h-[844px] bg-zinc-900 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative">

        <div className="bg-zinc-950 px-6 py-3 flex justify-between items-center text-xs text-zinc-400 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMute}
              className="text-lg hover:scale-110 transition-transform cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <span className={`font-mono font-bold ${gameState.timer < 60 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
              ⏱️ {formatTime(gameState.timer)}
            </span>
            <span>🔋 85%</span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative bg-zinc-900">
          {gameState.activeView === 'main' && (
            <MainDeskView
              gameState={gameState}
              onMugClick={handleMugClick}
              onDrawerClick={handleDrawerClick}
              onPhoneClick={handlePhoneClick}
              onFragmentAClick={handleFragmentAClick}
              onDeskEngravingClick={handleDeskEngravingClick}
              onFloorboardClick={handleFloorboardClick}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              workspaceRef={workspaceRef}
            />
          )}

          {gameState.activeView === 'drawer_zoom' && (
            <DrawerZoomView
              gameState={gameState}
              drawerCode={drawerCode}
              setDrawerCode={setDrawerCode}
              onCheckCode={checkDrawerCode}
              onBack={() => setGameState(prev => ({ ...prev, activeView: 'main' }))}
              onLogbookClick={handleLogbookClick}
            />
          )}

          {gameState.activeView === 'phone_zoom' && (
            <PhoneZoomView
              gameState={gameState}
              phoneCode={phoneCode}
              setPhoneCode={setPhoneCode}
              onCheckCode={checkPhoneCode}
              onBack={() => setGameState(prev => ({ ...prev, activeView: 'main' }))}
            />
          )}

          {gameState.activeView === 'suspect_lineup' && (
            <SuspectLineupView onAccusation={handleAccusation} />
          )}

          {gameState.activeView === 'victory' && (
            <VictoryView timer={gameState.timer} />
          )}

          {gameState.activeView === 'game_over' && (
            <GameOverView result={gameState.accusationResult} />
          )}

          {gameState.isHiding && (
            <div className="absolute inset-0 bg-black z-50 flex items-center justify-center fade-in">
              <div className="text-center">
                <div className="text-6xl mb-4">🤫</div>
                <h2 className="text-2xl font-bold text-amber-500 mb-2">HIDING...</h2>
                <p className="text-zinc-400">Stay quiet. Timer running at 2x speed.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-950 border-t-2 border-amber-600 px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-amber-500 text-xs font-bold tracking-wider">EVIDENCE BAG</div>
            {gameState.selectedItems.length === 2 && (
              <button
                onClick={handleCombineEvidence}
                className="bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1 rounded transition"
              >
                🔬 Combine Evidence
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {gameState.inventory.length === 0 ? (
              <div className="text-zinc-600 text-sm italic">No evidence collected yet...</div>
            ) : (
              gameState.inventory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item === 'reconstructed_photo') handlePhotoClick();
                    else if (item === 'logbook') handleLogbookClick();
                    else toggleInventorySelection(item);
                  }}
                  className={`min-w-[80px] h-16 rounded-lg flex flex-col items-center justify-center text-2xl transition-all ${
                    gameState.selectedItems.includes(item)
                      ? 'bg-amber-600 border-2 border-amber-400 scale-105'
                      : 'bg-zinc-800 border-2 border-zinc-700 hover:border-amber-600'
                  }`}
                >
                  <span>
                    {item === 'torn_photo_left' ? '📷' :
                     item === 'torn_photo_right' ? '📷' :
                     item === 'reconstructed_photo' ? '🖼️' :
                     item === 'encrypted_phone' ? '📱' :
                     item === 'logbook' ? '📖' : '📄'}
                  </span>
                  <span className="text-[8px] text-zinc-400 mt-1">
                    {item === 'torn_photo_left' ? 'Frag A' :
                     item === 'torn_photo_right' ? 'Frag B' :
                     item === 'reconstructed_photo' ? 'Photo' :
                     item === 'encrypted_phone' ? 'Phone' :
                     item === 'logbook' ? 'Log' : 'Item'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {showToast && (
          <div className="absolute top-20 left-4 right-4 bg-zinc-800 border-2 border-amber-500 rounded-lg p-4 shadow-xl fade-in z-50">
            <p className="text-amber-100 text-sm">{showToast}</p>
          </div>
        )}

        {showHidePrompt && (
          <div className="absolute inset-0 bg-red-950 bg-opacity-95 z-50 flex items-center justify-center fade-in animate-pulse">
            <div className="text-center p-6">
              <div className="text-8xl mb-4 animate-bounce">🚨</div>
              <h1 className="text-3xl font-bold text-red-400 mb-4">FOOTSTEPS OUTSIDE!</h1>
              <p className="text-red-200 text-xl mb-6">HIDE NOW!</p>
              <div className="text-6xl font-bold text-red-300 mb-6">{hideTimer}</div>
              <button
                onClick={handleHide}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition transform hover:scale-105"
              >
                🏃 HIDE UNDER DESK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MainDeskView({ gameState, onMugClick, onDrawerClick, onPhoneClick, onFragmentAClick, onDeskEngravingClick, onFloorboardClick, onMouseMove, onTouchMove, workspaceRef }) {
  return (
    <div
      ref={workspaceRef}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      className="h-full relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-zinc-950"></div>

      {gameState.flashlightActive && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle 150px at ${gameState.flashlightPos.x}% ${gameState.flashlightPos.y}%, transparent 0%, rgba(0,0,0,0.95) 100%)`
          }}
        ></div>
      )}

      <div className="relative z-20 h-full p-6 fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-amber-500 mb-2">🕵️ DETECTIVE'S DESK</h1>
          <p className="text-zinc-400 text-sm">Use flashlight to investigate in the dark...</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onMugClick}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              gameState.mugMoved
                ? 'bg-zinc-800 border-zinc-700 opacity-60'
                : 'bg-zinc-800 border-amber-600 hover:bg-zinc-750 hover:border-amber-500 hover:scale-105'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">☕</span>
              <div className="text-left">
                <h3 className="text-amber-400 font-bold">Cold Coffee Mug</h3>
                <p className="text-zinc-500 text-sm">
                  {gameState.mugMoved ? 'Moved aside - found sticky note' : 'Investigate this item'}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onDrawerClick}
            className="w-full p-6 rounded-xl border-2 bg-zinc-800 border-amber-600 hover:bg-zinc-750 hover:border-amber-500 hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{gameState.drawerUnlocked ? '🗄️' : '🔒'}</span>
              <div className="text-left">
                <h3 className="text-amber-400 font-bold">
                  {gameState.drawerUnlocked ? 'Unlocked Desk Drawer' : 'Locked Desk Drawer'}
                </h3>
                <p className="text-zinc-500 text-sm">
                  {gameState.drawerUnlocked ? 'Click to view contents' : 'Requires 3-digit combination'}
                </p>
              </div>
            </div>
          </button>

          {gameState.inventory.includes('encrypted_phone') && (
            <button
              onClick={onPhoneClick}
              className="w-full p-6 rounded-xl border-2 bg-zinc-800 border-rose-800 hover:bg-zinc-750 hover:border-rose-600 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">📱</span>
                <div className="text-left">
                  <h3 className="text-amber-400 font-bold">Victim's Encrypted Phone</h3>
                  <p className="text-zinc-500 text-sm">Locked with 4-digit PIN</p>
                </div>
              </div>
            </button>
          )}

          {!gameState.deskEngravingFound && (
            <button
              onClick={onDeskEngravingClick}
              className="w-full p-4 rounded-xl border-2 bg-zinc-800 border-zinc-700 hover:border-amber-600 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🔍</span>
                <div className="text-left">
                  <h3 className="text-zinc-400 font-bold text-sm">Desk Back Panel</h3>
                  <p className="text-zinc-600 text-xs">Examine closely...</p>
                </div>
              </div>
            </button>
          )}

          {!gameState.fragmentAFound && (
            <button
              onClick={onFragmentAClick}
              className="w-full p-4 rounded-xl border-2 bg-zinc-800 border-zinc-700 hover:border-amber-600 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">📷</span>
                <div className="text-left">
                  <h3 className="text-zinc-400 font-bold text-sm">Bottom Corner of Desk</h3>
                  <p className="text-zinc-600 text-xs">Something glinting...</p>
                </div>
              </div>
            </button>
          )}

          {!gameState.floorboardChecked && (
            <button
              onClick={onFloorboardClick}
              className="w-full p-4 rounded-xl border-2 bg-zinc-800 border-zinc-700 hover:border-amber-600 hover:scale-105 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">🪵</span>
                <div className="text-left">
                  <h3 className="text-zinc-400 font-bold text-sm">Loose Floorboard</h3>
                  <p className="text-zinc-600 text-xs">Creaks when stepped on...</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DrawerZoomView({ gameState, drawerCode, setDrawerCode, onCheckCode, onBack, onLogbookClick }) {
  const handleCodeInput = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...drawerCode];
    newCode[index] = value;
    setDrawerCode(newCode);

    if (value && index < 2) {
      document.getElementById(`drawer-code-${index + 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (drawerCode.every(d => d !== '')) {
      onCheckCode();
    }
  }, [drawerCode]);

  if (gameState.drawerUnlocked) {
    return (
      <div className="h-full bg-zinc-900 p-6 fade-in flex flex-col">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-amber-500 hover:text-amber-400 transition"
        >
          <span>←</span>
          <span className="font-bold">Back to Desk</span>
        </button>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">📂 Drawer Contents</h2>

            <div className="space-y-4">
              <div className="bg-zinc-800 border-2 border-green-600 rounded-xl p-6">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-green-400 font-bold text-xl mb-2">Victim's Encrypted Phone</h3>
                <p className="text-zinc-400 text-sm">Added to Evidence Bag</p>
              </div>

              <button
                onClick={onLogbookClick}
                className="w-full bg-zinc-800 border-2 border-amber-600 hover:border-amber-500 rounded-xl p-6 transition"
              >
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-amber-400 font-bold text-xl mb-2">Cryptic Logbook</h3>
                <p className="text-zinc-500 text-sm">Click to read</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-900 p-6 fade-in flex flex-col">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-amber-500 hover:text-amber-400 transition"
      >
        <span>←</span>
        <span className="font-bold">Back to Desk</span>
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="bg-zinc-950 rounded-3xl p-8 border-4 border-zinc-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-amber-500 mb-2">3-Digit Combination Lock</h2>
              <p className="text-zinc-500 text-sm">Find the code to unlock</p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  id={`drawer-code-${index}`}
                  type="tel"
                  maxLength="1"
                  value={drawerCode[index]}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  className="w-16 h-20 text-center text-3xl font-bold bg-zinc-800 border-2 border-amber-600 rounded-lg text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center text-zinc-500 text-xs">
              Hint: Check the reconstructed photo timestamp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneZoomView({ gameState, phoneCode, setPhoneCode, onCheckCode, onBack }) {
  const handleCodeInput = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...phoneCode];
    newCode[index] = value;
    setPhoneCode(newCode);

    if (value && index < 3) {
      document.getElementById(`phone-code-${index + 1}`)?.focus();
    }
  };

  useEffect(() => {
    if (phoneCode.every(d => d !== '')) {
      onCheckCode();
    }
  }, [phoneCode]);

  return (
    <div className="h-full bg-zinc-900 p-6 fade-in flex flex-col">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-amber-500 hover:text-amber-400 transition"
      >
        <span>←</span>
        <span className="font-bold">Back to Desk</span>
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="bg-zinc-950 rounded-3xl p-8 border-4 border-rose-800 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-rose-400 mb-2">Encrypted Phone</h2>
              <p className="text-zinc-500 text-sm">4-digit PIN required</p>
              {gameState.wrongAttempts > 0 && (
                <p className="text-red-500 text-xs mt-2">Wrong attempts: {gameState.wrongAttempts}</p>
              )}
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`phone-code-${index}`}
                  type="tel"
                  maxLength="1"
                  value={phoneCode[index]}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  className="w-16 h-20 text-center text-3xl font-bold bg-zinc-800 border-2 border-rose-800 rounded-lg text-rose-400 focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="text-center text-zinc-500 text-xs">
              Hint: Check the logbook coordinates (24°N × 67°E)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuspectLineupView({ onAccusation }) {
  const suspects = [
    {
      id: 'marcus',
      name: 'Marcus Vance',
      title: 'The Partner',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
      bio: "Massive motive: stands to inherit the firm. His blood was found on the scene's shattered mug, and he canceled his flight at 03:00 AM. However, his phone GPS logs place him miles away at the time of the murder (04:20 AM). Claims he is being framed due to his public hatred of the victim."
    },
    {
      id: 'elena',
      name: 'Elena Rostova',
      title: 'The Whistleblower',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
      bio: "Zero apparent motive: a close friend and ally of the victim. However, the phone's hidden satellite log places her device at the exact coordinates (24°N, 67°E) at the exact timestamp of the murder (04:20 AM). She claims her phone was cloned by the real killer to track her movements.",
    },
    {
      id: 'aris',
      name: 'Dr. Aris Thorne',
      title: 'The Landlord',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
      bio: "Caught in a major lie: His fingerprints are all over the forced desk drawer lock, despite claiming he was asleep. However, he has a verified live-stream alibi from 03:30 AM to 05:00 AM. Claims he only broke into the desk the day before to search for overdue rent.",
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6 fade-in overflow-y-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-amber-500 mb-2">🎯 SUSPECT LINEUP</h1>
        <p className="text-zinc-400 text-sm">Choose the killer based on the evidence</p>
        <div className="mt-4 bg-rose-900 border-2 border-rose-700 rounded-lg p-3">
          <p className="text-rose-200 text-xs font-bold">⚠️ ONE CHANCE ONLY - CHOOSE WISELY</p>
        </div>
      </div>

      <div className="space-y-4">
        {suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => onAccusation(suspect.id)}
            className="w-full bg-zinc-800 border-2 border-amber-600 hover:border-amber-400 hover:bg-zinc-750 rounded-xl p-4 transition-all hover:scale-105"
          >
            <div className="flex gap-4">
              <img
                src={suspect.image}
                alt={suspect.name}
                className="w-20 h-20 rounded-lg object-cover border-2 border-zinc-700"
              />
              <div className="flex-1 text-left">
                <h3 className="text-amber-400 font-bold text-lg">{suspect.name}</h3>
                <p className="text-zinc-500 text-xs mb-2">{suspect.title}</p>
                <p className="text-zinc-300 text-sm mb-2">{suspect.bio}</p>
                <p className={`text-xs font-bold ${suspect.id === 'elena' ? 'text-rose-400' : 'text-zinc-500'}`}>
                  {suspect.clue}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function VictoryView({ timer }) {
  return (
    <div className="h-full bg-gradient-to-br from-green-900 via-zinc-900 to-zinc-950 p-6 fade-in flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-4xl font-bold text-green-400 mb-4">CASE SOLVED!</h1>
        <p className="text-zinc-300 text-lg mb-6">
          You correctly identified Elena Rostova as the killer!
        </p>
        <div className="bg-zinc-800 border-2 border-green-500 rounded-lg p-6 mb-6">
          <p className="text-green-400 font-bold mb-2">✅ Evidence Secured</p>
          <p className="text-zinc-400 text-sm mb-4">
            GPS data and timestamp matched perfectly. The corrupt precinct's plan has been foiled.
          </p>
          <p className="text-amber-500 font-mono">
            Time Remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}

function GameOverView({ result }) {
  const messages = {
    timeout: {
      title: 'TIME RAN OUT',
      message: 'The evidence was wiped before you could solve the case.',
      icon: '⏰'
    },
    caught: {
      title: 'CAUGHT!',
      message: 'The corrupt cop found you. The evidence is now compromised.',
      icon: '🚨'
    },
    wrong: {
      title: 'WRONG ACCUSATION',
      message: 'You accused the wrong person. The real killer escaped.',
      icon: '❌'
    }
  };

  const msg = messages[result] || messages.wrong;

  return (
    <div className="h-full bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950 p-6 fade-in flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">{msg.icon}</div>
        <h1 className="text-4xl font-bold text-red-400 mb-4">{msg.title}</h1>
        <p className="text-zinc-300 text-lg mb-6">{msg.message}</p>
        <div className="bg-zinc-800 border-2 border-red-500 rounded-lg p-6 mb-6">
          <p className="text-red-400 font-bold mb-2">Case Failed</p>
          <p className="text-zinc-400 text-sm">
            Justice was not served. Try again and pay closer attention to the evidence.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<EscapeRoomGame />);

