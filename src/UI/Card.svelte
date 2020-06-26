<script>
	import Glass from './Glass.svelte'
	// let border = "border"
</script>

<div class="card glass border">
	<Glass border="border">
	  <slot />
	</Glass>

</div>

<style>
 .card {
			max-width: 300px;
			height: 250px;
			padding: 0.25rem;
			margin: 1rem;
	}

	
</style>