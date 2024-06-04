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
    { name: "Wallet", path: "/wallet" },
];

export default ROUTES;