<script>
	export let color = 'gray'; // Default color
</script>

<span
	class={`inline-flex items-center justify-center
    rounded-lg px-3 py-0.5 font-medium 
            bg-${color}-400 text-${color}-800`}
>
	<slot />
	<!-- This is where the content of the badge will be inserted -->
</span>
