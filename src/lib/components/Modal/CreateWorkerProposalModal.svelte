<script lang="ts">
	import { TOAST_TYPES } from '$lib/constants';
	import { get_worker_proposal_by_id } from '$lib/services/awWorkerPropService';
	import { activePlanetStore, session, toastStore } from '$lib/stores';
	import { Spinner } from 'flowbite-svelte';
	import CloseOutline from 'flowbite-svelte-icons/CloseOutline.svelte';
	import { onMount } from 'svelte';

	export let isOpen = false;
	export let onClose: () => void;
	export let onCreateProposal: (proposal: any) => Promise<void>;

	let isUploading = false;
	let id = '';
	let proposer = String($session?.actor);
	let title = '';
	let summary = '';
	let arbiter = '';
	let proposal_pay: any = null;
	let arbiter_pay: any = null;
	let content_hash = '';
	let job_duration: any = null;
	let file_content: any = null;

	onMount(async () => {
		await generateRandomProposalId();
		proposer = String($session?.actor);
	});

	// afterUpdate(async () => {
	// 	if (isOpen) {
	// 		await generateRandomProposalId();
	// 	}
	// });

	async function submit() {
		isUploading = true;
		let proposal = {
			proposer,
			title,
			summary,
			arbiter,
			proposal_pay,
			arbiter_pay,
			content_hash,
			id,
			job_duration
		};

		if (title === '') {
			toastStore.add('Please enter a title', TOAST_TYPES.WARNING);
			isUploading = false;
			return;
		}

		if (summary === '') {
			toastStore.add('Please enter a summary', TOAST_TYPES.WARNING);
			isUploading = false;
			return;
		}

		if (arbiter === '') {
			toastStore.add('Please enter an arbiter', TOAST_TYPES.WARNING);
			isUploading = false;
			return;
		}

		if (job_duration === null) {
			toastStore.add('Please enter a job duration', TOAST_TYPES.WARNING);
			isUploading = false;
			return;
		}

		if (proposal_pay === null) {
			proposal.proposal_pay = 0;
		}

		if (arbiter_pay === null) {
			proposal.arbiter_pay = 0;
		}

		// await uploadFileToIPFS();

		// proposal.content_hash = content_hash;

		await onCreateProposal(proposal)
			.then(async (res: any) => {
				isUploading = false;
				if (res) {
					// close the modal
					close();
				} else {
					// unpin the file from IPFS
					// await removeFileFromIPFS();
				}
			})
			.catch(async (error: any) => {
				isUploading = false;
				// unpin the file from IPFS
				// await removeFileFromIPFS();
				console.error('Error:', error);
			});
	}
	async function close() {
		title = '';
		summary = '';
		arbiter = '';
		proposal_pay = null;
		arbiter_pay = null;
		content_hash = '';
		job_duration = null;
		file_content = null;
		onClose();
		await generateRandomProposalId();
	}

	async function generateRandomProposalId() {
		const characters = '12345abcdefghijklmnopqrstuvwxyz';
		let proposal_id = '';
		let proposal_id_exists = false;
		while (!proposal_id_exists) {
			proposal_id = '';
			for (let i = 0; i < 12; i++) {
				proposal_id += characters.charAt(Math.floor(Math.random() * characters.length));
			}
			const res: any = await get_worker_proposal_by_id($activePlanetStore.name, proposal_id);

			// If it does, generate a new one
			// If it doesn't, set proposal_id_exists to true
			if (!res?.proposal_id) {
				proposal_id_exists = true;
			}
		}
		id = proposal_id;
	}

	async function handleFileChanged(event: any) {
		const file = event.target.files[0];
		if (!file) return;
		file_content = file;
	}

	async function uploadFileToIPFS() {
		try {
			if (!file_content) {
				toastStore.add('Please select a file to upload', TOAST_TYPES.ERROR);
			}
			let formData = new FormData();
			formData.append('file', file_content);
			const response = await fetch('/api/ipfs/pin', {
				method: 'POST',
				body: formData
			});

			const { ipfsHash } = await response.json();
			if (ipfsHash) {
				content_hash = ipfsHash;
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	async function removeFileFromIPFS() {
		try {
			if (content_hash) {
				const response = await fetch('/api/ipfs/unpin', {
					method: 'POST',
					body: JSON.stringify({ content_hash }),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const { ipfsHash } = await response.json();
				if (ipfsHash) {
					content_hash = ipfsHash;
				}
			}
		} catch (error) {
			console.error('Error:', error);
		}
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
					New Worker Proposal
				</h2>
				<div class="flex-grow"></div>
				<CloseOutline
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>
			<!-- <div class="flex flex-row gap-5">
				<input class=" text-black" type="text" bind:value={id} placeholder="ID" />
				
			</div> -->
			<div class="flex flex-col md:flex-row md:gap-5">
				<!-- <input class="text-black" type="number" bind:value={category} placeholder="Category Num" /> -->

				<input id="title" class="text-black" type="text" bind:value={title} placeholder="Title" />

				<input
					id="job_duration"
					class="text-black"
					type="number"
					bind:value={job_duration}
					placeholder="Job Duration Seconds"
				/>
			</div>

			<div class="flex flex-col md:flex-row md:gap-5">
				<input
					class="text-black"
					type="text"
					bind:value={proposer}
					placeholder="Proposer"
					disabled
				/>
				<input class="text-black" type="text" bind:value={arbiter} placeholder="Arbiter" />
			</div>

			<div class="flex flex-col md:flex-row md:gap-5">
				<input
					class="text-black"
					type="number"
					bind:value={proposal_pay}
					placeholder="Proposal Pay TLM"
				/>
				<input
					class="text-black"
					type="number"
					bind:value={arbiter_pay}
					placeholder="Arbiter Pay TLM"
				/>
				<!-- <input
					class="text-black"
					type="text"
					bind:value={proposal_pay_token_contract}
					placeholder="Token Contract"
				/> -->
			</div>

			<!-- <div class="flex flex-row gap-5">
				<input
					class="text-black"
					type="text"
					bind:value={arbiter_pay}
					placeholder="Arbiter Pay Quantity"
				/>
				<input
					class="text-black"
					type="text"
					bind:value={arbiter_pay_token_contract}
					placeholder="Token Contract"
				/>
			</div> -->

			<textarea
				class="text-black"
				bind:value={summary}
				placeholder="Summary"
				on:input={autoResize}
				on:focusin={() => autoResize(event)}
				on:focusout={() => resetHeight(event)}
			></textarea>
			<label for="file-upload" class="file-upload__label"
				>Upload document to IPFS via <a
					class="text-blue-500 underline"
					href="https://app.pinata.cloud/register"
					target="_blank">Pinata</a
				>
				then paste the hash here:
			</label>
			<input
				class="text-black"
				type="text"
				bind:value={content_hash}
				placeholder="IPFS HASH TO DOCUMENT WITH MORE INFO"
			/>
			<!-- <div class="file-upload">
				<label for="file-upload" class="file-upload__label">Upload document with more info </label>
				<input
					id="file-upload"
					class="file-upload__input"
					type="file"
					on:change={handleFileChanged}
				/>
			</div> -->
			<div class="mt-2">
				{#if isUploading}
					<!-- Spining wheel when uploading -->
					<div class="flex flex-col items-center">
						<span class="mb-2">Uploading file...</span>
						<Spinner color="green" />
					</div>
				{:else}
					<button class="bg-green-500 text-white hover:bg-green-700" on:click={submit}
						>Create Proposal</button
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
		align-items: center;
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
