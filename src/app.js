const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/18o6MwnT0vfyMIV3hm4lKHu6gtpE2Glsivv_LnyR2jO0/edit?gid=890066547#gid=890066547";
const BONUS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1SMgRCqPI7LXqXi7xcq3k0vfX4ZQiTccRDTTvG5l24Yk/edit?pli=1&gid=195863414#gid=195863414";

const KPI_TABS = [
  { id: "sales", label: "Sales", sheet: "Sales", color: "#4b8dff", unit: "count", aggregate: "sum", targetPerMonth: 600 },
  { id: "dependability", label: "Dependability", sheet: "Dependability", color: "#8d5cff", unit: "percent", aggregate: "average", overallWeight: 0.10 },
  { id: "quality", label: "Chat Quality", sheet: "Quality", color: "#a64dff", unit: "percent", aggregate: "average", overallWeight: 0.30 },
  { id: "rt", label: "Response Time", sheet: "RT", color: "#4b8dff", unit: "percent", aggregate: "average", overallWeight: 0.30 },
  { id: "tnd", label: "T&D Score", sheet: "TnD", color: "#155dff", unit: "percent", aggregate: "average", overallWeight: 0.30 },
  { id: "coins", label: "Gold Coins", sheet: "Gold Coins", color: "#f7b733", unit: "count", aggregate: "sum", targetPerMonth: 330 }
];

const ACTUAL_DATA_KPI_IDS = new Set(["sales", "quality", "rt", "tnd", "coins"]);
const BONUS_START_YEAR = 2022;
const AUTH_STORAGE_KEY = "employee-performance-authenticated";
const AUTH_USERS = {
  user1: "9f37f577aad6b6518ea0685b3b96cc94dec6ebb8c66914588cc108ed4ea14e4b",
  user2: "5c3cfda21b1fd485dbef4c03d224c4dd4ef1653e4fdc555af54bac39c8c233f0"
};

const META_TABS = {
  employees: "Employee List",
  teams: "Team"
};

const state = {
  sheetId: "",
  kpis: new Map(),
  employees: new Map(),
  teams: new Map(),
  months: [],
  selectedUser: "",
  annualAutoRange: true,
  dashboardStarted: false,
  bonusStarted: false,
  bonusRows: [],
  bonusMonths: [],
  bonusEmployees: new Map(),
  selectedBonusUser: "",
  diagnostics: []
};

const els = {
  app: document.querySelector("#app"),
  loginPage: document.querySelector("#loginPage"),
  loginForm: document.querySelector("#loginForm"),
  loginUsername: document.querySelector("#loginUsername"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  logoutBtn: document.querySelector("#logoutBtn"),
  performanceNav: document.querySelector("#performanceNav"),
  bonusNav: document.querySelector("#bonusNav"),
  performancePage: document.querySelector("#performancePage"),
  bonusPage: document.querySelector("#bonusPage"),
  sheetUrl: document.querySelector("#sheetUrl"),
  controls: document.querySelector("#controls"),
  loadBtn: document.querySelector("#loadBtn"),
  employeeInput: document.querySelector("#employeeInput"),
  employeeOptions: document.querySelector("#employeeOptions"),
  startMonth: document.querySelector("#startMonth"),
  endMonth: document.querySelector("#endMonth"),
  statusText: document.querySelector("#statusText"),
  statusTitle: document.querySelector(".status-title"),
  progressPanel: document.querySelector("#progressPanel"),
  progressLabel: document.querySelector("#progressLabel"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  employeeName: document.querySelector("#employeeName"),
  employeeMeta: document.querySelector("#employeeMeta"),
  scoreValue: document.querySelector("#scoreValue"),
  summaryGrid: document.querySelector("#summaryGrid"),
  insightList: document.querySelector("#insightList"),
  rangeTitle: document.querySelector("#rangeTitle"),
  coverageText: document.querySelector("#coverageText"),
  chartsGrid: document.querySelector("#chartsGrid"),
  downloadReport: document.querySelector("#downloadReport"),
  downloadCsv: document.querySelector("#downloadCsv"),
  evaluationInputs: document.querySelector("#evaluationInputs"),
  addEvaluationUser: document.querySelector("#addEvaluationUser"),
  evaluationTableBody: document.querySelector("#evaluationTableBody"),
  downloadEvaluationPdf: document.querySelector("#downloadEvaluationPdf"),
  annualStartMonth: document.querySelector("#annualStartMonth"),
  annualEndMonth: document.querySelector("#annualEndMonth"),
  refreshEvaluationRange: document.querySelector("#refreshEvaluationRange"),
  bonusControls: document.querySelector("#bonusControls"),
  bonusSheetUrl: document.querySelector("#bonusSheetUrl"),
  bonusLoadBtn: document.querySelector("#bonusLoadBtn"),
  bonusEmployeeInput: document.querySelector("#bonusEmployeeInput"),
  bonusEmployeeOptions: document.querySelector("#bonusEmployeeOptions"),
  bonusStartMonth: document.querySelector("#bonusStartMonth"),
  bonusEndMonth: document.querySelector("#bonusEndMonth"),
  bonusTrendToggle: document.querySelector("#bonusTrendToggle"),
  bonusEmployeeName: document.querySelector("#bonusEmployeeName"),
  bonusEmployeeMeta: document.querySelector("#bonusEmployeeMeta"),
  bonusPayableValue: document.querySelector("#bonusPayableValue"),
  bonusSummaryGrid: document.querySelector("#bonusSummaryGrid"),
  bonusCoverageText: document.querySelector("#bonusCoverageText"),
  bonusChartsGrid: document.querySelector("#bonusChartsGrid"),
  bonusHistoryTitle: document.querySelector("#bonusHistoryTitle"),
  bonusEmployeeSummaryGrid: document.querySelector("#bonusEmployeeSummaryGrid"),
  bonusHistoryBody: document.querySelector("#bonusHistoryBody")
};

initializeAuth();

els.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await handleLogin();
});

els.logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  showLogin();
});

els.performanceNav.addEventListener("click", () => showPage("performance"));
els.bonusNav.addEventListener("click", () => showPage("bonus"));

els.controls.addEventListener("submit", (event) => {
  event.preventDefault();
  loadSheet(els.sheetUrl.value.trim() || DEFAULT_SHEET_URL);
});

els.bonusControls.addEventListener("submit", (event) => {
  event.preventDefault();
  loadBonusSheet(els.bonusSheetUrl.value.trim() || BONUS_SHEET_URL);
});

els.bonusEmployeeInput.addEventListener("change", selectTypedBonusEmployee);
els.bonusEmployeeInput.addEventListener("blur", selectTypedBonusEmployee);
els.bonusEmployeeInput.addEventListener("input", selectExactBonusEmployee);
els.bonusEmployeeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    selectTypedBonusEmployee();
  }
});
els.bonusTrendToggle.addEventListener("change", renderBonusDashboard);
els.bonusStartMonth.addEventListener("change", () => {
  setActiveBonusRangeButton("");
  renderBonusDashboard();
});
els.bonusEndMonth.addEventListener("change", () => {
  setActiveBonusRangeButton("");
  renderBonusDashboard();
});
document.querySelectorAll("[data-bonus-range]").forEach((button) => {
  button.addEventListener("click", () => {
    const range = button.dataset.bonusRange === "all" ? "all" : Number(button.dataset.bonusRange);
    setBonusDefaultRange(range);
    setActiveBonusRangeButton(button.dataset.bonusRange);
    renderBonusDashboard();
  });
});

els.bonusSheetUrl.value = BONUS_SHEET_URL;

els.employeeInput.addEventListener("change", selectTypedEmployee);
els.employeeInput.addEventListener("blur", selectTypedEmployee);
els.employeeInput.addEventListener("input", selectExactEmployee);
els.employeeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    selectTypedEmployee();
  }
});

els.startMonth.addEventListener("change", () => {
  setActiveRangeButton("");
  renderDashboard();
});
els.endMonth.addEventListener("change", () => {
  setActiveRangeButton("");
  renderDashboard();
});

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-range]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const range = button.dataset.range === "all" ? "all" : Number(button.dataset.range);
    setDefaultRange(range);
    renderDashboard();
  });
});

els.downloadReport.addEventListener("click", downloadReport);
els.downloadCsv.addEventListener("click", downloadCsv);
els.addEvaluationUser.addEventListener("click", () => addEvaluationField());
els.downloadEvaluationPdf.addEventListener("click", downloadEvaluationPdf);
els.refreshEvaluationRange.addEventListener("click", () => {
  state.annualAutoRange = true;
  resetAnnualRange();
  renderAnnualEvaluation();
});
els.annualStartMonth.addEventListener("change", () => {
  state.annualAutoRange = false;
  renderAnnualEvaluation();
});
els.annualEndMonth.addEventListener("change", () => {
  state.annualAutoRange = false;
  renderAnnualEvaluation();
});

function initializeAuth() {
  if (sessionStorage.getItem(AUTH_STORAGE_KEY) === "true") {
    showDashboard();
    return;
  }
  showLogin();
}

function showLogin() {
  els.loginPage.classList.remove("auth-hidden");
  els.app.classList.add("auth-hidden");
  els.loginPassword.value = "";
  els.loginError.textContent = "";
  window.setTimeout(() => els.loginUsername.focus(), 0);
}

function showDashboard() {
  els.loginPage.classList.add("auth-hidden");
  els.app.classList.remove("auth-hidden");
  startDashboard();
}

function showPage(page) {
  const isBonus = page === "bonus";
  els.performancePage.classList.toggle("auth-hidden", isBonus);
  els.bonusPage.classList.toggle("auth-hidden", !isBonus);
  els.controls.classList.toggle("auth-hidden", isBonus);
  els.bonusControls.classList.toggle("auth-hidden", !isBonus);
  els.performanceNav.classList.toggle("active", !isBonus);
  els.bonusNav.classList.toggle("active", isBonus);

  if (isBonus) {
    startBonusDashboard();
    return;
  }

  setStatus("Loaded", state.employees.size
    ? `Found ${state.employees.size} employees and ${state.months.length} month columns.`
    : "Paste a Sheet URL or use the default Employee Performance Profile sheet.");
}

