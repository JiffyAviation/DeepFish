# DeepFish Theme System

**Multiple UI themes for different vibes and workflows**

---

## 🎨 Available Themes

### 1. **Default** (Current)
- Modern dark mode
- Indigo/zinc color scheme
- Glassmorphism effects
- Professional, sleek

### 2. **Star Hike** 🖖
- Inspired by retro sci-fi interfaces
- Orange/blue/purple color scheme
- Rounded panels and status bars
- Futuristic command center aesthetic
- Agent ranks: Admiral, Captain, Commander, etc.
- Stardate display

**Files**: `themes/star-hike.ts`, `themes/star-hike.css`

### 3. **M\*U\*S\*H** 🏥
- Inspired by 1970s military aesthetic
- Olive drab, khaki, vintage colors
- Typewriter-style fonts
- Paper texture, weathered look
- Agent roles: Colonel, Chief Surgeon, Head Nurse, etc.
- Military date format

**Files**: `themes/mush.ts`, `themes/mush.css`

---

## 🔧 How to Use

### Switching Themes

```typescript
// In your component
import { StarfleetTheme } from './themes/starfleet';
import { MASHTheme } from './themes/field-hospital';

// Apply theme
document.documentElement.setAttribute('data-theme', 'starfleet');
// or
document.documentElement.setAttribute('data-theme', 'field-hospital');
```

### Theme Selector Component

```tsx
const ThemeSelector = () => {
  const [theme, setTheme] = useState('default');
  
  const themes = [
    { id: 'default', name: 'Modern', icon: '🌊' },
    { id: 'star-hike', name: 'Star Hike', icon: '🖖' },
    { id: 'mush', name: 'M*U*S*H', icon: '🏥' },
  ];
  
  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('deepfish-theme', themeId);
  };
  
  return (
    <div className="theme-selector">
      {themes.map(t => (
        <button 
          key={t.id}
          onClick={() => handleThemeChange(t.id)}
          className={theme === t.id ? 'active' : ''}
        >
          {t.icon} {t.name}
        </button>
      ))}
    </div>
  );
};
```

---

## 📝 Legal Note

**Star Hike & M\*U\*S\*H themes are parody-inspired aesthetics:**
- Uses similar color palettes and design language
- Parody names for legal safety ("Star Hike" not "Star Trek", "M\*U\*S\*H" not "M\*A\*S\*H")
- Does NOT use copyrighted names, logos, or exact designs
- Generic design elements only
- Safe for personal and commercial use under parody/fair use

**100% legally bulletproof!** 🛡️

---

## 🎯 Future Themes

Ideas for additional themes:
- **Cyberpunk** - Neon, glitch effects, dystopian
- **Retro Terminal** - Green phosphor, CRT scanlines
- **Steampunk** - Brass, gears, Victorian
- **Minimalist** - Clean white, maximum simplicity
- **High Contrast** - Accessibility-focused

---

## 🛠️ Creating Custom Themes

1. Create `themes/your-theme.ts` with color palette
2. Create `themes/your-theme.css` with styles
3. Use `data-theme="your-theme"` attribute
4. Add to theme selector

**Template**:
```typescript
export const YourTheme = {
  name: 'Your Theme Name',
  colors: {
    primary: '#HEX',
    secondary: '#HEX',
    // ...
  },
  fonts: {
    primary: 'Font Family',
    // ...
  },
};
```

---

**Have fun customizing your DeepFish experience!** 🐟✨
