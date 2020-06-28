<script>
  // export let dispModal
</script>

<div class="backdrop"></div>
<div class="window" >
  <header>
    <slot name="title"><!-- optional fallback --></slot>
    
  </header>
  <hr>
  <body>
    <slot name='content'></slot>
  </body>
  <hr>
  <footer>
    <slot name="footer" />
  </footer>
</div>
<style>
.backdrop {
  position: absolute;
  top: 0;
  display: block;
  background-color: rgba(0,0,0,0.25);
  width: 100%;
  height: 100vh;
}
.window {
  border-radius: 1rem;
  display: block;
  margin: auto;
  background: whitesmoke;
  color: black;
  position: absolute;
  left: 10%;
  top: 20vh;
  margin: auto;
  width: 80%;
  min-height: 60vh;
  text-align: center;
  padding: 1rem;
}
hr {
  opacity: 0.5;
}
body {
  height: 40vh;
}

footer {
  position: absolute;
  bottom: 0;

  margin-bottom: 1rem;
  display: block;
  width: 100%;
  height: 2rem;
}


</style>