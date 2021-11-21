<template>
  <div class="nav">
    <div class="left"><slot name="left"></slot></div>
    <div class="title"><slot name="title"></slot></div>
    <div class="right"><slot name="right"></slot></div>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  components: {},
  props: {},
};
</script>

<style lang="scss" scoped>
.nav {
  background-color: skyblue;
  height: 60px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left,
  .right {
    height: 40px;
    width: 40px;
  }
  .title {
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
