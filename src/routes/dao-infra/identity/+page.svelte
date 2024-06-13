<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import SetIndentityModal from '$lib/components/Modal/SetIndentityModal.svelte';
	import IdentityAction from '$lib/components/SidePanel/Actions/IdentityAction.svelte';
	import { AW_DAO_INFRA } from '$lib/constants';
	import { get_identities, get_identity_cursor } from '$lib/services/awDaoInfraService';
	import { activePlanetStore, session } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { Spinner } from 'flowbite-svelte';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';
	import CrosshairsSolid from 'svelte-awesome-icons/CrosshairsSolid.svelte';

	let selectedPlanet: Planet = $activePlanetStore;
	let loading = true;
	let identities: any = [];
	let selectedIdentity: any = null;
	let user_identity: any = null;
	let setIdentityModal: any;

	$: $session && updateUserIdentity();
	onMount(async () => {
		loading = true;
		await fetchIdentities();
		loading = false;
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			loading = true;
			await fetchIdentities();
			loading = false;
		}
	});

	async function fetchIdentities() {
		const cursor = await get_identity_cursor($activePlanetStore.name);
		if (!cursor) return;
		let data = await get_identities(cursor);
		if (!data) return;
		identities = data;

		user_identity = identities.find((identity: any) => {
			return identity.wallet == String($session?.actor);
		});
	}

	function updateUserIdentity() {
		user_identity = identities.find((identity: any) => {
			return identity.wallet == String($session?.actor);
		});
	}

	function selectIdentity(item: any) {
		if (selectedIdentity && selectedIdentity.wallet == item.wallet) {
			selectedIdentity = null;
			return;
		} else {
			selectedIdentity = item;
		}
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		<PlanetMenu />
		<div class="mt-10 overflow-x-auto">
			{#if loading}
				<div class="my-4 flex justify-center md:my-5">
					<Spinner color="purple" />
				</div>
			{:else if identities.length == 0}
				<div class="my-4 flex justify-center md:my-5">No Data</div>
			{:else}
				<div class="my-4 flex flex-col gap-6 md:my-5">
					{#each identities as identity}
						<button class="flex flex-row p-1" on:click={() => selectIdentity(identity)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedIdentity && selectedIdentity.wallet == identity?.wallet}
									<CrosshairsSolid color="#ecc94b" size="24" />
								{/if}
							</div>
							<div
								class={`flex-grow basis-full whitespace-normal 
								break-words break-all rounded-2xl
								border border-solid p-5 shadow-md  ${
									identity.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT
										? 'border-purple-700 shadow-purple-700'
										: 'border-gray-700 shadow-gray-700 '
								} ${
									identity?.wallet == selectedIdentity?.wallet
										? 'backdrop-brightness-200'
										: 'backdrop-brightness-125'
								}`}
							>
								<div class="flex flex-col flex-wrap md:flex-row">
									<div class="flex flex-none basis-full flex-col text-start md:basis-2/12">
										<div class="text-sm md:text-base">
											#: <span class="text-base font-semibold text-white underline md:text-lg"
												>{identity.wallet}</span
											>
										</div>
										<div class="ml-0 mt-2 md:ml-5">
											<img
												class="h-16 w-16 rounded-3xl bg-gray-500"
												src={identity.logo}
												alt="Logo"
											/>
										</div>
									</div>
									<div
										class="mx-0 mt-3 flex-none basis-full flex-col text-start md:mx-3 md:mt-0 md:basis-3/12"
									>
										<div class="text-sm md:text-base">
											Name: <span class="text-white">{identity.identity_name}</span>
										</div>
										<div class="text-sm md:text-base">
											Permission Level: <span class="text-white">{identity.permission_level}</span>
										</div>
										<div class="text-sm md:text-base">
											Header Graphic: <span class="text-white">{identity.header_graphic}</span>
										</div>
									</div>
									<div class="mx-0 flex flex-1 flex-col text-start md:mx-3"></div>
									<div
										class="mt-3 flex flex-none basis-full flex-col text-start md:mt-0 md:basis-3/12"
									>
										<div class="text-sm md:text-base">Updated At</div>
										<div class="text-white">
											{moment(`${identity.updated_at}`).format('YYYY-MM-DD HH:mm:ss')}
										</div>
									</div>
								</div>

								<div
									class="mx-auto mt-5 w-full border-t-2 border-dotted border-gray-500 md:w-2/3"
								></div>
								<div class="mt-3 flex flex-col flex-wrap md:mt-0 md:flex-row">
									<div class="flex flex-none basis-full flex-col text-start md:basis-2/12"></div>
									<div
										class="mx-0 mt-3 flex-none basis-full flex-col text-start md:mx-3 md:mt-0 md:basis-3/12"
									>
										<div class="mt-1 text-sm md:text-base">
											Description: <span class="text-white">
												{#each identity.description.split('\n') as line}
													{line}
													<br />
												{/each}
											</span>
										</div>

										<div class="mt-1 flex flex-row text-sm md:text-base">
											Contacts:
											<ul class="ml-5 list-inside list-disc">
												{#each identity.contacts as contact}
													<li>
														<span class="text-white">{contact}</span>
													</li>
												{/each}
											</ul>
										</div>
									</div>
									<div class="mx-0 flex flex-1 flex-col text-start md:mx-3"></div>
									<div
										class="mt-3 flex flex-none basis-full flex-col text-end md:mt-0 md:basis-3/12"
									></div>
								</div>
							</div>
							<div class="w-8 flex-none"></div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="left-side"></div>
<div class="right-side">
	<IdentityAction
		{selectedIdentity}
		{user_identity}
		on:set_identity={(data) => {
			setIdentityModal.setModalOpen(true, data.detail);
		}}
		on:refresh={fetchIdentities}
	/>
</div>
<SetIndentityModal bind:this={setIdentityModal} on:refresh={fetchIdentities} />

<style>
</style>
