<template>
  <div class="home-hero-image">
    123123
    <img src="/img/avt.JPG?url" alt="Hero Image" />
  </div>
</template>

<script>
export default {
  name: "HomeHero",
};
</script>

<style scoped lang="scss">
@media (max-width: 768px) {
  .home-hero-image img {
    width: 90%;
    max-width: 400px;
  }
}
.home-hero-image {
  text-align: center;
  margin-top: 50px;
}
.home-hero-image img {
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
}
</style>
