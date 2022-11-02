// api default variables
const myHeaders = new Headers();

// R rlbxF7TsDgKG3xtMcyiDXMYMgD7Vp0lF  M q70WvDJ4ZVodPukIrxcFPjIq9krthYfq
myHeaders.append("apikey", "rlbxF7TsDgKG3xtMcyiDXMYMgD7Vp0lF");
const requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};
// getting api data
const apiData = {
  convertTo: "",
  convertFrom: "",
  amount: "",
  async getCurrencies() {
    let cunrencies = [];

    const res = await fetch(
      "https://api.apilayer.com/currency_data/list",
      requestOptions
    );
    const apiCurrenciesObj = await res.json();
    const currenciesObj = apiCurrenciesObj.currencies;
    for (let key in currenciesObj) {
      cunrencies.push(currenciesObj[key] + "-" + key);
    }
    cunrencies = cunrencies.sort();
    return cunrencies;
  },
  async getExchangeRate() {
    const res = await fetch(
      `https://api.apilayer.com/currency_data/convert?to=${this.convertTo}&from=${this.convertFrom}&amount=${this.amount}`,
      requestOptions
    );
    const apiRateObj = await res.json();
    const amount = apiRateObj.query.amount;
    const from = apiRateObj.query.from;
    const to = apiRateObj.query.to;
    const rate = apiRateObj.info.quote;
    const result = apiRateObj.result;
    return {
      from,
      to,
      amount,
      rate,
      result,
    };
  },
};
const UI = {
  selectDomElements() {
    const selectElms = document.querySelectorAll(".inputs select");
    const valueElms = document.querySelectorAll(".inputs input");
    const value1Elm = document.querySelector("#value-1");
    const value2Elm = document.querySelector("#value-2");
    const currency1Elm = document.querySelector(".currency-1");
    const currency2Elm = document.querySelector(".currency-2");
    const msgUiElm = document.querySelector("#messageWrapper");
    const showtoUI = document.querySelector("#show");
    return {
      selectElms,
      valueElms,
      value1Elm,
      value2Elm,
      currency1Elm,
      currency2Elm,
      msgUiElm,
      showtoUI,
    };
  },
  clearMsg(msgElm) {
    msgElm.children[0].remove();
  },
  showMsg(msg) {
    const message = `<div class="alert alert-danger">${msg}</div>`;
    const { msgUiElm } = this.selectDomElements();
    msgUiElm.insertAdjacentHTML("afterbegin", message);
    setTimeout(() => {
      this.clearMsg(msgUiElm);
    }, 3000);
  },
  setCurrenciesInUI(currencies) {
    const { currency1Elm, currency2Elm } = this.selectDomElements();
    let options = "";
    currencies.forEach((currency) => {
      options += `<option value="${currency}">${currency}</option>`;
    });
    options = options.replace(
      /<option value="Bangladeshi Taka-BDT">Bangladeshi Taka-BDT<\/option>/,
      `<option value="Bangladeshi Taka-BDT" selected>Bangladeshi Taka-BDT</option>`
    );
    currency1Elm.insertAdjacentHTML("afterbegin", options);
    options = options.replace(
      /<option value="Bangladeshi Taka-BDT" selected>Bangladeshi Taka-BDT<\/option>/,
      `<option value="Bangladeshi Taka-BDT">Bangladeshi Taka-BDT</option>`
    );
    options = options.replace(
      /<option value="United States Dollar-USD">United States Dollar-USD<\/option>/,
      `<option value="United States Dollar-USD" selected>United States Dollar-USD</option>`
    );
    currency2Elm.insertAdjacentHTML("afterbegin", options);
  },
  async setDefaultValueToUI(
    convertTo = "USD",
    convertFrom = "BDT",
    amount = 1
  ) {
    const { value1Elm, value2Elm } = this.selectDomElements();
    apiData.convertTo = convertTo;
    apiData.convertFrom = convertFrom;
    apiData.amount = amount;
    const data = await apiData.getExchangeRate();
    value1Elm.value = amount;
    value2Elm.value = data.result;
    this.showToUI(data);
  },
  async setValueToUI(convertTo = "USD", convertFrom = "BDT", amount = 1) {
    const { value1Elm, value2Elm } = this.selectDomElements();
    apiData.convertTo = convertTo;
    apiData.convertFrom = convertFrom;
    apiData.amount = amount;
    const data = await apiData.getExchangeRate();
    this.showToUI(data);
    console.log(Number(value1Elm.value) === Number(data.amount));
    console.log(Number(value1Elm.value));
    console.log(Number(data.amount));
    if (Number(value1Elm.value) === Number(data.amount)) {
      value1Elm.value = amount;
      value2Elm.value = data.result;
    } else {
      value2Elm.value = amount;
      value1Elm.value = data.result;
    }
  },
  validateInputs(value1, value2) {
    if (value1 !== value1 || value1 <= 0 || value2 !== value2 || value2 <= 0) {
      this.showMsg("Please, provide a positive number!");
      return true;
    } else {
      return false;
    }
  },
  getInputsData() {
    const { value1Elm, value2Elm, currency1Elm, currency2Elm } =
      this.selectDomElements();
    const currency1 = currency1Elm.value;
    const currency2 = currency2Elm.value;
    const value1 = Number(value1Elm.value);
    const value2 = Number(value2Elm.value);
    const isInvalid = this.validateInputs(value1, value2);
    if (isInvalid) return false;
    return {
      currency1,
      currency2,
      value1,
      value2,
    };
  },
  showToUI(data) {
    const { showtoUI } = this.selectDomElements();
    showtoUI.textContent = "";
    const elm = `<h6 class="first">${data.amount} ${data.from} equal to</h6>
      <h3 class="second">${data.result} ${data.to}</h3>`;
    showtoUI.insertAdjacentHTML("afterbegin", elm);
  },
  async handleCurrencyChangeEvent() {
    const { selectElms, value1Elm, value2Elm, currency1Elm, currency2Elm } =
      this.selectDomElements();
    for (let select of selectElms) {
      select.addEventListener("change", (evt) => {
        const inputsData = this.getInputsData();
        if (!inputsData) return;
        let currency1 = currency1Elm.value.split("-");
        currency1 = currency1[currency1.length - 1];
        let currency2 = currency2Elm.value.split("-");
        currency2 = currency2[currency2.length - 1];
        const amount1 = Number(value1Elm.value);
        const amount2 = Number(value2Elm.value);
        if (evt.target.classList.contains("currency-1")) {
          this.setValueToUI(currency2, currency1, amount1);
        } else {
          this.setValueToUI(currency1, currency2, amount2);
        }
      });
    }
  },
  async handleValueChangeEvent() {
    const { valueElms, value1Elm, value2Elm, currency1Elm, currency2Elm } =
      this.selectDomElements();
    for (let input of valueElms) {
      input.addEventListener("change", (evt) => {
        const inputsData = this.getInputsData();
        if (!inputsData) return;
        let currency1 = currency1Elm.value.split("-");
        currency1 = currency1[currency1.length - 1];
        let currency2 = currency2Elm.value.split("-");
        currency2 = currency2[currency2.length - 1];
        const amount1 = Number(value1Elm.value);
        const amount2 = Number(value2Elm.value);
        if (evt.target.classList.contains("value-1")) {
          this.setValueToUI(currency2, currency1, amount1);
        } else {
          this.setValueToUI(currency1, currency2, amount2);
        }
      });
    }
  },
  async init() {
    const currencies = await apiData.getCurrencies();
    this.setCurrenciesInUI(currencies);
    this.setDefaultValueToUI();
    this.handleCurrencyChangeEvent();
    this.handleValueChangeEvent();
  },
};
UI.init();
