export const prerender = true;
// export async function load({ fetch, params }: { fetch: any, params: any & { activePlanetScope: string } }) {
//     // Fetch data using server-side endpoint
//     const response = await fetch(`/api/daoaw/candidates?activePlanetScope=${params.activePlanetScope}`);
//     const data = await response.json();
//     return {
//         props: {
//             candidates: data
//         }
//     };
// }