<script>
	// import Glass from './Glass.svelte'
	// import './glass.css'
	export let mode
</script>

<div class="card {mode} glass border">
	  <slot />
	<!-- <Glass border="border">
	</Glass> -->

</div>

<style>
 .card {
			max-width: 300px;
			height: 250px;
			padding: 0.25rem;
			margin: 1rem;
	}
	.glass{
			background: rgba(0,0,0,0.15);
	}
	.border {
			border-radius: 10px;
			border: 2px outset rgba(0,0,0,0.05);
	} 
	
</style>