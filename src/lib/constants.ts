const blockchain_endpoints = [
    "https://wax.greymass.com",
    "https://api.waxsweden.org",
    "https://wax.eosdac.io",
    "https://wax-history.eosdac.io",
    "https://wax.eu.eosamsterdam.net",
    "https://wax.eosrio.io",
    "https://eu.wax.eosrio.io",
    "https://wax.api.eosnation.io",
    "https://wax.dfuse.eosnation.io",
    "https://api.waxsweden.org",
    "https://wax.eosusa.io",
    "https://api.wax.alohaeos.com",
];

const AW = {
    PLANETS: [
        { name: "Kavian", scope: "kavian" },
        { name: "Eyeke", scope: "eyeke" },
        { name: "Neri", scope: "nerix" },
        { name: "Veles", scope: "veles" },
        { name: "Naron", scope: "naron" },
        { name: "Magor", scope: "magor" },
    ],
    CONTRACT_NAME: "dao.worlds",
    CANDIDATES_TABLE: "candidates",
    DACGLOBALS_TABLE: "dacglobals",
    VOTES_TABLE: "votes",
    ACTIONS: {
        VOTE_CUSTODIANS: "votecust",
    }
};

const TOAST_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    INFO: "info",
    WARNING: "warning",
};

export { AW, TOAST_TYPES, blockchain_endpoints };

