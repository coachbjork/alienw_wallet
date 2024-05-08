<script lang="ts">
	import PlanetMenu from '$lib/components/Menu/PlanetMenu.svelte';
	import ArticleModal from '$lib/components/Modal/ArticleModal.svelte';
	import ArticleAction from '$lib/components/SidePanel/ArticleAction.svelte';
	import {
		get_article_cursor,
		get_articles,
		get_identity_by_wallet
	} from '$lib/services/awDaoInfraService';
	import { activePlanetStore, session } from '$lib/stores';
	import type { Planet } from '$lib/types';
	import { Spinner } from 'flowbite-svelte';
	import { LabelSolid } from 'flowbite-svelte-icons';
	import moment from 'moment';
	import { afterUpdate, onMount } from 'svelte';

	let selectedPlanet: Planet = $activePlanetStore;
	let loading = true;
	let selectedArticle: any = null;
	let user_identity: any = null;
	let articleModal: any;
	let articles: any = [];

	$: $session && fetchUserIdentity();

	onMount(async () => {
		loading = true;
		await fetchArticles();
		if ($session) {
			await fetchUserIdentity();
		}
		loading = false;
	});

	afterUpdate(async () => {
		if (selectedPlanet !== $activePlanetStore) {
			selectedPlanet = $activePlanetStore;
			loading = true;
			await fetchArticles();
			if ($session) {
				await fetchUserIdentity();
			}
			loading = false;
		}
	});

	async function fetchUserIdentity() {
		const data = await get_identity_by_wallet($activePlanetStore.name, String($session?.actor));
		if (!data) return;
		user_identity = data;
	}

	async function fetchArticles() {
		const cursor = await get_article_cursor($activePlanetStore.name);
		if (!cursor) return;
		let data = await get_articles(cursor);
		if (!data) return;
		articles = data;
	}

	function selectArticle(item: any) {
		if (selectedArticle && selectedArticle.article_id == item.article_id) {
			selectedArticle = null;
			return;
		} else {
			selectedArticle = item;
		}
	}
</script>

<div class="main-content py-6">
	<div class="container relative overflow-x-hidden">
		<PlanetMenu />
		<div class="mt-10 overflow-x-auto">
			{#if loading}
				<div class="flex justify-center">
					<Spinner color="purple" />
				</div>
			{:else if articles.length == 0}
				<div class="flex justify-center">No Data</div>
			{:else}
				<div class="flex flex-col gap-6">
					{#each articles as article}
						<button class="flex flex-row" on:click={() => selectArticle(article)}>
							<div class="w-8 flex-none place-self-center">
								{#if selectedArticle && selectedArticle.article_id == article?.article_id}
									<LabelSolid class="text-stone-300 h-5 w-5 " />
								{/if}
							</div>
							<div
								class={`flex-grow rounded-2xl border border-solid border-gray-700 p-5 shadow-md shadow-gray-700  
								${
									article?.article_id == selectedArticle?.article_id
										? 'backdrop-brightness-200'
										: 'backdrop-brightness-125'
								}`}
							>
								<div class="flex flex-row flex-wrap">
									<div class="flex flex-none basis-2/12 flex-col text-start">
										<div>
											#: <span class="text-white underline">{article.article_id}</span>
										</div>
										<div class="mt-2">
											<span class="text-white">{article.creator}</span>
										</div>
									</div>
									<div class="mx-3 flex-none basis-3/12 flex-col text-start">
										<div>
											Title: <span class="text-white">{article.title}</span>
										</div>
										<div>
											Image URL: <span class="text-white">{article.image}</span>
										</div>
										<div>
											Link: <span class="text-white">{article.link}</span>
										</div>
										<div>
											Description: <span class="text-white">
												{#each article.description.split('\n') as line}
													{line}
													<br />
												{/each}
											</span>
										</div>
									</div>
									<div class="mx-3 flex flex-1 flex-col text-start">
										<div>
											Author: <span class="text-white">{article.author}</span>
										</div>
									</div>
									<div class="flex flex-none basis-3/12 flex-col text-end">
										<div>Updated At</div>
										<div class="text-white">
											{moment(`${article.updated_at}`).format('YYYY-MM-DD HH:mm:ss')}
										</div>
									</div>
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
<div class="left-side md:flex"></div>
<div class="right-side md:flex">
	<ArticleAction
		{selectedArticle}
		{user_identity}
		on:set={(data) => {
			articleModal.setModalOpen(true, data.detail);
		}}
		on:refresh={fetchArticles}
	/>
</div>
<ArticleModal bind:this={articleModal} on:refresh={fetchArticles} />

<style>
</style>
