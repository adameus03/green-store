<script setup>
	import { ref } from 'vue';
	import axios from 'axios';
	const products = ref([]);
	axios.get('http://localhost:8091/products').then((received) => { // will die if backend not running or response is not json or that json is not an array
		console.log(received);
		for (const prod of received.data) {
			products.value.push(prod);
		}
	});
</script>
<template>
	<div class="products">
		<ul>
			<li v-for="(product, index) in products" :key="index">
				{{ product["prod_id"] }}
			</li>
		</ul>
	</div>
</template>