/*AQUÍ SE MANEJA EL CAMBIO DE TEMA CLARO-OSCURO*/

document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.querySelector('.theme_switch input[type="checkbox"]');
    const themeSwitchMovil = document.querySelector('.theme_switch_movil input[type="checkbox"]');
    const root = document.documentElement;

    function changeColors(isDarkTheme) {
        const properties = isDarkTheme ? {
            '--primary': '#FB9409',
            '--secondary': '#B45A23',
            '--base1': '#1D1D1F',
            '--base2': '#333333',
            '--text1': '#F5F5F7',
            '--text2': '#CCCCCC',
            '--text3': '#444444',
            '--gray': '#AAAAAA',
            '--nav-grad': '#11111155',
            '--footer': '#111111',
            '--footer-text': '#444444',
            '--primary_transparent': '#3183FFAA',
            '--secondary_transparent': '#B45A23AA',
            '--icons': '1.5',
            '--export': '1'
        } : {
            '--primary': '#3183FF',
            '--secondary': '#2566C8',
            '--base1': '#F5F5F7',
            '--base2': '#FFFFFF',
            '--text1': '#1D1D1F',
            '--text2': '#666666',
            '--text3': '#BBBBBB',
            '--gray': '#AAAAAA',
            '--nav-grad': '#EEEEEE55',
            '--footer': '#CCCCCC',
            '--footer-text': '#1D1D1F',
            '--primary_transparent': '#3183FFAA',
            '--secondary_transparent': '#2566C8AA',
            '--icons': '1',
            '--export': '0'
        };

        for (const [key, value] of Object.entries(properties)) {
            root.style.setProperty(key, value);
        }
    }

    function saveThemeState(isDarkTheme) {
        localStorage.setItem('isDarkTheme', isDarkTheme);
    }

    function loadThemeState() {
        const savedState = localStorage.getItem('isDarkTheme');
        // Si hay un estado guardado, cambiar el tema y el estado del interruptor según corresponda
        if (savedState !== null) {
            const isDarkTheme = savedState === 'true';
            changeColors(isDarkTheme);
            themeSwitch.checked = isDarkTheme;
            themeSwitchMovil.checked = isDarkTheme;
        }
    }

    function handleThemeChange() {
        const isDarkTheme = this.checked;
        changeColors(isDarkTheme);
        saveThemeState(isDarkTheme);
    }

    themeSwitch.addEventListener('change', handleThemeChange);
    themeSwitchMovil.addEventListener('change', handleThemeChange);

    loadThemeState();
});

