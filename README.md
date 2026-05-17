# 🔍 Midnight Murder Mystery

A mobile-first detective investigation game built with React. Solve the murder before time runs out!

![Game Status](https://img.shields.io/badge/status-complete-brightgreen)
![Platform](https://img.shields.io/badge/platform-PWA-blue)
![Time](https://img.shields.io/badge/playtime-5min-green)
![Tech](https://img.shields.io/badge/tech-React-61dafb)

## 🎮 About The Game

You're a detective investigating a murder at a crime scene desk. With only 5 minutes before the corrupt cop arrives, you must:
- 🔦 Use flashlight to explore the dark detective's desk
- 🧩 Collect and combine evidence fragments
- 🔐 Crack drawer and phone codes
- 🎯 Identify the killer from suspect lineup
- 🏃 Hide from the corrupt cop when they arrive

## ✨ Features

- **React-Based:** Built with React 18 hooks for smooth state management
- **Web Audio API:** Immersive sound effects (background drone, clicks, success/error sounds)
- **Flashlight Mechanic:** Mouse/touch-controlled flashlight reveals hidden clues
- **Evidence System:** Collect items and combine torn photo fragments
- **Multiple Puzzles:** Drawer code (3-digit), phone unlock (4-digit), suspect deduction
- **Timed Event:** Corrupt cop appears at 2 minutes - hide or lose!
- **Mobile Optimized:** Touch-friendly interface with Tailwind CSS
- **Progressive Web App:** Install on any device, works offline

## 🚀 Quick Start

### Play Online
Visit: [Your Deployed URL Here]

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/yourusername/midnight-murder-mystery.git
cd midnight-murder-mystery
```

2. Start a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

3. Open in browser:
```
http://localhost:8000
```

## 🎯 How to Play

### Phase 1: Explore the Detective's Desk (0-2 minutes)
- **Move flashlight** with mouse/touch to reveal hidden items in the dark
- **Click coffee mug** to find a sticky note with "Emergency PIN: 9999" (red herring!)
- **Find torn photo fragments** - Fragment A (bottom corner) and Fragment B (under floorboard)
- **Combine fragments** in inventory to reveal crime photo with timestamp: 04:20 AM
- **Check desk engraving** for hint: "Find the missing halves"

### Phase 2: Unlock the Drawer (Code: 420)
- **Click drawer** to zoom in
- **Enter 3-digit code: 420** (from reconstructed photo timestamp 04:20)
- **Collect items:** Encrypted Phone and Cryptic Logbook

### Phase 3: Decrypt the Phone (Code: 1608)
- **Read logbook** for clue: "Birth coordinates: 24°N, 67°E"
- **Calculate:** 24 × 67 = 1608
- **Enter 4-digit code: 1608** to unlock phone
- **Warning:** Don't use 9999 (red herring) - causes 60-second penalty!

### Phase 4: Corrupt Cop Event (At 2:00 remaining)
- **Hide immediately** when prompted (3-second countdown)
- **Failure to hide** = Game Over
- **Successfully hiding** pauses timer for 10 seconds

### Phase 5: Identify the Killer
- **Review evidence:** Photo timestamp, logbook, phone data
- **Choose suspect:** Elena Martinez (Corrupt Detective) is the killer
- **Wrong choice** = Game Over

## 🛠️ Technology Stack

- **React 18** - Component-based UI with hooks (useState, useEffect, useRef)
- **Tailwind CSS** - Utility-first styling via CDN
- **Babel Standalone** - JSX transformation in browser
- **Web Audio API** - Procedural sound generation (no audio files needed)
- **HTML5** - Semantic structure with mobile viewport
- **PWA** - Progressive Web App capabilities (manifest.json, service worker)

## 📱 Browser Support

- ✅ Chrome (Android/Desktop) - Recommended
- ✅ Safari (iOS/Desktop)
- ✅ Firefox
- ✅ Edge
- ⚠️ Requires modern browser with Web Audio API support

## 🏗️ Project Structure

```
Escape Room/
├── index.html              # Main HTML with React/Tailwind CDN links
├── css/
│   └── style.css          # Custom CSS (animations, mobile frame)
├── js/
│   └── game.js            # React components and game logic (1159 lines)
├── assets/
│   └── icons/             # PWA icons (192x192, 512x512)
├── manifest.json          # PWA configuration
├── sw.js                  # Service worker for offline support
└── *.md                   # Documentation files
```

## 🎨 Design

### Color Palette (Dark Noir Theme)
- Background: `#18181b` / `#09090b` (Zinc-950/900)
- Accent: `#f59e0b` / `#d97706` (Amber-500/600)
- Text: `#f4f4f5` (Zinc-100)
- Error: `#ef4444` (Red-500)
- Success: `#22c55e` (Green-500)

### UI Components
- **Mobile Frame:** 844px height, rounded corners, shadow effects
- **Flashlight:** Radial gradient spotlight effect
- **Status Bar:** Time, mute button, battery indicator
- **Inventory:** Bottom bar with selectable evidence items
- **Toast Notifications:** Temporary messages for game events

## 🔧 Development

### Prerequisites
- Modern web browser with Web Audio API support
- Text editor (VS Code recommended)
- Local server (Python, Node.js, or Live Server)

### Setup Development Environment

1. Install VS Code extensions:
   - Live Server
   - ES7+ React/Redux/React-Native snippets (optional)

2. Clone and open project:
```bash
git clone <repo-url>
cd "Escape Room"
```

3. Start Live Server:
   - Right-click `index.html` → "Open with Live Server"
   - Or use: `python -m http.server 8000`

### Testing

- **Desktop:** Use Chrome DevTools mobile emulation (375x844)
- **Mobile:** Test on actual device via local network
- **Audio:** Use headphones for best experience
- **Cross-browser:** Test on Chrome, Safari, Firefox

## 📊 Game Mechanics

### Timer System
- **5 minutes (300 seconds)** to complete investigation
- **Corrupt cop event** triggers at 2:00 remaining
- **Hide mechanic:** Timer pauses for 10 seconds while hiding
- **Red herring penalty:** -60 seconds for using wrong code (9999)
- **Game over conditions:** Time expires, caught by cop, wrong accusation

### Evidence System
- **Inventory:** Collect up to 6 items (photo fragments, phone, logbook)
- **Combination:** Select 2 items to combine (torn photo fragments)
- **Interactive items:** Coffee mug, drawer, phone, floorboard, desk engraving

### Puzzle Solutions
- **Drawer Code:** 420 (from photo timestamp 04:20)
- **Phone Code:** 1608 (24 × 67 from logbook coordinates)
- **Killer:** Elena Martinez (Corrupt Detective)
- **Red Herring:** 9999 (sticky note under mug - causes penalty!)

### Audio Features
- **Background Drone:** Low-frequency ambient tension
- **Click Sound:** Tactile feedback for interactions
- **Error Sound:** Screen shake with rumble
- **Success Sound:** Unlocking chime (C5 → E5)
- **Mute Toggle:** Available in status bar

## 🐛 Known Issues

- None currently - game is feature complete

## 🚀 Future Enhancements

- [ ] Multiple difficulty levels (different codes/timer)
- [ ] Additional crime scenes with different stories
- [ ] Save/load game progress
- [ ] Achievements system
- [ ] More evidence combination puzzles
- [ ] Additional sound effects and music tracks
- [ ] Accessibility improvements (screen reader support)
- [ ] Multiple language support

## 🤝 Contributing

Contributions welcome! This is a complete game but can be enhanced.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Built with React, Tailwind CSS, and Web Audio API

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for utility-first styling
- Web Audio API for procedural sound generation
- Inspired by classic detective games and escape rooms

## 📞 Support

Having issues? Found a bug?
- Open an issue on GitHub
- Check browser console for errors
- Ensure Web Audio API is supported in your browser

## 🎓 Learning Resources

This project demonstrates:
- React Hooks (useState, useEffect, useRef)
- Web Audio API for game sounds
- Tailwind CSS for rapid styling
- PWA implementation
- Mobile-first responsive design
- Game state management

---

**Made with ❤️ and React**

*Play responsibly. No actual detectives were harmed in the making of this game.*
