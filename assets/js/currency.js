/**
 * Indigo Metaphysics Academy — Currency & Multilingual Engine
 */

const IndigoCurrency = {
  current: 'USD',
  rates: {
    USD: 1,
    RUB: 92,
    EUR: 0.92,
    USDT: 1
  },
  symbols: {
    USD: '$',
    RUB: '₽',
    EUR: '€',
    USDT: '₮'
  },

  setCurrency(curr) {
    if (!this.rates[curr]) return;
    this.current = curr;
    localStorage.setItem('indigo_currency', curr);
    this.updateAllPrices();
  },

  format(baseUSD) {
    const rate = this.rates[this.current] || 1;
    const converted = Math.round(baseUSD * rate);
    const sym = this.symbols[this.current];

    if (this.current === 'RUB') {
      return `${converted.toLocaleString('ru-RU')} ${sym}`;
    } else if (this.current === 'EUR') {
      return `${converted.toLocaleString('de-DE')} ${sym}`;
    } else {
      return `${sym}${converted.toLocaleString('en-US')}`;
    }
  },

  updateAllPrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usdVal = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(usdVal)) {
        el.innerText = this.format(usdVal);
      }
    });

    // Fire event for any live calculators
    window.dispatchEvent(new CustomEvent('indigo-currency-changed', { detail: { currency: this.current } }));
  },

  init() {
    const saved = localStorage.getItem('indigo_currency') || 'USD';
    this.current = saved;
    const selects = document.querySelectorAll('.currency-select');
    selects.forEach(s => {
      s.value = this.current;
      s.addEventListener('change', (e) => {
        this.setCurrency(e.target.value);
        if (window.indigoAudio) window.indigoAudio.playTick();
      });
    });
    this.updateAllPrices();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  IndigoCurrency.init();
});