function startDashboard() {
  if (state.dashboardStarted) return;
  state.dashboardStarted = true;
  els.sheetUrl.value = DEFAULT_SHEET_URL;
  setEmptyControls();
  loadSheet(DEFAULT_SHEET_URL);
}

function startBonusDashboard() {
  if (state.bonusStarted) return;
  state.bonusStarted = true;
  setBonusEmpty();
  loadBonusSheet(els.bonusSheetUrl.value.trim() || BONUS_SHEET_URL);
}

async function handleLogin() {
  const username = normalizeUser(els.loginUsername.value);
  const password = els.loginPassword.value;
  const expectedHash = AUTH_USERS[username];
  const actualHash = await sha256(password);

  if (expectedHash && actualHash === expectedHash) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
    showDashboard();
    return;
  }

  els.loginError.textContent = "Invalid username or password.";
  els.loginPassword.value = "";
  els.loginPassword.focus();
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function loadSheet(url) {
  const sheetId = extractSheetId(url);
  if (!sheetId) {
    setStatus("Could not read Sheet URL", "Paste a valid Google Sheets URL that includes /d/{sheet-id}/.");
    return;
  }

  setStatus("Loading", "Reading KPI tabs from Google Sheets...");
  startProgress("Loading performance data");
  els.loadBtn.disabled = true;
  state.sheetId = sheetId;
  state.kpis.clear();
  state.employees.clear();
  state.teams.clear();
  state.months = [];
  state.diagnostics = [];

  try {
    const totalSteps = KPI_TABS.length + 2;
    let completedSteps = 0;
    const markStep = (label) => {
      completedSteps += 1;
      updateProgress(completedSteps, totalSteps, label);
    };

    await Promise.all(KPI_TABS.map((tab) => loadKpiTab(sheetId, tab).finally(() => markStep(tab.label))));
    await loadEmployeeMeta(sheetId);
    markStep("Employee list");
    await loadTeamMeta(sheetId);
    markStep("Teams");
    buildEmployeeOptions();
    buildMonthOptions();
    initializeEvaluationInputs();
    setDefaultRange(12);
    renderDashboard();
    renderAnnualEvaluation();
    const warnings = state.diagnostics.length ? ` ${state.diagnostics.join(" ")}` : "";
    setStatus("Loaded", `Found ${state.employees.size} employees and ${state.months.length} month columns.${warnings}`);
    finishProgress();
  } catch (error) {
    setStatus("Load failed", friendlyError(error));
    hideProgress();
  } finally {
    els.loadBtn.disabled = false;
  }
}

async function loadKpiTab(sheetId, tab) {
  try {
    const table = await querySheet(sheetId, tab.sheet);
    const rows = tableToRows(table);
    const metricRows = new Map();

    rows.forEach((row) => {
      const username = normalizeUser(row.values[0]);
      if (!username) return;
      ensureEmployee(username).username = row.values[0];
      metricRows.set(username, extractSeries(row.headers, row.values, tab));
    });

    state.kpis.set(tab.id, metricRows);
  } catch (error) {
    state.diagnostics.push(`${tab.label} tab was not readable.`);
    state.kpis.set(tab.id, new Map());
  }
}

async function loadBonusSheet(url) {
  const sheetId = extractSheetId(url);
  if (!sheetId) {
    setStatus("Could not read Bonus Sheet URL", "Paste a valid Google Sheets URL that includes /d/{sheet-id}/.");
    return;
  }

  setStatus("Loading bonus", "Reading month tabs from the bonus sheet...");
  startProgress("Loading bonus data");
  els.bonusLoadBtn.disabled = true;
  state.bonusRows = [];
  state.bonusMonths = [];
  state.bonusEmployees.clear();

  try {
    const tabs = bonusMonthTabs();
    let completedSteps = 0;
    const results = await Promise.allSettled(tabs.map((tab) => loadBonusMonthTab(sheetId, tab).finally(() => {
      completedSteps += 1;
      updateProgress(completedSteps, tabs.length, tab.label);
    })));
    const loaded = results.filter((result) => result.status === "fulfilled" && result.value.length).flatMap((result) => result.value);
    state.bonusRows = trimTrailingDuplicateBonusMonths(loaded).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    state.bonusMonths = [...new Map(state.bonusRows.map((row) => [row.monthKey, { key: row.monthKey, label: row.monthLabel }])).values()]
      .sort((a, b) => a.key.localeCompare(b.key));
    buildBonusEmployeeOptions();
    buildBonusMonthOptions();
    renderBonusDashboard();
    setStatus("Bonus loaded", `Loaded ${state.bonusRows.length.toLocaleString("en-US")} bonus rows across ${state.bonusMonths.length} month tabs.`);
    finishProgress();
  } catch (error) {
    setStatus("Bonus load failed", friendlyError(error));
    hideProgress();
  } finally {
    els.bonusLoadBtn.disabled = false;
  }
}

async function loadBonusMonthTab(sheetId, tab) {
  try {
    const table = await querySheet(sheetId, tab.sheet);
    return tableToRows(table).map((row) => parseBonusRow(row, tab)).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function parseBonusRow(row, tab) {
  const headerMap = new Map(row.headers.map((header, index) => [normalizeHeader(header), index]));
  const firstValue = cleanCell(row.values[0]);
  const tag = normalizeHeader(firstValue);
  const cpb = tag === "cpb" || tag.includes("consistence performance bonus");
  const offset = cpb || !valueByHeader(row, headerMap, "name") ? 1 : 0;
  const name = valueByHeader(row, headerMap, "name") || cleanCell(row.values[offset]);
  const username = normalizeUser(valueByHeader(row, headerMap, "username") || row.values[offset + 1]);

  if (!username || username === "username") return null;

  const record = {
    monthKey: tab.key,
    monthLabel: tab.label,
    cpb,
    name,
    username,
    salesQa: parseMoney(valueByHeader(row, headerMap, "sales qa") || row.values[offset + 2]),
    teamBonus: parseMoney(valueByHeader(row, headerMap, "team bonus") || row.values[offset + 3]),
    dependability: parseMetric(valueByHeader(row, headerMap, "dependability") || row.values[offset + 4], "percent"),
    finalTeamBonus: parseMoney(valueByHeader(row, headerMap, "final team bonus") || row.values[offset + 5]),
    otherOffs: parseNumber(valueByHeader(row, headerMap, "other offs") || row.values[offset + 6]),
    unpaidNoShows: parseNumber(valueByHeader(row, headerMap, "unpaids no shows") || row.values[offset + 7]),
    totalOffs: parseNumber(valueByHeader(row, headerMap, "total offs") || row.values[offset + 8]),
    compensation: parseMoney(valueByHeader(row, headerMap, "compensation") || row.values[offset + 9]),
    team: valueByHeader(row, headerMap, "teams") || valueByHeader(row, headerMap, "team") || cleanCell(row.values[offset + 10]),
    payable: parseMoney(valueByHeader(row, headerMap, "payable") || row.values[offset + 11]),
    status: valueByHeader(row, headerMap, "emp status") || cleanCell(row.values[offset + 12])
  };

  const employee = state.bonusEmployees.get(username) || { username, name: record.name };
  employee.name = record.name || employee.name;
  employee.latestTeam = record.team || employee.latestTeam;
  state.bonusEmployees.set(username, employee);
  return record;
}

function valueByHeader(row, headerMap, key) {
  const index = headerMap.get(normalizeHeader(key));
  return index === undefined ? "" : cleanCell(row.values[index]);
}

function bonusMonthTabs() {
  const tabs = [];
  const endYear = new Date().getFullYear() + 1;
  for (let year = BONUS_START_YEAR; year <= endYear; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      const shortYear = String(year).slice(-2);
      const date = new Date(year, month, 1);
      const name = date.toLocaleString("en-US", { month: "short" });
      tabs.push({
        sheet: `${name}${shortYear}`,
        key: `${year}-${String(month + 1).padStart(2, "0")}`,
        label: `${name} '${shortYear}`
      });
    }
  }
  return tabs;
}

function trimTrailingDuplicateBonusMonths(rows) {
  const summaries = [...new Set(rows.map((row) => row.monthKey))]
    .sort((a, b) => a.localeCompare(b))
    .map((monthKey) => {
      const monthRows = rows.filter((row) => row.monthKey === monthKey);
      return {
        monthKey,
        signature: bonusMonthSignature(monthRows)
      };
    });

  let latestIndex = summaries.length - 1;
  while (latestIndex > 0 && summaries[latestIndex].signature === summaries[latestIndex - 1].signature) {
    latestIndex -= 1;
  }

  const latestRealMonth = summaries[latestIndex]?.monthKey;
  return latestRealMonth ? rows.filter((row) => row.monthKey <= latestRealMonth) : rows;
}

function bonusMonthSignature(rows) {
  const activeRows = rows.filter((row) => !row.status || !normalizeHeader(row.status).includes("resigned"));
  const teamCounts = {};
  activeRows.forEach((row) => {
    const team = row.team || "No Team";
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });
  return JSON.stringify({
    employees: activeRows.length,
    cpb: rows.filter((row) => row.cpb).length,
    salesQa: Math.round(sumRows(rows, "salesQa")),
    finalTeamBonus: Math.round(sumRows(rows, "finalTeamBonus")),
    payable: Math.round(sumRows(rows, "payable")),
    teams: Object.keys(teamCounts).sort().map((team) => [team, teamCounts[team]])
  });
}

async function loadEmployeeMeta(sheetId) {
  try {
    const table = await querySheet(sheetId, META_TABS.employees);
    const rows = tableToRows(table);
    rows.forEach((row) => {
      const username = normalizeUser(row.values[0]);
      if (!username) return;
      const employee = ensureEmployee(username);
      row.headers.forEach((header, index) => {
        const key = normalizeHeader(header);
        const value = cleanCell(row.values[index]);
        if (!value) return;
        if (index === 0) employee.username = value;
        if (key.includes("name") && !key.includes("user")) employee.name = value;
        if (key.includes("emp") && key.includes("type")) employee.empType = value;
        if (key.includes("shift")) employee.shiftType = value;
        if (key.includes("level")) employee.level = value;
        if (key.includes("designation") || key.includes("role")) employee.designation = value;
        if (key.includes("team")) employee.team = value;
      });
    });
  } catch (error) {
    state.diagnostics.push("Employee List tab was not readable.");
  }
}

async function loadTeamMeta(sheetId) {
  try {
    const table = await querySheet(sheetId, META_TABS.teams);
    const rows = tableToRows(table);
    rows.forEach((row) => {
      const username = normalizeUser(row.values[0]);
      if (!username) return;
      const currentTeam = currentTeamValue(row.headers, row.values);
      if (currentTeam) {
        state.teams.set(username, currentTeam);
        ensureEmployee(username).team = currentTeam;
      }
    });
  } catch (error) {
    state.diagnostics.push("Team tab is not available yet.");
  }
}

function querySheet(sheetId, sheetName) {
  const callbackName = `sheetCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const params = new URLSearchParams({
    sheet: sheetName,
    headers: "1",
    tq: "select *",
    tqx: `out:json;responseHandler:${callbackName}`
  });
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out while reading ${sheetName}`));
    }, 30000);

    window[callbackName] = (response) => {
      cleanup();
      if (response.status === "error") {
        const detail = response.errors && response.errors[0] ? response.errors[0].detailed_message || response.errors[0].message : "Unknown sheet error";
        reject(new Error(detail));
      } else {
        resolve(response.table);
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`Could not load ${sheetName}`));
    };
    script.src = url;
    document.head.append(script);

    function cleanup() {
      window.clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    }
  });
}

