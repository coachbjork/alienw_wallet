import { base } from '$app/paths';
const ROUTES = [
    {
        name: "Voting",
        path: `${base}/voting`,
    },
    {
        name: "Worker Proposals",
        path: `${base}/worker-proposals`,
    },
    {
        name: "Msig",
        path: `${base}/msig`,
    },
    {
        name: "DAO Infra",
        path: `${base}/dao-infra`,
        group: [
            {
                name: "Article",
                path: `${base}/dao-infra/article`,
            },
            {
                name: "Identity",
                path: `${base}/dao-infra/identity`,
            },
        ],
    },
    {
        name: "Referendum",
        path: `${base}/referendum`,
    },
    { name: "Wallet", path: `${base}/wallet` },
];

export default ROUTES;