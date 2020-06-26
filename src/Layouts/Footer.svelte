<script>
  // import Glass from "../UI/Glass.svelte";
  export let mode
</script>

  <!-- <Glass>
  </Glass> -->
<footer class="glass">
  <span>debian server</span>
  <span>&copy;</span>
  <span>{new Date().getFullYear()}</span>
</footer>


<style>
  footer {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.5rem;
    position: absolute;
    bottom: 0;
    margin: auto;
  }
  footer span {
    margin: 0 0.25rem;
  }
  .glass{
			background: rgba(0,0,0,0.15);
	}

</style>