function tableToRows(table) {
  const headers = table.cols.map((column, index) => column.label || column.id || `Column ${index + 1}`);

  return table.rows.map((row) => {
    const values = headers.map((_, colIndex) => {
      const cell = row.c[colIndex];
      if (!cell) return "";
      return cell.v === null || cell.v === undefined || cell.v === "" ? cell.f : cell.v;
    });
    return { headers, values };
  }).filter((row) => row.values.some((value) => cleanCell(value)));
}

function extractSeries(headers, values, tab) {
  return headers.slice(1).map((header, index) => {
    const month = parseMonth(header);
    const value = parseMetric(values[index + 1], tab.unit);
    if (!month || value === null) return null;
    addMonth(month);
    return { month: month.key, label: month.label, value };
  }).filter(Boolean).sort((a, b) => a.month.localeCompare(b.month));
}

function buildEmployeeOptions() {
  const usernames = new Set();
  state.kpis.forEach((rows) => rows.forEach((_, username) => usernames.add(username)));
  usernames.forEach((username) => ensureEmployee(username));

  const employees = [...state.employees.values()].sort((a, b) => displayName(a).localeCompare(displayName(b)));
  els.employeeOptions.innerHTML = "";
  employees.forEach((employee) => {
    const option = document.createElement("option");
    option.value = employee.username;
    option.label = displayName(employee) === employee.username ? employee.username : `${displayName(employee)} (${employee.username})`;
    els.employeeOptions.append(option);
  });

  state.selectedUser = employees[0] ? normalizeUser(employees[0].username) : "";
  els.employeeInput.value = employees[0] ? employees[0].username : "";
}

function buildBonusEmployeeOptions() {
  const employees = [...state.bonusEmployees.values()].sort((a, b) => displayName(a).localeCompare(displayName(b)));
  els.bonusEmployeeOptions.innerHTML = "";
  employees.forEach((employee) => {
    const option = document.createElement("option");
    option.value = employee.username;
    option.label = displayName(employee) === employee.username ? employee.username : `${displayName(employee)} (${employee.username})`;
    els.bonusEmployeeOptions.append(option);
  });

  state.selectedBonusUser = "";
  els.bonusEmployeeInput.value = "";
}

function buildBonusMonthOptions() {
  const months = bonusAvailableMonths();
  [els.bonusStartMonth, els.bonusEndMonth].forEach((select) => {
    select.innerHTML = "";
    months.forEach((month) => {
      const option = document.createElement("option");
      option.value = month.key;
      option.textContent = month.label;
      select.append(option);
    });
  });
  if (state.bonusMonths.length) {
    setBonusDefaultRange(12);
    setActiveBonusRangeButton("12");
  }
}

function setBonusDefaultRange(size) {
  const months = bonusAvailableMonths();
  if (!months.length) return;
  const end = months[months.length - 1];
  const start = size === "all"
    ? months[0]
    : months[Math.max(0, months.length - size)];
  els.bonusStartMonth.value = start.key;
  els.bonusEndMonth.value = end.key;
}

function bonusAvailableMonths() {
  return [...state.bonusMonths]
    .filter((month) => state.bonusRows.some((row) => row.monthKey === month.key))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function setActiveBonusRangeButton(range) {
  document.querySelectorAll("[data-bonus-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bonusRange === range);
  });
}

