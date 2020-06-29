<script>
  // export let dispModal
</script>

<div class="backdrop"></div>
<div class="modal" >
  <header>
    <slot name="title"/>
      
  </header>
  
  <body>
    <slot name='content'></slot>
  </body>
  
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

/* hr {
  opacity: 0.5;
} */
header {
  /* height: 1.5rem; */
  /* line-heig  ht: 1rem; */
  background: #666;
  border-radius : 10px 10px 0 0;
  padding: 3px ;
}
header * {
  /* text-shadow: 1px 1px black; */
}
body {
  /* display: inline-block; */
  padding-top: 1rem;
  height: 50vh;
  border-top: 1px solid rgba(0,0,0,0.5);
  /* border-bottom: 1px solid rgba(0,0,0,0.5); */
}

footer {
  padding-top: 1rem;
  /* border-top: 1px solid rgba(0,0,0,0.5); */
  position: absolute;
  bottom: 0;

  margin-bottom: 1rem;
  display: block;
  width: 100%;
  height: 2rem;
  border-radius : 0 0 10px 10px ;
}


</style>