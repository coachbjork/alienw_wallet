<script lang="ts">
	import { PUBLIC_ALIEN_WALLET_API } from '$env/static/public';
	import { AW_DAO, AW_PLANETS, TOAST_TYPES } from '$lib/constants';
	import { get_candidate_by_candname } from '$lib/services/awdaoService';
	import { session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Asset } from '@wharfkit/antelope';
	import axios from 'axios';
	import { Spinner } from 'flowbite-svelte';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import DeleteFilled from 'svelte-ant-design-icons/DeleteFilled.svelte';
	import EditFilled from 'svelte-ant-design-icons/EditFilled.svelte';

	const dispatch = createEventDispatcher();
	let loading = true;
	let candidateData: any = [];
	let profileData: any = [];
	let profiles: any = [];
	onMount(async () => {});

	afterUpdate(async () => {});

	export async function refresh() {
		if ($session) {
			Promise.all([fetchCandidate()]).then(async () => {
				loading = false;
			});
		}
	}

	$: $session &&
		Promise.all([fetchCandidate()]).then(async () => {
			loading = false;
		});

	async function fetchCandidate() {
		loading = true;
		let res: any = await Promise.all(
			AW_PLANETS.filter((planet) => {
				return planet.scope != 'testa';
			}).map(async (planet) => {
				const res = await get_candidate_by_candname(planet, String($session?.actor));
				return res;
			})
		);
		if (!res) return;
		// filter out null values
		res = res.filter((r: any) => r);

		candidateData = res;

		const resP = await fetchCandidatesProfile();

		profileData = resP;
		profiles = AW_PLANETS.filter((planet) => {
			return planet.scope != 'testa';
		}).map((planet) => {
			let pData = profileData.find((p: any) => p.planet === planet.scope);
			let cData = candidateData.find((c: any) => c.planet.scope === planet.scope);

			let desc = pData?.cand_desc;
			// try to convert string to json object
			if (typeof desc == 'string') {
				try {
					desc = JSON.parse(desc.replace(/'([^']*?)'/g, '"$1"')).description;
				} catch (e) {
					console.log('error', e);
				}
			}

			return {
				planet,
				cand_acc: pData?.cand_acc || 'No Profile',
				cand_name: pData?.cand_name || 'No Given Name',
				cand_img: pData?.cand_img || 'default-avatar.png',
				cand_desc:
					(typeof pData?.cand_desc == 'object' ? pData?.cand_desc?.description : desc) ||
					'No Given Description',
				requestedpay: cData?.requestedpay || Asset.from('0.0000 TLM'),
				is_registered: pData ? true : false
			};
		});
	}

	async function fetchCandidatesProfile() {
		const res: any = await axios.get(
			`${PUBLIC_ALIEN_WALLET_API}/custodians?account=${String($session?.actor)}`
		);
		// const res: any = await axios.get(`${PUBLIC_ALIEN_WALLET_API}/custodians?account=anyo.cabal`);

		if (!res) return [];
		return res.data;
	}

	function getProfileImg(planet: string) {
		const profile = profileData.find((p: any) => p.planet === planet);

		if (profile) {
			return profile.cand_img;
		}
		return 'default-avatar.png';
	}
	function getProfileName(planet: string) {
		const profile = profileData.find((p: any) => p.planet === planet);

		if (profile) {
			return profile.cand_name;
		}
		return 'No Given Name';
	}

	function getProfileDesc(planet: string) {
		const profile = profileData.find((p: any) => p.planet === planet);

		if (profile) {
			if (typeof profile.cand_desc == 'object') {
				return profile.cand_desc?.description || 'No Description Given';
			} else {
				return profile.cand_desc;
			}
		}
		return 'No Description Given';
	}

	async function withdraw_candidate(dac_id: string) {
		if (!$session) {
			toastStore.add('Please login first', TOAST_TYPES.WARNING);
			return;
		}

		let actions: any = [
			{
				account: AW_DAO.CONTRACT_NAME,
				name: AW_DAO.ACTIONS.WITHDRAW_CANDIDATE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					cand: String($session.actor),
					dac_id
				}
			}
		];

		const res = await pushActions($session, actions);

		if (res) {
			refresh();
		}
	}