function getBonusRange() {
  let start = els.bonusStartMonth.value;
  let end = els.bonusEndMonth.value;
  if (!start || !end) return null;
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function bonusRowsForEmployee(username) {
  const range = getBonusRange();
  return state.bonusRows
    .filter((row) => row.username === username && (!range || (row.monthKey >= range.start && row.monthKey <= range.end)))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

function bonusMonthSummaries() {
  const range = getBonusRange();
  return state.bonusMonths.filter((month) => !range || (month.key >= range.start && month.key <= range.end)).map((month) => {
    const rows = state.bonusRows.filter((row) => row.monthKey === month.key);
    const activeRows = rows.filter((row) => !row.status || !normalizeHeader(row.status).includes("resigned"));
    const teamCounts = {};
    activeRows.forEach((row) => {
      const team = row.team || "No Team";
      teamCounts[team] = (teamCounts[team] || 0) + 1;
    });

    return {
      monthKey: month.key,
      monthLabel: month.label,
      rows,
      activeRows,
      payable: sumRows(rows, "payable"),
      salesQa: sumRows(rows, "salesQa"),
      finalTeamBonus: sumRows(rows, "finalTeamBonus"),
      employeeCount: activeRows.length,
      cpbCount: rows.filter((row) => row.cpb).length,
      teamCounts
    };
  }).filter((summary) => summary.rows.length);
}

function sumRows(rows, key) {
  return rows.reduce((sum, row) => sum + valueOrZero(row[key]), 0);
}

function formatTeamCounts(teamCounts) {
  const preferred = ["Dominators", "Wizards", "Dodgers", "Rookie"];
  const keys = [
    ...preferred.filter((team) => teamCounts[team]),
    ...Object.keys(teamCounts).filter((team) => !preferred.includes(team)).sort()
  ];
  return keys.map((team) => `${team}: ${teamCounts[team]}`).join(", ");
}

function bonusChartSummary(id, label, unit, color, points) {
  const cleanPoints = points
    .filter((point) => point.value !== null && point.value !== undefined && !Number.isNaN(point.value))
    .sort((a, b) => a.month.localeCompare(b.month));
  const first = cleanPoints.length ? cleanPoints[0].value : null;
  const latest = cleanPoints.length ? cleanPoints[cleanPoints.length - 1].value : null;
  const delta = first !== null && latest !== null ? latest - first : 0;
  return {
    tab: { id, label, unit, color },
    points: cleanPoints,
    latest,
    first,
    average: null,
    total: null,
    rangeValue: latest,
    scoreValue: latest,
    delta,
    rangeLabel: "Latest",
    labelMode: "key",
    changeText: cleanPoints.length > 1 ? formatDelta(delta, unit) : "No trend"
  };
}

function buildMonthOptions() {
  state.months.sort((a, b) => a.key.localeCompare(b.key));
  const months = selectableMonths();
  [els.startMonth, els.endMonth, els.annualStartMonth, els.annualEndMonth].forEach((select) => {
    select.innerHTML = "";
    months.forEach((month) => {
      const option = document.createElement("option");
      option.value = month.key;
      option.textContent = month.label;
      select.append(option);
    });
  });
}

function setDefaultRange(size) {
  const months = selectableMonths();
  if (!months.length) return;
  const available = dataMonthsForEmployee(state.selectedUser);
  const source = available.length ? available : months;
  const end = source[source.length - 1];
  const start = size === "all" ? source[0] : source[Math.max(0, source.length - size)];
  els.startMonth.value = start.key;
  els.endMonth.value = end.key;
}

function renderDashboard() {
  if (!state.selectedUser || !state.months.length) {
    renderEmpty();
    return;
  }

  const employee = state.employees.get(state.selectedUser) || { username: state.selectedUser };
  const range = getRange();
  const summaries = KPI_TABS.map((tab) => summarizeKpi(tab, state.selectedUser, range));
  const score = calculateScore(summaries);

  els.employeeName.textContent = displayName(employee);
  els.employeeMeta.textContent = buildMetaLine(employee);
  els.scoreValue.textContent = score === null ? "--" : `${formatScore(score)}%`;
  els.rangeTitle.textContent = `${monthLabel(range.start)} to ${monthLabel(range.end)}`;
  els.coverageText.textContent = `${summaries.filter((item) => item.points.length).length} of ${KPI_TABS.length} KPIs have data in this range.`;

  renderSummaryCards(summaries);
  renderInsights(summaries);
  renderCharts(summaries);
}

function renderBonusDashboard() {
  if (!state.bonusRows.length) {
    renderBonusEmpty("No bonus rows loaded yet.");
    return;
  }

  const summaries = bonusMonthSummaries();
  const latest = summaries[summaries.length - 1];
  const selectedEmployee = state.selectedBonusUser ? state.bonusEmployees.get(state.selectedBonusUser) : null;

  els.bonusEmployeeName.textContent = "Bonus Breakdown";
  els.bonusEmployeeMeta.textContent = latest
    ? `Latest month: ${latest.monthLabel} | ${formatTeamCounts(latest.teamCounts)}`
    : "No monthly bonus rows found.";
  els.bonusPayableValue.textContent = latest ? formatValue(latest.payable, "money") : "--";
  els.bonusCoverageText.textContent = `Loaded ${summaries.length} month tabs and ${state.bonusEmployees.size} employees. Select an employee for individual breakdown.`;

  renderBonusTiles(summaries);
  renderBonusComparisonChart(summaries);

  if (selectedEmployee) {
    renderBonusHistory(bonusRowsForEmployee(state.selectedBonusUser), selectedEmployee);
  } else {
    renderBonusHistory([], null);
  }
}

function renderBonusEmpty(message) {
  els.bonusEmployeeName.textContent = "Select an employee";
  els.bonusEmployeeMeta.textContent = message;
  els.bonusPayableValue.textContent = "--";
  els.bonusSummaryGrid.innerHTML = "";
  els.bonusChartsGrid.innerHTML = '<div class="empty-state">No bonus values found.</div>';
  els.bonusEmployeeSummaryGrid.innerHTML = "";
  els.bonusHistoryBody.innerHTML = '<tr><td colspan="9" class="evaluation-empty">Select an employee to begin.</td></tr>';
}

function renderBonusTiles(summaries) {
  els.bonusSummaryGrid.innerHTML = "";
  const latest = summaries[summaries.length - 1];
  const tiles = [
    { type: "latest", title: "Latest Month", color: "#7b55ff" },
    { title: "# of Employees", key: "employeeCount", unit: "count", color: "#155dff", orientation: "vertical" },
    { type: "teams", title: "Teams Month Wise", color: "#45caff" },
    { title: "Sales + QA Monthly Sum", key: "salesQa", unit: "money", color: "#4b8dff", orientation: "vertical" },
    { title: "Final Team Bonus Monthly Sum", key: "finalTeamBonus", unit: "money", color: "#c23eff", orientation: "vertical" },
    { title: "Payable Month Wise", key: "payable", unit: "money", color: "#7b55ff", orientation: "horizontal" }
  ];

  tiles.forEach((tile) => {
    const node = document.createElement("article");
    node.className = "bonus-tile";
    node.innerHTML = `
      <div class="bonus-tile-head">
        <div>
          <p class="eyebrow">${escapeHtml(tile.type === "latest" ? "Overview" : "Monthly")}</p>
          <h4>${escapeHtml(tile.title)}</h4>
        </div>
      </div>
      <div class="bonus-tile-body"></div>`;
    const body = node.querySelector(".bonus-tile-body");

    if (tile.type === "latest") {
      body.innerHTML = latest ? `
        <strong class="bonus-latest-month">${escapeHtml(latest.monthLabel)}</strong>
        <dl class="bonus-detail-list">
          <div><dt># of Employees</dt><dd>${escapeHtml(formatValue(latest.employeeCount, "count"))}</dd></div>
          <div><dt># of CPB Employees</dt><dd>${escapeHtml(formatValue(latest.cpbCount, "count"))}</dd></div>
          <div><dt>Sales + QA</dt><dd>${escapeHtml(formatValue(latest.salesQa, "money"))}</dd></div>
          <div><dt>Final Team Bonus</dt><dd>${escapeHtml(formatValue(latest.finalTeamBonus, "money"))}</dd></div>
          <div><dt>Payable</dt><dd>${escapeHtml(formatValue(latest.payable, "money"))}</dd></div>
        </dl>` : '<div class="empty-state">No latest month.</div>';
    } else if (tile.type === "teams") {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("role", "img");
      body.append(svg);
      body.classList.toggle("scrollable-chart", summaries.length > 18);
      drawTeamBreakdownChart(svg, summaries);
    } else {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("role", "img");
      body.append(svg);
      body.classList.toggle("scrollable-chart", summaries.length > 18);
      drawBonusBarChart(svg, {
        title: tile.title,
        key: tile.key,
        unit: tile.unit,
        color: tile.color,
        orientation: tile.orientation,
        points: summaries.map((summary) => ({
          month: summary.monthKey,
          label: summary.monthLabel,
          value: summary[tile.key],
          details: `${summary.monthLabel}: ${formatValue(summary[tile.key], tile.unit)}`
        })),
        showTrend: els.bonusTrendToggle.checked
      });
    }

    els.bonusSummaryGrid.append(node);
  });
}

function renderBonusComparisonChart(monthSummaries) {
  els.bonusChartsGrid.innerHTML = "";
  const template = document.querySelector("#chartTemplate");
  const node = template.content.firstElementChild.cloneNode(true);
  node.classList.add("wide-chart");
  node.querySelector(".eyebrow").textContent = "Bonus";
  node.querySelector("h4").textContent = "# of Employees vs Total Payable";
  node.querySelector(".trend-pill").textContent = "All months";
  const svg = node.querySelector("svg");
  els.bonusChartsGrid.append(node);
  drawEmployeePayableChart(svg, monthSummaries);
}

function renderBonusHistory(rows, employee) {
  if (!rows.length) {
    els.bonusHistoryTitle.textContent = "Employee bonus history";
    els.bonusEmployeeSummaryGrid.innerHTML = "";
    els.bonusHistoryBody.innerHTML = '<tr><td colspan="9" class="evaluation-empty">Select an employee to see individual bonus history.</td></tr>';
    return;
  }

  els.bonusHistoryTitle.textContent = `Employee bonus history: ${employee.name || employee.username}`;
  renderBonusEmployeeSummary(rows);

  els.bonusHistoryBody.innerHTML = [...rows].reverse().map((row) => `
    <tr>
      <td>${escapeHtml(row.monthLabel)}</td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.username)}</td>
      <td class="${row.cpb ? "cpb-cell" : ""}">${row.cpb ? "CPB" : "--"}</td>
      <td>${escapeHtml(row.team)}</td>
      <td>${escapeHtml(formatValue(row.totalOffs, "count"))}</td>
      <td>${escapeHtml(formatValue(row.salesQa, "money"))}</td>
      <td>${escapeHtml(formatValue(row.finalTeamBonus, "money"))}</td>
      <td>${escapeHtml(formatValue(row.payable, "money"))}</td>
    </tr>`).join("");
}

function renderBonusEmployeeSummary(rows) {
  const cards = [
    { label: "Total OFFs", value: sumRows(rows, "totalOffs"), unit: "count", detail: `${rows.length} selected months`, color: "#155dff" },
    { label: "Sales + QA", value: sumRows(rows, "salesQa"), unit: "money", detail: `${rows.length} selected months`, color: "#4b8dff" },
    { label: "Final Team Bonus", value: sumRows(rows, "finalTeamBonus"), unit: "money", detail: `${rows.length} selected months`, color: "#c23eff" },
    { label: "Payable", value: sumRows(rows, "payable"), unit: "money", detail: `${rows.length} selected months`, color: "#7b55ff" }
  ];
  els.bonusEmployeeSummaryGrid.innerHTML = "";
  const template = document.querySelector("#metricCardTemplate");
  cards.forEach((card) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.classList.add("bonus-employee-card");
    node.querySelector(".metric-dot").style.background = card.color;
    node.querySelector(".metric-head p").textContent = card.label;
    node.querySelector("strong").textContent = formatValue(card.value, card.unit);
    node.querySelector("small").textContent = card.detail;
    els.bonusEmployeeSummaryGrid.append(node);
  });
  renderEmployeeTeamHistoryTile(rows);
}

function renderEmployeeTeamHistoryTile(rows) {
  const node = document.createElement("article");
  node.className = "bonus-tile employee-team-tile";
  node.innerHTML = `
    <div class="bonus-tile-head">
      <div>
        <p class="eyebrow">History</p>
        <h4>Historical Teams</h4>
      </div>
    </div>
    <div class="bonus-tile-body"></div>`;
  const body = node.querySelector(".bonus-tile-body");
  body.classList.toggle("scrollable-chart", rows.length > 18);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("role", "img");
  body.append(svg);
  drawEmployeeTeamHistoryChart(svg, rows);
  els.bonusEmployeeSummaryGrid.append(node);
}

function drawBonusBarChart(svg, config) {
  const pointCount = Math.max(config.points.length, 1);
  const width = config.orientation === "horizontal"
    ? Math.max(560, pointCount * 42)
    : Math.max(520, pointCount * 44);
  const height = 220;
  const pad = config.orientation === "horizontal"
    ? { top: 18, right: 78, bottom: 18, left: 88 }
    : { top: 18, right: 14, bottom: 42, left: 54 };
  const points = config.points.filter((point) => Number.isFinite(point.value));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", `${config.title} bar chart`);

  if (!points.length) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">No data</text>`;
    return;
  }

  const shown = points;
  const maxValue = Math.max(...shown.map((point) => point.value), 1);
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  if (config.orientation === "horizontal") {
    const rowGap = 5;
    const rowHeight = (innerHeight - rowGap * (shown.length - 1)) / shown.length;
    const bars = shown.map((point, index) => {
      const y = pad.top + index * (rowHeight + rowGap);
      const barWidth = (point.value / maxValue) * innerWidth;
      return `
        <text x="${pad.left - 8}" y="${y + rowHeight * 0.72}" text-anchor="end" class="chart-label">${escapeHtml(point.label)}</text>
        <rect x="${pad.left}" y="${y}" width="${barWidth}" height="${rowHeight}" rx="4" fill="${config.color}" opacity="0.72" class="bonus-hover-target" data-tooltip="${escapeAttribute(point.details)}"></rect>
        <text x="${pad.left + barWidth + 6}" y="${y + rowHeight * 0.72}" class="chart-value-label">${escapeHtml(formatChartValue(point.value, config.unit))}</text>`;
    }).join("");
    svg.innerHTML = bars + trendLineForBars(shown, config, pad, innerWidth, innerHeight, true);
    attachBonusTooltips(svg);
    return;
  }

  const gap = 7;
  const barWidth = (innerWidth - gap * (shown.length - 1)) / shown.length;
  const labels = shown.map((point, index) => {
    const x = pad.left + index * (barWidth + gap) + barWidth / 2;
    return `<text x="${x}" y="${height - 12}" text-anchor="middle" class="chart-label">${escapeHtml(point.label)}</text>`;
  }).join("");
  const bars = shown.map((point, index) => {
    const barHeight = (point.value / maxValue) * innerHeight;
    const x = pad.left + index * (barWidth + gap);
    const y = pad.top + innerHeight - barHeight;
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${config.color}" opacity="0.72" class="bonus-hover-target" data-tooltip="${escapeAttribute(point.details)}"></rect>
      <text x="${x + barWidth / 2}" y="${Math.max(12, y - 6)}" text-anchor="middle" class="chart-value-label">${escapeHtml(formatChartValue(point.value, config.unit))}</text>`;
  }).join("");
  svg.innerHTML = `
    <line x1="${pad.left}" y1="${pad.top + innerHeight}" x2="${pad.left + innerWidth}" y2="${pad.top + innerHeight}" class="chart-axis" />
    ${bars}
    ${trendLineForBars(shown, config, pad, innerWidth, innerHeight, false)}
    ${labels}`;
  attachBonusTooltips(svg);
}

function drawTeamBreakdownChart(svg, summaries) {
  const width = Math.max(520, summaries.length * 44);
  const height = 220;
  const pad = { top: 16, right: 12, bottom: 34, left: 46 };
  const teams = ["Dominators", "Wizards", "Dodgers", "Rookie", "Retainer"];
  const colors = {
    Dominators: "#6c44f7",
    Wizards: "#c23eff",
    Dodgers: "#155dff",
    Rookie: "#45caff",
    Retainer: "#f7b733"
  };
  const shown = summaries;
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const gap = 7;
  const barWidth = (innerWidth - gap * (shown.length - 1)) / shown.length;
  const maxTotal = Math.max(...shown.map((summary) => Math.max(summary.employeeCount, 1)), 1);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", "Month wise team count chart");

  const bars = shown.map((summary, index) => {
    const x = pad.left + index * (barWidth + gap);
    let yCursor = pad.top + innerHeight;
    const segments = teams.map((team) => {
      const count = summary.teamCounts[team] || 0;
      if (!count) return "";
      const segmentHeight = (count / maxTotal) * innerHeight;
      yCursor -= segmentHeight;
      return `<rect x="${x}" y="${yCursor}" width="${barWidth}" height="${segmentHeight}" fill="${colors[team]}" class="bonus-hover-target" data-tooltip="${escapeAttribute(`${summary.monthLabel}: ${team} ${count} | CPB ${summary.cpbCount}`)}"></rect>`;
    }).join("");
    return `${segments}<text x="${x + barWidth / 2}" y="${Math.max(12, yCursor - 5)}" text-anchor="middle" class="chart-value-label">${summary.employeeCount}</text>`;
  }).join("");
  const labels = shown.map((summary, index) => {
    const x = pad.left + index * (barWidth + gap) + barWidth / 2;
    return `<text x="${x}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(summary.monthLabel)}</text>`;
  }).join("");

  svg.innerHTML = `
    <line x1="${pad.left}" y1="${pad.top + innerHeight}" x2="${pad.left + innerWidth}" y2="${pad.top + innerHeight}" class="chart-axis" />
    ${bars}
    ${labels}`;
  attachBonusTooltips(svg);
}

