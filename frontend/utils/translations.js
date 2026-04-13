class TranslationManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'fr'];
    }

    async loadTranslations(language) {
        if (!this.translations[language]) {
            try {
                const response = await fetch(`/utils/${language}.json`);
                this.translations[language] = await response.json();
            } catch (error) {
                console.error(`Error loading translations for ${language}:`, error);
                if (language !== 'en') {
                    return this.loadTranslations('en');
                }
            }
        }
        return this.translations[language];
    }

    async setLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
            localStorage.setItem('language', language);
            await this.loadTranslations(language);
            this.updatePage();

            if (window.currentPlayerData && window.renderPlayerContent) {
                window.renderPlayerContent(window.currentPlayerData);
            }
        }
    }

    translate(key) {
        const translation = this.translations[this.currentLanguage] || {};
        return translation?.[key] || key;
    }

    updatePage() {
        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);

            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update page title
        const titleKey = document.documentElement.getAttribute('data-title-key');
        if (titleKey) {
            document.title = this.translate(titleKey);
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    async init() {
        await this.loadTranslations(this.currentLanguage);
        this.createLanguageSwitch();
        this.updatePage();
    }

    createLanguageSwitch() {
        const header = document.querySelector('.header-container');
        if (!header) return;

        const existingSwitch = header.querySelector('.language-switch');
        if (existingSwitch) {
            existingSwitch.remove();
        }

        const languageSwitch = document.createElement('div');
        languageSwitch.classList.add('language-switch');
        languageSwitch.innerHTML = `
            <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            <button class="lang-btn ${this.currentLanguage === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
        `;

        languageSwitch.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const newLang = e.target.getAttribute('data-lang');
                this.setLanguage(newLang);

                // Update active state
                languageSwitch.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
                });
            }
        });

        header.appendChild(languageSwitch);
    }

    t(template, replacements = {}) {
        // Replace translation keys in template
        let translated = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return this.translate(key);
        });

        // Replace data placeholders
        Object.keys(replacements).forEach(key => {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            translated = translated.replace(regex, replacements[key]);
        });

        return translated;
    }

    // Quick translate for dynamic content
    getDynamicTranslations() {
        const keys = [
            'date_of_birth', 'birth_place', 'height', 'weight', 'position', 'shoots', 'team',
            'career_stats', 'career_games_played', 'career_goals', 'career_assists', 'career_points',
            'games_played', 'goals', 'assists', 'points',
            'season_stats', 'playoffs_stats', 'international_stats',
            'player_not_found', 'unable_to_load', 'back_to_search', 'try_again'
        ];

        const translations = {};
        keys.forEach(key => {
            translations[key] = this.translate(key);
        });
        return translations;
    }
}

const translator = new TranslationManager();