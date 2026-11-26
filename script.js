(function () {
  "use strict";

  const BASE_CONFIG = {
    2: {
      pattern: /^[01]+$/,
      invalidCharRegex: /[^01]/g,
      prefix: "0b",
      placeholder: "예: 10100100 / 例：10100100",
      hint: "2진수에는 0과 1만 입력할 수 있습니다 (예: 10100100). / 二进制只能输入 0 和 1（例：10100100）。",
      koName: "2진수",
      zhName: "二进制",
      koAllowed: "0과 1",
      zhAllowed: "0 和 1"
    },
    8: {
      pattern: /^[0-7]+$/,
      invalidCharRegex: /[^0-7]/g,
      prefix: "0o",
      placeholder: "예: 244 / 例：244",
      hint: "8진수에는 0~7 숫자만 입력할 수 있습니다 (예: 244). / 八进制只能输入 0~7 的数字（例：244）。",
      koName: "8진수",
      zhName: "八进制",
      koAllowed: "0~7 숫자",
      zhAllowed: "0~7 的数字"
    },
    10: {
      pattern: /^[0-9]+$/,
      invalidCharRegex: /[^0-9]/g,
      prefix: "",
      placeholder: "예: 164 / 例：164",
      hint: "10진수에는 0~9 숫자만 입력할 수 있습니다 (예: 164). / 十进制只能输入 0~9 的数字（例：164）。",
      koName: "10진수",
      zhName: "十进制",
      koAllowed: "0~9 숫자",
      zhAllowed: "0~9 的数字"
    },
    16: {
      pattern: /^[0-9a-fA-F]+$/,
      invalidCharRegex: /[^0-9a-fA-F]/g,
      prefix: "0x",
      placeholder: "예: A4 / 例：A4",
      hint: "16진수에는 0~9와 A~F(a~f)만 입력할 수 있습니다 (예: A4). / 十六进制只能输入 0~9 和 A~F（或 a~f）（例：A4）。",
      koName: "16진수",
      zhName: "十六进制",
      koAllowed: "0~9 및 A~F(a~f)",
      zhAllowed: "0~9 和 A~F（或 a~f）"
    }
  };

  const form = document.getElementById("converter-form");
  const baseRadios = document.querySelectorAll('input[name="base"]');
  const numberInput = document.getElementById("number-input");
  const inputHint = document.getElementById("input-hint");
  const errorBox = document.getElementById("error-message");
  const clearBtn = document.getElementById("clear-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const emptyState = document.getElementById("empty-state");
  const resultsGrid = document.getElementById("results-grid");
  const resultItems = document.querySelectorAll(".result-item");
  const copyButtons = document.querySelectorAll(".copy-btn");

  const resultOutputs = {
    2: document.getElementById("result-2"),
    8: document.getElementById("result-8"),
    10: document.getElementById("result-10"),
    16: document.getElementById("result-16")
  };

  function getSelectedBase() {
    const checked = document.querySelector('input[name="base"]:checked');
    return checked ? Number(checked.value) : 10;
  }

  function setSelectedBase(base) {
    const radio = document.querySelector('input[name="base"][value="' + base + '"]');
    if (radio) {
      radio.checked = true;
    }
    updateHintForBase(base);
  }

  function updateHintForBase(base) {
    const config = BASE_CONFIG[base];
    inputHint.textContent = config.hint;
    numberInput.placeholder = config.placeholder;
  }

  function formatBinaryInGroupsOfFour(binaryStr) {
    const parts = [];
    for (let i = binaryStr.length; i > 0; i -= 4) {
      const start = Math.max(0, i - 4);
      parts.unshift(binaryStr.slice(start, i));
    }
    return parts.join(" ");
  }

  function validateInput(rawValue, base) {
    const trimmed = rawValue.trim();

    if (trimmed === "") {
      return {
        valid: false,
        message: "입력값이 비어 있습니다. 0 이상의 정수를 입력해 주세요. / 输入不能为空，请输入一个非负整数。"
      };
    }

    if (trimmed.startsWith("-")) {
      return {
        valid: false,
        message: "음수는 변환할 수 없습니다. 0 이상의 정수만 입력해 주세요. / 不能输入负数，请输入 0 或正整数。"
      };
    }

    if (trimmed.includes(".")) {
      return {
        valid: false,
        message: "소수점이 포함된 수는 입력할 수 없습니다. 정수만 입력해 주세요. / 不能输入小数，请只输入整数。"
      };
    }

    if (/\s/.test(trimmed)) {
      return {
        valid: false,
        message: "숫자 중간에 공백을 포함할 수 없습니다. 공백 없이 입력해 주세요. / 数字中间不能包含空格，请去掉空格后重试。"
      };
    }

    const config = BASE_CONFIG[base];
    if (!config.pattern.test(trimmed)) {
      const invalidChars = Array.from(new Set(trimmed.match(config.invalidCharRegex) || []));
      const invalidList = invalidChars.join(", ");
      return {
        valid: false,
        message:
          config.koName + "에는 " + config.koAllowed + "만 입력할 수 있습니다 (잘못된 문자: " + invalidList + "). / " +
          config.zhName + "只能输入" + config.zhAllowed + "（包含无效字符：" + invalidList + "）。"
      };
    }

    return { valid: true, value: trimmed };
  }

  function parseBigIntByBase(cleaned, base) {
    const config = BASE_CONFIG[base];
    return BigInt(config.prefix + cleaned);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    numberInput.classList.add("is-invalid");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
    numberInput.classList.remove("is-invalid");
  }

  function renderResults(value, sourceBase) {
    const binaryRaw = value.toString(2);
    resultOutputs[2].textContent = formatBinaryInGroupsOfFour(binaryRaw);
    resultOutputs[8].textContent = value.toString(8);
    resultOutputs[10].textContent = value.toString(10);
    resultOutputs[16].textContent = value.toString(16).toUpperCase();

    resultItems.forEach(function (item) {
      const itemBase = Number(item.getAttribute("data-base"));
      const badge = item.querySelector(".source-badge");
      const isSource = itemBase === sourceBase;
      item.classList.toggle("is-source", isSource);
      if (badge) {
        badge.hidden = !isSource;
      }
    });

    emptyState.hidden = true;
    resultsGrid.hidden = false;
  }

  function resetAll() {
    numberInput.value = "";
    clearError();
    resultsGrid.hidden = true;
    emptyState.hidden = false;
    Object.keys(resultOutputs).forEach(function (key) {
      resultOutputs[key].textContent = "";
    });
    numberInput.focus();
  }

  function handleConvert() {
    const base = getSelectedBase();
    const validation = validateInput(numberInput.value, base);

    if (!validation.valid) {
      showError(validation.message);
      resultsGrid.hidden = true;
      emptyState.hidden = false;
      return;
    }

    clearError();
    const numericValue = parseBigIntByBase(validation.value, base);
    renderResults(numericValue, base);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          resolve();
        } else {
          reject(new Error("Copy failed"));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    handleConvert();
  });

  baseRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      updateHintForBase(getSelectedBase());
      clearError();
    });
  });

  numberInput.addEventListener("input", function () {
    if (!errorBox.hidden) {
      clearError();
    }
  });

  clearBtn.addEventListener("click", resetAll);

  sampleBtn.addEventListener("click", function () {
    setSelectedBase(10);
    numberInput.value = "164";
    handleConvert();
  });

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (!targetEl || !targetEl.textContent) {
        return;
      }

      copyText(targetEl.textContent).then(function () {
        button.textContent = "복사됨 / 已复制";
        button.classList.add("is-copied");
        setTimeout(function () {
          button.textContent = "복사 / 复制";
          button.classList.remove("is-copied");
        }, 1500);
      }).catch(function () {
        button.textContent = "복사 실패 / 复制失败";
        setTimeout(function () {
          button.textContent = "복사 / 复制";
        }, 1500);
      });
    });
  });

  updateHintForBase(getSelectedBase());
})();

