<template>
  <span class="chore-wrap">
    <g-link :to="chore.path">
      <label :for="id" class="chore">
      {{chore.title}} - <strong>{{people}}</strong>
      </label>
      <div class="chore-details" title="details">
          <div>
              <InfoCircle />
          </div>
      </div>
    </g-link>
  </span>
</template>

<script>
import InfoCircle from '../components/InfoCircle'
export default {
  components: { InfoCircle },
  props: ['chore'],
  computed: {
    people: function() {
      return (this.chore.people || []).join(', ')
    }
  }
}
</script>

<style scoped>
a, a:visited {
  color: black;
}

.chore-wrap{
    display:block;
    position:relative;
    padding-left:35px;
    box-shadow:0 2px 0 -1px #ebebeb;
    text-align: left;
    cursor: pointer;
}
.chore-wrap:last-of-type{
    box-shadow:none;
}
.chore{
    display:inline-block;
    font-weight:200;
    font-size:18px;
    padding:20px 5px;
    height:18px;
    position:relative;
    vertical-align: middle;
    cursor: pointer;
}
.chore:before{
    content:'';
    display:block;
    position:absolute;
    top:calc(50% + 1px);
    left:0;
    width:0%;
    height:1px;
    background:#cd4400;
    transition:.25s ease-in-out;
    cursor: pointer;
}

/* Details Link */
.chore-details{
    display:block;
    position:absolute;
    height:36px;
    width:100px;
    line-height:36px;
    right:0;
    top:12px;
    text-align:right;
    color:#d8d8d8;
    cursor: pointer;
}
.chore-details div {
    display:inline-block;
}
.chore-details svg {
    color:#d8d8d8;
    width: 36px;
    height: 36px;
    margin-left: 8px;
}
.chore-wrap:hover .chore-details svg{
    color:#0eb0b7;
}
</style>
