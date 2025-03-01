document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("productList");
    const addProductForm = document.getElementById("addProductForm");

    // 📌 Получение товаров
    async function fetchProducts() {
        const res = await fetch("/admin/products");
        const products = await res.json();
        productList.innerHTML = products.map(p => `
            <div class="user-card mb-3">
                <h5><strong>${p.name_en} / ${p.name_ru}</strong></h5>
                <p>${p.description_en} / ${p.description_ru}</p>
                <img src="${p.image1}" width="100">
                <img src="${p.image2}" width="100">
                <img src="${p.image3}" width="100">
                <button class="btn btn-primary mt-2" onclick="editProduct('${p._id}')">Edit</button>
                <button class="btn btn-danger mt-2" onclick="deleteProduct('${p._id}')">Delete</button>
            </div>
        `).join("");
    }

    // 📌 Добавление нового товара
    addProductForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newProduct = {
            name_en: document.getElementById("name_en").value,
            name_ru: document.getElementById("name_ru").value,
            description_en: document.getElementById("description_en").value,
            description_ru: document.getElementById("description_ru").value,
            image1: document.getElementById("image1").value,
            image2: document.getElementById("image2").value,
            image3: document.getElementById("image3").value,
        };
        await fetch("/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct)
        });
        fetchProducts();
    });

    // 📌 Удаление товара
    async function deleteProduct(id) {
        if (confirm("Are you sure you want to delete this product?")) {
            await fetch(`/admin/products/${id}`, { method: "DELETE" });
            fetchProducts();
        }
    }

    // 📌 Заглушка для редактирования
    function editProduct(id) {
        alert(`Editing product: ${id}`);
    }

    fetchProducts();
});