function trendLineForBars(points, config, pad, innerWidth, innerHeight, horizontal) {
  if (!config.showTrend || points.length < 2) return "";
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  if (horizontal) {
    const rowGap = 5;
    const rowHeight = (innerHeight - rowGap * (points.length - 1)) / points.length;
    const linePoints = points.map((point, index) => {
      const x = pad.left + (point.value / maxValue) * innerWidth;
      const y = pad.top + index * (rowHeight + rowGap) + rowHeight / 2;
      return `${x},${y}`;
    });
    return `<polyline points="${linePoints.join(" ")}" class="trend-line" />`;
  }

  const gap = 7;
  const barWidth = (innerWidth - gap * (points.length - 1)) / points.length;
  const linePoints = points.map((point, index) => {
    const x = pad.left + index * (barWidth + gap) + barWidth / 2;
    const y = pad.top + innerHeight - (point.value / maxValue) * innerHeight;
    return `${x},${y}`;
  });
  return `<polyline points="${linePoints.join(" ")}" class="trend-line" />`;
}

function drawEmployeePayableChart(svg, summaries) {
  const width = 900;
  const height = 320;
  const pad = { top: 26, right: 86, bottom: 42, left: 58 };
  const points = summaries.filter((summary) => Number.isFinite(summary.employeeCount) && Number.isFinite(summary.payable));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", "Employee count vs total payable chart");
  if (!points.length) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">No data</text>`;
    return;
  }

  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const maxPayable = Math.max(...points.map((point) => point.payable), 1);
  const maxEmployees = Math.max(...points.map((point) => point.employeeCount), 1);
  const gap = 5;
  const barWidth = (innerWidth - gap * (points.length - 1)) / points.length;
  const xFor = (index) => pad.left + index * (barWidth + gap) + barWidth / 2;
  const yPayable = (value) => pad.top + innerHeight - (value / maxPayable) * innerHeight;
  const yEmployees = (value) => pad.top + innerHeight - (value / maxEmployees) * innerHeight;
  const bars = points.map((point, index) => {
    const h = (point.payable / maxPayable) * innerHeight;
    const x = pad.left + index * (barWidth + gap);
    const y = pad.top + innerHeight - h;
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="#7b55ff" opacity="0.36" class="bonus-hover-target" data-tooltip="${escapeAttribute(`${point.monthLabel}: Payable ${formatValue(point.payable, "money")} | Employees ${point.employeeCount}`)}"></rect>`;
  }).join("");
  const employeeLine = points.map((point, index) => `${xFor(index)},${yEmployees(point.employeeCount)}`).join(" ");
  const labels = points.map((point, index) => {
    if (index % Math.ceil(points.length / 6) !== 0 && index !== points.length - 1) return "";
    return `<text x="${xFor(index)}" y="${height - 12}" text-anchor="middle" class="chart-label">${escapeHtml(point.monthLabel)}</text>`;
  }).join("");
  const latest = points[points.length - 1];
  svg.innerHTML = `
    <line x1="${pad.left}" y1="${pad.top + innerHeight}" x2="${pad.left + innerWidth}" y2="${pad.top + innerHeight}" class="chart-axis" />
    ${bars}
    <polyline points="${employeeLine}" class="comparison-line" />
    <circle cx="${xFor(points.length - 1)}" cy="${yEmployees(latest.employeeCount)}" r="4" fill="#155dff" class="bonus-hover-target" data-tooltip="${escapeAttribute(`${latest.monthLabel}: ${latest.employeeCount} employees`)}"></circle>
    <text x="${width - 78}" y="22" class="chart-label">Bars: Payable</text>
    <text x="${width - 78}" y="40" class="chart-label">Line: Employees</text>
    ${labels}`;
  attachBonusTooltips(svg);
}

function drawEmployeeTeamHistoryChart(svg, rows) {
  const width = Math.max(520, rows.length * 64);
  const height = 220;
  const pad = { top: 18, right: 16, bottom: 42, left: 32 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const gap = 8;
  const barWidth = rows.length ? (innerWidth - gap * (rows.length - 1)) / rows.length : innerWidth;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", "Employee historical team chart");

  if (!rows.length) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">No team history</text>`;
    return;
  }

  const bars = rows.map((row, index) => {
    const x = pad.left + index * (barWidth + gap);
    const teamColor = colorForTeam(row.team);
    const team = row.team || "No Team";
    const labelX = x + barWidth / 2;
    const labelY = pad.top + innerHeight / 2;
    return `
      <rect x="${x}" y="${pad.top}" width="${barWidth}" height="${innerHeight}" rx="5" fill="${teamColor}" opacity="0.84" class="bonus-hover-target" data-tooltip="${escapeAttribute(`${row.monthLabel}: ${team}`)}"></rect>
      <text x="${labelX}" y="${labelY}" text-anchor="middle" class="team-bar-label" transform="rotate(-90 ${labelX} ${labelY})">${escapeHtml(team)}</text>
      <text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" class="chart-label">${escapeHtml(row.monthLabel)}</text>`;
  }).join("");
  svg.innerHTML = bars;
  attachBonusTooltips(svg);
}

function colorForTeam(team) {
  const key = normalizeHeader(team);
  if (key === "dominators") return "#6c44f7";
  if (key === "wizards") return "#c23eff";
  if (key === "dodgers") return "#155dff";
  if (key === "rookie") return "#45caff";
  if (key === "retainer") return "#f7b733";
  return "#7b55ff";
}

