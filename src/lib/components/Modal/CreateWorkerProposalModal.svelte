<script lang="ts">
	import { XSolid } from 'flowbite-svelte-icons';

	export let isOpen = false;
	export let onClose: () => void;
	export let onCreateProposal: (proposal: any) => Promise<void>;

	let id = '';
	let proposer = '';
	let title = '';
	let summary = '';
	let arbitrator = '';
	let proposal_pay = '';
	let proposal_pay_token_contract = '';
	let arbitrator_pay = '';
	let arbitrator_pay_token_contract = '';
	let content_hash = '';
	let category = '';
	let job_duration = '';

	async function submit() {
		const proposal = {
			proposer,
			title,
			summary,
			arbitrator,
			proposal_pay,
			proposal_pay_token_contract,
			arbitrator_pay,
			arbitrator_pay_token_contract,
			content_hash,
			id,
			category,
			job_duration
		};

		await onCreateProposal(proposal).then((res: any) => {
			if (res) {
				close();
			}
		});
	}
	function close() {
		id = '';
		proposer = '';
		title = '';
		summary = '';
		arbitrator = '';
		proposal_pay = '';
		proposal_pay_token_contract = '';
		arbitrator_pay = '';
		arbitrator_pay_token_contract = '';
		content_hash = '';
		category = '';
		job_duration = '';
		onClose();
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
				<XSolid
					class="text-red-500 hover:cursor-pointer"
					size="lg"
					strokeWidth="3"
					on:click={close}
				/>
			</div>
			<div class="flex flex-row gap-5">
				<input class="basis-2/6 text-black" type="text" bind:value={id} placeholder="ID" />
				<input class="text-black" type="text" bind:value={title} placeholder="Title" />
			</div>

			<div class="flex flex-row gap-5">
				<input class="text-black" type="text" bind:value={proposer} placeholder="Proposer" />
				<input class="text-black" type="text" bind:value={arbitrator} placeholder="Arbitrator" />
			</div>

			<div class="flex flex-row gap-5">
				<input
					class="text-black"
					type="text"
					bind:value={proposal_pay}
					placeholder="Proposal Pay Quantity"
				/>
				<input
					class="text-black"
					type="text"
					bind:value={proposal_pay_token_contract}
					placeholder="Token Contract"
				/>
			</div>

			<div class="flex flex-row gap-5">
				<input
					class="text-black"
					type="text"
					bind:value={arbitrator_pay}
					placeholder="Arbitrator Pay Quantity"
				/>
				<input
					class="text-black"
					type="text"
					bind:value={arbitrator_pay_token_contract}
					placeholder="Token Contract"
				/>
			</div>
			<div class="flex flex-row gap-5">
				<input class="text-black" type="number" bind:value={category} placeholder="Category Num" />
				<input
					class="text-black"
					type="number"
					bind:value={job_duration}
					placeholder="Job Duration Seconds"
				/>
			</div>
			<textarea class="text-black" bind:value={summary} placeholder="Summary"></textarea>
			<input class="text-black" type="text" bind:value={content_hash} placeholder="Content Hash" />
			<button class="bg-green-500 text-white hover:bg-green-700" on:click={submit}
				>Create Proposal</button
			>
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
		padding: 30px;
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
