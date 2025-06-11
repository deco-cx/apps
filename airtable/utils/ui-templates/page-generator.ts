export interface AirtableBase {
  id: string;
  name: string;
  recordCount?: number;
}

export interface AirtableTable {
  id: string;
  name: string;
  recordCount?: number;
  baseId?: string;
}

export interface SelectionPageOptions {
  bases: AirtableBase[];
  tables: AirtableTable[];
  callbackUrl: string;
}

export function generateSelectionPage(
  { bases, tables, callbackUrl }: SelectionPageOptions,
): string {
  let htmlTemplate: string;

  try {
    htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Connector - Airtable Access</title>
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Roboto,
          sans-serif;
        margin: 0;
        padding: 20px;
        background: #2925244d;
        color: #f5f5f4;
        line-height: 1.5;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .container {
        width: 425px;
        height: 572px;
        background: #292524;
        border-radius: 16px;
        overflow: hidden;
        border: none;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #2925244d;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .selection-header {
        padding: 24px 24px 16px;
        background: #292524;
      }

      .header-logo-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .airtable-logo {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #f5f5f4;
        flex: 1;
        text-align: left;
        margin: 0 16px;
      }

      .close-button {
        position: absolute;
        width: 16px;
        height: 16px;
        right: 16px;
        top: 16px;
        background: transparent;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        border-radius: 2px;
        flex: none;
        order: 0;
        flex-grow: 0;
        z-index: 10;
      }

      .selection-subtitle {
        color: #a8a29e;
        font-size: 14px;
        text-align: left;
      }

      .selection-content {
        padding: 0px 24px 24px 24px;
        background: rgba(0, 0, 0, 0);
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .search-section {
        margin-bottom: 16px;
      }

      .search-box {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #57534e;
        border-radius: 6px;
        font-size: 14px;
        background: #292524;
        color: #57534e;
        transition: border-color 0.2s;
      }

      .search-box:focus {
        outline: none;
        border-color: #57534e;
      }

      .search-box::placeholder {
        color: #57534e;
      }

      .selection-list {
        background: #292524;
        border-radius: 0;
        overflow: hidden;
        border: none;
        margin-bottom: 16px;
        flex: 1;
        overflow-y: auto;
      }

      .base-item {
        border-bottom: none;
      }

      .base-item:last-child {
        border-bottom: none;
      }

      .base-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        background: #292524;
      }

      .base-header:hover {
        background: #292524;
      }

      .base-checkbox {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background: #f5f5f4;
        border: 1px solid #f5f5f4;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .base-checkbox.checked {
        background: #f5f5f4;
        border-color: #f5f5f4;
      }

      .base-checkbox.unchecked {
        background: #292524;
        border-color: #57534e;
      }

      .check-icon {
        width: 10px;
        height: 7px;
        stroke: #292524;
        stroke-width: 1.3px;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
        opacity: 1;
        transition: opacity 0.2s;
      }

      .base-checkbox.unchecked .check-icon {
        opacity: 0;
      }

      .base-label {
        font-weight: 500;
        flex: 1;
        font-size: 14px;
        color: #f5f5f4;
      }

      .expand-icon {
        width: 16px;
        height: 16px;
        transition: transform 0.2s;
        fill: #57534e;
      }

      .base-item.expanded .expand-icon {
        transform: rotate(90deg);
      }

      .tables-container {
        display: none;
        background: #292524;
      }

      .base-item.expanded .tables-container {
        display: block;
      }

      .table-item {
        display: flex;
        align-items: center;
        padding: 8px 12px 8px 32px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-top: none;
      }

      .table-item:hover {
        background: #292524;
      }

      .table-item.search-match {
        background: rgba(255, 255, 255, 0.1);
      }

      .table-item.base-match {
        background: rgba(255, 255, 255, 0.03);
      }

      .table-checkbox {
        margin-right: 8px;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background: #f5f5f4;
        border: 1px solid #f5f5f4;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .table-checkbox.checked {
        background: #f5f5f4;
        border-color: #f5f5f4;
      }

      .table-checkbox.unchecked {
        background: #292524;
        border-color: #57534e;
      }

      .table-label {
        font-weight: 400;
        flex: 1;
        font-size: 14px;
        color: #f5f5f4;
      }

      .no-results {
        text-align: center;
        padding: 24px 16px;
        color: #737373;
        font-size: 14px;
      }

      .button-section {
        border-top: 1px solid #57534e;
        padding: 16px 24px;
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        background: #292524;
        flex-shrink: 0;
      }

      .btn {
        padding: 8px 12px;
        border-radius: 12px;
        font-weight: 500;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        border: none;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-primary {
        background: #f5f5f4;
        color: #292524;
        padding: 8px 12px;
      }

      .btn-primary:hover {
        background: #e7e5e4;
      }

      .btn-secondary {
        background: transparent;
        color: #a8a29e;
        border: 1px solid #404040;
      }

      .btn-secondary:hover {
        background: #404040;
        color: #f5f5f4;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .selection-list::-webkit-scrollbar {
        width: 6px;
      }

      .selection-list::-webkit-scrollbar-track {
        background: #404040;
      }

      .selection-list::-webkit-scrollbar-thumb {
        background: #525252;
        border-radius: 3px;
      }

      @media (max-width: 640px) {
        body {
          padding: 10px;
        }

        .container {
          max-width: 100%;
        }

        .selection-header,
        .selection-content {
          padding: 16px;
        }

        .header-title {
          font-size: 16px;
          margin: 0 12px;
        }

        .button-section {
          flex-direction: column;
          padding: 16px;
        }

        .btn {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="modal-overlay">
      <div class="container">
        <button class="close-button" onclick="skipSelection()">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style="position: absolute; left: 25%; right: 25%; top: 25%; bottom: 25%"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#F8FAFC"
              stroke-width="1.33"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="selection-header">
          <div class="header-logo-section">
            <svg
              class="airtable-logo"
              width="32"
              height="27.2"
              viewBox="0 0 200 170"
              xmlns="http://www.w3.org/2000/svg"
              style="shape-rendering: geometricprecision"
            >
              <g>
                <path
                  fill="rgb(255, 186, 5)"
                  d="M90.0389,12.3675 L24.0799,39.6605 C20.4119,41.1785 20.4499,46.3885 24.1409,47.8515 L90.3759,74.1175 C96.1959,76.4255 102.6769,76.4255 108.4959,74.1175 L174.7319,47.8515 C178.4219,46.3885 178.4609,41.1785 174.7919,39.6605 L108.8339,12.3675 C102.8159,9.8775 96.0559,9.8775 90.0389,12.3675"
                >
                </path>
                <path
                  fill="rgb(57, 202, 255)"
                  d="M105.3122,88.4608 L105.3122,154.0768 C105.3122,157.1978 108.4592,159.3348 111.3602,158.1848 L185.1662,129.5368 C186.8512,128.8688 187.9562,127.2408 187.9562,125.4288 L187.9562,59.8128 C187.9562,56.6918 184.8092,54.5548 181.9082,55.7048 L108.1022,84.3528 C106.4182,85.0208 105.3122,86.6488 105.3122,88.4608"
                >
                </path>
                <path
                  fill="rgb(220, 4, 59)"
                  d="M88.0781,91.8464 L66.1741,102.4224 L63.9501,103.4974 L17.7121,125.6524 C14.7811,127.0664 11.0401,124.9304 11.0401,121.6744 L11.0401,60.0884 C11.0401,58.9104 11.6441,57.8934 12.4541,57.1274 C12.7921,56.7884 13.1751,56.5094 13.5731,56.2884 C14.6781,55.6254 16.2541,55.4484 17.5941,55.9784 L87.7101,83.7594 C91.2741,85.1734 91.5541,90.1674 88.0781,91.8464"
                >
                </path>
                <path
                  fill="rgba(0, 0, 0, 0.25)"
                  d="M88.0781,91.8464 L66.1741,102.4224 L12.4541,57.1274 C12.7921,56.7884 13.1751,56.5094 13.5731,56.2884 C14.6781,55.6254 16.2541,55.4484 17.5941,55.9784 L87.7101,83.7594 C91.2741,85.1734 91.5541,90.1674 88.0781,91.8464"
                >
                </path>
              </g>
            </svg>
            <span class="header-title">Airtable</span>
          </div>
          <div class="selection-subtitle">
            Select the bases and tables you want to make available in this
            integration.
          </div>
        </div>

        <div class="selection-content">
          <div class="search-section">
            <div style="position: relative">
              <svg
                style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.83333 10.6667C5.62222 10.6667 4.59722 10.2472 3.75833 9.40833C2.91944 8.56944 2.5 7.54444 2.5 6.33333C2.5 5.12222 2.91944 4.09722 3.75833 3.25833C4.59722 2.41944 5.62222 2 6.83333 2C8.04444 2 9.06944 2.41944 9.90833 3.25833C10.7472 4.09722 11.1667 5.12222 11.1667 6.33333C11.1667 6.82222 11.0889 7.28333 10.9333 7.71667C10.7778 8.15 10.5667 8.53333 10.3 8.86667L14.0333 12.6C14.1556 12.7222 14.2167 12.8778 14.2167 13.0667C14.2167 13.2556 14.1556 13.4111 14.0333 13.5333C13.9111 13.6556 13.7556 13.7167 13.5667 13.7167C13.3778 13.7167 13.2222 13.6556 13.1 13.5333L9.36667 9.8C9.03333 10.0667 8.65 10.2778 8.21667 10.4333C7.78333 10.5889 7.32222 10.6667 6.83333 10.6667ZM6.83333 9.33333C7.66667 9.33333 8.375 9.04167 8.95833 8.45833C9.54167 7.875 9.83333 7.16667 9.83333 6.33333C9.83333 5.5 9.54167 4.79167 8.95833 4.20833C8.375 3.625 7.66667 3.33333 6.83333 3.33333C6 3.33333 5.29167 3.625 4.70833 4.20833C4.125 4.79167 3.83333 5.5 3.83333 6.33333C3.83333 7.16667 4.125 7.875 4.70833 8.45833C5.29167 9.04167 6 9.33333 6.83333 9.33333Z"
                  fill="#57534E"
                />
              </svg>
              <input
                type="search"
                id="search-input"
                class="search-box"
                placeholder="Search"
                style="padding-left: 40px"
                oninput="handleSearch()"
              >
            </div>
          </div>

          <div
            id="select-all-header"
            style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #292524; margin-bottom: 0"
          >
          </div>

          <div class="selection-list" id="selection-list"></div>
        </div>

        <div class="button-section">
          <button class="btn btn-secondary" onclick="skipSelection()">
            Skip selection
          </button>
          <button class="btn btn-primary" onclick="confirmSelection()">
            Save
          </button>
        </div>
      </div>
    </div>

    <script>
      const basesData = "{{BASES_DATA}}";
      const tablesData = "{{TABLES_DATA}}";
      const callbackUrl = "{{CALLBACK_URL}}";

      let bases, tables;
      try {
        bases = typeof basesData === "string"
          ? JSON.parse(basesData)
          : basesData;
        tables = typeof tablesData === "string"
          ? JSON.parse(tablesData)
          : tablesData;
      } catch (e) {
        bases = basesData;
        tables = tablesData;
      }

      let selectedBases = new Set();
      let selectedTables = new Set();
      let expandedBases = new Set();
      let filteredBases = [...bases];
      let filteredTables = [...tables];

      document.addEventListener("DOMContentLoaded", function () {
        preselectPartial();
        renderSelectionList();
      });

      function preselectPartial() {
        bases.forEach((base) => {
          selectedBases.add(base.id);
        });

        tables.forEach((table) => {
          if (selectedBases.has(table.baseId)) {
            selectedTables.add(table.id);
          }
        });

        if (bases.length <= 5) {
          bases.forEach((base) => {
            expandedBases.add(base.id);
          });
        } else {
          if (bases.length >= 1) {
            expandedBases.add(bases[0].id);
          }
        }
      }

      function handleSearch() {
        const query = document.getElementById("search-input").value
          .toLowerCase();

        if (!query.trim()) {
          filteredBases = [...bases];
          filteredTables = [...tables];
          renderSelectionList();
          return;
        }

        const matchingBaseIds = new Set();
        const matchingTableIds = new Set();
        const baseIdsByTableId = new Map();
        tables.forEach((table) => {
          baseIdsByTableId.set(table.id, table.baseId);
        });

        bases.forEach((base) => {
          if (
            (base.name || "").toLowerCase().includes(query) ||
            base.id.toLowerCase().includes(query)
          ) {
            matchingBaseIds.add(base.id);
          }
        });
        tables.forEach((table) => {
          if (
            (table.name || "").toLowerCase().includes(query) ||
            table.id.toLowerCase().includes(query)
          ) {
            matchingTableIds.add(table.id);
            if (table.baseId) {
              matchingBaseIds.add(table.baseId);
            }
          }
        });
        filteredBases = bases.filter((base) =>
          matchingBaseIds.has(base.id)
        );

        filteredTables = tables.filter((table) =>
          matchingTableIds.has(table.id)
        );

        renderSelectionList();
      }

      const filteredTablesSet = new Set();

      function renderSelectionList() {
        const container = document.getElementById("selection-list");
        const headerContainer = document.getElementById(
          "select-all-header",
        );

        if (filteredBases.length === 0) {
          container.innerHTML =
            '<div class="no-results">No bases found</div>';
          headerContainer.innerHTML = "";
          return;
        }

        filteredTablesSet.clear();
        filteredTables.forEach((table) =>
          filteredTablesSet.add(table.id)
        );

        const searchQuery = document.getElementById("search-input")
          .value.toLowerCase();

        let basesToShow;
        if (searchQuery) {
          basesToShow = filteredBases;
        } else {
          const basesWithFilteredTablesMap = new Map();

          filteredTables.forEach((table) => {
            if (table.baseId) {
              basesWithFilteredTablesMap.set(table.baseId, true);
            }
          });

          basesToShow = bases.filter((base) =>
            basesWithFilteredTablesMap.has(base.id)
          );
        }

        if (searchQuery && filteredBases.length > 0) {
          const directMatchTableBaseIds = new Set();

          for (const table of filteredTables) {
            if (
              table.baseId &&
              ((table.name || "").toLowerCase().includes(searchQuery) ||
                table.id.toLowerCase().includes(searchQuery))
            ) {
              directMatchTableBaseIds.add(table.baseId);
            }
          }

          if (
            directMatchTableBaseIds.size === 0 &&
            filteredBases.length <= 10
          ) {
            filteredBases.forEach((base) => expandedBases.add(base.id));
          } else {
            directMatchTableBaseIds.forEach((baseId) =>
              expandedBases.add(baseId)
            );
          }
        }

        const selectAllChecked = selectedBases.size === bases.length
          ? "checked"
          : "unchecked";
        const totalBases = selectedBases.size;
        const totalBasesCount = bases.length;

        const headerHTML = \`
          <div style="display: flex; align-items: center; gap: 8px;" onclick="toggleSelectAll()">
            <div class="base-checkbox \${selectAllChecked}" style="cursor: pointer;">
              <svg class="check-icon" viewBox="0 0 16 12">
                <path d="M1 6l4 4 8-8" />
              </svg>
            </div>
            <span style="font-weight: 500; font-size: 14px; color: #f5f5f4; cursor: pointer;">Select all</span>
          </div>
          <span style="color: #57534E; font-size: 14px;">\${totalBases} of \${totalBasesCount} bases selected</span>
        \`;

        headerContainer.innerHTML = headerHTML;
        container.innerHTML = basesToShow.map(createBaseItemHTML).join(
          "",
        );
      }

      function createBaseItemHTML(base) {
        const isSelected = selectedBases.has(base.id);
        const isExpanded = expandedBases.has(base.id);

        const baseTableIds = baseToTablesMap.get(base.id) || new Set();
        const filteredBaseTables = tables.filter((table) =>
          table.baseId === base.id &&
          filteredTablesSet.has(table.id)
        );

        const searchQuery = document.getElementById("search-input")
          .value.toLowerCase();
        const hasMatchingTables = searchQuery &&
          filteredBaseTables.length > 0;

        const shouldBeExpanded = isExpanded || hasMatchingTables;

        const tablesHTML = filteredBaseTables.map((table) =>
          createTableItemHTML(table)
        ).join("");

        return \`
          <div class="base-item \${shouldBeExpanded ? "expanded" : ""}">
            <div class="base-header" onclick="toggleBaseExpansion('\${base.id}')">
              <div class="base-checkbox \${
          isSelected ? "checked" : "unchecked"
        }" onclick="event.stopPropagation(); toggleBaseSelection('\${base.id}')">
                <svg class="check-icon" viewBox="0 0 16 12">
                  <path d="M1 6l4 4 8-8" />
                </svg>
              </div>
              <span class="base-label">\${base.name || base.id}</span>
              <svg class="expand-icon" viewBox="0 0 16 16">
                <path d="M6 12l6-6-6-6" />
              </svg>
            </div>
            <div class="tables-container">
              \${tablesHTML}
            </div>
          </div>
        \`;
      }

      let searchMatchingBaseIdsCache = new Set();
      let searchQueryCache = "";

      function createTableItemHTML(table) {
        const isSelected = selectedTables.has(table.id);
        const searchQuery = document.getElementById("search-input")
          .value.toLowerCase();

        if (searchQuery && searchQueryCache !== searchQuery) {
          searchMatchingBaseIdsCache.clear();
          searchQueryCache = searchQuery;

          bases.forEach((base) => {
            if (
              (base.name || "").toLowerCase().includes(searchQuery) ||
              base.id.toLowerCase().includes(searchQuery)
            ) {
              searchMatchingBaseIdsCache.add(base.id);
            }
          });
        }

        const matchesDirectly = searchQuery &&
          ((table.name || "").toLowerCase().includes(searchQuery) ||
            table.id.toLowerCase().includes(searchQuery));

        const baseMatchesSearch = searchQuery &&
          searchMatchingBaseIdsCache.has(table.baseId);

        let highlightClass = "";

        if (matchesDirectly) {
          highlightClass = "search-match";
        } else if (baseMatchesSearch && searchQuery) {
          highlightClass = "base-match";
        }

        return \`
          <div class="table-item \${highlightClass}" onclick="toggleTableSelection('\${table.id}')">
            <div class="table-checkbox \${
          isSelected ? "checked" : "unchecked"
        }">
              <svg class="check-icon" viewBox="0 0 16 12">
                <path d="M1 6l4 4 8-8" />
              </svg>
            </div>
            <span class="table-label">\${table.name || table.id}</span>
          </div>
        \`;
      }

      function toggleBaseExpansion(baseId) {
        if (expandedBases.has(baseId)) {
          expandedBases.delete(baseId);
        } else {
          expandedBases.add(baseId);
        }
        renderSelectionList();
      }

      function toggleBaseSelection(baseId) {
        const baseTableIds = baseToTablesMap.get(baseId) || new Set();

        if (selectedBases.has(baseId)) {
          selectedBases.delete(baseId);

          for (const tableId of baseTableIds) {
            selectedTables.delete(tableId);
          }
        } else {
          selectedBases.add(baseId);

          for (const tableId of baseTableIds) {
            selectedTables.add(tableId);
          }
        }

        renderSelectionList();
      }

      const baseToTablesMap = new Map();

      function buildBaseToTablesMap() {
        baseToTablesMap.clear();
        tables.forEach((table) => {
          if (table.baseId) {
            if (!baseToTablesMap.has(table.baseId)) {
              baseToTablesMap.set(table.baseId, new Set());
            }
            baseToTablesMap.get(table.baseId).add(table.id);
          }
        });
      }

      document.addEventListener("DOMContentLoaded", function () {
        buildBaseToTablesMap();
      }, { once: true });

      function toggleTableSelection(tableId) {
        const table = tables.find((t) => t.id === tableId);

        if (!table || !table.baseId) return;

        if (selectedTables.has(tableId)) {
          selectedTables.delete(tableId);

          const baseTableIds = baseToTablesMap.get(table.baseId) ||
            new Set();
          let hasSelectedTables = false;

          for (const id of baseTableIds) {
            if (selectedTables.has(id)) {
              hasSelectedTables = true;
              break;
            }
          }

          if (!hasSelectedTables) {
            selectedBases.delete(table.baseId);
          }
        } else {
          selectedTables.add(tableId);

          selectedBases.add(table.baseId);
        }

        renderSelectionList();
      }

      function toggleSelectAll() {
        const allSelected = selectedBases.size === bases.length;

        if (allSelected) {
          selectedBases.clear();
          selectedTables.clear();
        } else {
          bases.forEach((base) => selectedBases.add(base.id));
          tables.forEach((table) => selectedTables.add(table.id));
        }

        renderSelectionList();
      }

      function skipSelection() {
        const urlParams = new URLSearchParams();
        urlParams.set("skip", "true");
        window.location.href = callbackUrl + "&" + urlParams.toString();
      }

      function confirmSelection() {
        if (selectedBases.size === 0 && selectedTables.size === 0) {
          alert(
            "Please select at least one base or table to continue.",
          );
          return;
        }

        const urlParams = new URLSearchParams();
        urlParams.set("isSaveBase", "true");

        const selectedBasesArray = Array.from(selectedBases);
        if (selectedBasesArray.length > 0) {
          urlParams.set("selectedBases", selectedBasesArray.join(","));
        }

        const selectedTablesArray = Array.from(selectedTables);
        if (selectedTablesArray.length > 0) {
          urlParams.set(
            "selectedTables",
            selectedTablesArray.join(","),
          );
        }

        const finalUrl = callbackUrl + "&" + urlParams.toString();
        window.location.href = finalUrl;
      }
    </script>
  </body>
</html>
`;
  } catch (error) {
    console.error("Falha ao ler o template HTML:", error);
    return generateFallbackPage({ bases, tables, callbackUrl });
  }

  const processedHtml = htmlTemplate
    .replace('"{{BASES_DATA}}"', JSON.stringify(bases))
    .replace('"{{TABLES_DATA}}"', JSON.stringify(tables))
    .replace('"{{CALLBACK_URL}}"', JSON.stringify(callbackUrl));

  return processedHtml;
}

function generateFallbackPage(
  { bases, tables, callbackUrl }: SelectionPageOptions,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCP Connector - Airtable Access</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      max-width: 32rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
      margin: 8px;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .btn-secondary {
      background: white;
      color: #374151;
      border-color: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>MCP Connector - Airtable Access</h2>
    <p>Template file not found. Using fallback interface.</p>
    <p>Found ${bases.length} bases and ${tables.length} tables.</p>
    <div>
      <button class="btn btn-secondary" onclick="window.location.href='${callbackUrl}&skip=true'">
        Skip selection
      </button>
      <button class="btn btn-primary" onclick="window.location.href='${callbackUrl}&isSaveBase=true'">
        Continue
      </button>
    </div>
  </div>
</body>
</html>`;
}
