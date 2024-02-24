
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

const AW_WORKER_PROPOSALS = {
    CONTRACT_NAME: "prop.worlds",
    TABLES: {
        PROPOSALS: "proposals",
        PROPOSAL_VOTES: "propvotes",
        CONFIGS: "configs",
    },
    DELEGATE_MODE: {
        PROPOSAL: "proposal",
        CATEGORY: "category",
    },
    ACTIONS: {
        CREATE_PROPOSAL: "createprop",
        VOTE_PROPOSAL: "voteprop",
        START_WORK: "startwork",
        CANCEL_PROPOSAL: "cancelprop",
        CANCEL_WIP_PROPOSAL: "cancelwip",
        COMPLETE_WORK: "completework",
        VOTE_FINISH_PROPOSAL: "votepropfin",
        DISPUTE_UNAPPROVED_PROPOSAL: "dispute",
        FINALIZE_PROPOSAL: "finalize",
        UPDATE_CONFIG: "updateconfig",
        ARBIRATOR_APPROVE: "arbapprove",
        ARBIRATOR_DENY: "arbdeny",
        ARBIRATOR_VOTE: "arbirator_vote",
        ARBITATOR_AGREE: "arbagree",
        CLEAR_EXPIRED_PROPOSAL: "clearexpprop",
        DELEGATE_VOTE: "delegatevote",
        DELEGATE_VOTE_CATEGORY: "delegatecat",
        UNDELEGATE_VOTE: "undelegateca",
    },
    PROP_STATE: {
        PENDING_APPROVAL: { name: "Pending Approval", value: "pendingappr" },
        HAS_ENOUGH_APP_VOTES: { name: "Ready To Start", value: "apprvtes" },
        IN_PROGRESS: { name: "In Progress", value: "inprogress" },
        PENDING_FINALIZE: { name: "Pending Finalize", value: "pendingfin" },
        HAS_ENOUGH_FIN_VOTES: { name: "Ready To Finalize", value: "apprfinvtes" },
        EXPIRED: { name: "Expired", value: "expired" },
        DISPUTED: { name: "Disputed", value: "indispute" },
    },
    VOTE: {
        VOTE_PROP_APPROVE: { name: "Approve", value: "propapprove" },
        VOTE_PROP_DENY: { name: "Deny", value: "propdeny" },
        VOTE_FINAL_APPROVE: { name: "Approve", value: "finalapprove" },
        VOTE_FINAL_DENY: { name: "Deny", value: "finaldeny" },
        VOTE_APPROVE: { name: "Approve", value: "approve" },
        VOTE_DENY: { name: "Deny", value: "deny" },
        VOTE_ABSTAIN: { name: "Abstain", value: "abstain" },
    }
};

const AW_PLANETS = [
    { name: "Kavian", scope: "kavian", account: "kavian.dac" },
    { name: "Eyeke", scope: "eyeke", account: "eyeke.dac" },
    { name: "Neri", scope: "nerix", account: "neri.dac" },
    { name: "Veles", scope: "veles", account: "veles.dac" },
    { name: "Naron", scope: "naron", account: "naron.dac" },
    { name: "Magor", scope: "magor", account: "magor.dac" },
    { name: "Testa", scope: "testa", account: "testadacdacc" },
];

const AW_TOKEN = {
    CONTRACT_NAME: "token.worlds",
    TABLES: {
        STAKES: "stakes",
    }
};

const AW_DAO = {
    CONTRACT_NAME: "dao.worlds",
    TABLES: {
        CANDIDATES: "candidates",
        DACGLOBALS: "dacglobals",
        VOTES: "votes",
        CUSTODIANS1: "custodians1",
    },
    ACTIONS: {
        VOTE_CUSTODIANS: "votecust",
        CLAIM_BUDGET: "claimbudget",
    },
};

const AW_MSIG = {
    CONTRACT_NAME: "msig.worlds",
    TABLES: {
        PROPOSALS: "proposals",

    },
    ACTIONS: {
        PROPOSE: "propose",
        APPROVE: "approve",
        UNAPPROVE: "unapprove",
        CANCEL: "cancel",
        EXECUTE: "exec",
    },
    PROP_STATE: {
        PENDING: { name: "Pending", value: 0 },
        EXECUTED: { name: "Executed", value: 1 },
        CANCELLED: { name: "Cancelled", value: 2 },
    },
};

const AW = {
    CONTRACT_NAME: "alien.worlds",
};

const TOAST_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    INFO: "info",
    WARNING: "warning",
};

const ROUTES = [{
    name: "Home",
    path: "/",
}, {
    name: "Voting",
    path: "/voting",
},
{
    name: "Worker Proposals",
    path: "/worker-proposals",
},
{
    name: "Msig",
    path: "/msig",
}
];

export {
    AW,
    AW_DAO,
    AW_MSIG,
    AW_PLANETS,
    AW_TOKEN,
    AW_WORKER_PROPOSALS,
    ROUTES,
    TOAST_TYPES,
    blockchain_endpoints
};

