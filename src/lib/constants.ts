
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

const AW_DAO_INFRA = {
    CONTRACT_NAME: "awdaoinfrasc",
    TABLES: {
        ARTICLES: "articles",
        IDENTITIES: "identities",
    },
    ACTIONS: {
        NEW_IDENTITY: "setidentity",
        SET_IDENTITY: "setidentity",
        REMOVE_IDENTITY: "rmidentity",
        ADD_ARTICLE: "addarticle",
        UPDATE_ARTICLE: "updarticle",
        REMOVE_ARTICLE: "rmarticle",
    },
    PERMISSION_LEVEL: {
        PARENT: "parent",
        SUB: "sub",
    },
};

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

const AW_REFERENDUM = {
    CONTRACT_NAME: "ref.worlds",
    TABLES: {
        REFERENDUMS: "referendums",
        VOTES: "votes",
        DEPOSITS: "deposits",
        CONFIG: "config",
    },
    ACTIONS: {
        PROPOSE: "propose",
        VOTE: "vote",
        CANCEL: "cancel",
        EXECUTE: "exec",
        DEPOSIT: "deposit",
        REFUND: "refund",
        UPDATE_STATUS: "updatestatus",
        CLEAN: "clean",
    },
    STATUS: {
        OPEN: { name: "Open", value: "open" },
        PASSING: { name: "Passing", value: "passing" },
        FAILING: { name: "Failing", value: "failing" },
        QUORUM_UNMET: { name: "Quorum Unmet", value: "quorum.unmet" },
        EXPIRED: { name: "Expired", value: "expired" },
        EXECUTED: { name: "Executed", value: "executed" },
    },
    VOTE: {
        REMOVE: { name: "Remove", value: "remove" },
        YES: { name: "Yes", value: "yes" },
        NO: { name: "No", value: "no" },
        ABSTAIN: { name: "Abstain", value: "abstain" },
    },
    REF_TYPE: {
        BINDING: { name: "Binding", value: "binding", tip: "This requires an associated transaction that will get executed if the referendum reaches a positive consensus through voting. It will have no intervention by the custodians or provide any mechanism for the custodians to intervene if they disagree with the outcome." },
        SEMI_BINDING: { name: "Semi Binding", value: "semibinding", tip: "Similar to the binding referendum, this requires a transaction that could be executed if the referendum reaches a positive consensus but rather than being executed it will be referred to the custodians as a proposal to make the final decision via voting before executing. Given it would have passed the consensus of the DAO community to get to this point it would be likely that the DAO would approve but may have a valid reason not to. This would open opportunity for interesting DAO politics to play out." },
        OPINION: { name: "Opinion", value: "opinion", tip: "This simply captures the group opinion of the DAO. It doesn't lead to the execution of any logic." },
    },
    COUNT_TYPE: {
        TOKEN: { name: "Token", value: "token" },
        ACCOUNT: { name: "Account", value: "account" },
    }
};

const AW_MSIG = {
    CONTRACT_NAME: "msig.worlds",
    TABLES: {
        PROPOSALS: "proposals",
        APPROVALS: "approvals",
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
    TOKEN: { NAME: "TLM", },
    ACTIONS: [
        {
            "name": "addvesting",
            "fields": [
                {
                    "name": "account",
                    "type": "name"
                },
                {
                    "name": "vesting_start",
                    "type": "time_point_sec"
                },
                {
                    "name": "vesting_length",
                    "type": "uint32"
                },
                {
                    "name": "vesting_quantity",
                    "type": "asset"
                }
            ],
            "base": ""
        },
        {
            "name": "burn",
            "fields": [
                {
                    "name": "from",
                    "type": "name"
                },
                {
                    "name": "quantity",
                    "type": "asset"
                },
                {
                    "name": "memo",
                    "type": "string"
                }
            ],
            "base": ""
        },
        {
            "name": "close",
            "fields": [
                {
                    "name": "owner",
                    "type": "name"
                },
                {
                    "name": "symbol",
                    "type": "symbol"
                }
            ],
            "base": ""
        },
        {
            "name": "create",
            "fields": [
                {
                    "name": "issuer",
                    "type": "name"
                },
                {
                    "name": "maximum_supply",
                    "type": "asset"
                }
            ],
            "base": ""
        },
        {
            "name": "issue",
            "fields": [
                {
                    "name": "to",
                    "type": "name"
                },
                {
                    "name": "quantity",
                    "type": "asset"
                },
                {
                    "name": "memo",
                    "type": "string"
                }
            ],
            "base": ""
        },
        {
            "name": "open",
            "fields": [
                {
                    "name": "owner",
                    "type": "name"
                },
                {
                    "name": "symbol",
                    "type": "symbol"
                },
                {
                    "name": "ram_payer",
                    "type": "name"
                }
            ],
            "base": ""
        },
        {
            "name": "pause",
            "fields": [],
            "base": ""
        },
        {
            "name": "transfer",
            "fields": [
                {
                    "name": "from",
                    "type": "name"
                },
                {
                    "name": "to",
                    "type": "name"
                },
                {
                    "name": "quantity",
                    "type": "asset"
                },
                {
                    "name": "memo",
                    "type": "string"
                }
            ],
            "base": ""
        },
        {
            "name": "unpause",
            "fields": [],
            "base": ""
        }
    ],
};

const TOAST_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    INFO: "info",
    WARNING: "warning",
};

const ROUTES = [
    {
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
    },
    {
        name: "DAO Infra",
        path: "/dao-infra",
        group: [
            {
                name: "Article",
                path: "/dao-infra/article",
            },
            {
                name: "Identity",
                path: "/dao-infra/identity",
            },
        ],
    },
    {
        name: "Referendum",
        path: "/referendum",
    },
];

const LOCAL_STORAGE_KEYS = {
    ACTIVE_PLANET: "activePlanetStore",
    CUSTODIANS: "custodiansStore",
    BP_RPC: "bpRPCStore",
};

export {
    AW,
    AW_DAO,
    AW_DAO_INFRA,
    AW_MSIG,
    AW_PLANETS, AW_REFERENDUM, AW_TOKEN,
    AW_WORKER_PROPOSALS,
    LOCAL_STORAGE_KEYS,
    ROUTES,
    TOAST_TYPES, blockchain_endpoints
};

