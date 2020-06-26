<script>
  export let border = null
</script>

<div class="glass {border}">
  <slot />
</div>

<style>
  .glass{
			background: rgba(0,0,0,0.15);
	} 
  .border {
			border-radius: 10px;
			border: 2px outset rgba(0,0,0,0.05);
	} 
</style>