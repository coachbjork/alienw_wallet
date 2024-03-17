<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import SetIndentityModal from '$lib/components/Modal/SetIndentityModal.svelte';
	import IdentityAction from '$lib/components/SidePanel/IdentityAction.svelte';
	import { AW_DAO_INFRA } from '$lib/constants';
	import { get_identities, get_identity_cursor } from '$lib/services/awDaoInfraService';
	import { activePlanetStore, session } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { Spinner } from 'flowbite-svelte';
	import { LabelSolid } from 'flowbite-svelte-icons';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';

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
		if ($session) {
		}
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
	<div class="container">
		<PlanetMenu />
		<div class="pt-10">
			{#if loading}
				<div class="flex justify-center">
					<Spinner color="purple" />
				</div>
			{:else if identities.length == 0}
				<div class="flex justify-center">No Data</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each identities as identity}
						<button class="flex flex-row" on:click={() => selectIdentity(identity)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedIdentity && selectedIdentity.wallet == identity?.wallet}
									<LabelSolid class="text-stone-300 h-5 w-5 " />
								{/if}
							</div>
							<div
								class={`flex-grow rounded-2xl border border-solid p-5 shadow-md  ${
									identity.permission_level == AW_DAO_INFRA.PERMISSION_LEVEL.PARENT
										? 'border-purple-700 shadow-purple-700'
										: 'border-gray-700 shadow-gray-700 '
								}`}
							>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start">
										<div>
											#: <span class="text-white underline">{identity.wallet}</span>
										</div>
										<div class="ml-5 mt-2">
											<img
												class="h-16 w-16 rounded-3xl bg-gray-500"
												src={identity.logo}
												alt="Logo"
											/>
										</div>
									</div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div>
											Name: <span class="text-white">{identity.identity_name}</span>
										</div>
										<div>
											Permission Level: <span class="text-white">{identity.permission_level}</span>
										</div>
										<div>
											Header Graphic: <span class="text-white">{identity.header_graphic}</span>
										</div>
									</div>
									<div class="mx-3 flex flex-1 flex-col text-start"></div>
									<div class="flex flex-none basis-3/12 flex-col text-end">
										<div>Updated At</div>
										<div class="text-white">
											{moment(`${identity.updated_at}`).format('YYYY-MM-DD HH:mm:ss')}
										</div>
									</div>
								</div>

								<div class="mx-auto mt-5 w-2/3 border-t-2 border-dotted border-gray-500"></div>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start"></div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div class="mt-1">
											Description: <span class="text-white">
												{#each identity.description.split('\n') as line}
													{line}
													<br />
												{/each}
											</span>
										</div>
										<div class="mt-1 flex flex-row">
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
									<div class="mx-3 flex flex-1 flex-col text-start"></div>
									<div class="flex flex-none basis-3/12 flex-col text-end"></div>
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