function attachBonusTooltips(svg) {
  const tooltip = bonusTooltip();
  svg.querySelectorAll(".bonus-hover-target").forEach((node) => {
    node.addEventListener("mousemove", (event) => {
      tooltip.textContent = node.dataset.tooltip || "";
      tooltip.classList.add("show");
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY + 14}px`;
    });
    node.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
    });
  });
}

function bonusTooltip() {
  let tooltip = document.querySelector("#bonusTooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "bonusTooltip";
    tooltip.className = "bonus-tooltip";
    document.body.append(tooltip);
  }
  return tooltip;
}

function renderSummaryCards(summaries) {
  els.summaryGrid.innerHTML = "";
  const template = document.querySelector("#metricCardTemplate");
  summaries.forEach((summary) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".metric-dot").style.background = summary.tab.color;
    node.querySelector(".metric-head p").textContent = summary.tab.label;
    node.querySelector("strong").textContent = formatValue(summary.rangeValue, summary.tab.unit);
    node.querySelector("small").textContent = summary.points.length
      ? `${summary.rangeLabel} across ${summary.points.length} month${summary.points.length === 1 ? "" : "s"}`
      : "No values in selected range";
    els.summaryGrid.append(node);
  });
}

function renderInsights(summaries) {
  const valid = summaries.filter((summary) => summary.points.length);
  const best = [...valid].sort((a, b) => b.scoreValue - a.scoreValue)[0];
  const needsAttention = [...valid].sort((a, b) => a.scoreValue - b.scoreValue)[0];
  const improved = [...valid].sort((a, b) => b.delta - a.delta)[0];
  const items = [
    { title: best ? `${best.tab.label}: ${formatValue(best.rangeValue, best.tab.unit)}` : "No KPI data", text: "Best range score" },
    { title: needsAttention ? `${needsAttention.tab.label}: ${formatValue(needsAttention.rangeValue, needsAttention.tab.unit)}` : "No KPI data", text: "Lowest range score" },
    { title: improved ? `${improved.tab.label}: ${formatDelta(improved.delta, improved.tab.unit)}` : "No KPI data", text: "Strongest movement" }
  ];

  els.insightList.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "insight-item";
    div.innerHTML = `<strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span>`;
    els.insightList.append(div);
  });
}

function renderCharts(summaries) {
  els.chartsGrid.innerHTML = "";
  const template = document.querySelector("#chartTemplate");

  summaries.forEach((summary) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".eyebrow").textContent = summary.tab.sheet;
    node.querySelector("h4").textContent = summary.tab.label;
    node.querySelector(".trend-pill").textContent = summary.changeText;
    const svg = node.querySelector("svg");
    els.chartsGrid.append(node);
    drawSvgChart(svg, summary);
  });
}

function drawSvgChart(svg, summary) {
  const width = 700;
  const height = 250;
  const pad = { top: 36, right: 18, bottom: 36, left: 54 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const points = summary.points;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-label", `${summary.tab.label} trend chart`);

  if (!points.length) {
    svg.innerHTML = `<text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="chart-label">No data in range</text>`;
    return;
  }

  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxPointValue = Math.max(...values);
  const maxValue = summary.tab.unit === "percent" ? Math.max(100, ...values) : Math.max(...values, 1);
  const yMax = Math.ceil(maxValue / 10) * 10;
  const xFor = (index) => pad.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
  const yFor = (value) => pad.top + innerHeight - (value / yMax) * innerHeight;
  const linePoints = points.map((point, index) => `${xFor(index)},${yFor(point.value)}`);
  const area = `M ${pad.left},${pad.top + innerHeight} L ${linePoints.join(" L ")} L ${pad.left + innerWidth},${pad.top + innerHeight} Z`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map((tick) => {
    const y = pad.top + innerHeight - tick * innerHeight;
    const value = yMax * tick;
    return `
      <line x1="${pad.left}" y1="${y}" x2="${pad.left + innerWidth}" y2="${y}" class="chart-grid-line" />
      <text x="${pad.left - 10}" y="${y + 4}" text-anchor="end" class="chart-label">${escapeHtml(formatValue(value, summary.tab.unit))}</text>`;
  }).join("");
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const labels = points.map((point, index) => {
    if (index % labelStep !== 0 && index !== points.length - 1) return "";
    return `<text x="${xFor(index)}" y="${height - 10}" text-anchor="middle" class="chart-label">${escapeHtml(point.label)}</text>`;
  }).join("");
  const circles = points.map((point, index) => `
    <circle cx="${xFor(index)}" cy="${yFor(point.value)}" r="4" fill="${summary.tab.color}" class="chart-point">
      <title>${escapeHtml(point.label)}: ${escapeHtml(formatValue(point.value, summary.tab.unit))}</title>
    </circle>`).join("");
  const valueLabels = points.map((point, index) => {
    if (!shouldShowValueLabel(summary, point, index, points, minValue, maxPointValue)) return "";
    const y = Math.max(12, yFor(point.value) - 10 - ((index % 2) * 9));
    return `<text x="${xFor(index)}" y="${y}" text-anchor="middle" class="chart-value-label">${escapeHtml(formatChartValue(point.value, summary.tab.unit))}</text>`;
  }).join("");

  svg.innerHTML = `
    ${grid}
    <line x1="${pad.left}" y1="${pad.top + innerHeight}" x2="${pad.left + innerWidth}" y2="${pad.top + innerHeight}" class="chart-axis" />
    <path d="${area}" fill="${summary.tab.color}" class="chart-area" />
    <polyline points="${linePoints.join(" ")}" stroke="${summary.tab.color}" class="chart-line" />
    ${circles}
    ${valueLabels}
    ${labels}`;
}

function shouldShowValueLabel(summary, point, index, points, minValue, maxValue) {
  if (summary.labelMode !== "key") return true;
  if (index === 0 || index === points.length - 1) return true;
  return point.value === minValue || point.value === maxValue;
}

function summarizeKpi(tab, username, range) {
  const rows = state.kpis.get(tab.id);
  const series = rows && rows.get(username) ? rows.get(username) : [];
  const points = series.filter((point) => point.month >= range.start && point.month <= range.end);
  const values = points.map((point) => point.value);
  const latest = values.length ? values[values.length - 1] : null;
  const first = values.length ? values[0] : null;
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const total = values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  const rangeValue = tab.aggregate === "sum" ? total : average;
  const delta = latest !== null && first !== null ? latest - first : 0;
  const scoreValue = calculateKpiScore(tab, rangeValue, points.length);
  return {
    tab,
    points,
    latest,
    first,
    average,
    total,
    rangeValue,
    scoreValue,
    delta,
    rangeLabel: tab.aggregate === "sum" ? "Total" : "Average",
    changeText: values.length > 1 ? formatDelta(delta, tab.unit) : "No trend"
  };
}

function calculateScore(summaries) {
  const weighted = summaries.filter((summary) => summary.tab.overallWeight && summary.rangeValue !== null);
  const totalWeight = weighted.reduce((sum, summary) => sum + summary.tab.overallWeight, 0);
  if (!totalWeight) return null;
  return weighted.reduce((sum, summary) => sum + (summary.rangeValue * summary.tab.overallWeight), 0) / totalWeight;
}

function calculateKpiScore(tab, rangeValue, monthCount) {
  if (rangeValue === null || rangeValue === undefined || !monthCount) return null;
  if (tab.unit === "percent") return clamp(rangeValue, 0, 100);
  if (tab.targetPerMonth) return clamp((rangeValue / (tab.targetPerMonth * monthCount)) * 100, 0, 100);
  return null;
}

function downloadReport() {
  const employee = state.employees.get(state.selectedUser);
  if (!employee) return;
  const range = getRange();
  const chartSvgs = [...document.querySelectorAll(".chart-wrap svg")].map((svg) => svg.outerHTML);
  const summaries = KPI_TABS.map((tab) => summarizeKpi(tab, state.selectedUser, range));
  const rows = summaries.map((summary) => `
    <tr>
      <td>${escapeHtml(summary.tab.label)}</td>
      <td>${escapeHtml(formatValue(summary.rangeValue, summary.tab.unit))}</td>
      <td>${escapeHtml(summary.rangeLabel)}</td>
      <td>${escapeHtml(summary.changeText)}</td>
    </tr>`).join("");
  const charts = summaries.map((summary, index) => `
    <section>
      <h2>${escapeHtml(summary.tab.label)}</h2>
      <div class="chart">${chartSvgs[index] || ""}</div>
    </section>`).join("");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(displayName(employee))} Performance Report</title>
  <style>
    @page { margin: 14mm; }
    body { background: #fbfcff; color: #1f0961; font-family: Inter, Arial, sans-serif; margin: 0; padding: 28px; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid #edf0f7; padding-bottom: 18px; }
    .eyebrow { color: #7b55ff; font-size: 11px; font-weight: 500; margin: 0 0 8px; text-transform: uppercase; }
    h1 { margin: 0; font-size: 34px; line-height: 1.05; }
    p { color: #2f3742; margin: 8px 0 0; }
    .score { color: #7b55ff; font-size: 44px; font-weight: 600; text-align: right; white-space: nowrap; }
    .score small { color: #2f3742; display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #ffffff; box-shadow: 0 18px 42px rgba(31, 9, 97, 0.08); }
    th, td { border-bottom: 1px solid #edf0f7; padding: 10px; text-align: left; }
    th { color: #1f0961; font-weight: 500; }
    .chart { width: 100%; border: 1px solid #edf0f7; border-radius: 10px; background: #ffffff; box-shadow: 0 18px 42px rgba(31, 9, 97, 0.08); }
    svg { width: 100%; height: 300px; }
    .chart-axis { stroke: #d8e1eb; stroke-width: 1; }
    .chart-grid-line { stroke: #edf1f5; stroke-width: 1; }
    .chart-line { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .chart-area { opacity: 0.14; }
    .chart-point { stroke: #ffffff; stroke-width: 2; }
    .chart-label { fill: #2f3742; font-size: 11px; font-weight: 500; }
    .chart-value-label { fill: #1f0961; font-size: 10px; font-weight: 600; }
    section { break-inside: avoid; margin-top: 24px; }
    section h2 { font-size: 18px; font-weight: 500; margin: 0 0 12px; }
  </style>
</head>
<body>
  <header>
    <div>
      <p class="eyebrow">Employee performance profile</p>
      <h1>${escapeHtml(displayName(employee))}</h1>
      <p>${escapeHtml(buildMetaLine(employee))}</p>
      <p>${escapeHtml(monthLabel(range.start))} to ${escapeHtml(monthLabel(range.end))}</p>
    </div>
    <div class="score">${escapeHtml(els.scoreValue.textContent)}<small>AVG Overall</small></div>
  </header>
  <table>
    <thead><tr><th>KPI</th><th>Range value</th><th>Basis</th><th>Trend</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${charts}
  <script>
    window.addEventListener("load", () => {
      window.print();
    });
  </script>
</body>
</html>`;
  const popup = window.open("", "_blank");
  if (!popup) {
    downloadBlob(html, `${state.selectedUser}-performance-report.html`, "text/html");
    setStatus("Popup blocked", "Downloaded a print-ready HTML report. Open it and use Print > Save as PDF.");
    return;
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

function downloadCsv() {
  if (!state.selectedUser) return;
  const range = getRange();
  const rows = [["Username", "KPI", "Month", "Value"]];
  KPI_TABS.forEach((tab) => {
    const summary = summarizeKpi(tab, state.selectedUser, range);
    summary.points.forEach((point) => rows.push([state.selectedUser, tab.label, point.label, point.value]));
  });
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  downloadBlob(csv, `${state.selectedUser}-performance-data.csv`, "text/csv");
}

function initializeEvaluationInputs() {
  if (els.evaluationInputs.children.length) {
    if (state.annualAutoRange) resetAnnualRange();
    renderAnnualEvaluation();
    return;
  }
  addEvaluationField();
  resetAnnualRange();
}

function addEvaluationField(value = "") {
  const row = document.createElement("div");
  row.className = "evaluation-input-row";
  row.innerHTML = `
    <label class="field evaluation-field">
      <span>Username</span>
      <input class="evaluation-user-input" list="employeeOptions" type="search" autocomplete="off" placeholder="Type username or name" value="${escapeAttribute(value)}" />
    </label>
    <button type="button" class="remove-evaluation-user" aria-label="Remove username">Remove</button>`;

  const input = row.querySelector(".evaluation-user-input");
  input.addEventListener("input", () => {
    const typed = normalizeUser(input.value);
    if (state.employees.has(typed)) input.value = state.employees.get(typed).username;
    if (state.annualAutoRange) resetAnnualRange();
    renderAnnualEvaluation();
  });
  input.addEventListener("change", () => {
    normalizeEvaluationInput(input);
    if (state.annualAutoRange) resetAnnualRange();
    renderAnnualEvaluation();
  });
  input.addEventListener("blur", () => {
    normalizeEvaluationInput(input);
    if (state.annualAutoRange) resetAnnualRange();
    renderAnnualEvaluation();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      normalizeEvaluationInput(input);
      if (state.annualAutoRange) resetAnnualRange();
      renderAnnualEvaluation();
    }
  });

  row.querySelector(".remove-evaluation-user").addEventListener("click", () => {
    row.remove();
    if (!els.evaluationInputs.children.length) addEvaluationField();
    if (state.annualAutoRange) resetAnnualRange();
    renderAnnualEvaluation();
  });

  els.evaluationInputs.append(row);
  input.focus();
  renderAnnualEvaluation();
}

function normalizeEvaluationInput(input) {
  const typed = normalizeUser(input.value);
  if (!typed) return;
  const employee = findEmployee(typed);
  if (employee) input.value = employee.username;
}

function renderAnnualEvaluation() {
  const rows = annualEvaluationRows();
  if (!rows.length) {
    els.evaluationTableBody.innerHTML = '<tr><td colspan="11" class="evaluation-empty">Add a username to begin.</td></tr>';
    return;
  }

  els.evaluationTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.fullName)}</td>
      <td>${escapeHtml(row.username)}</td>
      <td>${escapeHtml(row.shift)}</td>
      <td>${escapeHtml(row.shiftType)}</td>
      <td>${escapeHtml(formatValue(row.sales, "count"))}</td>
      <td class="${kpiCellClass(row.dependability)}">${escapeHtml(formatValue(row.dependability, "percent"))}</td>
      <td class="${kpiCellClass(row.quality)}">${escapeHtml(formatValue(row.quality, "percent"))}</td>
      <td class="${kpiCellClass(row.rt)}">${escapeHtml(formatValue(row.rt, "percent"))}</td>
      <td class="${kpiCellClass(row.tnd)}">${escapeHtml(formatValue(row.tnd, "percent"))}</td>
      <td class="overall-cell">${escapeHtml(row.overall === null ? "--" : `${formatScore(row.overall)}%`)}</td>
      <td class="team-cell ${teamClass(row.team)}">${escapeHtml(row.team)}</td>
    </tr>`).join("");
}

function annualEvaluationRows() {
  return selectedAnnualEmployees()
    .map((employee) => buildAnnualEvaluationRow(normalizeUser(employee.username)));
}

function buildAnnualEvaluationRow(username) {
  const employee = state.employees.get(username) || { username };
  const range = getAnnualRange() || annualRangeForEmployee(username);
  const summaries = range ? KPI_TABS.map((tab) => summarizeKpi(tab, username, range)) : [];
  const byId = new Map(summaries.map((summary) => [summary.tab.id, summary]));
  const baseOverall = summaries.length ? calculateScore(summaries) : null;
  const sales = byId.get("sales")?.rangeValue ?? null;
  const salesBonus = sales === null ? 0 : sales / 1000;
  const overall = baseOverall === null ? null : baseOverall + salesBonus;

  return {
    fullName: displayName(employee),
    username: employee.username || username,
    shift: employee.shiftType || "",
    shiftType: employee.empType || "",
    sales,
    dependability: byId.get("dependability")?.rangeValue ?? null,
    quality: byId.get("quality")?.rangeValue ?? null,
    rt: byId.get("rt")?.rangeValue ?? null,
    tnd: byId.get("tnd")?.rangeValue ?? null,
    overall,
    team: employee.team || state.teams.get(username) || "",
    range
  };
}

function selectedAnnualEmployees() {
  const seen = new Set();
  return [...els.evaluationInputs.querySelectorAll(".evaluation-user-input")]
    .map((input) => findEmployee(normalizeUser(input.value)))
    .filter(Boolean)
    .filter((employee) => {
      const username = normalizeUser(employee.username);
      if (seen.has(username)) return false;
      seen.add(username);
      return true;
    });
}

function getAnnualRange() {
  let start = els.annualStartMonth.value;
  let end = els.annualEndMonth.value;
  if (!start || !end) return null;
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function resetAnnualRange() {
  const range = latestSheetMonthRange(12);
  if (!range) return;
  els.annualStartMonth.value = range.start;
  els.annualEndMonth.value = range.end;
}

function latestSheetMonthRange(size) {
  const months = selectableMonths();
  if (!months.length) return null;
  const end = months[months.length - 1];
  const start = months[Math.max(0, months.length - size)];
  return { start: start.key, end: end.key };
}

function latestCompleteMonthRange(username, size) {
  const months = dataMonthsForEmployee(username);
  if (!months.length) return latestSheetMonthRange(size);
  const end = months[months.length - 1];
  const start = months[Math.max(0, months.length - size)];
  return { start: start.key, end: end.key };
}

function annualRangeForEmployee(username) {
  return latestCompleteMonthRange(username, 12);
}

function downloadEvaluationPdf() {
  const rows = annualEvaluationRows();
  if (!rows.length) {
    setStatus("No annual rows", "Add at least one username before downloading the annual evaluation PDF.");
    return;
  }

  const rangeText = annualEvaluationRangeText(rows);
  const tableRows = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.fullName)}</td>
      <td>${escapeHtml(row.username)}</td>
      <td>${escapeHtml(row.shift)}</td>
      <td>${escapeHtml(row.shiftType)}</td>
      <td>${escapeHtml(formatValue(row.sales, "count"))}</td>
      <td class="${kpiCellClass(row.dependability)}">${escapeHtml(formatValue(row.dependability, "percent"))}</td>
      <td class="${kpiCellClass(row.quality)}">${escapeHtml(formatValue(row.quality, "percent"))}</td>
      <td class="${kpiCellClass(row.rt)}">${escapeHtml(formatValue(row.rt, "percent"))}</td>
      <td class="${kpiCellClass(row.tnd)}">${escapeHtml(formatValue(row.tnd, "percent"))}</td>
      <td class="overall">${escapeHtml(row.overall === null ? "--" : `${formatScore(row.overall)}%`)}</td>
      <td class="team ${teamClass(row.team)}">${escapeHtml(row.team)}</td>
    </tr>`).join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Annual Increment Evaluation</title>
  <style>
    @page { size: landscape; margin: 14mm; }
    body { color: #1f0961; font-family: Arial, sans-serif; margin: 0; }
    header { border-bottom: 3px solid #6c44f7; margin-bottom: 18px; padding-bottom: 12px; }
    p { margin: 4px 0; color: #2f3742; }
    h1 { margin: 0; font-size: 24px; }
    table { border-collapse: collapse; width: 100%; font-size: 11px; }
    th, td { border: 1px solid #17233f; padding: 6px 7px; text-align: center; }
    th { background: #ecf9ff; color: #1f0961; font-weight: 500; }
    td:first-child, th:first-child { text-align: left; }
    .overall { font-weight: 600; font-size: 13px; }
    .team { color: #ffffff; font-weight: 600; }
    .team-dominators { background: #6c44f7; }
    .team-wizards { background: #c23eff; }
    .team-dodgers { background: #155dff; }
    .team-rookie { background: #45caff; color: #1f0961; }
    .low-kpi { color: #d01818; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <p>BREAKTHRU</p>
    <h1>Annual Increment Evaluation</h1>
    <p>${escapeHtml(rangeText)} | Sales bonus: Sales / 1000 percentage points</p>
  </header>
  <table>
    <thead>
      <tr>
        <th>Full Name</th><th>Username</th><th>Shift</th><th>Shift Type</th><th>Sales</th>
        <th>Dependability</th><th>Chat Quality</th><th>Avg RT</th><th>T&D</th><th>Overall</th><th>Team</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>
    window.addEventListener("load", () => {
      window.print();
    });
  </script>
</body>
</html>`;

  const popup = window.open("", "_blank");
  if (!popup) {
    downloadBlob(html, "annual-increment-evaluation.html", "text/html");
    setStatus("Popup blocked", "Downloaded a print-ready HTML report. Open it and use Print > Save as PDF.");
    return;
  }
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

function annualEvaluationRangeText(rows) {
  const ranges = rows
    .filter((row) => row.range)
    .map((row) => `${monthLabel(row.range.start)} to ${monthLabel(row.range.end)}`);
  const unique = [...new Set(ranges)];
  if (!unique.length) return "Last 12 complete KPI months";
  return unique.length === 1 ? unique[0] : "Employee-specific last 12 complete KPI months";
}

function teamClass(team) {
  const key = normalizeHeader(team).replace(/\s+/g, "-");
  if (key === "dominators") return "team-dominators";
  if (key === "wizards") return "team-wizards";
  if (key === "dodgers") return "team-dodgers";
  if (key === "rookie") return "team-rookie";
  return "";
}

function kpiCellClass(value) {
  return value !== null && value !== undefined && !Number.isNaN(value) && value < 50 ? "low-kpi" : "";
}

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : "";
}

function parseMonth(input) {
  const text = cleanCell(input);
  if (!text) return null;
  if (input instanceof Date) return monthObject(input.getFullYear(), input.getMonth());

  const months = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8,
    september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
  };
  const normalized = text.toLowerCase().replace(/[,]/g, " ").replace(/\s+/g, " ").trim();
  const match = normalized.match(/([a-z]+)\s*['-]?\s*(\d{2,4})/) || normalized.match(/(\d{2,4})\s*['-]?\s*([a-z]+)/);
  if (!match) return null;

  const monthName = Number.isNaN(Number(match[1])) ? match[1] : match[2];
  const yearText = Number.isNaN(Number(match[1])) ? match[2] : match[1];
  const month = months[monthName.slice(0, 3)] ?? months[monthName];
  if (month === undefined) return null;
  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
  return monthObject(year, month);
}

function monthObject(year, month) {
  const date = new Date(year, month, 1);
  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}`,
    label: date.toLocaleString("en-US", { month: "short", year: "2-digit" })
  };
}

function addMonth(month) {
  if (!state.months.some((item) => item.key === month.key)) state.months.push(month);
}

function parseMetric(value, unit) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    if (unit === "percent" && value > 0 && value <= 1) return value * 100;
    return value;
  }
  const text = String(value).replace(/,/g, "").trim();
  if (!text) return null;
  const number = Number(text.replace("%", ""));
  if (Number.isNaN(number)) return null;
  if (unit === "percent" && !text.includes("%") && number > 0 && number <= 1) return number * 100;
  return number;
}

function parseMoney(value) {
  return parseNumber(value);
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const text = String(value).replace(/,/g, "").replace(/[^\d.-]/g, "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
}

function valueOrZero(value) {
  return Number.isFinite(value) ? value : 0;
}

function monthsForEmployee(username) {
  const months = new Set();
  state.kpis.forEach((rows) => {
    const series = rows.get(username) || [];
    series.forEach((point) => months.add(point.month));
  });
  return state.months.filter((month) => months.has(month.key));
}

function selectableMonths() {
  const months = state.months.filter((month) => monthHasActualData(month.key));
  return (months.length ? months : state.months).sort((a, b) => a.key.localeCompare(b.key));
}

function monthHasActualData(monthKey) {
  return KPI_TABS.some((tab) => {
    if (!ACTUAL_DATA_KPI_IDS.has(tab.id)) return false;
    const rows = state.kpis.get(tab.id);
    if (!rows) return false;
    for (const series of rows.values()) {
      if (series.some((point) => point.month === monthKey && isActualMetricValue(point.value))) return true;
    }
    return false;
  });
}

function monthHasActualDataForEmployee(username, monthKey) {
  for (const tab of KPI_TABS) {
    if (!ACTUAL_DATA_KPI_IDS.has(tab.id)) continue;
    const rows = state.kpis.get(tab.id);
    const series = rows && rows.get(username) ? rows.get(username) : [];
    if (series.some((point) => point.month === monthKey && isActualMetricValue(point.value))) return true;
  }
  return false;
}

function isActualMetricValue(value) {
  return Number.isFinite(value) && value !== 0;
}

function dataMonthsForEmployee(username) {
  return monthsForEmployee(username).filter((month) => monthHasActualDataForEmployee(username, month.key));
}

function completeDataMonthsForEmployee(username) {
  const dataMonths = dataMonthsForEmployee(username);
  const complete = dataMonths.filter((month) => {
    return KPI_TABS.every((tab) => {
      const rows = state.kpis.get(tab.id);
      const series = rows && rows.get(username) ? rows.get(username) : [];
      return series.some((point) => point.month === month.key && isActualMetricValue(point.value));
    });
  });
  return complete.length ? complete : dataMonths;
}

function completeMonthsForEmployee(username) {
  const anyMonths = monthsForEmployee(username);
  const complete = anyMonths.filter((month) => {
    return KPI_TABS.every((tab) => {
      const rows = state.kpis.get(tab.id);
      const series = rows && rows.get(username) ? rows.get(username) : [];
      return series.some((point) => point.month === month.key);
    });
  });
  return complete.length ? complete : anyMonths;
}

function selectTypedEmployee() {
  const typed = normalizeUser(els.employeeInput.value);
  if (!typed || typed === "loading employees...") return;
  const employee = findEmployee(typed);
  if (!employee) {
    setStatus("Employee not found", `No username or name matched "${els.employeeInput.value}".`);
    return;
  }
  state.selectedUser = normalizeUser(employee.username);
  els.employeeInput.value = employee.username;
  renderDashboard();
}

function selectExactEmployee() {
  const typed = normalizeUser(els.employeeInput.value);
  if (!typed || !state.employees.has(typed) || typed === state.selectedUser) return;
  const employee = state.employees.get(typed);
  state.selectedUser = typed;
  els.employeeInput.value = employee.username;
  renderDashboard();
}

function selectTypedBonusEmployee() {
  const typed = normalizeUser(els.bonusEmployeeInput.value);
  if (!typed || typed === "loading employees...") return;
  const employee = findBonusEmployee(typed);
  if (!employee) {
    setStatus("Employee not found", `No bonus username or name matched "${els.bonusEmployeeInput.value}".`);
    return;
  }
  state.selectedBonusUser = normalizeUser(employee.username);
  els.bonusEmployeeInput.value = employee.username;
  renderBonusDashboard();
}

function selectExactBonusEmployee() {
  const typed = normalizeUser(els.bonusEmployeeInput.value);
  if (!typed || !state.bonusEmployees.has(typed) || typed === state.selectedBonusUser) return;
  const employee = state.bonusEmployees.get(typed);
  state.selectedBonusUser = typed;
  els.bonusEmployeeInput.value = employee.username;
  renderBonusDashboard();
}

function findEmployee(value) {
  if (state.employees.has(value)) return state.employees.get(value);
  return [...state.employees.values()].find((employee) => {
    const username = normalizeUser(employee.username);
    const name = normalizeUser(employee.name);
    return username.includes(value) || name.includes(value);
  });
}

function findBonusEmployee(value) {
  if (state.bonusEmployees.has(value)) return state.bonusEmployees.get(value);
  return [...state.bonusEmployees.values()].find((employee) => {
    const username = normalizeUser(employee.username);
    const name = normalizeUser(employee.name);
    return username.includes(value) || name.includes(value);
  });
}

function setActiveRangeButton(range) {
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.range === range);
  });
}

function getRange() {
  let start = els.startMonth.value;
  let end = els.endMonth.value;
  if (start > end) [start, end] = [end, start];
  return { start, end };
}

function monthLabel(key) {
  const found = state.months.find((month) => month.key === key);
  return found ? found.label : key;
}

function ensureEmployee(username) {
  const key = normalizeUser(username);
  if (!state.employees.has(key)) state.employees.set(key, { username });
  return state.employees.get(key);
}

function displayName(employee) {
  return employee.name || employee.username || "Unknown employee";
}

function buildMetaLine(employee) {
  return [
    employee.username && `Username: ${employee.username}`,
    employee.level && `Level: ${employee.level}`,
    employee.empType && `Emp.Type: ${employee.empType}`,
    employee.shiftType && `Shift: ${employee.shiftType}`,
    employee.designation,
    employee.team && `Team: ${employee.team}`
  ].filter(Boolean).join(" | ");
}

function currentTeamValue(headers, values) {
  const headerIndex = headers.findIndex((header) => normalizeHeader(header) === "current team");
  const index = headerIndex >= 0 ? headerIndex : 1;
  return cleanCell(values[index]);
}

function normalizeUser(value) {
  return cleanCell(value).toLowerCase();
}

function normalizeHeader(value) {
  return cleanCell(value).toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function cleanCell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

function formatValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  if (unit === "money") return formatMoney(value);
  if (unit === "percent") return `${value.toFixed(2)}%`;
  return Math.round(value).toLocaleString("en-US");
}

function formatChartValue(value, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  if (unit === "money") return formatCompactMoney(value);
  if (unit === "percent") return `${value.toFixed(1)}%`;
  return Math.round(value).toLocaleString("en-US");
}

function formatScore(value) {
  return (Math.trunc(value * 100) / 100).toFixed(2);
}

function formatDelta(value, unit) {
  const sign = value > 0 ? "+" : "";
  if (unit === "money") return `${sign}${formatMoney(Math.abs(value))}`;
  if (unit === "percent") return `${sign}${value.toFixed(2)} pts`;
  return `${sign}${Math.round(value).toLocaleString("en-US")}`;
}

function formatMoney(value) {
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatCompactMoney(value) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K`;
  return formatMoney(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setEmptyControls() {
  els.employeeInput.value = "Loading employees...";
  els.employeeOptions.innerHTML = "";
  els.startMonth.innerHTML = "<option>--</option>";
  els.endMonth.innerHTML = "<option>--</option>";
  els.annualStartMonth.innerHTML = "<option>--</option>";
  els.annualEndMonth.innerHTML = "<option>--</option>";
}

function setBonusEmpty() {
  els.bonusEmployeeInput.value = "Loading employees...";
  els.bonusEmployeeOptions.innerHTML = "";
  els.bonusStartMonth.innerHTML = "<option>--</option>";
  els.bonusEndMonth.innerHTML = "<option>--</option>";
  els.bonusSummaryGrid.innerHTML = "";
  els.bonusChartsGrid.innerHTML = "";
  els.bonusEmployeeSummaryGrid.innerHTML = "";
  els.bonusHistoryBody.innerHTML = '<tr><td colspan="9" class="evaluation-empty">Loading bonus rows...</td></tr>';
}

function renderEmpty() {
  els.employeeName.textContent = "No employee data";
  els.employeeMeta.textContent = "Check that the sheet is accessible and tab names match the expected KPI tabs.";
  els.scoreValue.textContent = "--";
  els.summaryGrid.innerHTML = "";
  els.insightList.innerHTML = "";
  els.chartsGrid.innerHTML = '<div class="empty-state">No KPI values found for the selected employee and range.</div>';
}

function setStatus(title, text) {
  els.statusTitle.textContent = title;
  els.statusText.textContent = text;
}

function startProgress(label) {
  updateProgress(0, 1, label);
  els.progressPanel.classList.remove("auth-hidden");
}

function updateProgress(completed, total, label) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  els.progressLabel.textContent = label || "Loading";
  els.progressText.textContent = `${clamp(percent, 0, 100)}%`;
  els.progressBar.style.width = `${clamp(percent, 0, 100)}%`;
}

function finishProgress() {
  updateProgress(1, 1, "Complete");
  window.setTimeout(hideProgress, 700);
}

function hideProgress() {
  els.progressPanel.classList.add("auth-hidden");
  els.progressBar.style.width = "0%";
  els.progressText.textContent = "0%";
}

function friendlyError(error) {
  return `${error.message || error}. Make sure the Google Sheet is shared so anyone with the link can view it.`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
