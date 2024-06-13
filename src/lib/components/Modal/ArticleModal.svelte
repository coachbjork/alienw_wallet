<script lang="ts">
	import { AW_DAO_INFRA, TOAST_TYPES } from '$lib/constants';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { pushActions } from '$lib/utils/wharfkit/session';
	import { Spinner } from 'flowbite-svelte';
	import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();
	let isOpen = false;
	let isSubmitting = false;
	let isCreating = true;
	let title = '';
	let description = '';
	let image = '';
	let link = '';
	let author = '';

	export function setModalOpen(bool: boolean, data: any) {
		let { article } = data;
		if (article) {
			isCreating = false;
			title = article.title;
			image = article.image;
			link = article.link;
			author = article.author;
			description = article.description;
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

		if (!title) {
			toastStore.add('Title is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!image) {
			toastStore.add('Image URL is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!link) {
			toastStore.add('Article Link is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!author) {
			toastStore.add('Author is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		if (!description) {
			toastStore.add('Description is required', TOAST_TYPES.WARNING);
			isSubmitting = false;
			return;
		}

		let actions = [
			{
				account: AW_DAO_INFRA.CONTRACT_NAME,
				name: isCreating ? AW_DAO_INFRA.ACTIONS.ADD_ARTICLE : AW_DAO_INFRA.ACTIONS.UPDATE_ARTICLE,
				authorization: [
					{
						actor: String($session.actor),
						permission: String($session?.permission)
					}
				],
				data: {
					dac_id: $activePlanetStore.scope,
					executor: String($session.actor),
					title,
					image,
					link,
					author,
					description
				}
			}
		];
		await pushActions($session, actions);
		isSubmitting = false;
		refresh();
		close();
	}

	async function close() {
		title = '';
		description = '';
		image = '';
		link = '';
		author = '';
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
			<label for="title" class="text-base font-semibold"> Title: </label>
			<div class="flex flex-row">
				<input id="title" class="text-black" type="text" bind:value={title} placeholder="Title" />
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>
			<label for="author" class="text-base font-semibold"> Author: </label>
			<div class="flex flex-row">
				<input class="text-black" type="text" bind:value={author} placeholder="Author" />
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>
			<label for="image" class="text-base font-semibold"> Image URL: </label>
			<div class="flex flex-row">
				<input
					id="image"
					class="text-black"
					type="text"
					bind:value={image}
					placeholder="Image URL"
				/>
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>
			<label for="link" class="text-base font-semibold"> Link: </label>
			<div class="flex flex-row">
				<input class="text-black" type="text" bind:value={link} placeholder="Link" />
				<span
					class="my-2 ml-1 flex items-center justify-center rounded-lg bg-gray-600 px-2 text-white"
				>
					String
				</span>
			</div>

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
