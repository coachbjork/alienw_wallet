<script lang="ts">
	import { AW_DAO_INFRA, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import { CirclePlusSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	let isOpen = false;
	let isSubmitting = false;
	let isCreating = true;
	let wallet = '';
	let identity_name = '';
	let header_graphic = '';
	let logo = '';
	let description = '';
	let contacts: string[] = [];

	export function setModalOpen(bool: boolean, data: any) {
		let { identity } = data;
		if (identity) {
			isCreating = false;
			wallet = identity.wallet;
			identity_name = identity.identity_name;
			header_graphic = identity.header_graphic;
			logo = identity.logo;
			description = identity.description;
			contacts = identity.contacts;
		} else {
			isCreating = true;
		}
		isOpen = bool;
	}

	function refresh() {
		dispatch('refresh');
	}

	onMount(async () => {});

	async function submit() {
		isSubmitting = true;
		if (!$session) {
			toastStore.add('Please login to vote', TOAST_TYPES.WARNING);
			return;
		}

		if (!wallet) {
			toastStore.add('Wallet is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!identity_name) {
			toastStore.add('Identity Name is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!header_graphic) {
			toastStore.add('Header Graphic is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!logo) {
			toastStore.add('Logo is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!description) {
			toastStore.add('Description is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		// if(contacts.length == 0) {
		// 	toastStore.add('Contacts is required', TOAST_TYPES.WARNING);
		// 	isSubmitting = false;
		// 	return;
		// }

		let actions = [
			{
				account: AW_DAO_INFRA.CONTRACT_NAME,
				name: AW_DAO_INFRA.ACTIONS.SET_IDENTITY,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					dac_id: $activePlanetStore.scope,
					executor: String($session.actor),
					wallet,
					identity_name,
					header_graphic,
					logo,
					description,
					contacts
				}
			}
		];
		await pushActions($session, actions);
		isSubmitting = false;
		refresh();
		close();
	}

	async function close() {
		wallet = '';
		identity_name = '';
		header_graphic = '';
		logo = '';
		description = '';
		contacts = [];
		isOpen = false;
	}

	function autoResize(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
		event.target.style.height = event.target.scrollHeight + 'px'; // Set new height
	}

	function resetHeight(event: any) {
		event.target.style.height = 'auto'; // Reset height to recalculate
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if isOpen}
	<div class="modal" on:click={close}>
		<div class="modal-content bg-background-default-lighter" on:click|stopPropagation>
			<div class="mb-5 flex flex-row">
				<h2 class=" text-white underline decoration-white underline-offset-4">
					{#if isCreating}
						Create Identity
					{:else}
						Update Identity
					{/if}
				</h2>
				<div class="flex-grow"></div>
				<CloseOutline
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>
			<label for="wallet" class="text-base font-semibold"> Wallet: </label>
			<div class="flex flex-row">
				<input
					id="wallet"
					class="text-black"
					type="text"
					bind:value={wallet}
					placeholder="Wallet Name"
				/>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					Name
				</span>
			</div>
			<label for="identity-name" class="text-base font-semibold"> Identity Name: </label>
			<div class="flex flex-row">
				<input
					id="identity_name"
					class="text-black"
					type="text"
					bind:value={identity_name}
					placeholder="Identity Name"
				/>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>

			<label for="header-graphic" class="text-base font-semibold"> Header Graphic URL: </label>
			<div class="flex flex-row">
				<input
					class="text-black"
					type="text"
					bind:value={header_graphic}
					placeholder="Header Graphic URL"
				/>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>
			<label for="logo" class="text-base font-semibold"> Logo URL: </label>
			<div class="flex flex-row">
				<input class="text-black" type="text" bind:value={logo} placeholder="Logo URL" />
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>
			<label for="description" class="text-base font-semibold"> Description: </label>
			<div class="flex flex-row">
				<textarea
					class="text-black"
					bind:value={description}
					placeholder="Description"
					on:input={autoResize}
					on:focusin={() => autoResize(event)}
					on:focusout={() => resetHeight(event)}
				></textarea>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>

			<div class="flex flex-row">
				<label for="contact" class="text-base font-semibold"> Contacts: </label>
				<CirclePlusSolid
					class="ml-2 h-6 w-6 text-indigo-500"
					on:click={() => {
						contacts = [...contacts, ''];
					}}
				/>
			</div>
			{#each contacts as item, index}
				<div class="mt-1 flex flex-row">
					<input
						type="text"
						bind:value={item}
						class=" rounded-lg border-2 border-gray-300 bg-gray-200 text-black"
						placeholder="Contact Info"
					/>

					<span
						class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
					>
						String
					</span>

					<CloseCircleSolid
						class="ml-2 mt-4 flex h-6 w-6 items-center justify-center text-red-500 "
						on:click={() => {
							contacts = contacts.filter((_, i) => i !== index);
						}}
					/>
				</div>
			{/each}

			<div class="mt-2">
				{#if isSubmitting}
					<!-- Spining wheel when uploading -->
					<div class="flex flex-col items-center">
						<Spinner color="green" />
					</div>
				{:else}
					<button class="bg-green-500 text-white hover:bg-green-700" on:click={submit}
						>Submit</button
					>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		z-index: 100;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.modal-content {
		margin: auto;
		padding: 15px;
		border: 1px solid #888;
		width: 80%;
		max-width: 500px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	}

	input,
	textarea {
		width: 100%;
		margin: 8px 0;
		display: inline-block;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
		font-size: 16px;
	}

	button {
		width: 100%;
		padding: 14px 20px;
		margin: 8px 0;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
	}
</style>
