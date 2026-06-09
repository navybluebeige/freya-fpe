// ─── FREYA THEME ─────────────────────────────────────────────────────────────
// Fichier central des couleurs et styles de Freya
// Modifiez ici pour changer le design partout

export const colors = {
  // Couleurs principales
  primary: '#0D9488',        // Vert teal principal
  primaryDark: '#065a50',    // Vert foncé (navbar, sidebar, hero)
  primaryLight: '#CCFBF1',   // Vert très clair (fonds)
  primaryMid: '#0F766E',     // Vert intermédiaire

  // Accent
  accent: '#F97316',         // Orange chaud (le "a" de Freya, highlights)
  accentLight: '#FED7AA',    // Orange clair

  // Neutres
  dark: '#0F172A',           // Fond sombre
  text: '#0F172A',           // Texte principal
  textMuted: '#64748B',      // Texte secondaire
  textLight: '#94A3B8',      // Texte très clair
  border: '#E2E8F0',         // Bordures
  bg: '#F0F9F8',             // Fond général (légèrement vert)
  bgCard: '#fff',            // Fond des cartes
  bgLight: '#F8FAFC',        // Fond clair

  // États
  success: '#10B981',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0D9488',
  infoLight: '#CCFBF1',

  // Sidebar
  sidebarBg: '#0F172A',
  sidebarActive: 'rgba(13,148,136,0.15)',
  sidebarActiveBorder: 'rgba(13,148,136,0.3)',
  sidebarActiveText: '#2DD4BF',
  sidebarText: 'rgba(255,255,255,0.6)',
};

export const gradients = {
  hero: 'linear-gradient(160deg, #065a50 0%, #0D9488 50%, #0F766E 100%)',
  heroAlt: 'linear-gradient(135deg, #0F172A 0%, #065a50 60%, #0D9488 100%)',
  button: 'linear-gradient(135deg, #0D9488, #065a50)',
  dark: 'linear-gradient(135deg, #0F172A 0%, #1a2744 100%)',
  card: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
};

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.05)',
  cardHover: '0 4px 12px rgba(13,148,136,0.15)',
  modal: '0 25px 80px rgba(0,0,0,0.4)',
  button: '0 4px 15px rgba(13,148,136,0.35)',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

// Logo Freya avec accent orange
export const FreyaLogo = ({ size = 26, dark = false }) => (
  <span style={{
    fontSize: `${size}px`,
    fontWeight: '800',
    color: dark ? '#0F172A' : '#fff',
    letterSpacing: '-0.5px',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  }}>
    Frey<span style={{ color: '#F97316' }}>a</span>
  </span>
);

export default { colors, gradients, shadows, radius };
