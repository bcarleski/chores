<template>
  <span class="chore-wrap">
    <label :for="id" class="chore">
    {{chore.title}} - <strong>{{people}}</strong>
    </label>
    <div class="chore-details" title="details">
        <div>
            <InfoCircle />
        </div>
    </div>
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
input[type="checkbox"]{
    position:absolute;
    height:0;
    width:0;
    opacity:0;
    top:-600px;
}
.checknext {
    text-align: left;
    cursor: pointer;
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
.checkmark:after{
    content:'';
    display:block;
    position:absolute;
    z-index:0;
    height:18px;
    width:18px;
    top:20px;
    left:12px;
    box-shadow:inset 0 0 0 2px #d8d8d8;
    transition:.25s ease-in-out;
    border-radius:4px;
    cursor: pointer;
}
.checkmark:hover:after{
    box-shadow:inset 0 0 0 2px #949494;
    cursor: pointer;
}
.checkmark svg{
    position:absolute;
    z-index:1;
    left:15px;
    top:20px;
    font-size:1px;
    line-height:16px;
    width:16px;
    height:16px;
    text-align:center;
    color:transparent;
    text-shadow:1px 1px 0 white, -1px -1px 0 white;
    cursor: pointer;
}
:checked + .checknext .chore{
    color:#717171;
}
:checked + .checknext .chore:before{
    width:100%;
}
:checked + .checknext .checkmark:after{
    box-shadow:inset 0 0 0 2px #0eb0b7;
}
:checked + .checknext .checkmark svg{
    font-size:20px;
    line-height:35px;
    color:#0eb0b7;
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
