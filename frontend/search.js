const input = document.getElementById("search");
const resultsDiv = document.getElementById("results");
const noResultsDiv = document.getElementById("no-results");
const searchClear = document.getElementById("search-clear");

// Debounce timer for search
let searchTimeout;
const SEARCH_DELAY = 500; // Wait 500ms after user stops typing

// Clear search functionality
searchClear.addEventListener("click", () => {
    input.value = "";
    resultsDiv.innerHTML = "";
    searchClear.style.display = "none";
    noResultsDiv.style.display = "none";
    input.focus();

    // Clear any pending search
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});

// Show/hide clear button
input.addEventListener("input", () => {
    if (input.value.trim().length > 0) {
        searchClear.style.display = "flex";
    } else {
        searchClear.style.display = "none";
    }
});

// Debounced search function
async function performSearch(query) {
    if (query.length === 0) {
        resultsDiv.innerHTML = "";
        noResultsDiv.style.display = "none";
        return;
    }

    // Show loading state
    resultsDiv.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner small"></div>
            <span>Searching players...</span>
        </div>
    `;

    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.length === 0) {
            resultsDiv.innerHTML = "";
            noResultsDiv.style.display = "block";
            return;
        }

        noResultsDiv.style.display = "none";
        resultsDiv.innerHTML = `
            <div class="results-header">
                <h3>Search Results (${data.length} ${data.length === 1 ? 'player' : 'players'} found)</h3>
            </div>
            <div class="players-grid">
                ${data.map(p => `
                    <div class="player-search-card" data-id="${p.playerId}">
                        <div class="player-card-content">
                            <div class="player-main-info">
                                <h4 class="player-name">${p.name}</h4>
                                <div class="player-position">${p.positionCode ?? 'N/A'}</div>
                            </div>
                            <div class="player-team-info">
                                <span class="team-name">${p.lastTeamAbbrev ?? 'N/A'}</span>
                                <span class="player-status ${p.active ? 'active' : 'inactive'}">
                                    ${p.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div class="player-card-action">
                                <span class="view-stats-hint">Click to view stats →</span>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        // Add click event listeners to player cards
        document.querySelectorAll(".player-search-card").forEach(card => {
            card.addEventListener("click", function (e) {
                const playerId = this.getAttribute("data-id");

                // Add visual feedback
                this.style.transform = "scale(0.98)";
                setTimeout(() => {
                    window.location.href = `/playerStats.html?id=${playerId}`;
                }, 100);
            });

            card.addEventListener("mouseenter", function () {
                this.style.transform = "translateY(-2px)";
            });

            card.addEventListener("mouseleave", function () {
                this.style.transform = "translateY(0)";
            });
        });

    } catch (error) {
        console.error("Search error:", error);
        resultsDiv.innerHTML = `
            <div class="search-error">
                <h3>Search Error</h3>
                <p>There was an error searching for players. Please try again.</p>
            </div>
        `;
    }
}

// Debounced input event listener
input.addEventListener("input", () => {
    const query = input.value.trim();

    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (query.length === 0) {
        resultsDiv.innerHTML = "";
        noResultsDiv.style.display = "none";
        return;
    }

    resultsDiv.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner small"></div>
            <span>Typing...</span>
        </div>
    `;

    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, SEARCH_DELAY);
});

function updateSearchResults(data) {
    if (data.length === 0) {
        resultsDiv.innerHTML = "";
        noResultsDiv.style.display = "block";
        return;
    }

    noResultsDiv.style.display = "none";
    const playersText = data.length === 1 ? translator.translate('player_found') : translator.translate('players_found');

    resultsDiv.innerHTML = `
        <div class="results-header">
            <h3>${translator.translate('search_results')} (${data.length} ${playersText})</h3>
        </div>
        <div class="players-grid">
            ${data.map(p => `
                <div class="player-search-card" data-id="${p.playerId}">
                    <div class="player-card-content">
                        <div class="player-main-info">
                            <h4 class="player-name">${p.name}</h4>
                            <div class="player-position">${p.positionCode ?? 'N/A'}</div>
                        </div>
                        <div class="player-team-info">
                            <span class="team-name">${p.lastTeamAbbrev ?? 'N/A'}</span>
                            <span class="player-status ${p.active ? 'active' : 'inactive'}">
                                ${p.active ? translator.translate('active') : translator.translate('inactive')}
                            </span>
                        </div>
                        <div class="player-card-action">
                            <span class="view-stats-hint">${translator.translate('link_to_stats')}</span>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;

    // Add click event listeners to player cards
    document.querySelectorAll(".player-search-card").forEach(card => {
        card.addEventListener("click", function (e) {
            const playerId = this.getAttribute("data-id");
            this.style.transform = "scale(0.98)";
            setTimeout(() => {
                window.location.href = `/playerStats.html?id=${playerId}`;
            }, 100);
        });
    });
}

// Update the loading state in performSearch function
function showLoadingState() {
    resultsDiv.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner small"></div>
            <span>${translator.translate('searching_players')}</span>
        </div>
    `;
}