</script>

<h1 class="mb-6 ml-3 text-start text-2xl font-bold text-orange-500 md:ml-0 md:text-center">
	Candidate Profile
</h1>
<div class="mt-10 overflow-x-auto">
	{#if loading}
		<div class="flex items-center justify-center">
			<Spinner color="purple" />
		</div>
	{:else}
		{#each profiles as profile}
			<div class="flex w-full flex-col p-2">
				<div
					class="flex flex-col items-start justify-between rounded-lg p-2 backdrop-brightness-125 md:flex-wrap"
				>
					<div class="absolute right-2 top-2 flex flex-row">
						<!-- <button
							class=" flex cursor-pointer flex-row justify-center rounded-md bg-green-500 p-1 text-white hover:bg-green-600"
							on:click={() => {
								dispatch('editImgProfile', profile);
							}}
						>
							<EditFilled class="h-6 w-6 rounded-full  md:h-6 md:w-6" />
							<div class="ml-2">{profile.is_registered ? 'Update' : 'Sign Up'}</div>
						</button>
						{#if profile.is_registered}
							<button
								class=" ml-1 flex cursor-pointer flex-row justify-center rounded-md bg-red-500 p-1 text-white hover:bg-red-600"
								on:click={() => {
									withdraw_candidate(profile.planet.scope);
								}}
							>
								<DeleteFilled class="h-6 w-6 rounded-full  md:h-6 md:w-6" />
								<div class="ml-2">Renounce</div>
							</button>
						{/if} -->
					</div>

					<div class="flex w-full flex-row items-start text-nowrap">
						<enhanced:img
							class="h-16 min-h-16 w-16 min-w-16 rounded-full md:h-24 md:min-h-24 md:w-24 md:min-w-24"
							src={profile?.cand_img || 'default-avatar.png'}
							alt="error"
						/>

						<div class="ml-5 w-full">
							<div class="flex flex-row justify-between">
								<div>
									<div class="font-bold text-white">
										{profile.cand_acc} -
										<span class="italic">{profile.cand_name}</span>
									</div>
									<div class="mt-1 text-sm md:text-base">
										<span class="text-white">Planet: </span>
										<span class="text-default"> {profile.planet.name}</span>
									</div>
									<div class="text-sm md:text-base">
										<span class="text-white">Requested Pay: </span>
										<span class="text-default">{String(profile.requestedpay)}</span>
									</div>
								</div>
								<div class="flex h-fit flex-col md:flex-row">
									<button
										class=" flex cursor-pointer flex-row justify-center rounded-md bg-green-500 p-1 text-white hover:bg-green-600"
										on:click={() => {
											dispatch('editImgProfile', profile);
										}}
									>
										<EditFilled class="h-6 w-6 rounded-full  md:h-6 md:w-6" />
										<div class="ml-1 hidden md:block">
											{profile.is_registered ? 'Update' : 'Sign Up'}
										</div>
									</button>
									{#if profile.is_registered}
										<button
											class="mt-1 flex cursor-pointer flex-row justify-center rounded-md bg-red-500 p-1 text-white hover:bg-red-600 md:ml-1 md:mt-0"
											on:click={() => {
												withdraw_candidate(profile.planet.scope);
											}}
										>
											<DeleteFilled class="h-6 w-6 rounded-full  md:h-6 md:w-6" />
											<div class="ml-1 hidden md:block">Renounce</div>
										</button>
									{/if}
								</div>
							</div>
						</div>
					</div>
					<div class="mt-3 flex flex-col items-start md:mx-5">
						<div class=" text-sm text-white md:text-base">Description:</div>
						<div class="text-default text-sm md:text-base">
							{#each profile?.cand_desc.split('\n') as line}
								{line}
								<br />
							{/each}
							<!-- {profile.cand_desc} -->
						</div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
</style>
